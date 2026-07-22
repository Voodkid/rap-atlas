using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace RapAtlasDesktop
{
    internal static class LocalServer
    {
        private const string HtmlResourceName = "RapAtlas.Index.html";
        private const string IconResourceName = "RapAtlas.AppIcon.ico";
        private const string HealthMarker = "RAP_ATLAS_OK";
        private const int DefaultPort = 48671;
        private const int LastFallbackPort = 48679;

        internal static int Run(string[] args)
        {
            string executableDirectory = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            string mutexName = BuildMutexName(executableDirectory);
            bool createdNew;
            using (Mutex instanceMutex = new Mutex(true, mutexName, out createdNew))
            {
                if (!createdNew)
                {
                    ServerConnection running = WaitForConnection(executableDirectory, 1600);
                    if (running != null && IsRapAtlasRunning(running) && !CommandLine.Has(args, "--no-open")) OpenBrowser(BuildUrl(running.Port, running.Token));
                    return 0;
                }
                return RunOwned(args, executableDirectory);
            }
        }

        private static int RunOwned(string[] args, string executableDirectory)
        {
            bool noOpen = CommandLine.Has(args, "--no-open");
            int explicitPort = CommandLine.PositiveInt(args, "--port=");
            int idleSeconds = CommandLine.PositiveInt(args, "--idle-seconds=");
            List<int> ports = BuildPortCandidates(executableDirectory, explicitPort);
            ServerConnection existing = ReadConnection(executableDirectory);

            if (existing != null && IsRapAtlasRunning(existing))
            {
                if (!noOpen) OpenBrowser(BuildUrl(existing.Port, existing.Token));
                return 0;
            }

            TcpListener listener = null;
            int selectedPort = 0;
            foreach (int port in ports)
            {
                try
                {
                    listener = new TcpListener(IPAddress.Loopback, port);
                    listener.Start(20);
                    selectedPort = port;
                    break;
                }
                catch (SocketException)
                {
                    if (listener != null) listener.Stop();
                    listener = null;
                }
            }

            if (listener == null)
            {
                throw new InvalidOperationException("Не удалось открыть локальный адрес. Перезапусти RAP ATLAS или перезагрузи компьютер.");
            }

            ServerControl control = new ServerControl();
            SessionRegistry sessions = new SessionRegistry();
            StateStore state = new StateStore(AppPaths.DataDirectory(executableDirectory));
            string token = CreateToken();
            DateTime startedUtc = DateTime.UtcNow;
            DateTime lastRequestUtc = startedUtc;
            DateTime lastLoopUtc = startedUtc;

            try
            {
                SaveConnection(executableDirectory, selectedPort, token);
                if (!noOpen) OpenBrowser(BuildUrl(selectedPort, token));

                while (!control.ShutdownRequested)
                {
                    DateTime now = DateTime.UtcNow;
                    if ((now - lastLoopUtc).TotalSeconds > 15) sessions.RefreshAfterSleep(now);
                    lastLoopUtc = now;

                    if (idleSeconds > 0 && (now - lastRequestUtc).TotalSeconds >= idleSeconds) break;
                    if (sessions.ShouldExit(now, startedUtc)) break;

                    if (!listener.Pending())
                    {
                        Thread.Sleep(70);
                        continue;
                    }

                    TcpClient client = listener.AcceptTcpClient();
                    lastRequestUtc = DateTime.UtcNow;
                    ThreadPool.QueueUserWorkItem(delegate { HandleClient(client, sessions, state, control, token, selectedPort); });
                }
            }
            finally
            {
                listener.Stop();
                DeleteConnection(executableDirectory, selectedPort, token);
            }
            return 0;
        }

        private static void HandleClient(TcpClient client, SessionRegistry sessions, StateStore state, ServerControl control, string token, int port)
        {
            using (client)
            using (NetworkStream stream = client.GetStream())
            {
                try
                {
                    client.ReceiveTimeout = 3500;
                    client.SendTimeout = 3500;
                    HttpRequestData request = HttpRequestData.Read(stream);
                    if (request == null) return;

                    bool serviceRequest = request.Path.StartsWith("/__", StringComparison.Ordinal);
                    if (serviceRequest && !IsAuthorized(request, token, port))
                    {
                        WriteResponse(stream, 403, "Forbidden", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("FORBIDDEN"));
                        return;
                    }

                    if (request.Path == "/__health")
                    {
                        WriteResponse(stream, 200, "OK", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes(HealthMarker));
                        return;
                    }

                    if (request.Path == "/__shutdown" && request.Method == "POST")
                    {
                        WriteResponse(stream, 200, "OK", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("BYE"));
                        control.ShutdownRequested = true;
                        return;
                    }

                    if (request.Path.StartsWith("/__session/", StringComparison.Ordinal))
                    {
                        string id = request.QueryValue("id");
                        if (request.Path == "/__session/open") sessions.Open(id);
                        else if (request.Path == "/__session/heartbeat") sessions.Heartbeat(id);
                        else if (request.Path == "/__session/close") sessions.Close(id);
                        WriteResponse(stream, 204, "No Content", "text/plain", new byte[0]);
                        return;
                    }

                    if (request.Path == "/__state")
                    {
                        string key = request.QueryValue("key");
                        if (!state.IsAllowedKey(key))
                        {
                            WriteResponse(stream, 400, "Bad Request", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("BAD KEY"));
                            return;
                        }

                        if (request.Method == "GET")
                        {
                            byte[] stored;
                            if (state.TryRead(key, out stored)) WriteResponse(stream, 200, "OK", "application/json; charset=utf-8", stored);
                            else WriteResponse(stream, 404, "Not Found", "application/json; charset=utf-8", Encoding.UTF8.GetBytes("null"));
                            return;
                        }

                        if (request.Method == "POST")
                        {
                            if (!state.TryWrite(key, request.Body))
                            {
                                WriteResponse(stream, 400, "Bad Request", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("BAD STATE"));
                                return;
                            }
                            WriteResponse(stream, 204, "No Content", "text/plain", new byte[0]);
                            return;
                        }
                    }

                    if (request.Path == "/favicon.ico")
                    {
                        WriteResponse(stream, 200, "OK", "image/x-icon", ReadResource(IconResourceName));
                        return;
                    }

                    if (request.Path == "/" && request.QueryValue("token") == token)
                    {
                        WriteResponse(stream, 200, "OK", "text/html; charset=utf-8", ReadResource(HtmlResourceName));
                        return;
                    }

                    WriteResponse(stream, 404, "Not Found", "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("NOT FOUND"));
                }
                catch
                {
                    // Browsers occasionally close speculative connections without sending a request.
                }
            }
        }

        private static void WriteResponse(Stream stream, int statusCode, string statusText, string contentType, byte[] body)
        {
            string headers =
                "HTTP/1.1 " + statusCode + " " + statusText + "\r\n" +
                "Content-Type: " + contentType + "\r\n" +
                "Content-Length: " + body.Length + "\r\n" +
                "Cache-Control: no-store\r\n" +
                "X-Content-Type-Options: nosniff\r\n" +
                "Connection: close\r\n\r\n";
            byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (body.Length > 0) stream.Write(body, 0, body.Length);
            stream.Flush();
        }

        private static byte[] ReadResource(string name)
        {
            using (Stream resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(name))
            {
                if (resource == null) throw new InvalidOperationException("В программе отсутствует обязательный файл: " + name);
                using (MemoryStream copy = new MemoryStream())
                {
                    resource.CopyTo(copy);
                    return copy.ToArray();
                }
            }
        }

        private static List<int> BuildPortCandidates(string executableDirectory, int explicitPort)
        {
            List<int> ports = new List<int>();
            if (explicitPort > 0)
            {
                ports.Add(explicitPort);
                return ports;
            }

            int preferred = ReadPreferredPort(executableDirectory);
            if (preferred >= DefaultPort && preferred <= LastFallbackPort) ports.Add(preferred);
            for (int port = DefaultPort; port <= LastFallbackPort; port++) if (!ports.Contains(port)) ports.Add(port);
            return ports;
        }

        private static int ReadPreferredPort(string executableDirectory)
        {
            ServerConnection connection = ReadConnection(executableDirectory);
            return connection == null ? 0 : connection.Port;
        }

        private static ServerConnection ReadConnection(string executableDirectory)
        {
            try
            {
                string file = AppPaths.PortFile(executableDirectory);
                if (!File.Exists(file)) return null;
                string[] lines = File.ReadAllLines(file, Encoding.ASCII);
                int port;
                if (lines.Length < 2 || !int.TryParse(lines[0], out port) || port <= 0 || port > 65535 || string.IsNullOrWhiteSpace(lines[1])) return null;
                return new ServerConnection { Port = port, Token = lines[1].Trim() };
            }
            catch { return null; }
        }

        private static ServerConnection WaitForConnection(string executableDirectory, int milliseconds)
        {
            DateTime until = DateTime.UtcNow.AddMilliseconds(milliseconds);
            do
            {
                ServerConnection connection = ReadConnection(executableDirectory);
                if (connection != null) return connection;
                Thread.Sleep(80);
            } while (DateTime.UtcNow < until);
            return null;
        }

        private static void SaveConnection(string executableDirectory, int port, string token)
        {
            string file = AppPaths.PortFile(executableDirectory);
            string temporary = file + ".new";
            File.WriteAllText(temporary, port + Environment.NewLine + token, Encoding.ASCII);
            if (File.Exists(file)) File.Delete(file);
            File.Move(temporary, file);
        }

        private static void DeleteConnection(string executableDirectory, int port, string token)
        {
            try
            {
                string file = AppPaths.PortFile(executableDirectory);
                ServerConnection current = ReadConnection(executableDirectory);
                if (current != null && current.Port == port && current.Token == token && File.Exists(file)) File.Delete(file);
            }
            catch { }
        }

        private static bool IsRapAtlasRunning(ServerConnection connection)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + connection.Port + "/__health?token=" + Uri.EscapeDataString(connection.Token));
                request.Timeout = 450;
                request.ReadWriteTimeout = 450;
                request.Proxy = null;
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {
                    return response.StatusCode == HttpStatusCode.OK && reader.ReadToEnd() == HealthMarker;
                }
            }
            catch { return false; }
        }

        private static bool IsAuthorized(HttpRequestData request, string token, int port)
        {
            string supplied = request.QueryValue("token");
            if (string.IsNullOrEmpty(supplied)) supplied = request.HeaderValue("X-Rap-Atlas-Token");
            if (!FixedTimeEquals(supplied, token)) return false;

            string expectedOrigin = "http://127.0.0.1:" + port;
            string origin = request.HeaderValue("Origin");
            if (!string.IsNullOrEmpty(origin) && !string.Equals(origin, expectedOrigin, StringComparison.OrdinalIgnoreCase)) return false;
            string fetchSite = request.HeaderValue("Sec-Fetch-Site");
            if (string.Equals(fetchSite, "cross-site", StringComparison.OrdinalIgnoreCase)) return false;
            return true;
        }

        private static bool FixedTimeEquals(string left, string right)
        {
            if (left == null || right == null || left.Length != right.Length) return false;
            int difference = 0;
            for (int index = 0; index < left.Length; index++) difference |= left[index] ^ right[index];
            return difference == 0;
        }

        private static string CreateToken()
        {
            byte[] bytes = new byte[32];
            using (RandomNumberGenerator generator = RandomNumberGenerator.Create()) generator.GetBytes(bytes);
            return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }

        private static string BuildMutexName(string executableDirectory)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(Path.GetFullPath(executableDirectory).ToLowerInvariant());
            byte[] hash;
            using (SHA256 algorithm = SHA256.Create()) hash = algorithm.ComputeHash(bytes);
            return "Local\\RAP_ATLAS_" + BitConverter.ToString(hash, 0, 12).Replace("-", "");
        }

        private static void OpenBrowser(string url)
        {
            Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
        }

        private static string BuildUrl(int port, string token)
        {
            return "http://127.0.0.1:" + port + "/?token=" + Uri.EscapeDataString(token);
        }
    }

    internal sealed class ServerConnection
    {
        internal int Port;
        internal string Token;
    }

    internal sealed class ServerControl
    {
        internal volatile bool ShutdownRequested;
    }

    internal sealed class SessionRegistry
    {
        private readonly object gate = new object();
        private readonly Dictionary<string, DateTime> active = new Dictionary<string, DateTime>();
        private readonly HashSet<string> closed = new HashSet<string>();
        private bool hadSession;
        private DateTime emptySinceUtc = DateTime.MinValue;

        internal void Open(string id)
        {
            if (string.IsNullOrWhiteSpace(id) || id.Length > 120) return;
            lock (gate)
            {
                hadSession = true;
                closed.Remove(id);
                active[id] = DateTime.UtcNow;
                emptySinceUtc = DateTime.MinValue;
            }
        }

        internal void Heartbeat(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return;
            lock (gate)
            {
                if (active.ContainsKey(id) && !closed.Contains(id)) active[id] = DateTime.UtcNow;
            }
        }

        internal void Close(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return;
            lock (gate)
            {
                active.Remove(id);
                closed.Add(id);
                if (active.Count == 0) emptySinceUtc = DateTime.UtcNow;
            }
        }

        internal bool ShouldExit(DateTime nowUtc, DateTime startedUtc)
        {
            lock (gate)
            {
                List<string> stale = new List<string>();
                foreach (KeyValuePair<string, DateTime> pair in active)
                {
                    if ((nowUtc - pair.Value).TotalSeconds > 120) stale.Add(pair.Key);
                }
                foreach (string id in stale) active.Remove(id);
                if (stale.Count > 0 && active.Count == 0 && emptySinceUtc == DateTime.MinValue) emptySinceUtc = nowUtc;

                if (!hadSession) return (nowUtc - startedUtc).TotalMinutes >= 2;
                return active.Count == 0 && emptySinceUtc != DateTime.MinValue && (nowUtc - emptySinceUtc).TotalMilliseconds >= 3500;
            }
        }

        internal void RefreshAfterSleep(DateTime nowUtc)
        {
            lock (gate)
            {
                List<string> keys = new List<string>(active.Keys);
                foreach (string key in keys) active[key] = nowUtc;
            }
        }
    }

    internal sealed class StateStore
    {
        private readonly string directory;
        private readonly object gate = new object();

        internal StateStore(string directory)
        {
            this.directory = directory;
        }

        internal bool IsAllowedKey(string key)
        {
            return key == "bookmarks" || key == "recent" || key == "theme";
        }

        internal bool TryRead(string key, out byte[] value)
        {
            value = null;
            if (!IsAllowedKey(key)) return false;
            lock (gate)
            {
                string file = FileForKey(key);
                if (!File.Exists(file)) return false;
                value = File.ReadAllBytes(file);
                return true;
            }
        }

        internal bool TryWrite(string key, byte[] value)
        {
            if (!IsAllowedKey(key) || value == null || value.Length == 0 || value.Length > 65536) return false;
            string text = Encoding.UTF8.GetString(value).Trim();
            if (key == "theme")
            {
                if (text != "\"dark\"" && text != "\"light\"") return false;
            }
            else if (!text.StartsWith("[", StringComparison.Ordinal) || !text.EndsWith("]", StringComparison.Ordinal))
            {
                return false;
            }

            lock (gate)
            {
                Directory.CreateDirectory(directory);
                string file = FileForKey(key);
                string temporary = file + ".new";
                File.WriteAllBytes(temporary, Encoding.UTF8.GetBytes(text));
                if (File.Exists(file)) File.Delete(file);
                File.Move(temporary, file);
            }
            return true;
        }

        private string FileForKey(string key)
        {
            return Path.Combine(directory, key + ".json");
        }
    }

    internal sealed class HttpRequestData
    {
        internal string Method;
        internal string Path;
        internal Dictionary<string, string> Query;
        internal Dictionary<string, string> Headers;
        internal byte[] Body;

        internal string QueryValue(string key)
        {
            string value;
            return Query != null && Query.TryGetValue(key, out value) ? value : null;
        }

        internal string HeaderValue(string key)
        {
            string value;
            return Headers != null && Headers.TryGetValue(key, out value) ? value : null;
        }

        internal static HttpRequestData Read(NetworkStream stream)
        {
            MemoryStream received = new MemoryStream();
            byte[] buffer = new byte[4096];
            int headerEnd = -1;
            while (headerEnd < 0)
            {
                int count = stream.Read(buffer, 0, buffer.Length);
                if (count <= 0) return null;
                received.Write(buffer, 0, count);
                if (received.Length > 131072) throw new InvalidDataException("HTTP request is too large.");
                headerEnd = FindHeaderEnd(received.GetBuffer(), (int)received.Length);
            }

            byte[] current = received.ToArray();
            string headerText = Encoding.ASCII.GetString(current, 0, headerEnd);
            string[] lines = headerText.Split(new string[] { "\r\n" }, StringSplitOptions.None);
            if (lines.Length == 0) return null;
            string[] requestParts = lines[0].Split(' ');
            if (requestParts.Length < 2) return null;

            Dictionary<string, string> headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            for (int index = 1; index < lines.Length; index++)
            {
                int colon = lines[index].IndexOf(':');
                if (colon > 0) headers[lines[index].Substring(0, colon).Trim()] = lines[index].Substring(colon + 1).Trim();
            }

            int contentLength = 0;
            string contentLengthText;
            if (headers.TryGetValue("Content-Length", out contentLengthText)) int.TryParse(contentLengthText, out contentLength);
            if (contentLength < 0 || contentLength > 65536) throw new InvalidDataException("HTTP body is too large.");

            int bodyStart = headerEnd + 4;
            while (received.Length - bodyStart < contentLength)
            {
                int count = stream.Read(buffer, 0, Math.Min(buffer.Length, contentLength - ((int)received.Length - bodyStart)));
                if (count <= 0) break;
                received.Write(buffer, 0, count);
            }

            byte[] all = received.ToArray();
            byte[] body = new byte[Math.Min(contentLength, Math.Max(0, all.Length - bodyStart))];
            if (body.Length > 0) Buffer.BlockCopy(all, bodyStart, body, 0, body.Length);

            Uri uri = new Uri("http://127.0.0.1" + requestParts[1]);
            return new HttpRequestData
            {
                Method = requestParts[0].ToUpperInvariant(),
                Path = uri.AbsolutePath,
                Query = ParseQuery(uri.Query),
                Headers = headers,
                Body = body
            };
        }

        private static int FindHeaderEnd(byte[] bytes, int length)
        {
            for (int index = 0; index <= length - 4; index++)
            {
                if (bytes[index] == 13 && bytes[index + 1] == 10 && bytes[index + 2] == 13 && bytes[index + 3] == 10) return index;
            }
            return -1;
        }

        private static Dictionary<string, string> ParseQuery(string query)
        {
            Dictionary<string, string> values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (string.IsNullOrEmpty(query)) return values;
            string trimmed = query.TrimStart('?');
            foreach (string part in trimmed.Split('&'))
            {
                if (part.Length == 0) continue;
                int equals = part.IndexOf('=');
                string key = equals >= 0 ? part.Substring(0, equals) : part;
                string value = equals >= 0 ? part.Substring(equals + 1) : "";
                values[Decode(key)] = Decode(value);
            }
            return values;
        }

        private static string Decode(string value)
        {
            return Uri.UnescapeDataString(value.Replace("+", " "));
        }
    }
}

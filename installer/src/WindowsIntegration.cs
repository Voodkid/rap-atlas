using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;

namespace RapAtlasDesktop
{
    internal static class InstallationEngine
    {
        internal static void Install(InstallOptions options, Action<string> log)
        {
            ValidateInstallDirectory(options.InstallDirectory, options.TestMode);
            string installDirectory = Path.GetFullPath(options.InstallDirectory);
            string sourceExecutable = Path.GetFullPath(Assembly.GetExecutingAssembly().Location);
            string mainExecutable = AppPaths.MainExecutable(installDirectory);
            string uninstallerExecutable = AppPaths.UninstallerExecutable(installDirectory);

            log("Подготовка установки RAP ATLAS " + AppPaths.Version + ".");
            log("Папка программы: " + installDirectory);
            WindowsIntegration.StopRunningApplication(installDirectory, log);

            Directory.CreateDirectory(installDirectory);
            log("Папка программы готова.");

            CopyExecutable(sourceExecutable, mainExecutable);
            log("Основной файл программы установлен.");

            CopyExecutable(sourceExecutable, uninstallerExecutable);
            log("Программа удаления установлена.");

            Directory.CreateDirectory(options.StartMenuFolder);
            WindowsIntegration.CreateShortcut(
                Path.Combine(options.StartMenuFolder, AppPaths.AppName + ".lnk"),
                mainExecutable,
                "--run",
                "Открыть RAP ATLAS");
            WindowsIntegration.CreateShortcut(
                Path.Combine(options.StartMenuFolder, AppPaths.UninstallerExecutableName.Replace(".exe", ".lnk")),
                uninstallerExecutable,
                "",
                "Полностью удалить RAP ATLAS");
            log("Ярлыки в меню «Пуск» созданы.");

            string desktopShortcut = AppPaths.DesktopShortcut(options.DesktopDirectory);
            if (options.CreateDesktopShortcut)
            {
                Directory.CreateDirectory(options.DesktopDirectory);
                WindowsIntegration.CreateShortcut(desktopShortcut, mainExecutable, "--run", "Открыть RAP ATLAS");
                log("Ярлык на рабочем столе создан.");
            }
            else
            {
                WindowsIntegration.DeleteFileIfExists(desktopShortcut);
                log("Ярлык на рабочем столе не создавался.");
            }

            if (options.RegisterApplication)
            {
                WindowsIntegration.RegisterApplication(installDirectory);
                log("RAP ATLAS добавлен в список установленных программ Windows.");
            }

            log("Проверка установленных файлов завершена.");
            if (!File.Exists(mainExecutable) || !File.Exists(uninstallerExecutable))
            {
                throw new InvalidOperationException("Windows не смогла сохранить обязательные файлы программы.");
            }

            if (options.LaunchAfterInstall)
            {
                WindowsIntegration.StartApplication(mainExecutable);
                log("RAP ATLAS запущен в браузере.");
            }
            else
            {
                log("Автоматический запуск отключён — программу можно открыть позже через ярлык.");
            }

            log("Установка завершена успешно.");
        }

        private static void CopyExecutable(string source, string destination)
        {
            string temporary = destination + ".new";
            string backup = destination + ".previous";
            WindowsIntegration.DeleteFileIfExists(temporary);
            WindowsIntegration.DeleteFileIfExists(backup);
            File.Copy(source, temporary, true);
            if (!FilesMatch(source, temporary)) throw new IOException("Проверка нового файла перед установкой не пройдена.");

            bool hadPrevious = File.Exists(destination);
            if (hadPrevious) File.Move(destination, backup);
            try
            {
                File.Move(temporary, destination);
                if (!FilesMatch(source, destination)) throw new IOException("Установленный файл не совпадает с исходным.");
                WindowsIntegration.DeleteFileIfExists(backup);
            }
            catch
            {
                WindowsIntegration.DeleteFileIfExists(destination);
                if (hadPrevious && File.Exists(backup)) File.Move(backup, destination);
                throw;
            }
            finally
            {
                WindowsIntegration.DeleteFileIfExists(temporary);
            }
        }

        private static bool FilesMatch(string first, string second)
        {
            using (SHA256 algorithm = SHA256.Create())
            using (FileStream firstStream = File.OpenRead(first))
            using (FileStream secondStream = File.OpenRead(second))
            {
                byte[] left = algorithm.ComputeHash(firstStream);
                byte[] right = algorithm.ComputeHash(secondStream);
                if (left.Length != right.Length) return false;
                int difference = 0;
                for (int index = 0; index < left.Length; index++) difference |= left[index] ^ right[index];
                return difference == 0;
            }
        }

        private static void ValidateInstallDirectory(string directory, bool testMode)
        {
            string full = Path.GetFullPath(directory);
            if (!testMode && !string.Equals(full, Path.GetFullPath(AppPaths.InstallDirectory), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Недопустимая папка установки.");
            }
            if (string.Equals(full, Path.GetPathRoot(full), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Нельзя устанавливать RAP ATLAS в корень диска.");
            }
        }
    }

    internal static class UninstallEngine
    {
        internal static void Uninstall(UninstallOptions options, Action<string> log)
        {
            ValidateUninstallDirectory(options.InstallDirectory, options.TestMode);
            string installDirectory = Path.GetFullPath(options.InstallDirectory);

            log("Подготовка полного удаления RAP ATLAS.");
            log("Папка программы: " + installDirectory);
            WindowsIntegration.StopRunningApplication(installDirectory, log);

            string desktopShortcut = AppPaths.DesktopShortcut(options.DesktopDirectory);
            if (WindowsIntegration.DeleteFileIfExists(desktopShortcut)) log("Ярлык с рабочего стола удалён.");
            else log("Ярлыка на рабочем столе нет — пропускаю.");

            if (Directory.Exists(options.StartMenuFolder))
            {
                WindowsIntegration.DeleteDirectoryWithRetries(options.StartMenuFolder);
                log("Ярлыки из меню «Пуск» удалены.");
            }
            else
            {
                log("Ярлыков в меню «Пуск» нет — пропускаю.");
            }

            if (options.RemoveRegistry)
            {
                WindowsIntegration.UnregisterApplication();
                log("Запись из списка установленных программ Windows удалена.");
            }

            if (Directory.Exists(installDirectory))
            {
                WindowsIntegration.DeleteDirectoryWithRetries(installDirectory);
                log("Файлы программы, избранное, история и настройки удалены.");
            }
            else
            {
                log("Папка программы уже отсутствует.");
            }

            log("RAP ATLAS полностью удалён.");
        }

        private static void ValidateUninstallDirectory(string directory, bool testMode)
        {
            string full = Path.GetFullPath(directory);
            if (!testMode && !string.Equals(full, Path.GetFullPath(AppPaths.InstallDirectory), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Удаление остановлено: путь программы не совпадает с ожидаемым.");
            }
            if (string.Equals(full, Path.GetPathRoot(full), StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Удаление корня диска запрещено.");
            }
        }
    }

    internal static class WindowsIntegration
    {
        private const string UninstallRegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\RAP ATLAS";
        private const int MoveFileDelayUntilReboot = 0x4;

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool MoveFileEx(string existingFileName, string newFileName, int flags);

        internal static void CreateShortcut(string shortcutPath, string targetExecutable, string arguments, string description)
        {
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType == null) throw new InvalidOperationException("Windows не смогла создать ярлык.");

            object shell = null;
            object shortcut = null;
            try
            {
                shell = Activator.CreateInstance(shellType);
                shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { shortcutPath });
                Type shortcutType = shortcut.GetType();
                shortcutType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetExecutable });
                shortcutType.InvokeMember("Arguments", BindingFlags.SetProperty, null, shortcut, new object[] { arguments });
                shortcutType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { Path.GetDirectoryName(targetExecutable) });
                shortcutType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { targetExecutable + ",0" });
                shortcutType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { description });
                shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
            }
            finally
            {
                if (shortcut != null && Marshal.IsComObject(shortcut)) Marshal.FinalReleaseComObject(shortcut);
                if (shell != null && Marshal.IsComObject(shell)) Marshal.FinalReleaseComObject(shell);
            }
        }

        internal static void RegisterApplication(string installDirectory)
        {
            using (RegistryKey key = Registry.CurrentUser.CreateSubKey(UninstallRegistryPath))
            {
                if (key == null) throw new InvalidOperationException("Windows не смогла зарегистрировать программу.");
                string main = AppPaths.MainExecutable(installDirectory);
                string uninstaller = AppPaths.UninstallerExecutable(installDirectory);
                key.SetValue("DisplayName", AppPaths.AppName);
                key.SetValue("DisplayVersion", AppPaths.Version);
                key.SetValue("Publisher", "RAP ATLAS");
                key.SetValue("DisplayIcon", main + ",0");
                key.SetValue("InstallLocation", installDirectory);
                key.SetValue("UninstallString", CommandLine.Quote(uninstaller));
                key.SetValue("URLInfoAbout", "https://t.me/RAPATLAS");
                key.SetValue("HelpLink", "https://t.me/RAPATLAS/33");
                key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                key.SetValue("EstimatedSize", 1800, RegistryValueKind.DWord);
            }
        }

        internal static void UnregisterApplication()
        {
            try { Registry.CurrentUser.DeleteSubKeyTree(UninstallRegistryPath, false); }
            catch (ArgumentException) { }
        }

        internal static void StartApplication(string executable)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = executable,
                Arguments = "--run",
                WorkingDirectory = Path.GetDirectoryName(executable),
                UseShellExecute = true
            });
        }

        internal static void StopRunningApplication(string installDirectory, Action<string> log)
        {
            bool requested = RequestServerShutdown(installDirectory);
            if (requested)
            {
                log("Запущенная копия получила команду на завершение.");
                Thread.Sleep(350);
            }

            string expectedExecutable = Path.GetFullPath(AppPaths.MainExecutable(installDirectory));
            bool stopped = false;
            foreach (Process process in Process.GetProcessesByName("RAP ATLAS"))
            {
                try
                {
                    string processPath = process.MainModule == null ? null : process.MainModule.FileName;
                    if (processPath != null && string.Equals(Path.GetFullPath(processPath), expectedExecutable, StringComparison.OrdinalIgnoreCase))
                    {
                        if (!process.WaitForExit(1200)) process.Kill();
                        stopped = true;
                    }
                }
                catch { }
                finally { process.Dispose(); }
            }
            if (stopped) log("Фоновый процесс RAP ATLAS остановлен.");
            else if (!requested) log("Запущенных процессов RAP ATLAS нет.");
        }

        internal static bool RequestServerShutdown(string installDirectory)
        {
            try
            {
                string portFile = AppPaths.PortFile(installDirectory);
                int port;
                if (!File.Exists(portFile)) return false;
                string[] connection = File.ReadAllLines(portFile, Encoding.ASCII);
                if (connection.Length < 2 || !int.TryParse(connection[0], out port) || string.IsNullOrWhiteSpace(connection[1])) return false;
                string token = connection[1].Trim();
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/__shutdown?token=" + Uri.EscapeDataString(token));
                request.Method = "POST";
                request.Timeout = 600;
                request.ReadWriteTimeout = 600;
                request.Proxy = null;
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch { return false; }
        }

        internal static bool DeleteFileIfExists(string path)
        {
            if (!File.Exists(path)) return false;
            File.SetAttributes(path, FileAttributes.Normal);
            File.Delete(path);
            return true;
        }

        internal static void DeleteDirectoryWithRetries(string directory)
        {
            Exception last = null;
            for (int attempt = 0; attempt < 8; attempt++)
            {
                try
                {
                    if (!Directory.Exists(directory)) return;
                    Directory.Delete(directory, true);
                    return;
                }
                catch (Exception error)
                {
                    last = error;
                    Thread.Sleep(200);
                }
            }
            throw new IOException("Не удалось удалить папку: " + directory, last);
        }

        internal static void LaunchTemporaryUninstaller()
        {
            string source = Assembly.GetExecutingAssembly().Location;
            string temporaryDirectory = Path.Combine(Path.GetTempPath(), "RAP ATLAS Uninstall " + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(temporaryDirectory);
            string temporaryExecutable = Path.Combine(temporaryDirectory, "RAP ATLAS Uninstall.exe");
            File.Copy(source, temporaryExecutable, true);

            Process.Start(new ProcessStartInfo
            {
                FileName = temporaryExecutable,
                Arguments = "--uninstall-temp --install-dir=" + CommandLine.Quote(AppPaths.InstallDirectory),
                WorkingDirectory = temporaryDirectory,
                UseShellExecute = true
            });
        }

        internal static void ScheduleTemporaryUninstallerCleanup(string temporaryExecutable)
        {
            try
            {
                string temporaryDirectory = Path.GetDirectoryName(temporaryExecutable);
                MoveFileEx(temporaryExecutable, null, MoveFileDelayUntilReboot);
                MoveFileEx(temporaryDirectory, null, MoveFileDelayUntilReboot);
            }
            catch { }
        }
    }
}

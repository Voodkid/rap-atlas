using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("RAP ATLAS")]
[assembly: AssemblyDescription("Интерактивная карта интернет-рэпа")]
[assembly: AssemblyCompany("RAP ATLAS")]
[assembly: AssemblyProduct("RAP ATLAS")]
[assembly: AssemblyCopyright("RAP ATLAS")]
namespace RapAtlasDesktop
{
    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                if (CommandLine.Has(args, "--silent-install"))
                {
                    InstallOptions options = InstallOptions.FromCommandLine(args);
                    InstallationEngine.Install(options, delegate(string message) { Console.WriteLine(message); });
                    return 0;
                }

                if (CommandLine.Has(args, "--silent-uninstall"))
                {
                    UninstallOptions options = UninstallOptions.FromCommandLine(args);
                    UninstallEngine.Uninstall(options, delegate(string message) { Console.WriteLine(message); });
                    return 0;
                }

                string executableName = Path.GetFileName(Assembly.GetExecutingAssembly().Location);
                if (CommandLine.Has(args, "--run") || string.Equals(executableName, AppPaths.MainExecutableName, StringComparison.OrdinalIgnoreCase))
                {
                    return LocalServer.Run(args);
                }

                if (CommandLine.Has(args, "--uninstall-temp"))
                {
                    string installDirectory = CommandLine.Value(args, "--install-dir=") ?? AppPaths.InstallDirectory;
                    Application.Run(new UninstallForm(installDirectory, Assembly.GetExecutingAssembly().Location));
                    return 0;
                }

                if (string.Equals(executableName, AppPaths.UninstallerExecutableName, StringComparison.OrdinalIgnoreCase))
                {
                    WindowsIntegration.LaunchTemporaryUninstaller();
                    return 0;
                }

                Application.Run(new InstallForm());
                return 0;
            }
            catch (Exception error)
            {
                MessageBox.Show(
                    "Операцию не удалось завершить.\n\n" + error.Message,
                    AppPaths.AppName,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
                return 1;
            }
        }
    }

    internal static partial class AppPaths
    {
        internal const string AppName = "RAP ATLAS";
        internal const string MainExecutableName = "RAP ATLAS.exe";
        internal const string UninstallerExecutableName = "Удалить RAP ATLAS.exe";
        internal static string InstallDirectory
        {
            get
            {
                return Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Programs",
                    AppName);
            }
        }

        internal static string MainExecutable(string installDirectory)
        {
            return Path.Combine(installDirectory, MainExecutableName);
        }

        internal static string UninstallerExecutable(string installDirectory)
        {
            return Path.Combine(installDirectory, UninstallerExecutableName);
        }

        internal static string DataDirectory(string installDirectory)
        {
            return Path.Combine(installDirectory, "data");
        }

        internal static string PortFile(string installDirectory)
        {
            return Path.Combine(installDirectory, "port.txt");
        }

        internal static string DesktopDirectory
        {
            get { return Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory); }
        }

        internal static string StartMenuFolder
        {
            get
            {
                return Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.Programs),
                    AppName);
            }
        }

        internal static string DesktopShortcut(string desktopDirectory)
        {
            return Path.Combine(desktopDirectory, AppName + ".lnk");
        }
    }

    internal sealed class InstallOptions
    {
        internal string InstallDirectory;
        internal string DesktopDirectory;
        internal string StartMenuFolder;
        internal bool CreateDesktopShortcut;
        internal bool LaunchAfterInstall;
        internal bool RegisterApplication;
        internal bool TestMode;

        internal static InstallOptions Defaults()
        {
            return new InstallOptions
            {
                InstallDirectory = AppPaths.InstallDirectory,
                DesktopDirectory = AppPaths.DesktopDirectory,
                StartMenuFolder = AppPaths.StartMenuFolder,
                CreateDesktopShortcut = true,
                LaunchAfterInstall = true,
                RegisterApplication = true,
                TestMode = false
            };
        }

        internal static InstallOptions FromCommandLine(string[] args)
        {
            InstallOptions options = Defaults();
            options.TestMode = CommandLine.Has(args, "--test-mode");
            options.InstallDirectory = CommandLine.Value(args, "--install-dir=") ?? options.InstallDirectory;
            options.DesktopDirectory = CommandLine.Value(args, "--desktop-dir=") ?? options.DesktopDirectory;
            options.StartMenuFolder = CommandLine.Value(args, "--start-menu-dir=") ?? options.StartMenuFolder;
            options.CreateDesktopShortcut = CommandLine.Bool(args, "--desktop-shortcut=", true);
            options.LaunchAfterInstall = CommandLine.Bool(args, "--launch=", false);
            options.RegisterApplication = CommandLine.Bool(args, "--register=", !options.TestMode);
            return options;
        }
    }

    internal sealed class UninstallOptions
    {
        internal string InstallDirectory;
        internal string DesktopDirectory;
        internal string StartMenuFolder;
        internal bool RemoveRegistry;
        internal bool TestMode;

        internal static UninstallOptions Defaults(string installDirectory)
        {
            return new UninstallOptions
            {
                InstallDirectory = installDirectory,
                DesktopDirectory = AppPaths.DesktopDirectory,
                StartMenuFolder = AppPaths.StartMenuFolder,
                RemoveRegistry = true,
                TestMode = false
            };
        }

        internal static UninstallOptions FromCommandLine(string[] args)
        {
            string directory = CommandLine.Value(args, "--install-dir=") ?? AppPaths.InstallDirectory;
            UninstallOptions options = Defaults(directory);
            options.TestMode = CommandLine.Has(args, "--test-mode");
            options.DesktopDirectory = CommandLine.Value(args, "--desktop-dir=") ?? options.DesktopDirectory;
            options.StartMenuFolder = CommandLine.Value(args, "--start-menu-dir=") ?? options.StartMenuFolder;
            options.RemoveRegistry = CommandLine.Bool(args, "--register=", !options.TestMode);
            return options;
        }
    }

    internal static class CommandLine
    {
        internal static bool Has(string[] args, string expected)
        {
            foreach (string argument in args)
            {
                if (string.Equals(argument, expected, StringComparison.OrdinalIgnoreCase)) return true;
            }
            return false;
        }

        internal static string Value(string[] args, string prefix)
        {
            foreach (string argument in args)
            {
                if (argument.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                {
                    return argument.Substring(prefix.Length).Trim('"');
                }
            }
            return null;
        }

        internal static bool Bool(string[] args, string prefix, bool fallback)
        {
            string value = Value(args, prefix);
            if (value == null) return fallback;
            return value == "1" || string.Equals(value, "true", StringComparison.OrdinalIgnoreCase) || string.Equals(value, "yes", StringComparison.OrdinalIgnoreCase);
        }

        internal static int PositiveInt(string[] args, string prefix)
        {
            int value;
            return int.TryParse(Value(args, prefix), out value) && value > 0 && value <= 65535 ? value : 0;
        }

        internal static string Quote(string value)
        {
            return "\"" + value.Replace("\"", "\\\"") + "\"";
        }
    }
}

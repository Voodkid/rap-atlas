using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace RapAtlasDesktop
{
    internal static class InstallerColors
    {
        internal static readonly Color Background = Color.FromArgb(12, 13, 15);
        internal static readonly Color Panel = Color.FromArgb(23, 25, 30);
        internal static readonly Color Line = Color.FromArgb(54, 58, 67);
        internal static readonly Color Text = Color.FromArgb(244, 241, 234);
        internal static readonly Color Muted = Color.FromArgb(181, 177, 168);
        internal static readonly Color Accent = Color.FromArgb(199, 255, 94);
        internal static readonly Color AccentText = Color.FromArgb(16, 20, 9);
        internal static readonly Color Danger = Color.FromArgb(255, 107, 107);
    }

    internal abstract class InstallerFormBase : Form
    {
        protected readonly RichTextBox LogBox;
        protected readonly ProgressBar Progress;
        protected readonly Button PrimaryButton;
        protected readonly Button SecondaryButton;

        protected InstallerFormBase(string title, string heading, string subtitle, string primaryText)
        {
            Text = title;
            ClientSize = new Size(720, 610);
            MinimumSize = new Size(736, 649);
            MaximumSize = new Size(736, 649);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = InstallerColors.Background;
            ForeColor = InstallerColors.Text;
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular, GraphicsUnit.Point);
            AutoScaleMode = AutoScaleMode.Dpi;
            try { Icon = Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location); }
            catch { }

            Panel header = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(720, 118),
                BackColor = Color.FromArgb(8, 9, 11)
            };
            Controls.Add(header);

            Label mark = new Label
            {
                Text = "RA",
                Location = new Point(28, 25),
                Size = new Size(62, 62),
                TextAlign = ContentAlignment.MiddleCenter,
                BackColor = InstallerColors.Accent,
                ForeColor = InstallerColors.AccentText,
                Font = new Font("Segoe UI", 18f, FontStyle.Bold)
            };
            header.Controls.Add(mark);

            Label headingLabel = new Label
            {
                Text = heading,
                Location = new Point(108, 24),
                Size = new Size(575, 35),
                ForeColor = InstallerColors.Text,
                Font = new Font("Segoe UI", 18f, FontStyle.Bold)
            };
            header.Controls.Add(headingLabel);

            Label subtitleLabel = new Label
            {
                Text = subtitle,
                Location = new Point(110, 63),
                Size = new Size(565, 38),
                ForeColor = InstallerColors.Muted,
                Font = new Font("Segoe UI", 9.5f)
            };
            header.Controls.Add(subtitleLabel);

            Label logLabel = new Label
            {
                Text = "ПОЛНЫЙ ЖУРНАЛ",
                Location = new Point(28, 249),
                Size = new Size(180, 21),
                ForeColor = InstallerColors.Muted,
                Font = new Font("Segoe UI", 8f, FontStyle.Bold)
            };
            Controls.Add(logLabel);

            LogBox = new RichTextBox
            {
                Location = new Point(28, 274),
                Size = new Size(664, 236),
                BackColor = Color.FromArgb(8, 9, 11),
                ForeColor = Color.FromArgb(207, 228, 174),
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Consolas", 9f),
                ReadOnly = true,
                WordWrap = false,
                ScrollBars = RichTextBoxScrollBars.ForcedVertical,
                DetectUrls = false
            };
            Controls.Add(LogBox);

            Progress = new ProgressBar
            {
                Location = new Point(28, 526),
                Size = new Size(664, 6),
                Style = ProgressBarStyle.Continuous,
                Minimum = 0,
                Maximum = 100,
                Value = 0
            };
            Controls.Add(Progress);

            PrimaryButton = new Button
            {
                Text = primaryText,
                Location = new Point(492, 552),
                Size = new Size(200, 38),
                FlatStyle = FlatStyle.Flat,
                BackColor = InstallerColors.Accent,
                ForeColor = InstallerColors.AccentText,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            PrimaryButton.FlatAppearance.BorderSize = 0;
            Controls.Add(PrimaryButton);

            SecondaryButton = new Button
            {
                Text = "Отмена",
                Location = new Point(354, 552),
                Size = new Size(126, 38),
                FlatStyle = FlatStyle.Flat,
                BackColor = InstallerColors.Panel,
                ForeColor = InstallerColors.Text,
                Cursor = Cursors.Hand
            };
            SecondaryButton.FlatAppearance.BorderColor = InstallerColors.Line;
            Controls.Add(SecondaryButton);
            SecondaryButton.Click += delegate { Close(); };
        }

        protected void AppendLog(string message)
        {
            string line = "[" + DateTime.Now.ToString("HH:mm:ss") + "] " + message;
            LogBox.AppendText(line + Environment.NewLine);
            LogBox.SelectionStart = LogBox.TextLength;
            LogBox.ScrollToCaret();
            Application.DoEvents();
        }

        protected void SetBusy(bool busy)
        {
            PrimaryButton.Enabled = !busy;
            SecondaryButton.Enabled = !busy;
            Progress.Style = busy ? ProgressBarStyle.Marquee : ProgressBarStyle.Continuous;
            Progress.MarqueeAnimationSpeed = busy ? 22 : 0;
        }

        protected void SetCompleted()
        {
            Progress.Style = ProgressBarStyle.Continuous;
            Progress.Value = 100;
            PrimaryButton.Enabled = true;
            PrimaryButton.Text = "Закрыть";
            SecondaryButton.Visible = false;
            AcceptButton = PrimaryButton;
        }
    }

    internal sealed class InstallForm : InstallerFormBase
    {
        private readonly CheckBox desktopShortcut;
        private readonly CheckBox launchAfterInstall;
        private bool completed;

        internal InstallForm()
            : base(
                "Установка RAP ATLAS",
                File.Exists(AppPaths.MainExecutable(AppPaths.InstallDirectory)) ? "Обновление RAP ATLAS" : "Установка RAP ATLAS",
                "Локальная карта интернет-рэпа. Без аккаунта, рекламы и фоновых служб.",
                File.Exists(AppPaths.MainExecutable(AppPaths.InstallDirectory)) ? "Обновить" : "Установить")
        {
            Label location = new Label
            {
                Text = "Программа установится только для текущего пользователя:\n" + AppPaths.InstallDirectory,
                Location = new Point(28, 137),
                Size = new Size(664, 45),
                ForeColor = InstallerColors.Muted
            };
            Controls.Add(location);

            desktopShortcut = new CheckBox
            {
                Text = "Создать ярлык на рабочем столе",
                Location = new Point(28, 189),
                Size = new Size(315, 25),
                Checked = true,
                ForeColor = InstallerColors.Text,
                Cursor = Cursors.Hand
            };
            Controls.Add(desktopShortcut);

            launchAfterInstall = new CheckBox
            {
                Text = "Запустить RAP ATLAS после установки",
                Location = new Point(360, 189),
                Size = new Size(332, 25),
                Checked = true,
                ForeColor = InstallerColors.Text,
                Cursor = Cursors.Hand
            };
            Controls.Add(launchAfterInstall);

            Label note = new Label
            {
                Text = "Права администратора не нужны. Все действия будут показаны ниже.",
                Location = new Point(28, 220),
                Size = new Size(664, 22),
                ForeColor = InstallerColors.Muted
            };
            Controls.Add(note);

            AppendLog("Готов к установке. Выбери параметры и нажми «" + PrimaryButton.Text + "».");
            PrimaryButton.Click += InstallClicked;
            AcceptButton = PrimaryButton;
            CancelButton = SecondaryButton;
        }

        private void InstallClicked(object sender, EventArgs eventArgs)
        {
            if (completed)
            {
                Close();
                return;
            }

            SetBusy(true);
            desktopShortcut.Enabled = false;
            launchAfterInstall.Enabled = false;
            try
            {
                InstallOptions options = InstallOptions.Defaults();
                options.CreateDesktopShortcut = desktopShortcut.Checked;
                options.LaunchAfterInstall = launchAfterInstall.Checked;
                InstallationEngine.Install(options, AppendLog);
                completed = true;
                SetCompleted();
            }
            catch (Exception error)
            {
                AppendLog("ОШИБКА: " + error.Message);
                SetBusy(false);
                desktopShortcut.Enabled = true;
                launchAfterInstall.Enabled = true;
                MessageBox.Show("Установка не завершена. Подробности видны в журнале.", AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    internal sealed class UninstallForm : InstallerFormBase
    {
        private readonly string installDirectory;
        private readonly string temporaryExecutable;
        private bool completed;

        internal UninstallForm(string installDirectory, string temporaryExecutable)
            : base(
                "Удаление RAP ATLAS",
                "Удаление RAP ATLAS",
                "Будут удалены программа, ярлыки, избранное, история и настройки.",
                "Удалить полностью")
        {
            this.installDirectory = Path.GetFullPath(installDirectory);
            this.temporaryExecutable = Path.GetFullPath(temporaryExecutable);

            Label explanation = new Label
            {
                Text = "Никакие другие программы и файлы затронуты не будут.\nПапка удаления: " + this.installDirectory,
                Location = new Point(28, 145),
                Size = new Size(664, 48),
                ForeColor = InstallerColors.Muted
            };
            Controls.Add(explanation);

            Label warning = new Label
            {
                Text = "После подтверждения отменить удаление будет нельзя.",
                Location = new Point(28, 205),
                Size = new Size(664, 26),
                ForeColor = InstallerColors.Danger,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };
            Controls.Add(warning);

            AppendLog("Готов к удалению. Нажми «Удалить полностью», чтобы начать.");
            PrimaryButton.BackColor = InstallerColors.Danger;
            PrimaryButton.ForeColor = Color.White;
            PrimaryButton.Click += UninstallClicked;
            AcceptButton = PrimaryButton;
            CancelButton = SecondaryButton;
            FormClosed += delegate { WindowsIntegration.ScheduleTemporaryUninstallerCleanup(this.temporaryExecutable); };
        }

        private void UninstallClicked(object sender, EventArgs eventArgs)
        {
            if (completed)
            {
                Close();
                return;
            }

            SetBusy(true);
            try
            {
                UninstallOptions options = UninstallOptions.Defaults(installDirectory);
                UninstallEngine.Uninstall(options, AppendLog);
                AppendLog("Временный файл удаления помечен средствами Windows и исчезнет после закрытия окна или следующей перезагрузки.");
                completed = true;
                SetCompleted();
            }
            catch (Exception error)
            {
                AppendLog("ОШИБКА: " + error.Message);
                SetBusy(false);
                MessageBox.Show("Удаление не завершено. Подробности видны в журнале.", AppPaths.AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}

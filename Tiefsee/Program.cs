using System.IO;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;

namespace Tiefsee {
    static class Program {


        public static int startPort; //�{���}�l��port
        public static int startType; //1=�����Ұ�  2=�ֳt�Ұ�  3=�ֳt�ҰʥB�`�n  4=��@�������  5=��@�������B�`�n
        public static int serverCache; //���A�����R�A�귽�֨����ɶ�(��)
        public static WebServer webServer; //���a���A��
        public static StartWindow startWindow; //�_�l�����A�����������N�|�����{��

        /// <summary> �z�LUserAgent�����ҬO�_���v���ШDlocalhost server API </summary>
        public static string webvviewUserAgent = "Tiefsee";

        /// <summary> webview2���ҰʰѼ� </summary>
        public static string webvviewArguments;

        /// <summary>
        /// ���ε{�����D�n�i�J�I�C
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            //�ק� �u�@�ؿ� ���{����Ƨ� (�p�G���ǤJargs���ܡA�u�@�ؿ��|�Q�ק�A�ҥH�ݭn��^��
            Directory.SetCurrentDirectory(System.AppDomain.CurrentDomain.BaseDirectory);
            AppPath.Init();

            //�p�G�O�ө�APP���A�B�O�Ӧۡu�}���۰ʱҰʡv
            if (StartWindow.isStoreApp) {
                try {
                    var args2 = AppInstance.GetActivatedEventArgs();
                    if (args2 != null) {
                        if (args2.Kind == ActivationKind.StartupTask) {
                            args = new string[] { "none" };
                        }
                    }
                } catch { }
            }

            IniManager iniManager = new IniManager(AppPath.appDataStartIni);
            startPort = Int32.Parse(iniManager.ReadIniFile("setting", "startPort", "4876"));
            startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));
            serverCache = Int32.Parse(iniManager.ReadIniFile("setting", "serverCache", "0"));

            bool argsIsNone = (args.Length == 1 && args[0] == "none"); //�ҰʰѼƬO none

            if (args.Length >= 1 && args[0] == "restart") { //�ҰʰѼƬO restart

                args = args.Skip(1).ToArray(); //�R���}�C���Ĥ@��

            } else {

                // �ҰʼҦ����O�`�n�I���A�N�������}
                if (argsIsNone) {
                    if (startType == 3 || startType == 5) {
                    } else {
                        return;
                    }
                }

                //�p�G���\�ֳt�ҰʡA�N���}�ҷs����
                if (QuickRun.Check(args)) { return; }
            }

            //�u�����Ұʡv���~���A���n�קK�s��Ұ�
            if (startType != 1) {
                if (AppLock(true)) { return; }
            }

            //�b���a�ݫإ�server
            webServer = new WebServer();
            bool webServerState = webServer.Init();
            if (webServerState == false) {
                System.Windows.Forms.MessageBox.Show("Tiefsee localhost server error");
                return;
            }
            webServer.controller.SetCacheTime(serverCache);

            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            //--disable-web-security  ���\���ШD
            //--disable-features=msWebOOUI,msPdfOOUI  �T��g�A���
            //--disable-backing-store-limit  �T�ι��Ʀs�x�ƶq������C�i�H����㦳�\�h����/�ﶵ�d�M�j�q�O���骺�Τ�{�{
            //--user-agent  �мguserAgent
            //--enable-features=msWebView2EnableDraggableRegions ��webview2�䴩css�uapp-region:drag�v
            webvviewArguments = $@"
--disable-web-security 
--disable-features=""msWebOOUI,msPdfOOUI"" 
--disable-backing-store-limit 
--user-agent=""{Program.webvviewUserAgent}"" 
--enable-features=""msWebView2EnableDraggableRegions"" 
";

            if (startType != 1) { AppLock(false); } //�Ѱ���w
            startWindow = new StartWindow();

            if (argsIsNone == false) {
                WebWindow.Create("MainWindow.html", args, null); //��ܪ�l����
            }
            if (argsIsNone == true) { //�p�Gargs�Onone
                WebWindow.NewTempWindow("MainWindow.html"); //�s�W�@�Ӭݤ����������A�Ω�U�����
            }

            Application.Run(startWindow);
        }


        /// <summary>
        /// �b�{�������Ұʫe�A�T��A���Ұ�
        /// </summary>
        /// <param name="val"> true=��w�Afalse=�Ѱ���w </param>
        /// <returns> �^��true��ܵ{���ثe��w���A���n�Ұʵ{�� </returns>
        private static bool AppLock(bool val) {
            if (val) {

                if (File.Exists(AppPath.appDataLock)) {
                    try {
                        long ticks = 0;
                        using (StreamReader sr = new StreamReader(AppPath.appDataLock, System.Text.Encoding.UTF8)) {
                            ticks = long.Parse(sr.ReadToEnd());
                        }

                        if (DateTime.Now.Ticks - ticks < 5 * 10000000) { //�b5���s��ҰʡA�N�T��Ұ�
                            return true;
                        } else {
                            return false;
                        }
                    } catch {
                        return false;
                    }
                } else {
                    //using (File.Create(lockPath)) { }
                    using (FileStream fs = new FileStream(AppPath.appDataLock, FileMode.Create)) {
                        using (StreamWriter sw = new StreamWriter(fs, System.Text.Encoding.UTF8)) {
                            sw.Write(DateTime.Now.Ticks.ToString());
                        }
                    }
                    return false;
                }

            } else {
                if (File.Exists(AppPath.appDataLock)) {
                    File.Delete(AppPath.appDataLock);
                }
            }
            return false;
        }



    }
}
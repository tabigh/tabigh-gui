using System;
using System.Collections.Generic;
//using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.IO;
using System.Threading;
using System.Net;
using System.Data;
using System.Net.Cache;
using System.Reflection;
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.InteropServices;

namespace epgSagemSimplicity
{
        
    public class EpgArgs : System.EventArgs
    {
        private string message;

        public EpgArgs(string m)
        {
            this.message = m;
        }

        public string Message
        {
            get { return message; }
        }
    }

    public partial class Epg
    {
        public string AssemblyVersion
        {
            get
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }

        // After web page is parsed, we raise event for gui to update.
        public delegate void EpgFinishedHandler(object sender, EpgArgs ea);
        public event EpgFinishedHandler Finished;

        ManualResetEvent mre = new ManualResetEvent(true);

        const int DefaultTimeout = 8000; //  8s timeout
        string[] linedelimiter = { "\n" };
        string CachePath = "c:\\epgtemp\\";
        //        string CachePath = 'i:\'Globals.UserAppPath+@"\..\cache\list\";
        List<string> CacheList = new List<string>();
        public epgResult result;
        HttpRequestCachePolicy policy;
        CookieContainer CookieCont;
        HttpWebRequest httpWebRequest = null;
        public SiolPlugin.EpgPlugin selectedPlugin = null;
        ASCIIEncoding encoding = new ASCIIEncoding();
        FileSystemWatcher fwatcher = null;
        bool VersionOk = false;
        String UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.3)";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="path_">Startup path</param>

        protected virtual void OnFinished(object sender, EpgArgs ea)
        {
            return;
        }

        public Epg()
        {
            selectedPlugin = new SiolPlugin.EpgPlugin();
            result = new epgResult("", "", "");
            //            Finished = OnFinished;
            if (AssemblyVersion.CompareTo(selectedPlugin.MulticasttvVersion) >= 0)
            {
                VersionOk = true;
            }

            policy = new HttpRequestCachePolicy(HttpRequestCacheLevel.Default);
            CookieCont = new CookieContainer();
            HttpWebRequest.DefaultCachePolicy = policy;
        }

        ~Epg()
        {
            CacheList.Clear();
            if (fwatcher != null)
                fwatcher.Dispose();
        }

        /// <summary>
        /// Start downloading in new thread
        /// </summary>
        /// <param name="chan">Channel name</param>
        public void start(string ChanName, epgResult er)
        {
            result = er;
            ThreadStart starter = delegate { getEpg("",""); };
            Thread th = new Thread(starter);
            th.IsBackground = true;
            th.Start();
        }

        /// <summary>
        /// Get today's epg information for current channel
        /// </summary>
        /// <param name="chan">Channel name</param>
        public int getEpg(string ChanId, string _CachePath)
        {
            string chan = ChanId;
            bool recvsign = mre.WaitOne(DefaultTimeout + 500, true);
            if (!recvsign)
                return 0;// should never happen
            
            mre.Reset();

            if (!VersionOk)
            {
                mre.Set();
                return 0;
            }

            if (result.EpgData != null)
                result.EpgData.Clear();

            if (selectedPlugin == null)
            {
                mre.Set();
//                Finished(this, new EpgArgs("no_data"));
                return 0;
            }

            if (_CachePath != "")
                CachePath = _CachePath;

            if (ChanId == null)
            {
                mre.Set();
//                Finished(this, new EpgArgs("no_data"));
                return 0;
            }

            // check for cache
            if (CacheList.Contains(chan))
            {
                string cachedFile = CachePath + validateFileName(chan + ".txt");
                if (File.Exists(cachedFile))
                {
                    FileStream fs = null;
                    try
                    {
                        fs = new FileStream(cachedFile, FileMode.Open);
                        BinaryFormatter formatter = new BinaryFormatter();
                        result.EpgData = (List<string[]>)formatter.Deserialize(fs);
                        fs.Close();
                        //raise finished event
//                        Finished(this, new EpgArgs("epg_finished"));
                        return 1;
                    }
                    catch
                    {
                        if (fs != null)
                            fs.Close();
                    }
                }
            }
            else
            {
                if (selectedPlugin.PluginType == "online")
                {
                    return sendRequest(chan, ChanId);
                }
            }
            mre.Set();
            return 0;
        }

        private int sendRequest(string chan, string chanId)
        {

            if (selectedPlugin.InitialRequestNeeded)
            {
                try
                {
                    httpWebRequest = (HttpWebRequest)WebRequest.Create(selectedPlugin.HostName + selectedPlugin.InitialRequest);
                }
                catch
                {
//                    Finished(this, new EpgArgs("no_data"));
                    return 0;
                }
                httpWebRequest.Referer = selectedPlugin.HostName;
                httpWebRequest.Method = selectedPlugin.InitialRequestMethod;
                httpWebRequest.Timeout = DefaultTimeout;
                if (UserAgent == "")
                    httpWebRequest.UserAgent = "MulticastTV/" + AssemblyVersion + " (compatible; MSIE 7.0; Windows NT 5.1)";
                else
                    httpWebRequest.UserAgent = UserAgent;
                httpWebRequest.CookieContainer = CookieCont;

                if (httpWebRequest.Method == "POST")
                {
                    byte[] byte1 = encoding.GetBytes(selectedPlugin.InitialRequest);
                    httpWebRequest.ContentLength = byte1.Length;
                    Stream newStream = httpWebRequest.GetRequestStream();
                    newStream.Write(byte1, 0, byte1.Length);
                    newStream.Close();
                }
                if (downloadEpg(chan, chanId, httpWebRequest, true))
                    selectedPlugin.InitialRequestNeeded = false;
            }

            string[] reqparm = selectedPlugin.GetTodayRequest(chanId);
            try
            {
                httpWebRequest = (HttpWebRequest)WebRequest.Create(selectedPlugin.HostName + reqparm[0]);
            }
            catch
            {
//                Finished(this, new EpgArgs("no_data"));
                return 0;
            }
            httpWebRequest.Referer = reqparm[1];
            httpWebRequest.Method = selectedPlugin.RequestMethod;
            httpWebRequest.Timeout = DefaultTimeout;
            if (UserAgent == "")
                httpWebRequest.UserAgent = "MulticastTV/" + AssemblyVersion + " (compatible; MSIE 7.0; Windows NT 5.1)";
            else
                httpWebRequest.UserAgent = UserAgent;
            httpWebRequest.CookieContainer = CookieCont;
            httpWebRequest.ContentType = "application/x-www-form-urlencoded";

            string line = reqparm[2];
            if (httpWebRequest.Method == "POST")
            {
                byte[] byte1 = encoding.GetBytes(line);
                httpWebRequest.ContentLength = byte1.Length;
                Stream newStream = httpWebRequest.GetRequestStream();
                newStream.Write(byte1, 0, byte1.Length);
                newStream.Close();
            }

            if (downloadEpg(chan, chanId, httpWebRequest, false))
            {
//                Finished(this, new EpgArgs("epg_finished"));
                return 1;
            }
            return 0;
        }

        private bool downloadEpg(string chan,
                                 string id,
                                 HttpWebRequest req,
                                 bool initial)
        {
            HttpWebResponse resp = null;
            try
            {
                resp = (HttpWebResponse)req.GetResponse();
            }
            catch
            {
                req = null;
                return false;
            }
            Stream RespStream = null;
            try
            {
                RespStream = resp.GetResponseStream();
            }
            catch
            {
                if (resp != null)
                    resp.Close();
                return false;
            }

            StreamReader sr = new StreamReader(RespStream);
            string epgPage = null;
            try
            {
                epgPage = sr.ReadToEnd();
            }
            catch
            {
            }

            // close everything
            sr.Dispose();
            RespStream.Close();
            if (resp != null)
                resp.Close();

            if (epgPage != null)
            {
                if (initial)
                    selectedPlugin.ParseInitPage(epgPage);
                else
                {
                    result.EpgData = selectedPlugin.ParseToday(epgPage);
                    // add reference date
                    if (result.EpgData.Count > 0)
                        result.EpgData.Add(new string[] { DateTime.Now.ToString("yyyy-MM-dd HH:mm", null) });
                    //raise finished event
                    cacheData(chan);
                    return true;
                }
            }
            return false;
        }

        private void cacheData(string chanName)
        {
            //Cache received data
            if (!Directory.Exists(CachePath))
                Directory.CreateDirectory(CachePath);

            if (!CacheList.Contains(chanName))
            {
                FileStream fs = new FileStream(CachePath + validateFileName(chanName + ".txt"), FileMode.Create);
                try
                {
                    //add to list
                    CacheList.Add(chanName);
                    //save to disk
                    BinaryFormatter formatter = new BinaryFormatter();
                    formatter.Serialize(fs, result.EpgData);

                    fs.Close();
                }
                catch
                {
                    fs.Close();
                }
            }
        }

        public void clearCache(string chanName)
        {
            if (CacheList.Contains(chanName))
            {
                CacheList.Remove(chanName);
                // if plugin needs initial request, we have to reset it.
                if (selectedPlugin.InitialRequest.Length > 0)
                    selectedPlugin.InitialRequestNeeded = true;
            }
        }

        public static string validateFileName(string file)
        {
            char[] ic = Path.GetInvalidFileNameChars();
            foreach (char character in ic)
            {
                file = file.Replace(character, '-');
            }
            return file;
        }

        public void Clean()
        {
            httpWebRequest = null;
            if (selectedPlugin != null)
                selectedPlugin.Dispose();
        }

        private void Changed(object sender, FileSystemEventArgs e)
        {
            //            XmltvParser.xmltvparser.reload();
        }

        private void FileCreated(object sender, FileSystemEventArgs e)
        {
            //            XmltvParser.xmltvparser.reload();
        }

    }
    public partial class epgResult
    {
        private List<string[]> epg;
        private string ip;
        private string name;
        private string referer;
        private bool datetimeFormat;

        public epgResult(string _ip, string _name, string _sender)
        {
            ip = _ip;
            name = _name;
            referer = _sender;
            datetimeFormat = false;
        }
        
        public List<string[]> EpgData
        {
            get { return epg; }
            set { epg = value; }
        }

        public string Ip
        {
            get { return ip; }
            set { ip = value; }
        }

        public string Name
        {
            get { return name; }
            set { name = value; }
        }

        public string Referer
        {
            get { return referer; }
            set { referer = value; }
        }

        public bool DatetimeFormat
        {
            get { return datetimeFormat; }
            set { datetimeFormat = value; }
        }
    }

    /// <summary>
    /// This class is used to download particular web site with epg detailed informations like tv show genre, summary, actors, director...
    /// Parsing of that web site is done in webepg plugins.
    /// </summary>
    public partial class EpgDetails
    {
        public string AssemblyVersion
        {
            get
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }

        public static string CachePath = "c:\\epgtemp\\cache\\details\\";
        public delegate void delegateParentThreadEpgResult(epgDeatailsResult res);
        public event delegateParentThreadEpgResult Finished;

        epgDeatailsResult result;
        const int DefaultTimeout = 9000; //  9s timeout
        HttpRequestCachePolicy policy;
        ASCIIEncoding encoding = new ASCIIEncoding();
        ManualResetEvent mre = new ManualResetEvent(true);

        public SiolPlugin.EpgPlugin selectedPlugin = null;
        bool VersionOk = false;
        String UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.3)";


        protected virtual void OnFinished(object sender, EpgArgs ea)
        {
            return;
        }

        /// <summary>
        /// Constructor
        /// </summary>
        public EpgDetails()
        {
            selectedPlugin = new SiolPlugin.EpgPlugin();
            result = new epgDeatailsResult();
            if (selectedPlugin != null && AssemblyVersion.CompareTo(selectedPlugin.MulticasttvVersion) >= 0)
            {
                VersionOk = true;
            }
            policy = new HttpRequestCachePolicy(HttpRequestCacheLevel.Default);
            HttpWebRequest.DefaultCachePolicy = policy;
            //            Finished = OnFinished;
        }

        /// <summary>
        /// Start downloading in new thread
        /// </summary>
        /// <param name="href">Link to page with details</param>
        public void start(string href)
        {
            ThreadStart starter = delegate { Get(href,""); };
            Thread th = new Thread(starter);
            th.IsBackground = true;
            th.Start();
        }

        /// <summary>
        /// Download epg details
        /// </summary>
        /// <param name="href">Link to page with details</param>
        public int Get(string href, string _CachePath)
        {
            bool recvsign = mre.WaitOne(DefaultTimeout + 1000, true);
            if (!recvsign)
                return 0;

            mre.Reset();

            if (!VersionOk)
                return 0;

            if (_CachePath != "")
                CachePath = _CachePath;
            
            if (readFromCache(href))
            {
//                Finished(result);
                mre.Set();
                return 1;
            }

            mre.Set();
            return getFromInternet(href);
        }

        private int getFromInternet(string href)
        {
            System.Uri uri = new Uri(href);
            HttpWebRequest wreq = (HttpWebRequest)WebRequest.Create(uri);

            wreq.Timeout = DefaultTimeout;
            if (UserAgent == "")
                wreq.UserAgent = "MulticastTV/" + AssemblyVersion + " (compatible; MSIE 7.0; Windows NT 5.1)";
            else
                wreq.UserAgent = UserAgent;
            wreq.Referer = selectedPlugin.HostName;
            wreq.Method = selectedPlugin.RequestMethod;
            wreq.ContentType = "application/x-www-form-urlencoded";

            string PostString;
            // TODO: This should be changed 
            if (href.Contains("?"))
                PostString = href.Split("?".ToCharArray(), 2)[1];
            else
                PostString = href;

            if (wreq.Method == "POST")
            {
                byte[] byte1 = encoding.GetBytes(PostString);
                wreq.ContentLength = byte1.Length;
                Stream newStream = wreq.GetRequestStream();
                newStream.Write(byte1, 0, byte1.Length);
                newStream.Close();
            }

            if (downloadEpg(wreq, PostString, href))
            {
                cacheData(href);
//                Finished(result);
                return 1;
            }
            return 0;
        }

        private bool readFromCache(string href)
        {
            string cachedFile = CachePath + Epg.validateFileName(href + ".dat");
            if (File.Exists(cachedFile))
            {
                FileStream fs = null;
                try
                {
                    fs = new FileStream(cachedFile, FileMode.Open);
                    BinaryFormatter formatter = new BinaryFormatter();
                    result.EpgData = (string[])formatter.Deserialize(fs);
                    fs.Close();
                    return true;
                }
                catch
                {
                    if (fs != null)
                        fs.Close();
                }
            }
            return false;
        }

        private void cacheData(string href)
        {
            // Cache received data
            if (!Directory.Exists(CachePath))
                Directory.CreateDirectory(CachePath);

            FileStream fs = new FileStream(CachePath + Epg.validateFileName(href + ".dat"), FileMode.Create);
            try
            {
                //save to disk
                BinaryFormatter formatter = new BinaryFormatter();
                formatter.Serialize(fs, result.EpgData);
                fs.Close();
            }
            catch
            {
                fs.Close();
            }
        }

        private bool downloadEpg(HttpWebRequest req,
                                 string PostString,
                                 string href
                                 )
        {
            HttpWebResponse resp = null;
            try
            {
                resp = (HttpWebResponse)req.GetResponse();
            }
            catch
            {
                req = null;
                return false;
            }
            Stream RespStream = null;
            try
            {
                RespStream = resp.GetResponseStream();
            }
            catch
            {
                if (resp != null)
                    resp.Close();
                return false;
            }

            StreamReader sr = new StreamReader(RespStream);
            string epgPage = null;
            try
            {
                epgPage = sr.ReadToEnd();
            }
            catch
            {
            }

            // close everything
            sr.Dispose();
            RespStream.Close();
            if (resp != null)
                resp.Close();

            if (epgPage != null)
            {
                if (selectedPlugin != null)
                {
                    result.EpgData = selectedPlugin.ParseDetails(epgPage);
                    return true;
                }
            }
            return false;
        }
    }

    public class epgDeatailsResult
    {
        private string[] epg;

        public string[] EpgData
        {
            get { return epg; }
            set { epg = value; }
        }
    }


/*
 * 
 * COM interface
 * 
 */
  
    [ComVisible(true)]
    public interface IEpg
    {
        int getEpg(string ChanId, string CachePath);
        string result {get;}

    }

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)] //This is to make sure that no automatic generation of COM methods is done
    [ComDefaultInterface(typeof(IEpg))] //This to explicitly establish which is the default interface
    [ProgId("epgSagemSimplicity.Epg")]
    [Guid("f0660013-1603-4222-880e-7f8bc25d341c")]
    [IDispatchImpl(IDispatchImplType.CompatibleImpl)]
    partial class Epg : IEpg
    {

        #region IEpg Members
        //Explicit implementation is better because it avoids messing your .NET
        //class specification. Sometimes when you expose thru COM you can have problem with
        //methods overloads. For example you have to have the same method name but differente 
        //return type. Or you have a collition with an existing member.
        int IEpg.getEpg(string ChanId,string CachePath)
        {
            return getEpg(ChanId, CachePath);
        }

        string IEpg.result
        {
            get {
                    List<string> ls = new List<string>();
                    foreach (string[] item in this.result.EpgData)
                    {
                        ls.Add(String.Join("|;|", item));                                               
                    }
                    return String.Join("|:|", ls.ToArray());
                }
        }


        #endregion
    }

    [ComVisible(true)]
    public interface IEpgDetails
    {
        int Get(string href,string CachePath);
        string result { get; }
    }

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)] //This is to make sure that no automatic generation of COM methods is done
    [ComDefaultInterface(typeof(IEpgDetails))] //This to explicitly establish which is the default interface
    [ProgId("epgSagemSimplicity.EpgDetails")]
    [Guid("f0660013-1603-4222-880e-7f8bc25d341d")]
    [IDispatchImpl(IDispatchImplType.CompatibleImpl)]
    partial class EpgDetails : IEpgDetails
    {

        #region IEpgDetails Members
        //Explicit implementation is better because it avoids messing your .NET
        //class specification. Sometimes when you expose thru COM you can have problem with
        //methods overloads. For example you have to have the same method name but differente 
        //return type. Or you have a collition with an existing member.
        int IEpgDetails.Get(string href,string CachePath)
        {
            return Get(href,CachePath);
        }

        string IEpgDetails.result
        {
            get
            {
                return String.Join("|:|", this.result.EpgData);                
            }
        }


        #endregion
    }


}

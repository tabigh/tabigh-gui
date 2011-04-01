using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using PluginInterface;
using System.IO;


namespace SiolPlugin
{
    public class EpgPlugin : IEpgPlugin
    {
        private string name = "siol";
        private string comment = "Dodatne nastavitve so v datoteki siol.conf v mapi webepgplugins.";
        private string author = "MulticastTV";
        private string version = "1.0";
        private string multicasttvVersion = "0.30.0.0";
        private string lockedToLang = "sl-si";
        private string type = "online";
 
        // default regex settings
        private string hostname = "http://www.siol.net/";
        private string httpMethod = "GET";
        private string flag = "";
        private string initRequest = "tv-spored.aspx";
        private string initHttpMethod = "GET";
        private bool initRequestNeeded = true;  // we need to get "flag" from main page first
        private string regexInit = @"flag\s*=\s*(?<flag>.*?)[""']";
        //private string regexDaily = @"\<td\sclass\s*=\s*""time""\>(?<ura>.*?)\<\/td\>(.*?)onclick\s*=\s*[""']\s*go\s*\(\s*[""'](?<chn>.*?)[""']\s*,\s*[""'](?<flag>.*?)[""']\s*,\s*[""'](?<day>.*?)[""']\s*,\s*[""'](?<tip>.*?)[""']\s*,\s*[""'](?<val>.*?)[""']\s*\)(.*?)title\s*=\s*[""'](?<naslov>.*?)[""']";
       
        //<td class="time">00:00</td>	<td class="prog">		<div class="prog1"><a onMouseover="ddrivetip('Film / Erotični, Francija 2004')" onMouseout="hideddrivetip()" href="tv-spored.aspx?val=1522198&amp;flag=kklt4fxp0odu4xddzoug">Monica - ženske zgodbe</a>		</div>	</td></tr><tr class="dark">
        private string regexDailySplit = @"\<td\sclass\s*=\s*""time""\>";
        private string regexDaily = @"(?<ura>[0-9][0-9].[0-9][0-9]).*ddrivetip\s*\(\s*[""'](?<tip>.*?)[""']\).*val=(?<val>[0-9]+).*flag=(?<flag>.*?)[""']\>(?<naslov>.*?)\<\/a\>";        
//        private string regexDetails = @"\<span\sclass=""title""\>(?<chan>.*?)\<\/span\>(.*?)\<span\sclass=""time""\>(?<time>.*?)\<\/span\>(.*?)\<div\sclass=""event""\>\<h4\>(?<naslovinhref>.*?)\<\/h4\>(.*?)class=""sub""\>(?<zanr>.*?)\<\/p\>(.*?)class=""desc""\>(?<opis>.*?)\<\/p\>(.*?)\<p\sclass=""actor""\>(?<actor>.*?)\</p>";
        private string regexDetails = @"\<span\sclass=""title""\>(?<chan>.*?)\<\/span\>(.*?)\<span\sclass=""time""\>(?<time>.*?)\<\/span\>(.*?)\<span\sclass=""duration""\>(?<duration>.*?)\<\/span\>(.*?)\<div\sclass=""event""\>\<h4\>(?<naslovinhref>.*?)\<\/h4\>(.*?)class=""sub""\>(?<zanr>.*?)\<\/p\>(.*?)class=""desc""\>(?<opis>.*?)\<\/p\>(.*?)\<p\sclass=""actor""\>(?<actor>.*?)\</p>";
        private string regexDetailsImageHref = @"img\ssrc='(?<href>.*?)'(.*?)\>(?<naslov>.*?)$";

        IPluginHost myHost = null;

        public IPluginHost Host
        {
            get { return myHost; }
            set { myHost = value; }
        }

        /// <summary>
        /// Constructor.
        /// </summary>
        public EpgPlugin()
        {
            
        }
       
        public string Author
        {
            get { return author; }
        }

        public string Version
        {
            get { return version; }
        }

        public string MulticasttvVersion
        {
            get { return multicasttvVersion; }
        }

        public string Comment
        {
            get { return comment; }
        }

        public string Name
        {
            get { return name; }
        }

        public string PluginType
        {
            get { return type; }
        }

        public string LockedToUserInterfaceLangue
        {
            get { return lockedToLang; }
        }
        
        public string HostName
        {
            get { return hostname; }
        }

        public string RequestMethod
        {
            get { return httpMethod; }
        }

        public string InitialRequest
        {
            get { return initRequest; }
        }

        public bool InitialRequestNeeded
        {
            get { return initRequestNeeded; }
            set { initRequestNeeded = value; }
        }

        public string InitialRequestMethod
        {
            get { return initHttpMethod; }
        }


        public void Initialize(string Path)
        {
            LoadSettings(Path);
        }

        public void Dispose()
        { 
        
        }
        
        public string[] GetTodayRequest(string ChannelId)
        {
            string request = "";
            string referer = "";
            string postString = "";

            if (httpMethod == "POST")
            {
                request = "tv-spored.aspx?chn=" + ChannelId;
                referer = hostname+"tv-spored.aspx?chn=" + ChannelId;
                postString = "chn=" + ChannelId + "&flag=" + flag;
            }
            else
            { 
                request = "tv-spored.aspx?chn="+ ChannelId + "&flag=" + flag;
                referer = hostname + "tv-spored.aspx?chn=" + ChannelId;
            }

            string[] RequestParams = {request,    // http request
                                      referer ,    // http referer
                                      postString  // POST string
                                     };   
            return RequestParams;
        }

       public string[] GetTodaySunmmaryRequest()
        {
            string[] RequestParams = { };
            return RequestParams;
        
        }

        public void ParseInitPage(string Html)
        {
            Regex RegexFlag = new Regex(regexInit);
            Match m = RegexFlag.Match(Html);
            if (m.Success)
            {
                flag = m.Groups["flag"].Value;
            }
        }

        public List<string[]> ParseToday(string Html)
        {
            List<string[]> Plist = new List<string[]>();
            Regex regex = new Regex(regexDaily);
            Plist.Clear();

            string[] substrings = Regex.Split(Html, regexDailySplit);
           
            if (substrings.Length==0) { return Plist; }

            
            foreach(string item in substrings)
            {
                Match m = regex.Match(item);

                if (m.Success)
                {
                    string ura = "";
                    ura = m.Groups["ura"].Value + " - ";  //!!!
                    string naslov = "";
                    naslov = m.Groups["naslov"].Value;
                    string tip = "";
                    tip = m.Groups["tip"].Value;
                    string chn = "";
                    string day = "";
                    string val = "";
                    string flg = "";

                    chn = m.Groups["day"].Value;
                    day = m.Groups["chn"].Value;
                    val = m.Groups["val"].Value;
                    flg = m.Groups["flag"].Value;

                    // link for details
                    string href = "";
                    if (httpMethod == "POST")
                    {
                        href = hostname + "tv-spored.aspx?chn=" + chn + "&flag=" + flg + "&day=" + day + "&val=" + val;
                    }
                    else 
                    {
                        href = hostname + "tv-spored.aspx?val=" + val + "&flag=" + flg; 
                    }
                        
                     href = href.Replace("amp;", "");

                    string[] data = new string[4];
                    data[0] = ura;    // time  "hh:mm - "    !!!! note the spaces and minus sign
                    data[1] = naslov; // title
                    data[2] = tip;    // genre
                    data[3] = href;   // details link "0" for empty !!!

                    Plist.Add(data);
                }
            }

            return Plist;
        }

        public string[] ParseDetails(string Html)
        {

            Html = Html.Replace(Environment.NewLine, "<br>");
            Regex Rgx = new Regex(regexDetails);
            Match m = Rgx.Match(Html);
            
            if (!m.Success)
                return new string[] {}; // empty array

            string titleAndLink = m.Groups["naslovinhref"].Value;
            string genre = m.Groups["zanr"].Value;
            string description = "\n" + m.Groups["opis"].Value;
            if (description.Length > 2)
                description = description.Replace("<br />", "\n");

            string channelName = m.Groups["chan"].Value;
            string time = m.Groups["time"].Value;
            string duration = m.Groups["duration"].Value;
            string detailsLink = "";
            string title = "";
            string actorsAndDirector = "";
            actorsAndDirector = m.Groups["actor"].Value;
            string actorsTitle = "";
            string directorTitle = "";
            string director = "";
            string actors = "";
            if (actorsAndDirector.Length > 2)
            {
                //extract director
                int split = actorsAndDirector.IndexOf("<span>Igrajo:</span>");
                if (split != -1)
                {
                    director = actorsAndDirector.Substring(0, split);
                    director = director.Replace("<span>Režija:</span> ", "");
                    director = director.Replace("<br />", "");
                    if (director.Length > 2)
                        directorTitle = "\nRežija:";

                    actors = actorsAndDirector.Substring(split + 21);
                    actors = actors.Replace("<br />", "\n");
                    actorsTitle = "Igrajo:";
                }
            }

            Regex reghref = new Regex(regexDetailsImageHref);
            Match m2 = reghref.Match(titleAndLink);
            if (m2.Success)
            {
                //we have picture
                title = m2.Groups["naslov"].Value;
                detailsLink = m2.Groups["href"].Value;
            }
            else
            {
                title = titleAndLink;
                detailsLink = "";
            }

            //string title, string genre, string description, string channelName, string time, string custom1Desc, string custom1, string custom2Desc, string custom2, picture link, duration
            return new string[] { title, genre, description, channelName, time, actors, actorsTitle, director, directorTitle, detailsLink, duration }; 
        }
        public List<string[]> ParseTodaySummary(string Html)
        {
            List<string[]> Plist = new List<string[]>();
            Plist.Clear();
            return Plist;
        }

        private void LoadSettings(string file)
        {
            file = file + @"\" + name + ".conf";
            string line = "";
            StreamReader SR;

            if (!File.Exists(file))
                return;

            SR = File.OpenText(file);
            line = SR.ReadLine();

            while (line != null)
            {
                //comment
                if (!line.StartsWith("#"))
                {
                    if (line.StartsWith("metoda"))
                    {
                        string tmp = "";
                        tmp = line.Split('=')[1];
                        tmp.Trim();
                        if (tmp == "a")
                            httpMethod = "GET";
                        else if (tmp == "b")
                            httpMethod = "POST";
                    }
                }
                line = SR.ReadLine();
            }
            SR.Close();
        }
    }
}

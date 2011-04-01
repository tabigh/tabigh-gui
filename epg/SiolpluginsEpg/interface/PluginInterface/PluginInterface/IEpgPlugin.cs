using System;
using System.Collections.Generic;
using System.Text;

namespace PluginInterface
{
    /// <summary>
    /// Web scraping plugin interface.
    /// </summary>
    public interface IEpgPlugin
    {
        /// <summary>
        ///Author of the plugin.
        /// </summary>
        string Author
        {
            get;
        }

        /// <summary>
        /// Plugin Version.
        /// </summary>
        string Version
        {
            get;
        }

        /// <summary>
        /// Multicasttv version compatibility.
        /// </summary>
        string MulticasttvVersion
        {
            get;
        }

        /// <summary>
        /// Comment about the plugin.
        /// </summary>
        string Comment
        {
            get;
        }

        /// <summary>
        /// Locked to user interface langue eg. sl-si.
        /// Empty string for unlocked.
        /// </summary>
        string LockedToUserInterfaceLangue
        {
            get;
        }

        /// <summary>
        /// Plugin type. Currently only online type is supported.
        /// Online type means that http request to server is made whenever user changes channel.
        /// </summary>
        string PluginType
        {
            get;
        }

        /// <summary>
        /// Plugin name.
        /// </summary>
        string Name
        {
            get;
        }

        /// <summary>
        /// Web page hostname.
        /// </summary>
        string HostName
        {
            get;
        }

        /// <summary>
        /// Request method (POST or GET).
        /// </summary>
        string RequestMethod
        {
            get;
        }

        /// <summary>
        /// Url for initial request without hostname
        /// Eg. "http://www.siol.net/tv-spored.aspx" shoud be just "tv-spored.aspx".
        /// It's called only if InitialRequest is true. 
        /// </summary>
        string InitialRequest
        {
            get;
        }

        /// <summary>
        /// Is initial request needed?
        /// </summary>
        bool InitialRequestNeeded
        {
            get;
            set;
        }

        /// <summary>
        /// Initial request method (POST or GET).
        /// </summary>
        string InitialRequestMethod
        {
            get;
        }

        /// <summary>
        /// This function can be used to load settings from file.
        /// </summary>
        void Initialize(string Path);

        /// <summary>
        ///Clean...
        /// </summary>
        void Dispose();

        /// <summary>
        /// This function must return string array where
        /// array[0]=http request (without hostname),
        /// array[1]=referer
        /// array[2]=POST message - empty string if http method is GET.
        /// ChannelId is web identification for a channel. You must provide
        /// web identifications for channels listed in playlist in a file with
        /// the same name as plugin name and txt extension. Look at siol.txt for example.
            /// This file should be placed in a /parse folder.
        /// TODO:
        /// This method will change in the future. It will be used to return http request
        /// for 0 to 6 days in advance not just for today.
        /// </summary>
        /// <param name="ChannelId">Channel web identification</param>
        string[] GetTodayRequest(string ChannelId);

        /// <summary>
        /// Not implemented yet
        /// </summary>
        string[] GetTodaySunmmaryRequest();

        /// <summary>
        /// If InitialRequest is true, than this function is called first but only once.
        /// You can use this function to retreive any relavant data, that may be needed for GetTodayRequest method.
        /// </summary>
        void ParseInitPage(string Html);

        /// <summary>
        /// This function is used to parse today's selected channel's epg data.
        /// Html is string which contains whole page that was received as a result of GetTodayRequest request.
        /// It must return a List with string array in a following format:
        ///array[0] = tv show time;   format: "hh:mm - "    !!!! note the spaces and minus sign
        ///array[1] = tv show title;
        ///array[2] = tv show genre;
        ///array[3] = link to a page with deatiled information about the item;
        /// </summary>
        /// <param name="Html">Html page</param>
        List<string[]> ParseToday(string Html);

        /// <summary>
        /// Not implemented yet.
        /// </summary>
        /// <param name="Html">Html</param>
        List<string[]> ParseTodaySummary(string Html);

        /// <summary>
        /// This function is used to parse selected channel's detailed epg data, such as tv show summary, actors...
        /// It must return following string array:
        /// array[0] = tv show title;
        /// array[1] = tv show genre;
        /// array[2] = tv show description;
        /// array[3] = channel name;
        /// array[4] = tv show time;
        /// array[5] = custom entry (actors);
        /// array[6] = custom entry title (actors title);
        /// array[7] = custom entry (director);
        /// array[8] = custom entry (director title);
        /// array[9] = tv show image link; 
        /// </summary>
        /// <param name="Html">Html</param>
        string[] ParseDetails(string Html);

        IPluginHost Host { get; set; }
    }

    public interface IPluginHost
    {
        void Feedback(string Feedback, IEpgPlugin Plugin);
    }
}

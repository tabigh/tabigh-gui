using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Reflection;
using epgSagemSimplicity;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
//            Type type = epgSagemSimplicity.IEpg;
//            var obj = Activator.CreateInstance(type);
            
            epgSagemSimplicity.IEpg epg = new epgSagemSimplicity.Epg() as epgSagemSimplicity.IEpg;
            if (epg == null)
                return;
            if (epg.getEpg("HBOC", "c:\\epgtemp\\") != 0)
              
            {
                epgSagemSimplicity.IEpgDetails epgd = new epgSagemSimplicity.EpgDetails() as epgSagemSimplicity.IEpgDetails;
                if (epgd == null)
                    return;
                //                epgd.Finished += OnDetailsFinished;
                if (epgd.Get("http://www.siol.net/tv-spored.aspx?val=3577441", "c:\\epgtemp\\") != 0)
                {
                    string s = epgd.result;
                }


            }
        }

/*
        private void Form1_Load(object sender, EventArgs e)
        {
            epgSagemSimplicity.Epg epg = new epgSagemSimplicity.Epg();
            if (epg == null)
                return;
            if (epg.getEpg("SLO1","c:\\epgtemp\\") !=0)
            {
                epgSagemSimplicity.EpgDetails epgd = new epgSagemSimplicity.EpgDetails();
                if (epgd == null)
                    return;
//                epgd.Finished += OnDetailsFinished;
                if (epgd.Get(epg.result.EpgData[0][3], "c:\\epgtemp\\") !=0)
                {
                    
                }
                

            }
        }
*/ 
    }
}

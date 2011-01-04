﻿/*
This file is part of iptv-stb-gui.

Copyright (C) 2010

iptv-stb-gui is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iptv-stb-gui is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iptv-stb-gui.  If not, see <http://www.gnu.org/licenses/>.

http://code.google.com/p/iptv-stb-gui/

*/

// Notes:
// Browser AntFresco 4.x : XMLHttpRequest not supported, JS 1.3, CSS 1.0, DOM level 0 
// Body height: 576px (HD resolutions also).
// Main overlay frame consist of two table rows: Upper 0-400px, Lower 400-576px.

// channelInfo array (PHP): 
//[0=index(number), 1=name, 2=number, 3=ip, 4=port, 5=group, 6=language 7=epg, 8=locked] 

var gaPlaylist = new Array();	// array of channelInfo arrays 
var gaPlaylistFiltered = new Array();	 // array of filtered channelInfo arrays
var gaGroups = new Array();		// array of unique groups array (0=index,1=group name) 
var gaCurrentEpg = new Array();	// epg data for all channels (Currently only Siol ISP is supported.)

var gnCurrentIndex = 0; // index of a current playing channel
var gnCurrentGroup = -1;	// current group index (playing)
var gnCurrentItemIndex = 0;	// index of a selected item in a channel table
var gnCurrentItemGroup = gnCurrentGroup;	// selected group in channel table

var gnPreviousIndex = 0;  // index of a previous playing item
var gnPreviousGroup= -1;	// index of a previous group

// visibility of elements
var gbGroupBoxVisible = false;
var gbNumInputVisible = false;
var gbOsdBannerVisible = false;

// timers
var gnTmGroupBoxHide = 0;
var gnTmOsdBannerHide = 0;
var gnTmNumpad = 0;
var gnCheckForSubsTimer = 0;
var gnCheckForSubsInterval= 4000 ; // 4 seconds

//
var gsStreamSubtitleLanguageList = ''; 

var gbLoading = true;

gnEpgDownloadInterval = 5 * 60 * 1000; // Download epg on every 5 minutes.

function init()
{
	sagemSetDateTime(TIME_OFFSET);
	sagemSetLoadingPictTime();
	sagemSetDimming();
	sagemKillMedia();
	maxLetters();
	loadPlaylistHandler(la);
	downloadCurrentEpg();
	setInterval(downloadCurrentEpg,gnEpgDownloadInterval);
}

// LoadPlaylist handler
function loadPlaylistHandler(ar)
{
	gaPlaylist = ar;
	getUniqueGroups();
		
	// get current channel and group
	sTemp = sagemCurrentChannelGet();
	if (sTemp.indexOf(";") != -1){
		gnCurrentIndex = parseInt(sTemp.split(";")[0]);
		gnCurrentGroup = parseInt(sTemp.split(";")[1]);
	}
	if (gaGroups.length -1 < gnCurrentGroup)
		gnCurrentGroup=-1;
	filterByGroup(gnCurrentGroup);	
	if (gaPlaylistFiltered.length-1 < gnCurrentIndex)
		gnCurrentIndex=0;
	setChannel(gnCurrentIndex, gnCurrentGroup, true);
}

// Calculate maximum number of letters that would fit into channel selection table and osd banner, based on font size and table width. 
function maxLetters()
{
	var nBodyWidth = 720-(2*gnMarginLeft); //actual body width
	var nGBWidth = (gnGroupBoxWidth/100 * nBodyWidth) - gn_GrpBoxRow0Width; // right column width of the channel selection table
	gnGrpBoxMaxLetters = Math.round( nGBWidth / (gnGrpBoxFontFactor * gnGroupBoxFontSize /100) ); 

	var nOBDescWidth =  (gnOsdBannerWidth/100) * (nBodyWidth) ; // osd banner width
	gnOsdBanEpgMaxLetters = Math.round( nOBDescWidth / (gnOsdBanFontFactor * gnOsdBannerFontSize/100) ); 
}

// Create an array of unique groups.
function getUniqueGroups()
{
	nPlSize = gaPlaylist.length;
	for (var i=0; i<nPlSize; i++){
		var nSize = gaGroups.length;
		var bExists = false;

		for (var j=0; j<nSize; j++){  
			if (gaPlaylist[i][5]==gaGroups[j][1]) {
				bExists=true;
				break;
			}
		}
		if (!bExists)
		gaGroups.push([i,gaPlaylist[i][5]]);
	}
	gaGroups.sort(compareGroups); // sort by name (ASCII only)	
}

// Populate an array of channelInfo arrays filtered by group name.
function filterByGroup(nGroupIndex)
{
	gnCurrentItemGroup = nGroupIndex; // Update group index in the channel selection table.
	
	if (nGroupIndex == -1){
		// Don't filter, just point to gaPlaylist array.
		gaPlaylistFiltered = [] ; // Clear array
		gaPlaylistFiltered = gaPlaylist; // gaPlaylist holds all channels.
		return;
	}
	
	var sGroupName = '' ;
	var nSize = gaPlaylist.length;
	sGroupName = gaGroups[nGroupIndex][1];
	gaPlaylistFiltered = [];
	for (var i=0; i<nSize; i++){
		if (gaPlaylist[i][5]==sGroupName)
			gaPlaylistFiltered.push(new cloneObject(gaPlaylist[i]));
	}
}

// Display or hide channel selection table.
// If bRefresh is false, main frame is not rendered.
function displayGroupBox(bDisplay, bRefresh)
{
	if (bRefresh === undefined)
		bRefresh=true;

	if(bDisplay){
		stopTimer(gnTmGroupBoxHide); 
		gbGroupBoxVisible=true; 
		gnTmGroupBoxHide = setTimeout("displayGroupBox(false)",gnTmGroupBoxHideInterval); 
	}
	else{
		stopTimer(gnTmGroupBoxHide);
		gbGroupBoxVisible=false;
		gnCurrentItemIndex=gnCurrentIndex; // Revert to the currently playing index
		if(gnCurrentItemGroup != gnCurrentGroup) // Revert to the group from which the playing channel was selected.
			filterByGroup(gnCurrentGroup);
	}
	if (bRefresh)
		drawMainFrame();
}

// Display or hide osd banner.
// If bRefresh is false, main frame is not rendered.
function displayOsdBanner(bDisplay, bRefresh)
{
	if (bRefresh === undefined)
		bRefresh=true;

	if(bDisplay){
		stopTimer(gnTmOsdBannerHide);
		gbOsdBannerVisible=true;
		gnTmOsdBannerHide = setTimeout("displayOsdBanner(false)",gnTmOsdBannerHideInterval);
	}
	else{
		stopTimer(gnTmOsdBannerHide);
		gbOsdBannerVisible=false;
	}	
	if (bRefresh)
		drawMainFrame();
}

// Display or hide numeric input.
function displayNumpadInput(b)
{
	if(b)
		gbNumInputVisible=true;
	else
		gbNumInputVisible=false;

	drawMainFrame();
}

// Refresh screen
function drawMainFrame()
{
	var sHtmlUp = ''
	var sTempFrame = window.top.mainFrame;
	var sHtmlDown = '';

    //Upper:
	sHtmlUp += gsMainFrameHeader;
	sHtmlUp += '<table width=\"100%\" cellspacing=\"0\" ><tr><td valign=\"top\" height=400px>';
	if (gbNumInputVisible)
		sHtmlUp += drawNumInput() 
	else if (gbGroupBoxVisible)
		sHtmlUp +=  drawChanSelTable();

	//Lower:
	sHtmlDown += '</td></tr><tr><td valign=\"top\" >';
	if (gbOsdBannerVisible){
		getCurrentEpg(); 
		sHtmlDown += drawOsdBanner() ;
	}
	sHtmlDown += '</td></tr></table>';
	sHtmlDown += gsMainFrameFooter;

	sTempFrame.document.open();
	sTempFrame.document.write(sHtmlUp+sHtmlDown);
	sTempFrame.document.close();
}

// Clear OSD.
function clearMainFrame()
{
	if (gbGroupBoxVisible)
		displayGroupBox(false);
	if (gbOsdBannerVisible)
		displayOsdBanner(false);
	if (gbNumInputVisible)
		displayNumpadInput(false);
}

function getCurrentEpg()
{
	var sEpgId = gaPlaylistFiltered[gnCurrentItemIndex][7];
	var bFound=false;
	var i=0;
	var nSize = gaCurrentEpg.length;
	var nTimeNow;
	var nLength;
   
	// Reset previous values.
	gsCurrentShow='';
	gsCurrentShowDesc = '';
	gsCurrentProgress ='0';
	gsNextShow = '';
	gsNextShowDesc = '' ;
   
	if (sEpgId!=''){
		var dt = getRTC();
		for (; i<nSize; i++)
		{
			if (gaCurrentEpg[i][0]==sEpgId){
				nLength = gaCurrentEpg[i][5]*60000;
				nTimeNow = dt.getTime();
				if (nTimeNow < gaCurrentEpg[i][4] + nLength ){
					bFound=true;
					break;
				}
			}
		}
	}
 
	if (bFound){
		var dtStart = new Date();
		dtStart.setTime(gaCurrentEpg[i][4]);
		gsCurrentShow= formatTime(dtStart) + ' ' +  gaCurrentEpg[i][6] ;
		gsCurrentShowDesc = gaCurrentEpg[i][7] ;
		gsCurrentProgress=Math.max(0,Math.min(100,Math.round((nTimeNow-gaCurrentEpg[i][4])*100/(nLength))))+'' ;

		// Check if next show is listed.
		if (i+1 < nSize){
			if (gaCurrentEpg[i+1][0]==sEpgId){
				dtStart.setTime(gaCurrentEpg[i+1][4]);
				gsNextShow = formatTime(dtStart) + ' ' + gaCurrentEpg[i+1][6];
				gsNextShowDesc = gaCurrentEpg[i+1][7];
		   }
	   }
   }
}

function downloadCurrentEpgHandler(ar)
{
    gaCurrentEpg = [];
    gaCurrentEpg= ar;
}

// Get an array of a current and next epg data for every channel.
function downloadCurrentEpg()
{
	var sTempFrame = window.top.epgFrame;
	var sHtml = '<html><META http-equiv=\"PRAGMA\" content=\"NO-CACHE\"><META name=\"cache-control\" content=\"NO-CACHE\"></head>';
	sHtml += '<script src=\"'+EPG_SERVER+'?t='+getRTC().getTime()+'\" type=\"text/javascript\"><\/script>';
	sHtml += '<script language=\"JavaScript\">';
	sHtml += 'function init(){if(typeof(la) != \"undefined\" && la!=null ){window.top.downloadCurrentEpgHandler(la);} if (window.top.gbLoading){window.top.gbLoading=false; window.top.drawMainFrame();}}';
	sHtml += '<\/script>';	
	sHtml += '<body onload=\"init();\" onKeypress=\"javascript:return window.top.keyAction(event);\" ></body></html>';
	sTempFrame.document.open();
	sTempFrame.document.write(sHtml);
	sTempFrame.document.close();
}

// Select next/prev channel from GroupBox.
function chSelChange(bDirection)
{
	if (gbGroupBoxVisible)
	{
		var nSize = gaPlaylistFiltered.length;
		if (bDirection)
		{
			gnCurrentItemIndex++;
			if (gnCurrentItemIndex >= nSize)
				gnCurrentItemIndex=0;
		}
		else
		{
			gnCurrentItemIndex--;
			if (gnCurrentItemIndex < 0)
				gnCurrentItemIndex=nSize-1;
		}
	}
		
	displayGroupBox(true,false);
	displayOsdBanner(true);
}

// Select next/prev group.
function groupChange(bDirection)
{
	if (gbGroupBoxVisible){
		var nSize = gaGroups.length;
		gnCurrentItemIndex=0;
		if (bDirection){
			gnCurrentItemGroup++;
			if (gnCurrentItemGroup >= nSize)
				gnCurrentItemGroup = -1;
		}
		else{
			gnCurrentItemGroup--;
			if (gnCurrentItemGroup < -1)
				gnCurrentItemGroup = nSize -1;
		}
		filterByGroup(gnCurrentItemGroup);
	}

	displayGroupBox(true,false);
	displayOsdBanner(true);
}

// Set next/prev channel.
function chChange(bDirection)
{
	var nIndex = gnCurrentIndex;
	var nSize = gaPlaylistFiltered.length;

	if (bDirection){
		nIndex++;
		if (nIndex >= nSize)
			nIndex=0;
	}
	else{
		nIndex--;
		if (nIndex < 0)
			nIndex=nSize-1;
	}
		
	setChannel(nIndex, gnCurrentGroup, true);
}

function setChannel(nIndex, nGroup, bRefresh)
{
	gnPreviousIndex = gnCurrentIndex; // Update previous index.
	gnPreviousGroup = gnCurrentGroup; //Update previous group.
	gnCurrentIndex = nIndex; // Set current index.
	gnCurrentItemIndex = nIndex; //Set index in the channel table.
	gnCurrentGroup = nGroup; // Set current playing group.
	gnCurrentItemGroup = nGroup; // Set group in channel table.
	gsStreamSubtitleLanguageList = ''; //Clear Subtitle List
	
	sagemJoinMulticast(gaPlaylistFiltered[nIndex][3], gaPlaylistFiltered[nIndex][4]);
	sagemCurrentChannelSet(nIndex, nGroup);
	sagemSetDisplay(gaPlaylistFiltered[gnCurrentIndex][2]); // change display to current channel
	displayOsdBanner(true,bRefresh);	//Show epg for selected channel.
	
	gnCheckForSubsTimer = setTimeout("setSubtitles(0)",gnCheckForSubsInterval); // Auto select first available subtitle.
}

function setSubtitles(index)
{
	gsStreamSubtitleLanguageList = sagemGetSubtitleList(); // Update available subtitles
	if (gsStreamSubtitleLanguageList.length>index){
			sagemSetSubtitle(index);
	}
}

// Switch to previous channel
function previousChannel()
{
    if (gnCurrentGroup != gnPreviousGroup)
		filterByGroup(gnPreviousGroup); // refilter
	setChannel(gnPreviousIndex, gnPreviousGroup, true);
}

// Key input handler.
function keyInput(n)
{
	if (gsNumpad.length<3)
		gsNumpad+=n.toString();
	else
		gsNumpad = n.toString();
		
	displayNumpadInput(true);
	stopTimer(gnTmNumpadInterval);
	setTimeout("chSetNum()", gnTmNumpadInterval);
}

function chSetNum()
{
	var nChNum = Number(gsNumpad);
	var nSize = gaPlaylistFiltered.length;
	gsNumpad='';
	
	displayNumpadInput(false);
	filterByGroup(-1);
	
	// find channel
	for (var i=0; i<nSize; i++)
	{
		if (gaPlaylistFiltered[i][2]==nChNum){
			setChannel(i, -1, true);
			break;
		}
	}
	stopTimer(gnTmNumpad);	// stop timer
}

function stopTimer(id)
{
	if (id!=0)
		clearTimeout(id);
}

// Remote controll =================================
function keyAction(e)
{  
	k=typeof(e.which)=='undefined'?e.keyCode:e.which; 
	switch (k)
	{
	    case KEY_0:
		case 48:
		    keyInput(0);
		    return 0;
		case KEY_1:
		case 49:
			keyInput(1);
			return 0;
		case KEY_2:
		case 50:
		    keyInput(2);
			return 0;
		case KEY_3:
		case 51:
			keyInput(3);
			return 0;
		case KEY_4:
		case 52:
			keyInput(4);
			return 0;
		case KEY_5:
		case 53:
			keyInput(5);
			return 0;
		case KEY_6:
		case 54:
			keyInput(6);
			return 0;
		case KEY_7:
		case 55:
			keyInput(7);
			return 0;
		case KEY_8:
		case 56:
			keyInput(8);
			return 0;
		case KEY_9:
		case 57:
			keyInput(9);
			return 0;			
		case KEY_MENU:
			return(0);
		case KEY_UP:
		case 119:
			chSelChange(false);	// Open group box / select previous chan
			return(0);
		case KEY_DOWN:
		case 115:
			chSelChange(true);	// Open group box / select next chan.
			return(0);
		case KEY_LEFT:
		case 97:
			groupChange(false);	// Open group box / select previous group.
			return(0);
		case KEY_RIGHT:
		case 100:
			groupChange(true);	// Open group box / select next group.
			return(0);
		case KEY_REW:
			return(0);
		case KEY_FWD:
			return(0);
		case KEY_CHUP:
			chChange(true);	// Set next channel.
			return(0);
		case KEY_CHDOWN:
			chChange(false);	// Set previous channel.
			return(0);
		case KEY_RED:
			clearMainFrame();	// Clear osd.
			return(0);
		case KEY_GREEN:
			if (gbOsdBannerVisible)	// Toggle osd banner
				displayOsdBanner(false);
			else
				displayOsdBanner(true);			
			return(0);
		case KEY_VOLUP:
		case KEY_VOLDOWN:
			return(1);
		case KEY_MUTE:
			return(1);
		case KEY_OK:
		case 113: //Q
			if (gbGroupBoxVisible) {	// Set selected channel.
				setChannel(gnCurrentItemIndex,gnCurrentItemGroup,false);	
				displayGroupBox(false,true);	// Close channel selection table.
			}
			else	 
				displayGroupBox(true);	// Show only group box - no osd banner.
				return(0);
		case KEY_IDENT:
			return(0);
		case KEY_RETOUR:
		case 114: //R
			previousChannel();
			return(0);
		case KEY_YELLOW:
		case 116: //T  TODO: Display available subtitles
			setSubtitles(0);
			return(0);
		case KEY_BLUE:
				sagemSetSubtitle(-1); //Disable subtitles
			return (0);
		case KEY_POWER:
			sagemPowerOff();
			return(0);
		case KEY_QUIT:
			location.reload();				
			return(0);
		default:
			return(1);
    }
}

function getRTC() {
	return new Date();
}

function formatTime(dt)
{
	var lsMin = dt.getMinutes().toString();
	if (lsMin.length == 1)
		lsMin = '0' + lsMin;
	return dt.getHours().toString() + ':' + lsMin;
}

//==================================================
// Helper functions ================================

function compareGroups(a,b)
{
	if (a[1]<b[1])
		return -1;
	if (a[1]>b[1])
		return  1;
	if (a[1]==b[1])
		return 0;
}

function cloneObject(source)
 {
	for (i in source){
		if (typeof source[i] == 'source')
			this[i] = new cloneObject(source[i]);
		else
			this[i] = source[i];
	}
}

// TODO: Try this function for string concentration
function StringBuffer() 
{ 
	this.buffer = []; 
} 

StringBuffer.prototype.append = function append(string)
{ 
	this.buffer.push(string); 
	return this; 
}; 

StringBuffer.prototype.toString = function toString()
{ 
	return this.buffer.join(""); 
}; 

String.prototype.trunc = function(n)
 {
	return this.substr(0,n-1)+(this.length>n?'...':'');
 };

//==================================================
// Test ============================================

function test()
{
   
}
//==================================================

// keys 
KEY_0=536870922;
KEY_1=536870923;
KEY_2=536870924;
KEY_3=536870925;
KEY_4=536870926;
KEY_5=536870927;
KEY_6=536870928;
KEY_7=536870929;
KEY_8=536870930;
KEY_9=536870931;

KEY_CHUP=0x40000013;
KEY_CHDOWN=0x40000012;
KEY_OK=0x40000004;
KEY_RED=0x40000084;
KEY_GREEN=0x40000085;
KEY_YELLOW=0x40000086;
KEY_BLUE=0x40000087;
KEY_UP=0x4000000E;
KEY_DOWN=0x4000000F;
KEY_LEFT=0x40000010;
KEY_RIGHT=0x40000011;
KEY_MENU=0x4000000A;
KEY_REFRESH=0x4000008A;
KEY_RETOUR=0x4000008A;
KEY_PLAY=0x40000100;
KEY_IDENT=0x40000083;
KEY_VOLUP=0x30000001;
KEY_VOLDOWN=0x30000002;
KEY_REW=0x40000105;
KEY_FWD=0x40000104;
KEY_MUTE=0x30000003;
KEY_POWER=0x30000000;
KEY_QUIT=0x40000082;
KEY_TV=0x40000097;


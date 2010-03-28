// Browser AntFresco 4.x : XMLHttpRequest not supported, JS 1.3, CSS 1.0, DOM level 0( No InnerHtml...)
// Body height: 576px (HD resolutions also).
// Main overlay frame consist of two iframes: Upper 0-400px, Lower 400-576px.

// channelInfo array (PHP): 
//[0=index(number), 1=name, 2=number, 3=ip, 4=port, 5=group, 6=language 7=epg, 8=locked] 

var gaPlaylist = new Array();	// array of channelInfo arrays 
var gaPlaylistFiltered = new Array();	 // array of filtered channelInfo arrays
var gaGroups = new Array();		// array of unique groups array (0=index,1=group name) 
var gaCurrentEpg = new Array();	// current epg data

var gnCurrentItemGroup = -1;	// currrent selected group index, -1=all
var gnCurrentGroup = gnCurrentItemGroup;	// current group index (playing)
var gnCurrentItemIndex = 0;		// index of a current selected item in a groupbox
var gnCurrentIndex = 0;		// index of a current playing item

// element visibility
var gbGroupBoxVisible = false;
var gbNumInputVisible = false;
var gbOsdBannerVisible = false;

// numpad input
var gsNumpad = '';

// Current playing show name (groupbox not visible) or selected item show name (groupbox visible)
var gsCurrentShow='';
var gsCurrentShowDesc='';
var gsNextShow='';
var gsNextShowDesc='';
var gsCurrentProgress='0';

// timers
var gnTmGroupBoxHide = 0;
var gnTmOsdBannerHide = 0;
var gnTmNumpad = 0;

gnEpgDownloadInterval = 5 * 60 * 1000; // Download epg on every 5 minutes.

var gbLoading = true;

// conversions
gsGroupBoxAlpha = alphaToHex(gnGroupBoxAlpha);
gsOsdBannerHeaderAlpha = alphaToHex(gnOsdBannerHeaderAlpha); 
gsOsdBannerEpgAlpha = alphaToHex(gnOsdBannerEpgAlpha); 

// text metrics
gnGrpBoxFontFactor = 11.41;
gnGrpBoxMaxWords= 0;
gnOsdBanFontFactor = 10.0;
gnOsdBanEpgMaxWords= 0;
gn_GrpBoxRow0Width = Math.floor(40*gnGroupBoxFontSize/100);

//css
gsHeaderCommon = '<html><head><meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\" /><style type=\"text/css\">';

gsMainFrameHeaderUp = gsHeaderCommon +
				    'BODY {font-family:Arial; background-color: transparent; }'+
				    '.chn_table{'+
					'  background-color: '+gsGropBoxBackgroundColor+gsGroupBoxAlpha+';'+
					'  table-layout:fixed;'+
					'  font-size: '+gnGroupBoxFontSize+'%;'+
					'  font-weight:bold;'+
					'  width:'+gnGroupBoxWidth+'%;}'+
					'.chn_table_header_left{}'+
				    '.chn_table_header_right{'+
					'  color: '+gsGroupBoxHeaderColor+';'+
					'  text-align: left;}'+
				    '.chn_table_row_left{'+
					'  color: '+gsGroupBoxLeftColor+';}'+
					'.chn_table_row_left_sel{'+
					'  color: '+gsGroupBoxLeftColor+';'+
					'  background-color: '+gsGroubBoxSelectorColor+';}'+
					'.chn_table_row_right{'+
					'  color: '+gsGroupBoxRightColor+';}'+
					'.chn_table_row_right_sel{'+
					'  color: '+gsGroupBoxRightColor+';'+
					'  background-color: '+gsGroubBoxSelectorColor+';}'+
					'  </style></head>'+
					'<body onKeypress=\"javascript:return window.top.keyAction(event);\" leftmargin='+gnMarginLeft+'px topmargin='+gnMarginTop+'px >';
					
gsMainFrameHeaderDown = gsHeaderCommon +
				    'BODY {font-family:Arial; background-color: transparent; } '+
					'.osd_table{'+
					'  border-width:0px;'+
					'  font-size:'+gnOsdBannerFontSize+'%;'+
					'  width:'+gnOsdBannerWidth +'%;'+
					'  table-layout:fixed;}'+
					'.r0c0{'+
					'  color: '+gsOsdBannerNumColor+';'+
					'  background-color: '+gsOsdBannerHeadBackColor+gsOsdBannerHeaderAlpha+';'+
					'  font-weight:bolder;}'+
					'.r0c1{'+
					'  color: '+gsOsdBannerNameColor+';'+
					'  background-color: '+gsOsdBannerHeadBackColor+gsOsdBannerHeaderAlpha+';'+
					'  font-weight:bolder;}'+
					'.r0c2{'+
					'  color: '+gsOsdBannerClockColor+';'+
					'  background-color: '+gsOsdBannerHeadBackColor+gsOsdBannerHeaderAlpha+';'+
					'  font-weight:bolder;'+
					'  text-align: right;}'+
					'.r13c01{'+
					'  color: '+gsOsdBannerEpgColor+';'+
					'  background-color: '+gsOsdBannerEpgBackColor+gsOsdBannerEpgAlpha+';'+
					'  font-weight:bold;}'+
					'.r2c01{background-color: transparent; font-size: 4px; }'+
					'.desc{font-weight:normal;'+
					'  color: '+gsOsdBannerEpgDescColor+';}'+
				   	'  </style></head><body onKeypress=\"javascript:return window.top.keyAction(event);\" leftmargin='+gnMarginLeft+'px rightmargin='+gnMarginLeft+'px >';

					
gsMainFrameFooter = '</body></html>';

gsNumInputHeader = gsHeaderCommon +
					'.numpad{ '+
                    '  color:'+gsnumericInputColor+';'+
                    '  background-color: '+gsNumericInputBackColor+';'+
					'  font-family:Arial;'+
					'  font-size: 160%;'+
					'  font-weight: bold ;}'+
					'  </style></head><body onKeypress=\"javascript:return window.top.keyAction(event);\" leftmargin='+gnMarginLeft+ 'px topmargin='+gnMarginTop+'px >';
					
gsNumInputFooter =  gsMainFrameFooter;

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

function init()
{
    sagemSetDateTime();
    sagemSetLoadingPictTime();
	sagemSetDimming();
	sagemKillMedia();
	loadPlaylist();
	downloadCurrentEpg();
	maxWordCount();
}

// LoadPlaylist handler
function loadPlaylistHandler(ar)
{
    gaPlaylist = ar;
	getUniqueGroups();
	filterByGroup(-1);
	
	if (gaPlaylistFiltered.length > gnCurrentIndex)	{
		sagemJoinMulticast(gaPlaylistFiltered[gnCurrentIndex][3] +':'+ gaPlaylistFiltered[gnCurrentIndex][4]);
		displayOsdBanner(true);
	}
	
	gbLoading = false;
}

// Load playlist.
function loadPlaylist()
{
    var sTempFrame = window.top.plFrame;
	var sHtml = '<html><META http-equiv=\"PRAGMA\" content=\"NO-CACHE\"><META name=\"cache-control\" content=\"NO-CACHE\"></head>';
	sHtml += '<script src=\"playlist.php\" type=\"text/javascript\"><\/script>';
	sHtml += '<script language=\"JavaScript\">';
	sHtml += 'function init(){if(typeof(la) != \"undefined\" && la!=null ){window.top.loadPlaylistHandler(la);}}';
	sHtml += '<\/script></body></html>';	
	sHtml += '<body onload=\"init();\" onKeypress=\"javascript:return window.top.keyAction(event);\"></body></html>';
	sTempFrame.document.open();
	sTempFrame.document.write(sHtml);
	sTempFrame.document.close();	
}

//Fixme: Not linear relationship.
function maxWordCount()
{
     var nBodyWidth = 720-(2*gnMarginLeft);
     var nGBWidth = (gnGroupBoxWidth/100 * nBodyWidth) - gn_GrpBoxRow0Width;
     gnGrpBoxMaxWords = Math.round( nGBWidth / (gnGrpBoxFontFactor * gnGroupBoxFontSize /100) );
	 
	 var nOBDescWidth =  (gnOsdBannerWidth/100) * (nBodyWidth) ;
	 gnOsdBanEpgMaxWords = Math.round( nOBDescWidth / (gnOsdBanFontFactor * gnOsdBannerFontSize/100) );
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
    gaGroups.sort(compareGroups);	
}

// Populate an array of channelInfo arrays filtered by group name.
function filterByGroup(nGroupIndex)
{
	if (nGroupIndex == -1){
		resetGroupFiltering();
		return;
	}

    var nSize = gaPlaylist.length;
	var sGroupName = '' ;
	if (nGroupIndex >= 0)
	    sGroupName = gaGroups[nGroupIndex][1];

	gaPlaylistFiltered = [];	//Clear array.
	
	for (var i=0; i<nSize; i++){
	    if (nGroupIndex==-1 || gaPlaylist[i][5]==sGroupName)
		    gaPlaylistFiltered.push(new cloneObject(gaPlaylist[i]));
	}
}

// Change group to "ALL"
function resetGroupFiltering()
{
	gnCurrentItemGroup = -1; 
    gnCurrentGroup = -1; 
	gaPlaylistFiltered = [] ; 
	gaPlaylistFiltered = gaPlaylist;
}

function drawNumInput()
{
	return gsNumInputHeader + '<table width="64px" class=\"numpad\"><tr><td>'+ gsNumpad +'</td></tr></table>' + gsNumInputFooter;
}

// Draw channel selection table.
function drawChanSelTable()
{
    var sCurrentGroupName = '';
	if (gnCurrentItemGroup == -1)
	    sCurrentGroupName = 'Vsi';
	else
	    sCurrentGroupName = gaGroups[gnCurrentItemGroup][1];
	
	var nSelectorIndex = 0;
	var nItemStart = 0;
	var nFilteredPlaylistLength = gaPlaylistFiltered.length;
	var nItems = Math.min(gnMaxChanItems, nFilteredPlaylistLength);
	var nMiddleIndex = Math.floor(nItems/2);
    
	if (gnCurrentItemIndex < nMiddleIndex){
	    nItemStart = 0;
		nSelectorIndex = gnCurrentItemIndex;
	}
	else if (gnCurrentItemIndex >= nFilteredPlaylistLength-nMiddleIndex){
	    nItemStart = nFilteredPlaylistLength-nItems;
		nSelectorIndex = nItems - (nFilteredPlaylistLength-gnCurrentItemIndex);
	}
	else{
	    nItemStart = gnCurrentItemIndex - nMiddleIndex;
		nSelectorIndex = nMiddleIndex;
	}
	
	 var sTableHeader = '<table cellspacing=\"0\" class=\"chn_table\"><tr>' +
				          '<th width = \"'+gn_GrpBoxRow0Width+'px\" class=\"chn_table_header_left\"></th>'+
				          '<th class=\"chn_table_header_right\">' + sCurrentGroupName + '</th></tr>';
	var sTableBody = '';
	var sTableEnd = '</table>';
    for	(var i=0; i<nItems; i++){
	    var sRowCssLeft = 'chn_table_row_left';
		var sRowCssRight = 'chn_table_row_right';
		if (i==nSelectorIndex){
		    sRowCssLeft = 'chn_table_row_left_sel';
			sRowCssRight = 'chn_table_row_right_sel';
		}
        		
	    sTableBody +=  '<tr><td class=\"' + sRowCssLeft + '\" >' + gaPlaylistFiltered[i+nItemStart][2] +'</td>'+
					   '<td class=\"' + sRowCssRight + '\" >' + gaPlaylistFiltered[i+nItemStart][1].trunc(gnGrpBoxMaxWords) + '</td></tr>';
	}

	return  sTableHeader + sTableBody + sTableEnd ;
}

function drawOsdBanner()
{
    var sTable = '<table align="center" class="osd_table" ><tr>'+
				 '<td width = \"55px\" class="r0c0">'+gaPlaylistFiltered[gnCurrentItemIndex][2]+'</td>'+
				 '<td class="r0c1">'+gaPlaylistFiltered[gnCurrentItemIndex][1]+'</td>'+
				 '<td width = \"55px\" class="r0c2">'+formatTime(getRTC())+'</td></tr><tr>';

	if (gsCurrentShow!=''){
	    sCurShow = gsCurrentShow;
		nCurShowLen = sCurShow.length;
		sCurShowDesc =gsCurrentShowDesc;
		sNextShow = gsNextShow;
		nNextShowLen = gsNextShow.length;
		sNextShowDesc = gsNextShowDesc;
		if (nCurShowLen + sCurShowDesc.length > gnOsdBanEpgMaxWords){
		    sCurShow = gsCurrentShow.trunc(gnOsdBanEpgMaxWords);
			sCurShowDesc = gsCurrentShowDesc.trunc(Math.max(0,gnOsdBanEpgMaxWords-nCurShowLen));
		}
		if (nNextShowLen + sNextShowDesc.length > gnOsdBanEpgMaxWords){
		    sNextShow = gsNextShow.trunc(gnOsdBanEpgMaxWords);
			sNextShowDesc = gsNextShowDesc.trunc(Math.max(0,gnOsdBanEpgMaxWords - nNextShowLen ));
		}
		sTable+='<td class="r13c01" colspan="3">'+sCurShow+'<span class="desc"> '+sCurShowDesc+'</span></td></tr><tr>'+
				'<td class="r2c01" colspan="3"><img src="progress.gif" width='+ gsCurrentProgress +'% height=4px></td></tr><tr>'+
				'<td class="r13c01" colspan="3">'+sNextShow+'<span class="desc"> '+sNextShowDesc+'</span></td></tr></table>';
	}
	else
	    sTable += '</table>';
	
	return sTable;
}

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
		gnCurrentItemIndex=gnCurrentIndex; // reset group box selector !!!
		
		if(gnCurrentItemGroup != gnCurrentGroup){
		    gnCurrentItemGroup = gnCurrentGroup; // reset group !!!
			filterByGroup(gnCurrentGroup);
		}
	}
	if (bRefresh)
	    drawMainFrame();
}

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
    var sHtmlUp = '';
	var sTempFrameUp = window.top.mainFrameUp;
	var sHtmlDown = '';
	var sTempFrameDown = window.top.mainFrameDown;
	
    //Upper:
	sHtmlUp += gsMainFrameHeaderUp;
	if (gbNumInputVisible)
	    sHtmlUp += drawNumInput() 
	else if (gbGroupBoxVisible)
		sHtmlUp +=  drawChanSelTable();
	sHtmlUp += gsMainFrameFooter; 
	
	sTempFrameUp.document.open();
	sTempFrameUp.document.write(sHtmlUp);
	sTempFrameUp.document.close();

	//Lower:
	sHtmlDown += gsMainFrameHeaderDown;
	if (gbOsdBannerVisible){
	    getCurrentEpg(); 
		sHtmlDown += drawOsdBanner() ;
	}
    sHtmlDown += gsMainFrameFooter;

	sTempFrameDown.document.open();
	sTempFrameDown.document.write(sHtmlDown);
	sTempFrameDown.document.close();
	
}

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

	   //check if next show is listed
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
    gaCurrentEpg = [];  // clear array
    gaCurrentEpg= ar;
}

// Get array of a current and next show for every channel.
function downloadCurrentEpg()
{
    var sTempFrame = window.top.epgFrame;
	var sHtml = '<html><META http-equiv=\"PRAGMA\" content=\"NO-CACHE\"><META name=\"cache-control\" content=\"NO-CACHE\"></head>';
	sHtml += '<script src=\"'+EPG_SERVER+'?t='+getRTC().getTime()+'\" type=\"text/javascript\"><\/script>';
	sHtml += '<script language=\"JavaScript\">';
	sHtml += 'function init(){if(typeof(la) != \"undefined\" && la!=null ){window.top.downloadCurrentEpgHandler(la);}}';
	sHtml += '<\/script></body></html>';	
	sHtml += '<body onload=\"init();\" onKeypress=\"javascript:return window.top.keyAction(event);\"></body></html>';
	sTempFrame.document.open();
	sTempFrame.document.write(sHtml);
	sTempFrame.document.close();
 
    setTimeout("downloadCurrentEpg()",gnEpgDownloadInterval);
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
	var nSize = gaPlaylistFiltered.length;
	if (bDirection){
		gnCurrentIndex++;
		if (gnCurrentIndex >= nSize)
			gnCurrentIndex=0;
	}
	else{
		gnCurrentIndex--;
		if (gnCurrentIndex < 0)
			gnCurrentIndex=nSize-1;
	}
		
	gnCurrentItemIndex=gnCurrentIndex;
	sagemJoinMulticast(gaPlaylistFiltered[gnCurrentIndex][3] +':'+ gaPlaylistFiltered[gnCurrentIndex][4]);
	displayOsdBanner(true);	//show epg for selected channel
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
	       gnCurrentItemIndex=i;	// Update item in a group box.
		   gnCurrentIndex=i;	// Update current index.
		   sagemJoinMulticast(gaPlaylistFiltered[i][3] +':'+ gaPlaylistFiltered[i][4]);
		   displayOsdBanner(true);
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
   if (gbLoading)
       return(0);
   
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
			if (gbGroupBoxVisible) {	// Set selected channel.
		         sagemJoinMulticast(gaPlaylistFiltered[gnCurrentItemIndex][3] +':'+ gaPlaylistFiltered[gnCurrentItemIndex][4]);
				 gnCurrentIndex = gnCurrentItemIndex;
				 gnCurrentGroup = gnCurrentItemGroup;
				 displayGroupBox(false,false);	// close group box
				 displayOsdBanner(true);
			}
			else	 
				 displayGroupBox(true);	//Show only group box - no osd banner.
			 return(0);
        case KEY_IDENT:
            return(0);
		case KEY_RETOUR: 
            return(0);
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
// Hardware functions ==============================

function sagemSetLoadingPictTime()
{
	if (typeof(sagem) != 'undefined')
	{
		if (sagem.Get('STB', 'CONFIG', 'LOADINGPICTURE_TIME') != 7)
			sagem.Set('STB', 'CONFIG', 'LOADINGPICTURE_TIME', 7, 'SAVE');
	}	
}

function sagemSetDimming()
{
    if (typeof(sagem) != 'undefined')
		sagem.Set('STB', 'FRONTPANEL', 'DIMMING', 'MEDIUM')
}

function sagemSetDisplay(sDisp)
{
    if (typeof(sagem) != 'undefined')
	{
		sagem.Set('STB', 'FRONTPANEL', 'OPEN' );
       if (sDisp.length < 3)
    	   sDisp = ' ' + sDisp;
       if (sDisp.length < 3)
    	   sDisp = ' ' + sDisp;
       if (typeof(sagem) != 'undefined')
	       sagem.Set('STB', 'FRONTPANEL', 'DISPLAY', sDisp );
	}
}

function sagemSetDateTime()
{
    if (typeof(sagem) != 'undefined')
 		sagem.Set('TIME', 'TIME_OFFSET', TIME_OFFSET);	// Time is set via ntp, just correct the offset.
}

function sagemJoinMulticast(sIpPort)
{
    if (typeof(sagem) != 'undefined')
        document.location.href = 'tv://multicast.' + sIpPort ;
}

function sagemLeaveMulticast()
{
    if (typeof(sagem) != 'undefined')
        document.location.href = 'tv://##stop';
}

function sagemKillMedia()
{
    if (typeof (AVMedia) != 'undefined')
    	AVMedia.Kill();
}

function sagemPowerOff()
{
	if (typeof(sagem) != 'undefined'){
		document.location.href = 'tv://no_tv_no_radio';
		sagem.Set('STB', 'FRONTPANEL', 'CLOSE' );
		sagem.Set('STB', 'POWER_STATE', 'STANDBY');
	}
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

function alphaToHex(nPercent)
{
    return (Math.round(nPercent*2.55)).toString(16);
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



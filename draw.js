// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


// Current playing show name (groupbox not visible) or selected item show name (groupbox visible)
var gsCurrentShow='';
var gsCurrentShowDesc='';
var gsNextShow='';
var gsNextShowDesc='';
var gsCurrentProgress='0';

// numpad input
var gsNumpad = '';

// conversions
gsGroupBoxAlpha = alphaToHex(gnGroupBoxAlpha);
gsOsdBannerHeaderAlpha = alphaToHex(gnOsdBannerHeaderAlpha); 
gsOsdBannerEpgAlpha = alphaToHex(gnOsdBannerEpgAlpha); 

// text metrics
gnGrpBoxFontFactor = 11.41;
gnGrpBoxMaxLetters= 0;
gnOsdBanFontFactor = 10.0;
gnOsdBanEpgMaxLetters= 0;
gn_GrpBoxRow0Width = Math.floor(40*gnGroupBoxFontSize/100);

//css
gsHeaderCommon = '<html><head><meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\" /><style type=\"text/css\">';

gsMainFrameHeader =  gsHeaderCommon +
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
					'  </style></head>'+
					'<body onKeypress=\"javascript:return window.top.keyAction(event);\" leftmargin='+gnMarginLeft+'px topmargin='+gnMarginTop+'px >';
			
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
					   '<td class=\"' + sRowCssRight + '\" >' + gaPlaylistFiltered[i+nItemStart][1].trunc(gnGrpBoxMaxLetters) + '</td></tr>';
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
		if (nCurShowLen + sCurShowDesc.length > gnOsdBanEpgMaxLetters){
		    sCurShow = gsCurrentShow.trunc(gnOsdBanEpgMaxLetters);
			sCurShowDesc = gsCurrentShowDesc.trunc(Math.max(0,gnOsdBanEpgMaxLetters-nCurShowLen));
		}
		if (nNextShowLen + sNextShowDesc.length > gnOsdBanEpgMaxLetters){
		    sNextShow = gsNextShow.trunc(gnOsdBanEpgMaxLetters);
			sNextShowDesc = gsNextShowDesc.trunc(Math.max(0,gnOsdBanEpgMaxLetters - nNextShowLen ));
		}
		sTable+='<td class="r13c01" colspan="3">'+sCurShow+'<span class="desc"> '+sCurShowDesc+'</span></td></tr><tr>'+
				'<td class="r2c01" colspan="3"><img src="progress.gif" width='+ gsCurrentProgress +'% height=4px></td></tr><tr>'+
				'<td class="r13c01" colspan="3">'+sNextShow+'<span class="desc"> '+sNextShowDesc+'</span></td></tr></table>';
	}
	else
	    sTable += '</table>';
	
	return sTable;
}

//==================================================
// Helper functions ================================

function alphaToHex(nPercent)
{
    return (Math.round(nPercent*2.55)).toString(16);
}

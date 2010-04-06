/*
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
// Display on browser, for testing
browser_test = false;

// Epg server (Siol internal network)
EPG_SERVER = 'http://10.253.3.129/EpgThales/FetchEpg.aspx';

TIME_OFFSET = 7200; // Siol: zimski cas: 3600, poletni 7200

// dimensions =============================
// Maximum number of items in a channel selection table.
gnMaxChanItems = 9;
// Group table width (0-100)[%]
gnGroupBoxWidth = 30;
// Banner width (0-100)[%]
gnOsdBannerWidth = 100;
// Group table font size [%]
gnGroupBoxFontSize = 100;
// Osd banner font size (epg )[%]
gnOsdBannerFontSize = 100;
// overscan correction left [px]
gnMarginLeft = 46;
// overscan correction top [px]
gnMarginTop = 30;
// =========================================

// Timeouts ================================
// Group table hide timeout [ms]
gnTmGroupBoxHideInterval = 12000;
// Banner hide timeout [ms]
gnTmOsdBannerHideInterval = 6000;
// Numeric input timeout [ms]
gnTmNumpadInterval = 2000;
// =========================================

// Background transparency =================
// Group table transparency (0-100)[%] 
gnGroupBoxAlpha = 50; 
// Banner header transparency (0-100)[%]
gnOsdBannerHeaderAlpha = 94; 
// Banner epg transparency (0-100)[%]
gnOsdBannerEpgAlpha = 78; 
//==========================================

// Colors ==================================
// http://html-color-codes.info/
// Group table background color.
gsGropBoxBackgroundColor = '#0000c4';
// Group table header font color
gsGroupBoxHeaderColor = '#ffff00' ;
// Group box table left font color (numbers)
gsGroupBoxLeftColor = '#80f20d' ; 
// Group box table right font color (names)
gsGroupBoxRightColor = 'white' ;
// Group box selected item color
gsGroubBoxSelectorColor = '#808080';
// Banner header background color
gsOsdBannerHeadBackColor = '#808080';
// Banner epg background color 
gsOsdBannerEpgBackColor = '#0000c4';
// Banner: chan. number font color
gsOsdBannerNumColor = '#ffff00'; 
// Banner: chan. name font color
gsOsdBannerNameColor = 'white';
// Banner: clock font color 
gsOsdBannerClockColor = 'white';
// Banner : epg name color
gsOsdBannerEpgColor = '#ffff00';
// Banner : epg description color
gsOsdBannerEpgDescColor = 'white';
// Numeric input background color
gsNumericInputBackColor= 'black';
// Numeric input font color
gsnumericInputColor = 'yellow';
// ==========================================


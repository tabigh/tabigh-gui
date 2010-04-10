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

// Epg server (Siol internal network)
EPG_SERVER = 'http://10.253.3.129/EpgThales/FetchEpg.aspx';

TIME_OFFSET = 7200; // Siol: zimski cas: 3600, poletni 7200

// dimensions =============================
// Maximum number of items in a channel selection table. (default 9)
gnMaxChanItems = 9;
// Group table width (0-100)[%] (default 30)
gnGroupBoxWidth = 30;
// Banner width (0-100)[%] (default 100)
gnOsdBannerWidth = 100;
// Group table font size [%] (default 100)
gnGroupBoxFontSize = 100;
// Osd banner font size (epg )[%] (default 100)
gnOsdBannerFontSize = 100;
// overscan correction left [px] (default 46)
gnMarginLeft = 46;
// overscan correction top [px] (default 30)
gnMarginTop = 30;
// =========================================

// Timeouts ================================
// Group table hide timeout [ms] (default 12000)
gnTmGroupBoxHideInterval = 12000;
// Banner hide timeout [ms] (default 6000)
gnTmOsdBannerHideInterval = 6000;
// Numeric input timeout [ms] (default 2000)
gnTmNumpadInterval = 2000;
// =========================================

// Background transparency =================
// Group table transparency (0-100)[%] (default 50)
gnGroupBoxAlpha = 50; 
// Banner header transparency (0-100)[%] (default 94)
gnOsdBannerHeaderAlpha = 94; 
// Banner epg transparency (0-100)[%] (default 78)
gnOsdBannerEpgAlpha = 78; 
//==========================================

// Colors ==================================
// http://html-color-codes.info/
// Group table background color. (default #0000c4)
gsGropBoxBackgroundColor = '#0000c4';
// Group table header font color (default #ffff00)
gsGroupBoxHeaderColor = '#ffff00' ;
// Group box table left font color (numbers) (default #80f20d)
gsGroupBoxLeftColor = '#80f20d' ; 
// Group box table right font color (names) (default white)
gsGroupBoxRightColor = 'white' ;
// Group box selected item color (default #808080)
gsGroubBoxSelectorColor = '#808080';
// Banner header background color (default #808080)
gsOsdBannerHeadBackColor = '#808080';
// Banner epg background color (default #0000c4)
gsOsdBannerEpgBackColor = '#0000c4';
// Banner: chan. number font color (default #ffff00)
gsOsdBannerNumColor = '#ffff00'; 
// Banner: chan. name font color (default white)
gsOsdBannerNameColor = 'white';
// Banner: clock font color (default white)
gsOsdBannerClockColor = 'white';
// Banner : epg name color (default #ffff00)
gsOsdBannerEpgColor = '#ffff00';
// Banner : epg description color (default white)
gsOsdBannerEpgDescColor = 'white';
// Numeric input background color (default black)
gsNumericInputBackColor= 'black';
// Numeric input font color (default yellow)
gsnumericInputColor = 'yellow';
// ==========================================


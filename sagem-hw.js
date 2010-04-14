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

function sagemSetDateTime(offset)
{
    if (typeof(sagem) != 'undefined')
 		sagem.Set('TIME', 'TIME_OFFSET', offset);	// Time is set via ntp, just correct the offset.
}

function sagemJoinMulticast(ip, port)
{
    if (typeof(sagem) != 'undefined')
        document.location.href = 'tv://multicast.' + ip + ':' + port ;
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

function sagemCurrentChannelSet(index, group)
{
	if (typeof(sagem) != 'undefined'){
		SAGEM_JS_Set("CURRENT_CHANNEL", index+";"+group);
	}
}

function sagemCurrentChannelGet()
{
	if (typeof(sagem) != 'undefined'){
		if (SAGEM_JS_Get("CURRENT_CHANNEL"))
			return SAGEM_JS_Get("CURRENT_CHANNEL");
		else
			return '';
	}
	else
		return '';
}

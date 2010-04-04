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

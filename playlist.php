<?php
/**
* playlist.php
* iptv-stb-gui
* http://code.google.com/p/iptv-stb-gui/
*/

// input file
$file = 'siol.m3u';
// output string
$output = '';

$handle = @fopen($file, 'r');
  
if ($handle)
{
  $channel_info = array();
  $order = array("\r\n", "\n", "\r");
  $first = true;
  $i = 0;
  
  // start of output
  $output .= 'la=[';
  
  while (!feof($handle))
  {
      $buffer = fgets($handle);
      
      // if line starts with #EXTINF
      if ((strlen($buffer) > 7) && (substr($buffer, 0, 7) == '#EXTINF'))
      {
         $data = explode(',', substr($buffer, 8));
         // remove new line
         $channel_info[1] = str_replace($order, '', $data[1]);
         $channel_info[2] = $data[0];
      }
      // if line starts with #EXTTV
      else if ((strlen($buffer) > 6) && (substr($buffer, 0, 6) == '#EXTTV'))
      {
        $exttv_data = substr($buffer, stripos($buffer, ':') + 1);
        $exttv_data = explode(';', $exttv_data);

        // some channels have multiple categories, separated by a comma
        // use only first
        $categories = explode(',', $exttv_data[0]);
        $channel_info[5]= $categories[0];
           
        $channel_info[6]= $exttv_data[1];
        // remove new line
        $channel_info[7]=  str_replace($order, '', $exttv_data[2]);
        $channel_info[8]= 'false'; 
      }
      // if line starts with udp
      else if ((strlen($buffer) > 6) && (substr($buffer,0,3) == 'udp'))
      {
        $ip_start = stripos($buffer, '@') + 1;
        $ip_end = stripos($buffer, ':', $ip_start);
        $port_start = $ip_end + 1;
        $ip = substr($buffer, $ip_start, $ip_end - $ip_start);
        $port =substr($buffer, $port_start);

        $channel_info[3] = $ip;
        $channel_info[4] = str_replace($order, '', $port);
	      $channel_info[0]= $i;
	      
	      $i++;
        
        // If not first, add a comma before
        if (!$first)
        {
           $output .= ',';
        }
        
        //channel data
        $output .= '['.$channel_info[0].',"'.$channel_info[1].'","'.$channel_info[2];
        $output .= '","'.$channel_info[3].'","'.$channel_info[4].'","'.$channel_info[5];
        $output .= '","'.$channel_info[6].'","'.$channel_info[7].'","'.$channel_info[8].'"]';
        
        $first=false;
        
        unset($channel_info);
        $channel_info = array();   
      }
  }
  
  // end of output
  $output .= '];';
  fclose($handle);
}
else {
  // error file not found
  $output .= 'la=[[0,"Napaka: datoteka '.$file.' ne obstaja.","1","","","","","","false"]];';
}

echo $output;
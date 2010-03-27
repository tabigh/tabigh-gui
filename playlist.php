<?php

  $file = "siol.m3u";
  $arChanInfo = array();
  $handle = @fopen($file, "r");
    
  if ($handle)
  {
    $order = array("\r\n", "\n", "\r");
    $first=true;
	$i=0;
    echo "la=[";
    while (!feof($handle))
    {
        $buffer = fgets($handle);

        if (strlen($buffer)>7 && substr($buffer,0,7)== "#EXTINF")
        {
           $comma_sep = stripos($buffer,",");
           $arChanInfo[1]= str_replace($order, "" , substr($buffer, $comma_sep +1));
           $arChanInfo[2]= substr($buffer,8,$comma_sep -8);
           
        }
        else if (strlen($buffer)>6 && substr($buffer,0,6)== "#EXTTV" )
        {
          $exttv_data = substr($buffer,stripos($buffer,":")+1);
          $arexttv_data = explode(";", $exttv_data);
          if (count(arexttv>3))
          {
             $arTemp = explode(",",$arexttv_data[0]);
             $arChanInfo[5]= $arTemp[0];
             $arChanInfo[6]= $arexttv_data[1];
             $arChanInfo[7]=  str_replace($order, "", $arexttv_data[2]);
             $arChanInfo[8]= "false"; 
          }
        }
        else if (strlen($buffer)>6 && substr($buffer,0,3)== "udp")
        {
          $nIpStart = stripos($buffer,"@")+1;
          $nIpEnd = stripos($buffer,":",$nIpStart);
          $nPortStart = $nIpEnd+1;
          $sIp = substr($buffer, $nIpStart, $nIpEnd-$nIpStart);
          $sPort =substr($buffer,$nPortStart);

          $arChanInfo[3]=$sIp;
          $arChanInfo[4]= str_replace($order, "", $sPort);
		  $arChanInfo[0]= $i;
		  $i++;

          if (!$first)
          {
             echo ",";
          }
          echo "[", $arChanInfo[0],",", json_encode($arChanInfo[1]),",", json_encode($arChanInfo[2]),",",json_encode($arChanInfo[3]),",",json_encode($arChanInfo[4]),",",json_encode($arChanInfo[5]),",",json_encode($arChanInfo[6]),",",json_encode($arChanInfo[7]),",",json_encode($arChanInfo[8]),"]";
        
          $first=false;
          unset($arChanInfo);
          $arChanInfo = array();   
        }
    }
    echo "];";
    fclose($handle);
  }

?>


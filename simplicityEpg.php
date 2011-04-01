<?php
/*
 *
 * Siol IPTV Sagem simplicity PHP EPG handler wrapper
 * Released under GPL v3.0 2010, MisterTi
 * Version: 1.0
 *
 * Still much to do, among all:
 * - cleanup old cache files
 *
 */

function csv_explode($delim='&', $str, $enclose='"', $preserve=false)
{
  $resArr = array();
  $n = 0;
  $expEncArr = explode($enclose, $str);
  foreach($expEncArr as $EncItem){
    if($n++%2){
      array_push($resArr, array_pop($resArr) . ($preserve?$enclose:'') . $EncItem.($preserve?$enclose:''));
    }else{
      $expDelArr = explode($delim, $EncItem);
      array_push($resArr, array_pop($resArr) . array_shift($expDelArr));
      $resArr = array_merge($resArr, $expDelArr);
    }
  }

  $resArrOut = array();
  foreach($resArr as $key => $value)
  {
    $arr = explode("=",$value,2);
    if (sizeof($arr) > 1)
        $resArrOut[$arr[0]] = $arr[1];
  }
  return $resArrOut;
}

error_reporting(0);
session_start();

$get_arr = csv_explode('&',urldecode($_SERVER['QUERY_STRING']),'\'',false);

//TODO:
//$clock = $get_arr["clock"];
//$clockmul = $get_arr["clockmul"];

$cache_path = "c:\\sagemtemp\\";
$chan = $get_arr["chan"];
$details = $get_arr["details"];
$picture = $get_arr["picture"];
if (!$picture)
    header("Content-Type:text/html; charset=utf-8");

if ($chan)
{
    try
    {
        $a = new COM('epgSagemSimplicity.Epg');
    }
    catch (Exception $e)
    {
        echo "var epgdate = \"\"; var la=[];";
        exit;
    }
    $out="";
    if ($a->getEpg($chan,$cache_path))
    {
        $b = explode("|:|",$a->result);
        $epgdate = $b[count($b)-1];
        array_splice($b,count($b)-1);
        $out = "var epgdate=\"$epgdate\"; var la=[";
        for ($i = 0; $i < count($b);$i++)
        {
            $c = explode("|;|",$b[$i]);
            $temp = "";
            for ($j = 0; $j < count($c);$j++)
            {
                if ($j == 0)  //fix the time from '00:00 - ' to '00:00'
                {
                    $c[$j] = str_replace("-","",str_replace(" ","",$c[$j]));
                }
                if (($j+1) == count($c))
                    $temp .= '"'.$c[$j].'"';
                else
                    $temp .= '"'.$c[$j].'",';

            }
            if (($i+1) == count($b))
                $out .= "[".$temp."]];";
            else
                $out .= "[".$temp."],";
        }
        if (!$i)
        {
            $out.="];";
        }
    }
    $a = null;
    echo $out;
}

if ($details)
{
    try
    {
        $a = new COM('epgSagemSimplicity.EpgDetails');
    }
    catch (Exception $e)
    {
        echo "var ladetail=[];";
        exit;
    }
    if ($a->Get($details,$cache_path))
    {
        $out = "";
        $b = explode("|:|",$a->result);
        $out = "var ladetail=[";
        for ($i = 0; $i < count($b);$i++)
        {
            if (($i+1) == count($b))
                $out .= '"'.str_replace('"',"",$b[$i]).'"];';
            else
                $out .= '"'.str_replace('"',"",$b[$i]).'",';
        }
        if (!$i)
        {
            $out.="];";
        }
        echo iconv('cp1250','utf-8',str_replace("\n","",$out));
    }
}

if ($picture)
{
    header('Content-Type: image/jpeg');
//    header('Content-Length: ' . filesize($picture)); we don't know the size
    ob_clean();
    flush();
    readfile($picture);  //allow_url_fopen !!
}

?>

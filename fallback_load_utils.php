<?php

function fb_get_id($path){
	
	$p = explode('.', $path);
	if (count($p)>1) $leng =strlen($p[count($p)-1]) + 1;
	else $leng = 0; 
	return substr($path,0,strlen($path)-$leng);
}

function fb_parser($str){
	$estr = explode(' ', $str);
	
	foreach($estr as $i=>$s){
		$estr[$i] = preg_replace_callback('/_\$([a-zA-Z]*)/',create_function('$matches', 'include "vars.php"; $a=$matches[1]; return $_VAR[$a];'),$s);
	}
	$str = implode(' ',$estr);
	return $str;
}


function fb_load_file($path,$id){
	global $debug;
	if ($debug) echo "<li>Loading file $path $id</li>";
	$par = explode('?',$path)[1];
	$path = explode('?',$path)[0];
	$p = explode('.', $path);
	$ext = $p[count($p)-1];
	if ($ext=='xml') load_xml($path,$id);
	else if ($ext=='php') {
		fb_load_php($path,$par,$id);
	}
	else{
		if (fb_load_xml($path,$id)==FALSE){
			if (fb_load_xml($path.'.xml',$id)==FALSE){
				fb_load_php($path.'.php',$par,$id);
			}
		}
	}
}

function fb_load_xml($path,$id){
	global $debug;
	if ($debug) echo "<li>loading xml $path $id</li>";
	if (!file_exists($path)) return FALSE;
	$xml = simplexml_load_file($path);
	if ($xml==FALSE) return FALSE;
	else fb_load_entry($xml, $id);
	return TRUE;	
}

function fb_load_php($path,$par,$id){
	global $debug;
	if ($debug) echo "<li>loading php $path $id</li>";
	
	if (!file_exists($path)) return FALSE;
	
	if ($debug) echo "<li>loading php - file exists!</li>";

	ob_start();
	if ($par!=''){
		foreach (explode("&",$par) as $i){
			$_GET[explode('=',$i)[0]] = explode('=',$i)[1];
		}
	}
	if ($id!='') $_GET['id']=$id;
	include $path;
	$str_out = ob_get_contents();
	ob_end_clean();

	$xml = simplexml_load_string($str_out);
	fb_load_entry($xml, $id);
	return TRUE;	
}


function fb_load_entry($xml,$id){
	global $debug;
	if ($debug) echo "<li>loading entry $id</li>";
	$entry = $xml->xpath('//entry[@id="'.$id.'"]');
	#$entry = $xml->xpath('//li');
	if (count($entry)>0){
		$cfg = $xml->xpath('//entry[@id="'.$id.'"]/config');
		$cnt = $xml->xpath('//entry[@id="'.$id.'"]/content');
		$ttl = $xml->xpath('//entry[@id="'.$id.'"]/config/title');
		$ent = $xml->xpath('//entry[@id="'.$id.'"]/entry');
		$date = $xml->xpath('//entry[@id="'.$id.'"]/config/date');
		$author = $xml->xpath('//entry[@id="'.$id.'"]/config/author');
		$visib = $xml->xpath('//entry[@id="'.$id.'"]/config/visibility');
		foreach ($visib as $lol) $visibility = $lol;
		$ss = $xml->xpath('//entry[@id="'.$id.'"]/config/skipsubentries');
		foreach ($ss as $lol) $skipss= $lol;
		
		//todo: visibility ereditariety?
		if ($visibility!='false'){
			if (count($cfg)==1) fb_load_config($xml,'//entry[@id="'.$id.'"]/config');
			if (count($ttl)==1) fb_load_content($xml,'//entry[@id="'.$id.'"]/config/title',1);
			if (count($date)==1) fb_load_content($xml,'//entry[@id="'.$id.'"]/config/date',0);
			if (count($author)==1) fb_load_content($xml,'//entry[@id="'.$id.'"]/config/author',0);
			if (count($cnt)==1) fb_load_content($xml,'//entry[@id="'.$id.'"]/content',1);
		}
		if (($skipss!='true') && (count($ent)>0)) foreach($ent as $entry){
			fb_load_entry($xml,$entry['id']);
		}
	}
}

function fb_load_config($xml,$conf){
	global $head;
	global $esc;
	global $debug;
	#$conf is a xpath string
	if ($debug) echo "<li>loading config $conf</li>";
	foreach ($xml->xpath($conf.'/load_file') as $loadfile){
		fb_load_xml($loadfile,$loadfile['entryid']);
	}
	if ($esc==''){
		#homepage
		if ($debug) echo "<li>Loading Homepage!</li>";
		$home = $xml->xpath($conf.'/home');
		if (count($home)>0){
			fb_load_xml('resources/content/'.substr($home[0],2),substr($home[0],2,count($home[0])-4));
		}
	}
	
	#fill <head>
	if ($head){
		$css = $xml->xpath($conf.'/css');
		$title = $xml->xpath($conf.'/pagetitle');
		
		if (count($title)>0){
			echo "<title>".$title[0]."</title>";
		}
		if (count($css)>0) foreach ($css as $i){
			echo "<link rel='stylesheet' href='$i' type='text/css'>";
		}
	}
	
}


function fb_load_content($xml,$cnt_path,$rm_id){
	global $_SITENAME;
	global $debug;
	global $head;
	if ($debug==TRUE) echo "<li>loading content $cnt_path</li>";
	foreach ($xml->xpath($cnt_path) as $cont){
		$t = preg_replace('/#!(.*\"?\'?)/','/'.$_SITENAME.'/#!$1',$cont->asXML()); #use correct links
		
		#remove container id
		if ($rm_id){
			$t = preg_replace('/^<.*>/','',$t); 
			$t = preg_replace('/<\/.*>$/','',$t);
		}
		
		$t = fb_parser($t);
		
		if ($head!=TRUE) print_r ($t);
	}
}

?>
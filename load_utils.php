<?php

function get_tag($path){
	
	$p = explode('.', $path);
	if (count($p)>1) $leng =strlen($p[count($p)-1]) + 1;
	else $leng = 0; 
	return substr($path,0,strlen($path)-$leng);
}

function parser($str){
	$estr = explode(' ', $str);
	
	foreach($estr as $i=>$s){
		$estr[$i] = preg_replace_callback('/_\$([a-zA-Z]*)/',create_function('$matches', 'include "vars.php"; $a=$matches[1]; return $_VAR[$a];'),$s);
	}
	$str = implode(' ',$estr);
	return $str;
}


function load_file($path,$tag){
	global $debug;
	if ($debug) echo "<li>Loading file $path $tag</li>";
	$p = explode('.', $path);
	$ext = $p[count($p)-1];
	if ($ext=='xml') load_xml($path,$tag);
	else if ($ext=='php') load_php($path,$tag);
	else{
		if (load_xml($path,$tag)==FALSE){
			if (load_xml($path.'.xml',$tag)==FALSE){
				load_php($path.'.php',$tag);
			}
		}
	}
}

function load_xml($path,$tag){
	global $debug;
	if ($debug) echo "<li>loading xml $path $tag</li>";
	if (!file_exists($path)) return FALSE;
	$xml = simplexml_load_file($path);
	if ($xml==FALSE) return FALSE;
	else load_entry($xml, $tag);
	return TRUE;	
}

function load_php($path,$tag){
	global $debug;
	if ($debug) echo "<li>loading php $path $tag</li>";
	
	if (!file_exists($path)) return FALSE;
	
	ob_start();
	include $path;
	$str_out = ob_get_contents();
	ob_end_clean();
	
	$xml = simplexml_load_string($str_out);
	load_entry($xml, $tag);
	return TRUE;	
}


function load_entry($xml,$tag){
	global $debug;
	if ($debug) echo "<li>loading entry $tag</li>";
	$entry = $xml->xpath('//entry[@id="'.$tag.'"]');
	#$entry = $xml->xpath('//li');
	if (count($entry)>0){
		$cfg = $xml->xpath('//entry[@id="'.$tag.'"]/config');
		$cnt = $xml->xpath('//entry[@id="'.$tag.'"]/content');
		$ttl = $xml->xpath('//entry[@id="'.$tag.'"]/title');
		$ent = $xml->xpath('//entry[@id="'.$tag.'"]/entry');
		$date = $xml->xpath('//entry[@id="'.$tag.'"]/config/date');
		$author = $xml->xpath('//entry[@id="'.$tag.'"]/config/author');
		
		if (count($cfg)==1) load_config($xml,'//entry[@id="'.$tag.'"]/config');
		if (count($ttl)==1) load_content($xml,'//entry[@id="'.$tag.'"]/title',1);
		if (count($cnt)==1) load_content($xml,'//entry[@id="'.$tag.'"]/content',1);
		if (count($date)==1) load_content($xml,'//entry[@id="'.$tag.'"]/config/date',0);
		if (count($author)==1) load_content($xml,'//entry[@id="'.$tag.'"]/config/author',0);
		
		if (count($ent)>0) foreach($ent as $entry){
			load_entry($xml,$entry['id']);
		}
	}
}

function load_config($xml,$conf){
	global $head;
	global $esc;
	global $debug;
	#$conf is a xpath string
	if ($debug) echo "<li>loading config $conf</li>";
	foreach ($xml->xpath($conf.'/load_file') as $loadfile){
		load_xml($loadfile,$loadfile['entryid']);
	}
	if ($esc==''){
		#homepage
		if ($debug) echo "<li>Loading Homepage!</li>";
		$home = $xml->xpath($conf.'/home');
		if (count($home)>0){
			load_xml('resources/content/'.substr($home[0],2),substr($home[0],2,count($home[0])-4));
		}
	}
	
	#fill <head>
	if ($head){
		$css = $xml->xpath($conf.'/css');
		$title = $xml->xpath($conf.'/title');
		
		if (count($title)>0){
			echo "<title>".$title[0]."</title>";
		}
		if (count($css)>0) foreach ($css as $i){
			echo "<link rel='stylesheet' href='$i' type='text/css'>";
		}
	}
	
}


function load_content($xml,$cnt_path,$rm_tag){
	global $_SITENAME;
	global $debug;
	global $head;
	if ($debug==TRUE) echo "<li>loading content $cnt_path</li>";
	foreach ($xml->xpath($cnt_path) as $cont){
		$t = preg_replace('/#!(.*\"?\'?)/','/'.$_SITENAME.'/#!$1',$cont->asXML()); #use correct links
		
		#remove container tag
		if ($rm_tag){
			$t = preg_replace('/^<.*>/','',$t); 
			$t = preg_replace('/<\/.*>$/','',$t);
		}
		
		$t = parser($t);
		
		if ($head!=TRUE) print_r ($t);
	}
}

?>
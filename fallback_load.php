<?php
#load a very simple version of the site with php, without js
#usable for google bot crawler only!!

include 'vars.php';
include_once 'fallback_load_utils.php';

$debug =0;
$esc = $_GET['_escaped_fragment_'];
$mainconfig = simplexml_load_file('resources/xml/config.xml');

fb_load_config($mainconfig,'//config');

$loader = FALSE;
if (explode("/",$esc)[0]=='load') {
	$esc = explode("/",$esc)[1];
	$loader = TRUE;
}

if (($esc!='') && ($esc!=NULL)){
	$id = fb_get_id($esc);
	
	
	if ($loader) {
		fb_load_file('resources/load.php?data='.$esc,$id);
	}
	else {
		fb_load_file('resources/content/'.$esc, $id);
	}
}
?>
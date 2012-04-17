<?php
#load a very simple version of the site with php, without js
#usable for google bot crawler only!!

include 'vars.php';
include_once 'load_utils.php';
$debug =0;
$esc = $_GET['_escaped_fragment_'];
$mainconfig = simplexml_load_file('resources/xml/config.xml');

load_config($mainconfig,'//config');
if (($esc!='') && ($esc!=NULL)){
	$tag = get_tag($esc);
	load_file('resources/content/'.$esc, $tag);
}
?>
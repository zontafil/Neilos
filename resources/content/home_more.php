<?php
include_once '../plugin/content_loader.php';

$file = 'home.xml';
$tag_in='home';
$tag_out='home_more';

$plugins = array('more');

$param = array();

$param['_more_id']='home';
$param['_more_home_num_per_page']=3;
$param['_more_home_show_more']=1;

load_file($file,$tag_in,$tag_out);
?>
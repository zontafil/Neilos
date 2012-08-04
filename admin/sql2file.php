<?php
include_once dirname(__FILE__).'/../vars.php';
require_once dirname(__FILE__).'/../resources/lib/lib_sql2entry.php';


$overwrite = $_GET['file2sql_overwrite'];
$main_path = dirname(__FILE__).'/../resources/content/';


mysql_connect($_SQL_HOST,$_SQL_USER,$_SQL_PASS);
@mysql_select_db($_SQL_DB) or die( "Unable to select database");



$query = "select * from entries";
$res = mysql_query($query);
$num = mysql_numrows($res);
$i=0;
while ($i < $num) {

    $entry_id = mysql_result($res,$i,'id');
    $query = "select * from entry_subentries where subentry = '$entry_id'";
    $res2 = mysql_query($query);
    if (mysql_numrows($res2)==0){
        //this is a parent entry... convert the whole tree to file
        convert_sql2file($entry_id);
    }
    $i++;
}

function convert_sql2file($id){
    $main_path = dirname(__FILE__).'/../resources/content/';
    $query = "select * from entries where id = '$id'";
    $res = mysql_query($query);
    if (mysql_numrows($res)==0) return false;
    if (($pf = mysql_result($res,0,'preferred_file'))==''){
        //we don't have a default filename, create a new one
        $filename = mysql_result($res,0,'id_name').".xml";
    }
    else $filename = $pf;
    if ((file_exists($main_path.$filename)==false) || ($overwrite=='true')){
        if (file_exists($main_path.$filename)==true) unlink($main_path.$filename);
        $fh = fopen($main_path.$filename, 'w') or die("can't open file");
        fwrite($fh,'<?xml version="1.0" encoding="iso-8859-1"?>');
        
        fwrite($fh,print_sqlentry($id));
    }
}

?>
<?php

include_once dirname(__FILE__).'/../vars.php';

mysql_connect($_SQL_HOST,$_SQL_USER,$_SQL_PASS);
@mysql_select_db($_SQL_DB) or die( "Unable to select database");

mysql_query("truncate table entries");
mysql_query("truncate table entry_subentries");
mysql_query("truncate table entry_tags");
mysql_query("truncate table tags_name");




?>

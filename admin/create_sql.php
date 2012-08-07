<?php

include_once dirname(__FILE__).'/../vars.php';

mysql_connect($_SQL_HOST,$_SQL_USER,$_SQL_PASS);
mysql_query("create database $_SQL_DB");
@mysql_select_db($_SQL_DB) or die( "Unable to select database");

$query = "
CREATE TABLE `entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_name` varchar(45) DEFAULT NULL,
  `title` text,
  `date` date DEFAULT NULL,
  `author` varchar(45) DEFAULT NULL,
  `preferred_file` varchar(100) DEFAULT NULL,
  `intro` text,
  `config` varchar(1000) DEFAULT NULL,
  `content` text,
  `pagetitle` varchar(45) DEFAULT NULL,
  `visibility` varchar(1) DEFAULT NULL,
  `target` varchar(25) DEFAULT NULL,
  `skipsubentries` varchar(1) DEFAULT NULL,
  `clear` varchar(1) DEFAULT NULL,
  `type` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_name_UNIQUE` (`id_name`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1
";
mysql_query($query);
echo mysql_error();

$query= "
CREATE TABLE `entry_subentries` (
  `entry` int(11) NOT NULL,
  `subentry` int(11) NOT NULL,
  PRIMARY KEY (`entry`,`subentry`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
";
mysql_query($query);
echo mysql_error();

$query = "
CREATE TABLE `entry_tags` (
  `entry_id` int(11) NOT NULL,
  `tag` int(11) NOT NULL,
  PRIMARY KEY (`entry_id`,`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1
";
mysql_query($query);
echo mysql_error();

$query = "
CREATE TABLE `tags_name` (
  `tag_id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(65) DEFAULT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_name_UNIQUE` (`tag_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1
";
mysql_query($query);
echo mysql_error();



?>
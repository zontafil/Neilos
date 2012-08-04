<?php

include_once dirname(__FILE__).'/../vars.php';


$overwrite = $_GET['file2sql_overwrite'];
$main_path = dirname(__FILE__).'/../resources/content/';


mysql_connect($_SQL_HOST,$_SQL_USER,$_SQL_PASS);
@mysql_select_db($_SQL_DB) or die( "Unable to select database");

if ($handle = opendir($main_path)) {
	echo "Converting files to MySQL!\n";
    libxml_use_internal_errors(true);
    while (false !== ($file = readdir($handle))) {
        //echo "$main_path.$file";
        $fileexp = explode('.',$file);  
    	if ($fileexp[count($fileexp)-1]=='php'){
            //we have a php file. just dump it to the db ignoring the possible xml structure
            
			
			//PHP LOADING IS NOT ALLOWED ANYMORE
			//if (file_exists($main_path.$file)){
			//	$f = fopen($main_path.$file,'r');
			//	$stuff='';
			//	while( !feof($f)){
			//		$stuff .= fgets($f,100);
			//	}
			//	$stuff = addslashes($stuff);
			//	
			//	//WARNING: use last_insert_id instead!! don't be a fag
			//	//WARNING: don't use addslashes(). Are u mad. http://shiflett.org/blog/2006/jan/addslashes-versus-mysql-real-escape-string
			//	
			//	$query = "select * from entries where preferred_file = '$file'";
			//	$res = mysql_query($query);
			//	
			//	if ((mysql_numrows($res)==0) || ($overwrite=='true')){
			//		$query = "SELECT Auto_increment  FROM information_schema.tables  WHERE table_name='entries'";
			//		$nextid = mysql_result(mysql_query($query),0,"Auto_increment");
			//		$query = "INSERT INTO entries VALUES ('','entry$nextid','','','','$file','$stuff','','','','','',1,'','','')";
			//		mysql_query($query);
			//		echo mysql_error()."\n";
			//	}
			//}
        }
        else if ($fileexp[count($fileexp)-1]=='xml'){
			//we have an xml file.
			
			$xml = simplexml_load_file($main_path.$file);
			if ($xml) {
				foreach ($xml->xpath('//entry') as $i=>$cont){
					convert_entry_sql($xml,$cont->attributes()['id'],$file);
				}
				foreach ($xml->xpath('//entry') as $i=>$cont){
					link_subentry($xml,$cont->attributes()['id'],$file);
				}
			}
		}
    }
	echo "Done!\n";
}

function link_subentry($xml,$id,$tags){
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/'.'entry') as $cont){
		$query = "select id from entries where id_name = '$id'";
		$res = mysql_query($query);
		$id_num = mysql_result($res,0,'id');

		$sub_id_name = $cont->attributes()['id'];
		
		//getting subentry id
		$query = "select id from entries where id_name = '$sub_id_name'";
		$sub_id_num = mysql_result(mysql_query($query),0,'id');
		$query = "INSERT INTO entry_subentries VALUES ('$id_num','$sub_id_num')";
		mysql_query($query);
	}

}

function convert_entry_sql($xml,$id,$file){
	//convert entry to sql, and check for additional tags
	
	if ($id=='') return false;

	$config = $content = $title = '';

	foreach ($xml->xpath('//entry[@id="'.$id.'"]/'.'config') as $cont){
			$config .= $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/'.'content') as $cont){
			$content .= $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'title') as $cont){
			$title = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'author') as $cont){
			$author = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'date') as $cont){
			$date = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'pagetitle') as $cont){
			$pagetitle = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'visibility') as $cont){
			$visibility = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'target') as $cont){
			$target = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'skipsubentries') as $cont){
			$ss = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'clear') as $cont){
			$clear = $cont->asXML();
	}
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/'.'type') as $cont){
			$type = $cont->asXML();
	}
	$config = str_replace("<config>",'',$config);
	$config = str_replace("</config>",'',$config);
	$config = preg_replace("@<tag[^>]*?>.*?</tag>@siu","",$config);
	$config = preg_replace("@<title[^>]*?>.*?</title>@siu","",$config);
	$config = preg_replace("@<author[^>]*?>.*?</author>@siu","",$config);
	$config = preg_replace("@<date[^>]*?>.*?</date>@siu","",$config);
	$config = preg_replace("@<pagetitle[^>]*?>.*?</pagetitle>@siu","",$config);
	$config = preg_replace("@<visibility[^>]*?>.*?</visibility>@siu","",$config);
	$config = preg_replace("@<target[^>]*?>.*?</target>@siu","",$config);
	$config = preg_replace("@<skipsubentries[^>]*?>.*?</skipsubentries>@siu","",$config);
	$config = preg_replace("@<clear[^>]*?>.*?</clear>@siu","",$config);
	$config = preg_replace("@<type[^>]*?>.*?</type>@siu","",$config);
	$title = str_replace("<title>",'',$title);
	$title = str_replace("</title>",'',$title);
	$author = str_replace("<author>",'',$author);
	$author = str_replace("</author>",'',$author);
	$date = str_replace("<date>",'',$date);
	$date = str_replace("</date>",'',$date);
	$pagetitle = str_replace("<pagetitle>",'',$pagetitle);
	$pagetitle = str_replace("</pagetitle>",'',$pagetitle);
	$visibility = str_replace("<visibility>",'',$visibility);
	$visibility = str_replace("</visibility>",'',$visibility);
	if ($visibility=='false') $visibility = 0;
	else if ($visibility=='true') $visibility = 1;
	$target = str_replace("<target>",'',$target);
	$target = str_replace("</target>",'',$target);
	$ss = str_replace("<skipsubentries>",'',$ss);
	$ss = str_replace("</skipsubentries>",'',$ss);
	if ($ss=='true') $ss=1;
	else if ($ss=='false') $ss=0;
	$clear = str_replace("<clear>",'',$clear);
	$clear = str_replace("</clear>",'',$clear);
	if ($clear=='false') $clear=0;
	else if ($clear=='true') $clear=1;
	$type = str_replace("<type>",'',$type);
	$type = str_replace("</type>",'',$type);
	$content = str_replace("<content>",'',$content);
	$content = str_replace("</content>",'',$content);
	
	$config = addslashes($config);
	$content = addslashes($content);
	
	//
	//MAIN ENTRY SQL QUERY
	//
	$query = "INSERT INTO entries VALUES ('','$id','$title','$date','$author','$file','','$config','$content','$pagetitle','$visibility','$target','$ss','$clear','$type')";
    mysql_query($query);
	//	
	//	
	
	
	$query = "select id from entries where id_name = '$id'";
	$res = mysql_query($query);
	$entry_id_num = mysql_result($res,0,'id');

	foreach ($xml->xpath('//entry[@id="'.$id.'"]/'.'config') as $cont){
			
			foreach ($cont->xpath('tag') as $tag_list){
				$tag_h = $tag_list->asXML();
				$tag_csv = explode("</tag>",explode("<tag>",$tag_h)[1])[0];
				foreach (explode(",",$tag_csv) as $tag){
					$query = "insert into tags_name values('','$tag')";
					mysql_query($query);
					
					$query = "select tag_id from tags_name where tag_name = '$tag'";
					$res = mysql_query($query);
					$tag_id = mysql_result($res,0,'tag_id');
					
					$query = "insert into entry_tags values ('$entry_id_num','$tag_id')";
					mysql_query($query);
				}
			}
	}	
		
}


?>
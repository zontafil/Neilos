<?php
$root_dir = dirname(__FILE__)."/../../";

function load_content($params){
	include_once dirname(__FILE__).'/lib_sql2entry.php';
	include dirname(__FILE__).'/../../vars.php';

	//global $_DEFAULT_STORAGE;
	//global 	$_SQL_HOST;
	//global 	$_SQL_USER;
	//global 	$_SQL_PASS;
	//global 	$_SQL_DB;

	$data = $params['data'];
	$sql = $params['sql'];
	$file = $params['file'];
	$tag =$params['tag'];
	$id=$params['id'];
	if ($id=='') $id = $data;
	
	
	if (($sql!='true') && ($file=='true')) $sql='false';
	else if ($sql!='true'){
		if ($_DEFAULT_STORAGE=='sql') $sql='true';
		else if ($_DEFAULT_STORAGE=='file') $sql='false';
		else $sql='false';
	}
	if ($sql == 'true'){
		//SQL CODE HERE.
		libxml_use_internal_errors(true);
	
		mysql_connect($_SQL_HOST,$_SQL_USER,$_SQL_PASS);
		@mysql_select_db($_SQL_DB) or die( "Unable to select database");
		
		$p = explode('.', $data);
		$ext = $p[count($p)-1];
		
		
		if ($id!='') {
			$query .= "select * from entries where id_name = '$id'";
		}
		else if ($tag!='') {
			$query = "select * from tags_name where tag_name = '$tag'";
			$res_t = mysql_query($query);
			if (mysql_numrows($res_t)!=1) return false;
			$tag_id = mysql_result($res_t,0,'tag_id');
			$query = "select * from entries where id in (select entry_id from entry_tags where tag = '$tag_id')";
		}
		$res = mysql_query($query);
		echo mysql_error();
		//if (mysql_numrows($res)>1){
		//	$filename = $data;
		//	if ($ext!='xml') $filename .= '.xml';
		//	$res = mysql_query("select * from entries where preferred_file = '$filename' and id_name='$id'");
		//}
		
		if (mysql_numrows($res)==0) return false;
		
		$num = mysql_numrows($res);
		$i=0;
		$entry_tot = '';
		while ($i < $num) {
			$id_num = mysql_result($res,$i,'id');
			$id_name = mysql_result($res,$i,'id_name');
			$entry_str = print_sqlentry($id_num);
			
			$xml = simplexml_load_string($entry_str);
			if (!xml){
				echo "Error loading SQL entry (bad format)";
				return false;
			}
			
			$entry_tot .= load_entry($xml,$id_name);
			
			$i++;
		}
		return $entry_tot;
	}
	
	else{
		//FILE STORAGE CODE HERE
		//load the proper file
		$data = 'resources/content/'.$data;
		$p = explode('.', $data);
		$ext = $p[count($p)-1];
		if ($ext=='xml') load_file($data,$id);
		else return load_file($data.'.xml',$id);
	}

}

function load_file($file,$id){
	return load_file_convert($file,$id,$id);
}

function load_file_convert($file,$id,$id_out){
	//echo "load_file(): loading file $file!!\n";
	libxml_use_internal_errors(true);
	$root_dir = dirname(__FILE__)."/../../";
	
	$fileexp = explode('.',$file);  
	if ($fileexp[count($fileexp)-1]=='php'){
		//we have a php file. load it with php buffering
		//not possible anymore... 
		return false;
	}
	else if ($fileexp[count($fileexp)-1]=='xml'){
		//we have an xml file.
		$xml = simplexml_load_file($root_dir.$file);
		if (!$xml) {
			foreach(libxml_get_errors() as $error) {
				//echo "\tss", $error->message;
			}
			//echo "\nPRINTING WRONG XML: $str_out\n";
			return FALSE;
		}

	}
	else return false;
	//$out = "<xml>";
	$out .= load_entry_convert($xml, $id,$id_out);
	//$out .= "</xml>";
	return $out;
}
function load_entry($xml,$id){
	return load_entry_convert($xml,$id,$id);
}

function load_entry_convert($xml,$id,$id_out){
	$entry_str = "<entry id='$id_out'>";
	$entry_str .= load_block($xml, $id, 'config');
	$entry_str .= load_block($xml, $id, 'title');
	$entry_str .= load_block($xml, $id, 'content');
	$subentries_str = '';
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/entry') as $i=>$cont){
		$sub_id = $cont->attributes()['id'];
		$subentries_str .= load_entry($xml,$sub_id);
	}
	
	$entry_str .= apply_plugins($xml,$id,$subentries_str,'subentries');
	$entry_str .= "</entry>";
	return $entry_str;
}

function load_block($xml,$id,$block){
	
	$_input_string = '';
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/'.$block) as $cont){
		$_input_string .= $cont->asXML();
	}
	
	return apply_plugins($xml,$id,$_input_string,$block);
	
}

function apply_plugins($xml,$id,$in_str,$context){
	$out_str = $in_str;
	
	foreach ($xml->xpath('//entry[@id="'.$id.'"]/config/plugin/load') as $cont){
		$pl_name = (string) $cont->attributes()['plugin'];
		$param = array();
		foreach ($cont->xpath('param') as $cont2){
			$par_n = (string) $cont2->attributes()['name'];
			$param[$par_n]=$cont2;
		}
		include_once dirname(__FILE__).'/../plugin/'.$pl_name.'.php';
		$pl_ob = new $pl_name();
		$out_str = $pl_ob->init($out_str,$context,$param);
		unset($pl_ob);
	}
	return $out_str;
}


?>
	

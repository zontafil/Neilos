<?php
/*
 * 'more' plugin for neilos
 * 
 * PARAMETERS:
 * -entries_per_page: number of entries per page
 * -show_more: show "more" link
 */

global $_GET;
global $_SERVER;


Class More{
	public function init($_input_string,$id,$_context,$param){
		if (($_input_string!='') && ($_input_string!=NULL)){
			#fetch parameters
			//$id = $param['_more_id'];
			$page = $_GET['page'];
			if (ctype_digit($page)) $page = (int)$page;
			else $page=1;
			$num_per_page = $param['entries_per_page'];
			$show_more = $param['show_more'];
			$filename = basename($_SERVER['PHP_SELF']);

			#fill config
			if ($_context=='config'){
				if ($page>1){
					$_input_string = preg_replace('/<clear>[a-zA-Z]*<\/clear>/', '', $_input_string);
					$_input_string = preg_replace('/<\/config>/', '', $_input_string);
					$_input_string = $_input_string."<clear>false</clear>";
				}
				return $_input_string;
				
			}
			#fill entries
			else if ($_context=='subentries'){
				$_input_string = '<ss>'.$_input_string.'</ss>';
				libxml_use_internal_errors(true);
				$xml = simplexml_load_string($_input_string);
				if (!$xml) {
					foreach(libxml_get_errors() as $error) {
						echo "\t", $error->message;
					}
				}
				$out = '';
				$theresmore = false;
				foreach ($xml->xpath("entry") as $i=>$cont){
					#check if we are in the correct page
					if ($i<($page-1)*$num_per_page) continue;
					else if ($i>($page)*$num_per_page-1) {
						$theresmore = true;
						continue;
					}
					$out .= $cont->asXML();
				}
				if (($out!='') && ($show_more) && ($theresmore)){
					//evaluate the new GET string
					$get = $_GET;
					$get['page']= $page + 1;
					$get_str = '';
					foreach ($get as $key => $val){
						$get_str .= "$key=$val&amp;";
					}
					$get_str = substr($get_str, 0, strlen($get_str) - 5);
					
					
					//add more button
					 $out = $out . "<entry class='more_button' id='".$id_out."_more'>";
					 $out = $out . "<config><class>more_button</class><click prevent_default='true' href='$filename?$get_str' remove='true'></click>";
					 $out = $out . "<title>More</title></config>";
					 $out = $out . "</entry>";
				}
				
				return $out;
			}
			else return $_input_string;
		}
	}
}

?>
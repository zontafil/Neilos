<?php
/*
 * 'more' plugin for neilos
 * 
 * PARAMETERS:
 * -num_per_page: number of entries per page
 * -show_more: show "more" link
 */

global $_GET;
global $_SERVER;
if (($_input_string!='') && ($_input_string!=NULL)){
	#fetch parameters
	$id = $param['_more_id'];
	$page = $_GET['page'];
	if (ctype_digit($page)) $page = (int)$page;
	else $page=1;
	$num_per_page = $param['_more_'.$id.'_num_per_page'];
	$show_more = $param['_more_'.$id.'_show_more'];
	$filename = basename($_SERVER['PHP_SELF']);
	
	#fill config
	if ($_context=='config'){
		
		if ($page>1){
			$_input_string = preg_replace('/<clear>[a-zA-Z]*<\/clear>/', '', $_input_string);
			$_input_string = preg_replace('/<\/config>/', '', $_input_string);
			$_input_string = $_input_string."<clear>false</clear></config>";
		} 
	}
	#fill entries
	else if ($_context=='entries'){
		#separate entries
		$entry = preg_split('/<\/entry>\s*<entry/',$_input_string);
		
		$out = '';
		foreach ($entry as $i=>$ent){
			
			#check if we are in the correct page
			if (($i<($page-1)*$num_per_page) || ($i>($page)*$num_per_page-1)) continue;
			
			if ($out==''){
				if ($i==0) $out = $ent;
				else $out = "<entry".$ent;
			} 
			else $out = $out."</entry><entry".$ent;
		}
		if (count($entry)>($page)*$num_per_page) {
		 	$out = $out.'</entry>';
			if ($show_more){
				//add more button
				 $out = $out . "<entry class='more_button' id='".$tag_out."_more'>";
				 $out = $out . "<config><class>more_button</class><click prevent_default='true' href='".$filename."?page=".($page+1)."' remove='true'></click></config>";
				 //$out = $out . "<title><span><a href='javascript:Neilos.tools.open_link_tab(\"".$filename."?page=".($page+1)."\")'>More</a></span></title>";
				 $out = $out . "<title><span>More</span></title>";
				 $out = $out . "</entry>";
			}
		}
		$_input_string = $out;
	}
}

?>
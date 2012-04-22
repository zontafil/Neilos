<?php


function load_file($file,$tag_in,$tag_out){
	echo "<php>";
	$fileexp = explode('.',$file);  
	if ($fileexp[count($fileexp)-1]=='php'){
		ob_start();
		include "../content/$file";
		$str_out = ob_get_contents();
		ob_end_clean();
		$xml = simplexml_load_string($str_out);	
	}
	else {
		$xml = simplexml_load_file("../content/$file");
	}
	
	load_entry($xml, $tag_in, $tag_out);
	echo "</php>";
}


function load_entry($xml,$tag_in,$tag_out){
	global $plugins;
	global $param;
	
	echo "<entry id='$tag_out'>";
	
	load_block($xml, $tag_in, 'config');
	load_block($xml, $tag_in, 'title');
	load_block($xml, $tag_in, 'content');
	
	$entry_tot = '';
	foreach ($xml->xpath('//entry[@id="'.$tag_in.'"]/entry') as $i=>$cont){
		$entry_tot = $entry_tot . $cont->asXML();
	}
	
	//load all needed plugins
	$_input_string = $entry_tot;
	$_context = 'entries';
	foreach ($plugins as $pl) include $pl.'.php';

	print_r($_input_string);
	
	echo "</entry>";
}

function load_block($xml,$tag_in,$block){
	global $plugins;
	global $param;
	
		foreach ($xml->xpath('//entry[@id="'.$tag_in.'"]/'.$block) as $cont){
			$t = $cont->asXML();
		
			//load all needed plugins
			$_input_string = $t;
			$_context = $block;
			foreach ($plugins as $pl) include $pl.'.php';

			print_r($_input_string);
		}
	
}
	
?>
	

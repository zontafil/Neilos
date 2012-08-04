<?php
/*
 * 'laoder' plugin for neilos
 * 
 * PARAMETERS:
 * -same as the standard load_file GET parameters. See the manual.
 */

global $_GET;
global $_SERVER;


Class Loader{
	public function init($_input_string,$_context,$param){
		require_once dirname(__FILE__).'/../lib/lib_content_loader.php';
		
		#fill entries
		if ($_context=='subentries') {
			$_input_string .= load_content($param);
		}
		
		return $_input_string;
	}
}

?>
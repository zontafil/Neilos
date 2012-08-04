<php>
<entry id="testphp">
	<config>
		<clear>true</clear>
		<skipsubentries>false</skipsubentries>
		<skipcontent>false</skipcontent>
		<title>Neilos - Test Page</title>
	</config>
	<title>
			<span>PHP version</span>
	</title>
	<content>
			<spana><?php echo PHP_VERSION; ?></spana>
			<span><?
			
			
				ob_start();
				phpinfo();
				$info = ob_get_clean ();
				
				//$info = str_replace('&nbs','lol',$info);
				//echo $info;
				//$matches = array ();
				$i = preg_match ('%(<style type="text/css">.*</style>).*<body>(.*)</body>%s', $info, $matches);
				
				$lal = $matches[2];
				$lal=str_replace("nbsp","amp",$lal);
				//$lal = html_entity_decode($matches[2]);
				print $lal;
				
				$lal=str_replace("&nb","lol",$matches[1]);
				$lal = html_entity_decode($matches[1]);
				$lal = $matches[1];
				$lall=str_replace("&nb","lol",$matches[2]);
				//print $matches [1]; # Style information
				//print $matches [2]; # Body
				
			
			
			?></span>
	</content>
</entry>
</php>

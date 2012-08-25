<?php

// centralized php content loader.
// can decide to use file or sql storage

include_once 'lib/lib_content_loader.php';
//echo "<xml>".load_content($_GET)."</xml>";
echo load_content($_GET);
?>
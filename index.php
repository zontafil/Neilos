<?php include 'vars.php'; ?>

<?php $esc = $_GET['_escaped_fragment_'] ?>


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html lang="en-US">
<head>
<?php if (count($esc)>0) {$head=TRUE; include "fallback_load.php";} ?>
<?php if (count($esc)<=0) echo '<meta name="fragment" content="!">'; ?>

<title>m3l7 personal website</title>
<meta http-equiv="Content-Type"
content="text/html; charset=utf-8">
<META NAME="DESCRIPTION" CONTENT="nerd stuff by m3l7. Neilos CMS">
<meta name="KEYWORDS" content="cms zcms m3l7 javascript coding neilos">

<?php
if (count($esc)<=0) echo '
<script type="text/javascript" src="resources/js/jquery-1.7.1.min.js"></script>
<script type="text/javascript" src="resources/js/jquery-hashchange.js"></script>
<script type="text/javascript" src="resources/js/jquery.ba-resize.min.js"></script>
<script type="text/javascript" src="resources/js/neilos.js"></script>
'; ?>

		<?php if ($_ANALYTICS==TRUE) echo "
		<script type='text/javascript'>
              var _gaq = _gaq || [];
              _gaq.push(['_setAccount', '$_ANALYTICS_ID']);
              _gaq.push(['_trackPageview','/']);

              (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
              })();
        </script>
        "; ?>

</head>
<body>
<?php if (count($esc)>0) {$head=FALSE; include "fallback_load.php";} ?>
</body>
</html>
<html>
<head>
     <LINK href="css/tools.css" rel="stylesheet" type="text/css">
    
</head>

<body>
    
    <form name="file2sql" action="file2sql.php" method="get">
        <span class="tool_title">Convert Files to SQL</span>
        <hr/>
        <input class="action" type="submit" value="Go!">
        <ul class="options">
            <li>
                <span class="tool_option_name">Overwrite articles</span>
                <div class="options_input">
                    <input type="radio" name="file2sql_overwrite" value="yes" /> Yes<br />
                    <input type="radio" name="file2sql_overwrite" value="no" checked/> No
                </div>
            </li>
        </ul>
        <hr/>
    </form>
    <form name="sql2file" action="sql2file.php" method="get">
        <span class="tool_title">Convert SQL to Files</span>
        <hr/>
        <input class="action" type="submit" value="Go!">
        <ul class="options">
            <li>
                <span class="tool_option_name">Overwrite articles</span>
                <div class="options_input">
                    <input type="radio" name="sql2file_overwrite" value="yes" /> Yes<br />
                    <input type="radio" name="sql2file_overwrite" value="no" checked/> No
                </div>
            </li>
        </ul>
        <hr/>
    </form>
    <form name="createDB" action="create_sql.php" method="get">
        <span class="tool_title">Install the DB</span>
        <hr/>
        <input class="action" type="submit" value="Go!">
        <ul class="options">
          <li>
               <div class="options_input">
               </div>
          </li>
        </ul>
        <hr/>
    </form>
        <form name="emptyDB" action="empty_sql.php" method="get">
        <span class="tool_title">Delete all DB Data! (WARNING)</span>
        <hr/>
        <input class="action" type="submit" value="Go!">
        <ul class="options">
          <li>
               <div class="options_input">
               </div>
          </li>
        </ul>
        <hr/>
    </form>

</body>



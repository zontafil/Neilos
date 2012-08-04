<?php
function print_sqlentry($id){
    $result = '';
    
    $query = "select * from entries where id = '$id'";
    $res = mysql_query($query);

    $id_name = mysql_result($res,0,'id_name');
    $intro = mysql_result($res,0,'intro');
    $config = mysql_result($res,0,'config');
    $content = mysql_result($res,0,'content');
    $title = mysql_result($res,0,'title');
    $author = mysql_result($res,0,'author');
    $date = mysql_result($res,0,'date');
    $pagetitle = mysql_result($res,0,'pagetitle');
    $visibility = mysql_result($res,0,'visibility');
    $target = mysql_result($res,0,'target');
    $ss = mysql_result($res,0,'skipsubentries');
    $clear = mysql_result($res,0,'clear');
    $type = mysql_result($res,0,'type');

    //add tags to config
    $query = "select * from entry_tags where entry_id = '$id'";
    $res_tag = mysql_query($query);
    $num = mysql_numrows($res_tag);
    $i=0;
    $tag_str = '';
    while ($i < $num) {
        $tag_id = mysql_result($res_tag,$i,'tag');
        $query = "select * from tags_name where tag_id = '$tag_id'";
        $res_tname = mysql_query($query);
        $tag_name = mysql_result($res_tname,0,'tag_name');
        $tag_str .= $tag_name.',';
        $i++;
    }
    if ($num>0){
        $tag_str = substr($tag_str, 0, -1);
        $config .= "<tag>$tag_str</tag>";
    }
    if ($title!='') $config .= "<title>$title</title>\n";
    if ($author!='') $config .= "<author>$author</author>\n";
    if ($date!='0000-00-00') $config .= "<date>$date</date>\n";
    if ($pagetitle!='') $config .= "<pagetitle>$pagetitle</pagetitle>\n";
    if ($visibility=='1') $config .= "<visibility>true</visibility>\n";
    if ($visibility=='0') $config .= "<visibility>false</visibility>\n";
    if ($target!='') $config .= "<target>$target</target>\n";
    if ($ss=='1') $config .= "<skipsubentries>true</skipsubentries>\n";
    if ($ss=='0') $config .= "<skipsubentries>false</skipsubentries>\n";
    if ($type!='') $config .= "<type>$type</type>\n";
    if ($clear=='1') $config .= "<clear>true</clear>\n";
    if ($clear=='0') $config .= "<clear>false</clear>\n";
    
    $result .= '<entry id="'.$id_name.'">';
    $result .= $intro;
    if ($config!='') $result .= '<config>'.$config.'</config>';
    if ($content!='') $result .= '<content>'.$content.'</content>';
    
    
    //add subentries
    $query = "select * from entry_subentries where entry = '$id'";
    $res2 = mysql_query($query);
    echo "\n".mysql_error();
    
    $num = mysql_numrows($res2);
    $i=0;
    while ($i < $num) {
        $sub_id = mysql_result($res2,$i,'subentry');
        $result .= print_sqlentry($sub_id);
        $i++;
    }
    $result .= '</entry>';
    
    return $result;
}


?>
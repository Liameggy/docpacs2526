<?php
$array  = array("Javascript","Php","React","Dot NET","ASP","MySQL","Node","Mongo DB","Angular","JSP","JAVA","C","C#","C++","Python","Ruby");
	function array_search_partial($arr, $keyword) {
		foreach($arr as $str) {
			if (stristr($str, $keyword) !== FALSE)
				echo $str."<br/>"; 
		}
	}
	array_search_partial($array,$_GET['q']);
?>
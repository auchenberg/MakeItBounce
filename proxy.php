<?

	$url = urldecode($_GET['url']);

	// get the filename extension
	$ext = substr($url, -3);
	// set the MIME type
	switch ($ext) {
	   case 'jpg':
	       $mime = 'image/jpeg';
	       break;
	   case 'gif':
	       $mime = 'image/gif';
	       break;
	   case 'png':
	       $mime = 'image/png';
	       break;
	   default:
	       $mime = false;
	}

    header('Content-type: '.$mime);

echo file_get_contents($url);

?>


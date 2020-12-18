<?php
require_once(__DIR__.'/../../../vendor/autoload.php');
$px2te = new pickles2\libs\themeEditor\main();
$px2te->init(array(
	'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
	'entryScript' => realpath(__DIR__.'/../src_px2/.px_execute.php'),
));
if(@$_GET['client_resources']){
	$value = $px2te->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}
$value = $px2te->gpi( json_decode( $_REQUEST['data'] ) );
header('Content-type: text/json');
echo json_encode($value);
exit;

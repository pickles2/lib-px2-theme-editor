<?php
require_once(__DIR__.'/../../../vendor/autoload.php');

// 例外ハンドラを設定する
set_exception_handler(function(Throwable $exception) {
	$realpath_error_log = __DIR__.'/error_report.txt';
	echo "Uncaught exception: ", $exception->getMessage(), "\n";
	error_log(
		"Uncaught exception: ".$exception->getMessage().' on '.$exception->getFile().' line:'.$exception->getLine()."\n",
		3,
		$realpath_error_log
	);
});

// エラーハンドラを設定する
set_error_handler(function($errno, $errstr, $errfile, $errline) {
	$realpath_error_log = __DIR__.'/error_report.txt';
	error_log(
		'Error['.$errno.']: '.$errstr.' on '.$errfile.' line:'.$errline."\n",
		3,
		$realpath_error_log
	);
	return false;
});

$px2te = new pickles2\libs\themeEditor\main();
$px2te->init(array(
	'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
	'entryScript' => realpath(__DIR__.'/../src_px2/.px_execute.php'),
));
if($_GET['client_resources'] ?? null){
	$value = $px2te->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}
$value = $px2te->gpi( json_decode( $_REQUEST['data'] ) );
header('Content-type: text/json');
echo json_encode($value);
exit;

<?php
/**
 * api.php
 */
require_once('../../../vendor/autoload.php');


// 例外ハンドラを設定する
set_exception_handler(function(Throwable $exception) {
	$realpath_error_log = __DIR__.'/error_report.log';
	echo "Uncaught exception: ", $exception->getMessage(), "\n";
	error_log(
		"Uncaught exception: ".$exception->getMessage().' on '.$exception->getFile().' line:'.$exception->getLine()."\n",
		3,
		$realpath_error_log
	);
});

// エラーハンドラを設定する
set_error_handler(function($errno, $errstr, $errfile, $errline) {
	$realpath_error_log = __DIR__.'/error_report.log';
	error_log(
		'Error['.$errno.']: '.$errstr.' on '.$errfile.' line:'.$errline."\n",
		3,
		$realpath_error_log
	);
	return false;
});

$request = json_decode(file_get_contents("php://input"), true);


// Pickles 2 に擬態する
// `$px` を生成するため。
$px = null;
$realpath_current = realpath('.');
$script_filename_current = $_SERVER['SCRIPT_FILENAME'];
chdir(__DIR__.'/../src_px2/');
$_SERVER['PATH_INFO'] = @$request['page_path'];
$_SERVER['SCRIPT_NAME'] = '/tests/app/src_px2/.px_execute.php';
$_SERVER['SCRIPT_FILENAME'] = realpath('./.px_execute.php');
$px = new \picklesFramework2\px('./px-files/');
header('HTTP/1.1 200 OK');



$px2ce = new pickles2\libs\contentsEditor\main( $px );
$px2ce->init(array(
	'target_mode' => 'theme_layout', // <- 編集対象のモード ('page_content' (default) or 'theme_layout')
	'page_path' => $request['page_path'] ?? null, // <- 編集対象ページのパス (target_mode=theme_layout のとき、 `/{theme_id}/{layout_id}.html` の形式)
	'entryScript' => realpath(__DIR__.'/../src_px2/.px_execute.php'),
));

if($request['client_resources'] ?? null){
	$value = $px2ce->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}

$value = $px2ce->gpi( $request['data'] );
header('Content-type: text/json');
echo json_encode($value);
exit;

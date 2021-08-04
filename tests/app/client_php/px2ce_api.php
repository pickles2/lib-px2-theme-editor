<?php
/**
 * api.php
 */
require_once('../../../vendor/autoload.php');

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
	'page_path' => @$request['page_path'], // <- 編集対象ページのパス (target_mode=theme_layout のとき、 `/{theme_id}/{layout_id}.html` の形式)
	'entryScript' => realpath(__DIR__.'/../src_px2/.px_execute.php'),
));

if(@$request['client_resources']){
	$value = $px2ce->get_client_resources(__DIR__.'/caches/');
	header('Content-type: text/json');
	echo json_encode($value);
	exit;
}

$value = $px2ce->gpi( $request['data'] );
header('Content-type: text/json');
echo json_encode($value);
exit;

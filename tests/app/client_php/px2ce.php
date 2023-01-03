<?php
require_once('../../../vendor/autoload.php');
?>
<!DOCTYPE html>
<html>
<head>
<title>px2ce</title>
<style>
#canvas {
	width: 100%;
	height: 500px;
}
</style>

<!-- bootstrap -->
<link rel="stylesheet" href="../../../node_modules/bootstrap/dist/css/bootstrap.css" />
<script src="../../../node_modules/bootstrap/dist/js/bootstrap.js"></script>

<!-- px2style -->
<link rel="stylesheet" href="../../../node_modules/px2style/dist/styles.css" />
<script src="../../../node_modules/px2style/dist/scripts.js"></script>

<!--
エディタが利用する CSS や JavaScript などのリソースファイルがあります。
`$px2ce->get_client_resources()` からリソースの一覧を取得し、読み込んでください。
-->

<?php

$path_contents = '/'.urlencode(@$_GET['theme_id']).'/'.urlencode(@$_GET['layout_id']).'.html';

$px2ce = new pickles2\libs\contentsEditor\main();
$px2ce->init(array(
	'target_mode' => 'theme_layout', // <- 編集対象のモード ('page_content' (default) or 'theme_layout')
	'page_path' => $path_contents, // <- 編集対象ページのパス (target_mode=theme_layout のとき、 `/{theme_id}/{layout_id}.html` の形式)
	'entryScript' => realpath(__DIR__.'/../src_px2/.px_execute.php'),
));

$resources = $px2ce->get_client_resources(__DIR__.'/caches/');
foreach($resources->css as $css_file){
	echo('<link rel="stylesheet" href="./caches/'.htmlspecialchars($css_file).'" />');
}
foreach($resources->js as $js_file){
	echo('<script src="./caches/'.htmlspecialchars($js_file).'"></script>');
}
?>

</head>
<body>
<div id="canvas"></div>

<script>
var pickles2ContentsEditor = new Pickles2ContentsEditor();
pickles2ContentsEditor.init(
	{
		'page_path': <?= var_export($path_contents, true) ?> , // <- 編集対象ページのパス
		'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
		'preview':{ // プレビュー用サーバーの情報を設定します。
			'origin': '/tests/app/src_px2/'
		},
		'lang': 'ja', // language
		'gpiBridge': function(input, callback){
			fetch('./px2ce_api.php', {
				method: 'POST',
				body: JSON.stringify({
					'page_path': <?= var_export($path_contents, true) ?>,
					'data': input,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			})
			.then((res) => res.json())
			.then((data) => {
				callback(data);
				return;
			})
			.catch((error) => {
				console.error('GPI Error:', error);
			});
			return;
		},
		'complete': function(){
			alert('完了しました。');
		},
		'onClickContentsLink': function( uri, data ){
			alert('編集: ' + uri);
		},
		'onMessage': function( message ){
			// ユーザーへ知らせるメッセージを表示する
			console.info('message: '+message);
		}
	},
	function(){
		// スタンバイ完了したら呼び出されるコールバックメソッドです。
		console.info('standby!!');
	}
);
</script>
</body>
</html>

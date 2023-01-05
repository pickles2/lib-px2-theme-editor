# pickles2/lib-px2-theme-editor

## Usage

### Server Side (PHP)

```php
<?php
/**
 * api.php
 */
require_once('vendor/autoload.php');

$px2te = new pickles2\libs\themeEditor\main( $px );
$px2te->init(array(
	'appMode' => 'web', // 'web' or 'desktop'. default to 'web'
	'entryScript' => '/realpath/to/.px_execute.php', // Pickles 2 のエンドポイント
	'commands' => array(
		// コマンドのパスを指定する (任意)
		'php' => array(
			'bin' => 'php',
			'ini' => null,
		),
	),
));

$value = $px2te->gpi( json_decode( $_REQUEST['data'] ) );
header('Content-type: text/json');
echo json_encode($value);
exit;
```


### Client Side

```php
<div id="canvas"></div>

<!--
エディタが利用する CSS や JavaScript などのリソースファイルがあります。
`$px2te->get_client_resources()` からリソースの一覧を取得し、読み込んでください。
-->

<?php
require_once('vendor/autoload.php');

$px2te = new pickles2\libs\themeEditor\main( $px );
$px2te->init( /* any options */ );

$resources = $px2te->get_client_resources();
foreach($resources->css as $css_file){
	echo('<link rel="stylesheet" href="'.htmlspecialchars($css_file).'" />');
}
foreach($resources->js as $js_file){
	echo('<script src="'.htmlspecialchars($js_file).'"></script>');
}
?>

<script>
var pickles2ThemeEditor = new Pickles2ThemeEditor();
pickles2ThemeEditor.init(
	{
		'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
		'lang': 'en', // language
		'gpiBridge': function(input, callback){
			// GPI(General Purpose Interface) Bridge
			// broccoliは、バックグラウンドで様々なデータ通信を行います。
			// GPIは、これらのデータ通信を行うための汎用的なAPIです。
			$.ajax({
				"url": '/your/api/path',
				"type": 'post',
				'data': {'data':JSON.stringify(input)},
				"success": function(data){
					callback(data);
				}
			});
			return;
		},
        'themeLayoutEditor': function(themeId, layoutId){
            alert('themeLayoutEditor: '+themeId+'/'+layoutId);
        },
        'openInFinder': function(path){
            alert('openInFinder: '+path);
        },
        'openInTextEditor': function(path){
            alert('openInTextEditor: '+path);
        }
	},
	function(){
		// スタンバイ完了したら呼び出されるコールバックメソッドです。
		console.info('standby!!');
	}
);
</script>
```



## 更新履歴 - Change log

### pickles2/lib-px2-theme-editor v0.2.3 (2022年12月29日)

- `openInFinder`、 `openInTextEditor` を省略できるようになった。
- スタートアップ機能での初期化時に、 Broccoli コンテンツのリビルドを実行するようになった。

### pickles2/lib-px2-theme-editor v0.2.2 (2022年11月3日)

- テーマテンプレートの微修正。

### pickles2/lib-px2-theme-editor v0.2.1 (2022年6月5日)

- 依存パッケージのバージョンを更新。

### pickles2/lib-px2-theme-editor v0.2.0 (2022年1月8日)

- サポートするPHPのバージョンを `>=7.3.0` に変更。
- PHP 8.1 に対応した。

### pickles2/lib-px2-theme-editor v0.1.1 (2022年1月3日)

- レイアウトの編集方法変更ができるようになった。
- パフォーマンスに関する改善。
- サーバーサイドの初期化オプション `commands` を追加。
- 内部コードの改善。

### pickles2/lib-px2-theme-editor v0.1.0 (2021年6月26日)

- テーマのスタートアップ機能を追加。

### pickles2/lib-px2-theme-editor v0.0.2 (2021年2月21日)

- Windows で プラグインオプションの取得と、デフォルトテーマの変更に失敗する問題を修正。
- レイアウトとスタイリングの修正。
- ダークモードへの対応。
- その他の細かい不具合の修正。

### pickles2/lib-px2-theme-editor v0.0.1 (2020年12月30日)

- 初回リリース


## License

MIT License


## Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>

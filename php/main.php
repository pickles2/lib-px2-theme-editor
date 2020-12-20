<?php
namespace pickles2\libs\themeEditor;
class main{

	/** 設定情報 */
	public	$options;

	/** FileSystem Utility */
	private $fs;

	/** LangBank object */
	private $lb;

	/** px2agent */
	private $px2proj;

	/** px2all */
	private $px2all;

	/**
	 * Constructor
	 */
	public function __construct(){
		$this->fs = new \tomk79\filesystem();
	}

	/**
	 * $fs
	 * @return object FileSystem Utility Object.
	 */
	public function fs(){
		return $this->fs;
	}

	/**
	 * $lb
	 * @return object LangBank Object.
	 */
	public function lb(){
		return $this->lb;
	}

	/**
	 * px2agent
	 */
	public function px2agent(){
		return $this->px2proj;
	}

	/**
	 * Get $px2all
	 */
	public function px2all(){
		if( $this->px2all ){
			return $this->px2all;
		}
		$this->px2all = $this->px2agent()->query('/?PX=px2dthelper.get.all', array("output" => "json"));
		return $this->px2all;
	}

	/**
	 * Initialize
	 * @param array $options オプション
	 */
	public function init( $options = array() ){
		$options = (is_array($options) ? $options : array());
		$options['appMode'] = (array_key_exists('appMode', $options)&&$options['appMode'] ? $options['appMode'] : 'web'); // web | desktop

		$this->options = $options;

		$this->lb = new \tomk79\LangBank(__DIR__.'/../data/language.csv');

		$px2agent = new \picklesFramework2\px2agent\px2agent();
		$this->px2proj = $px2agent->createProject( $options['entryScript'] );

	}

	/**
	 * 汎用API
	 * @param  array   $query    クエリデータ
	 * @return mixed 実行結果。
	 */
	public function gpi($query){
		$gpi = new gpi($this);
		$rtn = $gpi->gpi( $query );
		return $rtn;
	}

	/**
	 * アプリケーションの実行モード設定を取得する
	 * @return string 'web'|'desktop'
	 */
	public function getAppMode(){
		$rtn = $this->options['appMode'];
		switch($rtn){
			case 'web':
			case 'desktop':
				break;
			default:
				$rtn = 'web';
				break;
		}
		return $rtn;
	}

	/**
	 * クライアントリソースの一覧を取得する
	 * 
	 * @param string $realpath_dist リソースファイルの出力先。
	 * 省略時は、各ファイルのサーバー内部パスを返す。
	 * @return object css および js ファイルの一覧
	 */
	public function get_client_resources($realpath_dist = null){
		$rtn = json_decode('{"css": [], "js": []}');

		// px2te
		if(is_string($realpath_dist) && is_dir($realpath_dist)){
			$this->fs->copy_r(__DIR__.'/../dist/', $realpath_dist.'/px2te/');
			array_push($rtn->js, 'px2te/pickles2-theme-editor.min.js');
			array_push($rtn->css, 'px2te/pickles2-theme-editor.min.css');
		}else{
			array_push($rtn->js, realpath(__DIR__.'/../dist/pickles2-theme-editor.min.js'));
			array_push($rtn->css, realpath(__DIR__.'/../dist/pickles2-theme-editor.min.css'));
		}


		return $rtn;
	}

}

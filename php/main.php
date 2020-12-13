<?php
namespace pickles2\libs\themeEditor;
class main{

	/** 設定情報 */
	public	$options;

	/** FileSystem Utility */
	private $fs;

	/** LangBank object */
	private $lb;


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
	 * Initialize
	 * @param array $options オプション
	 */
	public function init( $options = array() ){
		$options = (is_array($options) ? $options : array());
		$options['appMode'] = (@$options['appMode'] ? $options['appMode'] : 'web'); // web | desktop

		$this->options = $options;

		$this->lb = new \tomk79\LangBank(__DIR__.'/../data/language.csv');
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

}

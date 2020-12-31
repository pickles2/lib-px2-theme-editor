<?php
namespace pickles2\libs\themeEditor;
class configEditor{

	/** $main */
	private $main;

	/**
	 * Constructor
	 */
	public function __construct($main){
		$this->main = $main;
	}

	/**
	 * デフォルトテーマIDをセットする
	 */
	public function set_default_theme( $theme_id ){
		$param = base64_encode(json_encode(array(
			'symbols' => array(
				'theme_id' => $theme_id,
			)
		)));


		$px2all = $this->main->px2all();
		$tmp_data_file = $px2all->realpath_homedir.'_sys/ram/data/__theme-editor-'.date('Y-m-d-His').'-'.md5( microtime(true) ).'.txt';
		$this->main->fs()->save_file( $tmp_data_file, 'PX=px2dthelper.config.update&base64_json='.urlencode($param) );
		$result = $this->main->px2agent()->query(
			'/',
			array(
				"output" => "json",
				"method" => 'post',
				"body_file"=>$tmp_data_file,
			)
		);
		unlink( $tmp_data_file );


		if( !is_object( $result ) ){
			return array(
				'result' => false,
				'message' => 'テーマIDを変更できませんでした。この機能は、プロジェクトに pickles2/px2-px2dthelper v2.0.12 以降が必要です。',
			);
		}

		if( !$result->result ){
			return array(
				'result' => false,
				'message' => $result->message,
			);
		}
		return array(
			'result' => true,
			'message' => 'OK',
		);

	} // set_default_theme();

}

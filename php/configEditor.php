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

		$result = $this->main->px2agent()->query(
			'/?PX=px2dthelper.config.update&base64_json='.urlencode($param),
			array(
				"output" => "json",
			)
		);

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

<?php
namespace pickles2\libs\themeEditor\themeTemplates;
class template_001{

	/** $main */
	private $main;

	/**
	 * Constructor
	 */
	public function __construct($main){
		$this->main = $main;
	}

	/**
	 * テンプレートにオプション値を反映させる
	 */
	public function bind( $realpath_theme_root, $options ){
		return true;
	}

}

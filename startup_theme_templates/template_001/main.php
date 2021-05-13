<?php
namespace pickles2\libs\themeEditor\startupThemeTemplates\template_001;
class main{

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

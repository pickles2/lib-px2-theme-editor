<?php
namespace pickles2\libs\themeEditor\startupThemeTemplates\template_002;
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

		$templateFileList = array(
			'theme_files/modules.css',
		);

		foreach ($templateFileList as $templateFile) {
			$templateSrc = $this->main->fs()->read_file($realpath_theme_root.$templateFile);

			$twigHelper = new \pickles2\libs\themeEditor\TwigHelper();
			$templateSrc = $twigHelper->bind( $templateSrc, $options );

			$this->main->fs()->save_file(
				$realpath_theme_root.$templateFile,
				$templateSrc
			);
		}

		return true;
	}

}

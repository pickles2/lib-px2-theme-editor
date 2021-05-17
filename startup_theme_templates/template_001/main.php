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

		$colorUtils = new \tomk79\colorUtils\main();
		$options['textColorOnMainColor'] = '#fff';
		if( $colorUtils->get_brightness($options['mainColor']) > 65 && $colorUtils->get_saturation($options['mainColor']) < 40 ){
			$options['textColorOnMainColor'] = '#333';
		}
		$options['textColorOnSubColor'] = '#fff';
		if( $colorUtils->get_brightness($options['subColor']) > 65 && $colorUtils->get_saturation($options['mainColor']) < 40 ){
			$options['textColorOnSubColor'] = '#333';
		}


		$templateFileList = array(
			'theme_files/modules.css',
			'default.html',
			'popup.html',
			'top.html',
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

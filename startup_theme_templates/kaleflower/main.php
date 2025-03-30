<?php
namespace pickles2\libs\themeEditor\startupThemeTemplates\kaleflower;
class main {

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
		$options['textColorOnMainColor'] = '#eee';
		if( $colorUtils->get_brightness($options['mainColor'] ?? '') > 65 && $colorUtils->get_saturation($options['mainColor'] ?? '') < 40 ){
			$options['textColorOnMainColor'] = '#333';
		}
		$options['textColorOnSubColor'] = '#eee';
		if( $colorUtils->get_brightness($options['subColor'] ?? '') > 65 && $colorUtils->get_saturation($options['mainColor'] ?? '') < 40 ){
			$options['textColorOnSubColor'] = '#333';
		}
		$options['linkColor'] = $options['mainColor'];
		if( $colorUtils->get_brightness($options['linkColor'] ?? '') > 65 && $colorUtils->get_saturation($options['linkColor'] ?? '') < 40 ){
			$options['linkColor'] = '#00d';
		}


		$templateFileList = array(
			'theme_files/styles/theme.css.scss',
			'theme_files/modules.css',
			'inc/headsection.inc',
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


		$kflowFileList = array(
			'article.html.kflow',
			'default.html.kflow',
			'popup.html.kflow',
			'top.html.kflow',
		);

		foreach ($kflowFileList as $kflowFile) {

			$kaleflower = new \kaleflower\kaleflower();
			$kaleflower->load( $realpath_theme_root.$kflowFile );

			// Contents modules for Kaleflower
			$realpath_kflow_components_dir = $this->main->fs()->get_realpath($realpath_theme_root.'kflow/modules/');
			if( is_dir($realpath_kflow_components_dir) ){
				$kflow_component_files = $this->main->fs()->ls($realpath_kflow_components_dir);
				foreach( $kflow_component_files as $kflow_component_file ){
					if( is_file($realpath_kflow_components_dir.$kflow_component_file) ){
						$kaleflower->load( $realpath_kflow_components_dir.$kflow_component_file );
					}
				}
			}

			$this->main->fs()->save_file(
				$realpath_theme_root.$kflowFile,
				$kaleflower->getXml()
			);
		}


		if( array_key_exists('logoImage', $options) && strlen( $options['logoImage'] ?? '' ) ){
			foreach( array('default', 'article', 'popup', 'top') as $layoutName ){

				$this->main->fs()->mkdir_r( $realpath_theme_root.'theme_files/layouts/'.$layoutName.'/resources/' );
				$this->main->fs()->copy_r(
					$realpath_theme_root.'theme_files/logo.'.$options['logoImageExt'],
					$realpath_theme_root.'theme_files/layouts/'.$layoutName.'/resources/logo.'.$options['logoImageExt']
				);

				$this->main->fs()->mkdir_r( $realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage/' );
				$this->main->fs()->copy_r(
					$realpath_theme_root.'theme_files/logo.'.$options['logoImageExt'],
					$realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage/bin.'.$options['logoImageExt']
				);

				$resJson = array();
				$resJson["ext"] = $options['logoImageExt'];
				$resJson["size"] = filesize($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']);
				$resJson["base64"] = base64_encode( file_get_contents($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']) );
				$resJson["md5"] = md5_file($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']);
				$resJson["isPrivateMaterial"] = false;
				$resJson["publicFilename"] = "logo";
				$resJson["field"] = "image";
				$resJson["fieldNote"] = [];
				$resJson["type"] = $options['logoImageMimeType'];
				$this->main->fs()->save_file(
					$realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage/res.json',
					json_encode($resJson, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)
				);
			}
		}

		return true;
	}

}

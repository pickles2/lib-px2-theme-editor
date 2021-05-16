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

		$templateFileList = array(
			'theme_files/modules.css',
			'guieditor.ignore/default/data/data.json',
			'guieditor.ignore/popup/data/data.json',
			'guieditor.ignore/top/data/data.json',
			'broccoli_module_packages/_env.scss',
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


		if( array_key_exists('logoImage', $options) && strlen( $options['logoImage'] ) ){
			foreach( array('default', 'popup', 'top') as $layoutName ){

				$this->main->fs()->mkdir_r( $realpath_theme_root.'theme_files/layouts/'.$layoutName.'/resources/' );
				$this->main->fs()->copy_r(
					$realpath_theme_root.'theme_files/logo.'.$options['logoImageExt'],
					$realpath_theme_root.'theme_files/layouts/'.$layoutName.'/resources/logo_'.$layoutName.'.'.$options['logoImageExt']
				);

				$this->main->fs()->mkdir_r( $realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage_'.$layoutName.'/' );
				$this->main->fs()->copy_r(
					$realpath_theme_root.'theme_files/logo.'.$options['logoImageExt'],
					$realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage_'.$layoutName.'/bin.'.$options['logoImageExt']
				);

				$resJson = array();
				$resJson["ext"] = $options['logoImageExt'];
				$resJson["size"] = filesize($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']);
				$resJson["base64"] = base64_encode( file_get_contents($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']) );
				$resJson["md5"] = md5_file($realpath_theme_root.'theme_files/logo.'.$options['logoImageExt']);
				$resJson["isPrivateMaterial"] = false;
				$resJson["publicFilename"] = "logo_".$layoutName;
				$resJson["field"] = "image";
				$resJson["fieldNote"] = [];
				$resJson["type"] = $options['logoImageMimeType'];
				$this->main->fs()->save_file(
					$realpath_theme_root.'guieditor.ignore/'.$layoutName.'/data/resources/logoImage_'.$layoutName.'/res.json',
					json_encode($resJson, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)
				);
			}
		}

		return true;
	}

}

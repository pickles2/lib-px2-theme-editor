<?php
/**
 * General Purpose Interface
 */
namespace pickles2\libs\themeEditor;


/**
 * gpi.php (General Purpose Interface)
 */
class gpi{

	/** $main */
	private $main;

	/**
	 * Constructor
	 */
	public function __construct($main){
		$this->main = $main;
	}


	/**
	 * General Purpose Interface
	 */
	public function gpi($query){
		$query = (array) $query;
		if( !array_key_exists('api', $query) ){
			$query['api'] = null;
		}
		if( !array_key_exists('lang', $query) ){
			$query['lang'] = null;
		}
		if( !strlen($query['lang']) ){
			$query['lang'] = 'en';
		}

		$this->main->lb()->setLang( $query['lang'] );

		switch($query['api']){
			case "getBootupInfomations":
				// broccoli の初期起動時に必要なすべての情報を取得する
				$bootup = array();
				$bootup['conf'] = array();
				$bootup['conf']['appMode'] = $this->main->getAppMode();
				$bootup['languageCsv'] = file_get_contents( __DIR__.'/../data/language.csv' );
				$bootup['px2all'] = $this->main->px2agent()->query('/?PX=px2dthelper.get.all', array("output" => "json"));
				$bootup['multithemePluginOptions'] = $this->main->px2agent()->query('/?PX=px2dthelper.plugins.get_plugin_options&func_div=processor.html&plugin_name='.urlencode('tomk79\\pickles2\\multitheme\\theme::exec'), array("output" => "json"));
				$bootup['theme_collection_dir_exists'] = is_dir($bootup['px2all']->realpath_theme_collection_dir);
				return $bootup;
				break;

			// case "px2agent":
			// 	$result = $this->main->px2agent()->query(
			// 		$query['pxcmd'],
			// 		array(
			// 			"output" => "json",
			// 		)
			// 	);
			// 	return $result;
			// 	break;

			default:
				return true;
		}

		return true;
	}

}

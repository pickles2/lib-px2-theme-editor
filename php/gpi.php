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
				$bootup['px2all'] = $this->main->px2all();
				$bootup['multithemePluginOptions'] = $this->main->px2agent()->query('/?PX=px2dthelper.plugins.get_plugin_options&func_div=processor.html&plugin_name='.urlencode('tomk79\\pickles2\\multitheme\\theme::exec'), array("output" => "json"));
				$bootup['theme_collection_dir_exists'] = is_dir($bootup['px2all']->realpath_theme_collection_dir);

				$themecollection = new themecollection($this->main);
				$bootup['listThemeCollection'] = $themecollection->get_list();
				return $bootup;
				break;

			case "getThemeInfo":
				$themeId = $query['themeId'];
				$rtn = array();
				$px2all = $this->main->px2all();
				$realpath_theme_root = $px2all->realpath_theme_collection_dir.$themeId;

				$rtn['layouts'] = array();
				$ls = $this->main->fs()->ls($realpath_theme_root.'/');
				foreach( $ls as $layoutId ){
					if( !is_file( $realpath_theme_root.'/'.$layoutId ) ){
						continue;
					}
					if( !preg_match('/\.html$/', $layoutId) ){
						continue;
					}
					$layoutId = preg_replace('/\.[a-zA-Z0-9]+$/i', '', $layoutId);
					$editMode = 'html';
					if( is_file( $realpath_theme_root.'/'.$layoutId.'/guieditor.ignore/'.$layoutId.'/data/data.json' ) ){
						$editMode = 'html.gui';
					}

					array_push( $rtn['layouts'], array(
						'id' => $layoutId,
						'editMode' => $editMode,
					) );
				}

				// READMEを取得
				$rtn['readme'] = '';
				if( is_file( $realpath_theme_root.'/'.'/README.md' ) ){
					$rtn['readme'] = file_get_contents( $realpath_theme_root.'/'.'/README.md' ).toString();
					$rtn['readme'] = \Michelf\MarkdownExtra::defaultTransform($rtn['readme']);
				}else if( is_file( $realpath_theme_root.'/'.'/README.html' ) ){
					$rtn['readme'] = file_get_contents( $realpath_theme_root.'/'.'/README.html' ).toString();
				}

				// サムネイルを取得
				$rtn['thumb'] = '';
				$realpathImage = __DIR__.'/../resources/no-image.png';
				if( is_file( $realpath_theme_root.'/thumb.png' ) ){
					$realpathImage = $realpath_theme_root.'/thumb.png';
				}
				$rtn['thumb'] = 'data:image/png;base64,'.base64_encode(file_get_contents( $realpathImage ));

				return $rtn;
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

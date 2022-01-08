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
		if( !strlen(''.$query['lang']) ){
			$query['lang'] = 'en';
		}

		$this->main->lb()->setLang( $query['lang'] );

		switch($query['api']){
			case "getBootupInformations":
				// broccoli の初期起動時に必要なすべての情報を取得する
				$bootup = array();
				$bootup['conf'] = array();
				$bootup['conf']['appMode'] = $this->main->getAppMode();
				$bootup['languageCsv'] = file_get_contents( __DIR__.'/../data/language.csv' );
				$bootup['px2all'] = $this->main->px2all();
				$tmp_data_file = $bootup['px2all']->realpath_homedir.'_sys/ram/data/__theme-editor-'.date('Y-m-d-His').'-'.md5( microtime(true) ).'.txt';
				$this->main->fs()->save_file( $tmp_data_file, 'PX=px2dthelper.plugins.get_plugin_options&func_div=processor.html&plugin_name='.urlencode('tomk79\\pickles2\\multitheme\\theme::exec') );
				$bootup['multithemePluginOptions'] = $this->main->px2agent()->query(
					'/',
					array(
						"output" => "json",
						"method" => 'post',
						"body_file"=>$tmp_data_file,
					)
				);
				$bootup['multithemePluginOptions'] = (array) $bootup['multithemePluginOptions'];
				unlink( $tmp_data_file );
				$bootup['theme_collection_dir_exists'] = is_dir($bootup['px2all']->realpath_theme_collection_dir);

				$themecollection = new themeCollection($this->main);
				$bootup['listThemeCollection'] = $themecollection->get_list();

				$bootup['listThemeTemplates'] = array();
				$themeDirs = $this->main->fs()->ls(__DIR__.'/../startup_theme_templates/');
				foreach($themeDirs as $themeDir){
					$bootup['listThemeTemplates'][$themeDir] = array();
					$bootup['listThemeTemplates'][$themeDir]['id'] = $themeDir;

					$infoJson = $this->main->fs()->read_file(__DIR__.'/../startup_theme_templates/'.$themeDir.'/info.json');
					$infoJson = json_decode($infoJson);
					$bootup['listThemeTemplates'][$themeDir]['info'] = $infoJson;
				}

				$bootup['themeTemplatesThumbsCss'] = '';
				$scssProcessor = null;
				if (class_exists('\ScssPhp\ScssPhp\Compiler')) {
					$scssProcessor = new \ScssPhp\ScssPhp\Compiler();
				} elseif (class_exists('\Leafo\ScssPhp\Compiler')) {
					$scssProcessor = new \Leafo\ScssPhp\Compiler();
				}else{
					trigger_error('SCSS Proccessor is NOT available.');
				}
				foreach($themeDirs as $themeDir){
					$src_frontendThumbScss = $this->main->fs()->read_file(__DIR__.'/../startup_theme_templates/'.$themeDir.'/frontend/thumb.scss');
					$src_frontendThumbScss = '.pickles2-theme-editor{'.$src_frontendThumbScss.'}';
					$src_frontendThumbScss = str_replace('_rootClassName', '.pickles2-theme-editor__thumb-'.$themeDir, $src_frontendThumbScss);

					$src_frontendThumbScss = $scssProcessor->compile( $src_frontendThumbScss );

					$bootup['themeTemplatesThumbsCss'] .= $src_frontendThumbScss;
				}

				return $bootup;
				break;

			case "getThemeInfo":
				$theme_id = $query['themeId'];

				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->get_theme_info( $theme_id );
				return $rtn;
				break;

			case "addNewTheme":
				$themecollection = new themeCollection($this->main);
				if( !array_key_exists('importFrom', $query) ){ $query['importFrom'] = null; }
				$rtn = $themecollection->add_new_theme(
					$query['newThemeId'],
					array('importFrom' => $query['importFrom'])
				);
				return $rtn;
				break;

			case "startupTheme":
				$themecollection = new themeCollection($this->main);
				$options = array();
				if( array_key_exists('options', $query) ){
					$options = (array) $query['options'];
				}
				$rtn = $themecollection->startup_theme(
					$query['themeId'],
					$options
				);
				return $rtn;
				break;

			case "renameTheme":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->rename_theme(
					$query['newThemeId'],
					$query['renameFrom']
				);
				return $rtn;
				break;

			case "setDefaultTheme":
				$configeditor = new configEditor($this->main);
				$rtn = $configeditor->set_default_theme(
					$query['themeId']
				);
				return $rtn;
				break;

			case "deleteTheme":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->delete_theme(
					$query['themeId']
				);
				return $rtn;
				break;

			case "addNewLayout":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->add_new_layout(
					$query['themeId'],
					$query['newLayoutId'],
					$query['editMode']
				);
				return $rtn;
				break;

			case "renameLayout":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->rename_layout(
					$query['themeId'],
					$query['renameFrom'],
					$query['newLayoutId']
				);
				return $rtn;
				break;

			case "changeEditModeLayout":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->change_edit_mode_layout(
					$query['themeId'],
					$query['layoutId'],
					$query['newEditMode']
				);
				return $rtn;
				break;

			case "deleteLayout":
				$themecollection = new themeCollection($this->main);
				$rtn = $themecollection->delete_layout(
					$query['themeId'],
					$query['layoutId']
				);
				return $rtn;
				break;

			default:
				return true;
		}

		return true;
	}

}

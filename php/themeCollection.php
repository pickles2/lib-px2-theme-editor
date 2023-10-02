<?php
namespace pickles2\libs\themeEditor;
class themeCollection {

	/** $main */
	private $main;

	/**
	 * Constructor
	 */
	public function __construct($main){
		$this->main = $main;
	}

	/**
	 * テーマコレクションをリスト化
	 */
	public function get_list(){
		$themeCollection = array();
		$px2all = $this->main->px2all();
		if( !is_dir($px2all->realpath_theme_collection_dir) ){
			return false;
		}
		$ls = $this->main->fs()->ls($px2all->realpath_theme_collection_dir);
		if( !is_array($ls) || !count($ls) ){
			return $themeCollection;
		}

		$realpathDefaultThumb = 'data:image/png;base64,'.base64_encode( file_get_contents( __DIR__.'/../resources/no-image.png' ) );

		foreach( $ls as $idx=>$basename ){
			if( !is_dir( $px2all->realpath_theme_collection_dir . $basename . '/' ) ){
				continue;
			}
			$themeInfo = array();
			$themeInfo['id'] = $basename;
			$themeInfo['name'] = $basename;
			$themeInfo['thumb'] = $realpathDefaultThumb;

			if( is_file( $px2all->realpath_theme_collection_dir . $basename . '/thumb.png' ) ){
				$themeInfo['thumb'] = 'data:image/png;base64,'. base64_encode( file_get_contents( $px2all->realpath_theme_collection_dir . $basename . '/thumb.png' ) );
			}

			array_push( $themeCollection, $themeInfo );
		}

		return $themeCollection;
	}


	/**
	 * テーマの情報を取得する
	 */
	public function get_theme_info( $theme_id ){
		$rtn = array();
		$px2all = $this->main->px2all();
		$realpath_theme_root = $px2all->realpath_theme_collection_dir.urlencode($theme_id);

		$rtn['layouts'] = array();
		$ls = $this->main->fs()->ls($realpath_theme_root.'/');
		foreach( $ls as $basename ){
			if( !is_file( $realpath_theme_root.'/'.$basename ) ){
				continue;
			}
			if( !preg_match('/\.html$/', $basename) ){
				continue;
			}
			$layoutId = preg_replace('/\.[a-zA-Z0-9]+$/i', '', $basename);
			$editMode = 'html';
			if( is_file( $realpath_theme_root.'/guieditor.ignore/'.urlencode($layoutId).'/data/data.json' ) ){
				$editMode = 'html.gui';
			}

			array_push( $rtn['layouts'], array(
				'id' => $layoutId,
				'editMode' => $editMode,
				'size' => filesize( $realpath_theme_root.'/'.$basename ),
				'md5' => md5_file( $realpath_theme_root.'/'.$basename ),
			) );
		}

		// READMEを取得
		$rtn['readme'] = '';
		if( is_file( $realpath_theme_root.'/'.'/README.md' ) ){
			$rtn['readme'] = file_get_contents( $realpath_theme_root.'/'.'/README.md' );
			$rtn['readme'] = \Michelf\MarkdownExtra::defaultTransform($rtn['readme']);
		}else if( is_file( $realpath_theme_root.'/'.'/README.html' ) ){
			$rtn['readme'] = file_get_contents( $realpath_theme_root.'/'.'/README.html' );
		}

		// サムネイルを取得
		$rtn['thumb'] = '';
		$realpathImage = __DIR__.'/../resources/no-image.png';
		if( is_file( $realpath_theme_root.'/thumb.png' ) ){
			$realpathImage = $realpath_theme_root.'/thumb.png';
		}
		$rtn['thumb'] = 'data:image/png;base64,'.base64_encode(file_get_contents( $realpathImage ));

		return $rtn;
	}

	/**
	 * 新規テーマを追加する
	 */
	public function add_new_theme( $new_theme_id, $options = array() ){
		$rtn = array(
			'result' => null,
			'message' => '',
		);
		$px2all = $this->main->px2all();
		$realpath_theme_root = $px2all->realpath_theme_collection_dir.urlencode($new_theme_id).'/';
		$importFrom = $options['importFrom'];

		if( is_dir( $realpath_theme_root ) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマID '.$new_theme_id.' は、すでに存在します。',
			);
			return $rtn;
		}

		// フォルダ生成
		$this->main->fs()->mkdir_r( $realpath_theme_root );
		if( !$importFrom ){
			$this->main->fs()->save_file( $realpath_theme_root.'/default.html', '' );

			$rtn = array(
				'result' => true,
				'message' => 'OK',
			);

		}else{
			preg_match('/^(themeCollection|themePlugin)\:([\S]+)$/', $importFrom, $matched);

			$fromDiv = $matched[1];
			$fromId = $matched[2];
			if( $fromDiv == 'themeCollection' ){
				$result = $this->main->fs()->copy_r(
					$px2all->realpath_theme_collection_dir.$fromId,
					$realpath_theme_root
				);
			}else if($fromDiv == 'themePlugin'){
				$themePluginList = $px2all->packages->package_list->themes;
				$pluginInfo = $themePluginList->{$fromId};
				$result = $this->main->fs()->copy_r(
					$pluginInfo->path,
					$realpath_theme_root
				);
			}
			if( $result ){
				$rtn = array(
					'result' => true,
					'message' => 'OK',
				);
			}else{
				$rtn = array(
					'result' => false,
					'message' => '新しいテーマの生成に失敗しました。',
				);
			}
		}

		return $rtn;
	}

	/**
	 * 新規のテーマを構築する
	 */
	public function startup_theme( $theme_id, $options = array() ){

		$rtn = array(
			'result' => null,
			'message' => '',
		);

		if( !strlen( ''.$theme_id ) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマID を指定してください。',
			);
			return $rtn;
		}

		$px2all = $this->main->px2all();
		$realpath_theme_root = $px2all->realpath_theme_collection_dir.urlencode($theme_id).'/';

		if( !is_dir( $realpath_theme_root ) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマID '.$theme_id.' は、存在しません。',
			);
			return $rtn;
		}

		if( !array_key_exists('templateId', $options) || !strlen(''.$options['templateId']) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマテンプレートID を指定してください。',
			);
			return $rtn;
		}elseif( !preg_match('/^[a-zA-Z0-9\-\_]+$/', $options['templateId']) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマテンプレートID の形式が不正です。',
			);
			return $rtn;
		}
		$path_theme_template_dir = __DIR__.'/../startup_theme_templates/'.urlencode($options['templateId']).'/basefiles/';
		if( !is_dir($path_theme_template_dir) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマテンプレートが存在しません。',
			);
			return $rtn;
		}

		// テーマテンプレートを複製
		$this->main->fs()->rm($realpath_theme_root);
		$result = $this->main->fs()->copy_r( $path_theme_template_dir, $realpath_theme_root );
		if( !$result ){
			return array(
				'result' => false,
				'message' => 'テーマテンプレートの展開処理に失敗しました。',
			);
		}

		// ロゴ画像がある場合、保存
		if( array_key_exists('logoImage', $options) && strlen(''.$options['logoImage']) ){
			$result = $this->main->fs()->mkdir($realpath_theme_root.'/theme_files/');
			$logoExt = $options['logoImageExt'];
			if( !strlen(''.$logoExt) ){
				$logoExt = 'png';
			}
			$result = $this->main->fs()->save_file(
				$realpath_theme_root.'/theme_files/logo.'.$logoExt,
				base64_decode($options['logoImage'])
			);
			if( !$result ){
				return array(
					'result' => false,
					'message' => 'ロゴ画像の保存に失敗しました。',
				);
			}
		}

		// テンプレート別の加工処理
		require_once(__DIR__.'/../startup_theme_templates/'.urlencode($options['templateId']).'/main.php');
		$className = '\\pickles2\\libs\\themeEditor\\startupThemeTemplates\\'.$options['templateId'].'\\main';
		$templateOperator = new $className( $this->main );
		$result = $templateOperator->bind( $realpath_theme_root, $options );
		if( !$result ){
			return array(
				'result' => false,
				'message' => 'テンプレートの反映処理に失敗しました。',
			);
		}

		// --------------------------------------
		// Broccoli コンテンツをリビルドする
		$layout_list = $this->main->fs()->ls(__DIR__.'/../startup_theme_templates/'.urlencode($options['templateId']).'/basefiles/guieditor.ignore');
		if( !$layout_list ){
			$layout_list = array();
		}
		foreach($layout_list as $layout_id){
			$options = array(
				'api' => 'broccoliBridge',
				'forBroccoli' => array(
					'api' => 'updateContents',
					'options' => array(
						'lang' => 'ja',
					),
				),
			);
			$output = $this->main->px2agent()->query(
				'/'.urlencode($theme_id).'/'.urlencode($layout_id).'.html?PX=px2dthelper.px2ce.gpi&appMode=web&target_mode=theme_layout&data='.base64_encode(json_encode($options)),
				array(
					"output" => "json",
				)
			);
		}

		return array(
			'result' => true,
			'message' => 'OK',
		);
	}

	/**
	 * テーマを改名する
	 */
	public function rename_theme( $new_theme_id, $rename_from ){
		$rtn = array(
			'result' => null,
			'message' => '',
		);
		$px2all = $this->main->px2all();
		$realpath_theme_root = $px2all->realpath_theme_collection_dir.urlencode($new_theme_id).'/';

		if( is_dir( $realpath_theme_root ) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマID '.$new_theme_id.' は、すでに存在します。',
			);
			return $rtn;
		}

		$result = $this->main->fs()->rename( $px2all->realpath_theme_collection_dir.urlencode($rename_from).'/', $realpath_theme_root );

		if( !$result ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマディレクトリの改名に失敗しました。',
			);
			return $rtn;
		}

		$rtn = array(
			'result' => true,
			'message' => 'OK',
		);
		return $rtn;
	}

	/**
	 * テーマを削除する
	 */
	public function delete_theme( $theme_id ){
		$rtn = array(
			'result' => null,
			'message' => '',
		);
		$px2all = $this->main->px2all();
		$realpath_theme_root = $px2all->realpath_theme_collection_dir.urlencode($theme_id).'/';

		if( !is_dir( $realpath_theme_root ) ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマID '.$theme_id.' は、すでに存在しません。',
			);
			return $rtn;
		}

		$result = $this->main->fs()->rm( $realpath_theme_root );

		if( !$result ){
			$rtn = array(
				'result' => false,
				'message' => 'テーマディレクトリの削除に失敗しました。',
			);
			return $rtn;
		}

		$rtn = array(
			'result' => true,
			'message' => 'OK',
		);
		return $rtn;
	}

	/**
	 * 新規レイアウトを追加
	 */
	public function add_new_layout( $theme_id, $new_layout_id, $editMode = null ){
		if( !strlen(''.$theme_id) ){
			return array(
				'result' => false,
				'message' => 'テーマIDが指定されていません。',
			);
		}
		if( !strlen(''.$new_layout_id) ){
			return array(
				'result' => false,
				'message' => '新しいレイアウトIDが指定されていません。',
			);
		}

		$px2all = $this->main->px2all();
		$realpath_theme_root = $this->main->fs()->get_realpath($px2all->realpath_theme_collection_dir.urlencode($theme_id).'/');

		if( !is_dir($realpath_theme_root) ){
			return array(
				'result' => false,
				'message' => 'テーマが存在しません。',
			);
		}
		if( is_file($realpath_theme_root.$new_layout_id.'.html') ){
			return array(
				'result' => false,
				'message' => 'レイアウトID '.$new_layout_id.' は、すでに存在します。',
			);
		}

		$this->main->fs()->save_file( $realpath_theme_root.$new_layout_id.'.html', '<!DOCTYPE html>'."\n" );

		if( $editMode == 'html.gui' ){
			$this->main->fs()->mkdir_r( $realpath_theme_root.'/guieditor.ignore/'.urlencode($new_layout_id).'/data/' );
			$this->main->fs()->save_file( $realpath_theme_root.'/guieditor.ignore/'.urlencode($new_layout_id).'/data/data.json', '{}'."\n" );
		}

		return array(
			'result' => true,
			'message' => 'OK',
		);
	}

	/**
	 * レイアウトをリネーム
	 */
	public function rename_layout( $theme_id, $layout_id, $new_layout_id ){
		if( !strlen(''.$theme_id) ){
			return array(
				'result' => false,
				'message' => 'テーマIDが指定されていません。',
			);
		}
		if( !strlen(''.$layout_id) ){
			return array(
				'result' => false,
				'message' => '変更前のレイアウトIDが指定されていません。',
			);
		}
		if( !strlen(''.$new_layout_id) ){
			return array(
				'result' => false,
				'message' => '新しいレイアウトIDが指定されていません。',
			);
		}

		$px2all = $this->main->px2all();
		$realpath_theme_root = $this->main->fs()->get_realpath($px2all->realpath_theme_collection_dir.urlencode($theme_id).'/');

		if( !is_dir($realpath_theme_root) ){
			return array(
				'result' => false,
				'message' => 'テーマが存在しません。',
			);
		}
		if( !is_file($realpath_theme_root.$layout_id.'.html') ){
			return array(
				'result' => false,
				'message' => 'レイアウトID '.$layout_id.' は、存在しません。',
			);
		}
		if( is_file($realpath_theme_root.$new_layout_id.'.html') ){
			return array(
				'result' => false,
				'message' => 'レイアウトID '.$new_layout_id.' は、すでに存在します。',
			);
		}

		$this->main->fs()->rename(
			$realpath_theme_root.'/'.urlencode($layout_id).'.html',
			$realpath_theme_root.'/'.urlencode($new_layout_id).'.html'
		);

		if( is_dir( $realpath_theme_root.'/guieditor.ignore/'.urlencode($layout_id).'/' ) ){
			$this->main->fs()->rename(
				$realpath_theme_root.'/guieditor.ignore/'.urlencode($layout_id).'/',
				$realpath_theme_root.'/guieditor.ignore/'.urlencode($new_layout_id).'/'
			);
		}
		if( is_dir( $realpath_theme_root.'/theme_files/layouts/'.urlencode($layout_id).'/' ) ){
			$this->main->fs()->rename(
				$realpath_theme_root.'/theme_files/layouts/'.urlencode($layout_id).'/',
				$realpath_theme_root.'/theme_files/layouts/'.urlencode($new_layout_id).'/'
			);
		}

		return array(
			'result' => true,
			'message' => 'OK',
		);
	}

	/**
	 * レイアウトの編集方法を変更する
	 */
	public function change_edit_mode_layout( $theme_id, $layout_id, $new_edit_mode ){
		if( !strlen(''.$theme_id) ){
			return array(
				'result' => false,
				'message' => 'テーマIDが指定されていません。',
			);
		}
		if( !strlen(''.$layout_id) ){
			return array(
				'result' => false,
				'message' => '変更前のレイアウトIDが指定されていません。',
			);
		}
		if( !strlen(''.$new_edit_mode) ){
			return array(
				'result' => false,
				'message' => '編集方法が指定されていません。',
			);
		}

		$px2all = $this->main->px2all();
		$realpath_theme_root = $this->main->fs()->get_realpath($px2all->realpath_theme_collection_dir.urlencode($theme_id).'/');

		if( !is_dir($realpath_theme_root) ){
			return array(
				'result' => false,
				'message' => 'テーマが存在しません。',
			);
		}
		if( !is_file($realpath_theme_root.$layout_id.'.html') ){
			return array(
				'result' => false,
				'message' => 'レイアウトID '.$layout_id.' は、存在しません。',
			);
		}

		$guieditor_data_dir = $realpath_theme_root.'guieditor.ignore/'.urlencode($layout_id).'/';
		$beforeEditMode = 'html';
		if( is_dir($guieditor_data_dir) ){
			$beforeEditMode = 'html.gui';
		}

		if( $beforeEditMode == $new_edit_mode ){
			return array(
				'result' => false,
				'message' => '要求された編集方法は、すでに適用されています。',
			);
		}

		if( $beforeEditMode == 'html.gui' && $new_edit_mode == 'html' ){
			// --------------------------------------
			// ブロックエディタモードからHTMLモードに変更
			$result = $this->main->fs()->rm( $guieditor_data_dir );
			if( !$result ){
				return array(
					'result' => false,
					'message' => 'データディレクトリの削除に失敗しました。',
				);
			}
		}elseif( $beforeEditMode == 'html' && $new_edit_mode == 'html.gui' ){
			// --------------------------------------
			// HTMLモードからブロックエディタモードに変更

			$result = $this->main->fs()->mkdir_r( $guieditor_data_dir.'data/' );
			if( !$result ){
				return array(
					'result' => false,
					'message' => 'データディレクトリの作成に失敗しました。',
				);
			}

			$src_html = $this->main->fs()->read_file( $realpath_theme_root.$layout_id.'.html' );

			$data_json = json_encode( array(
				"bowl" => array(
					"main" => array(
						"modId" => "_sys/root" ,
						"fields" => array(
							"main" => array(
								array(
									"modId" => "_sys/html" ,
									"fields" => array(
										"main" => $src_html,
									),
								),
							),
						),
					),
				),
			), JSON_PRETTY_PRINT );

			$result = $this->main->fs()->save_file( $guieditor_data_dir.'data/data.json', $data_json );
			if( !$result ){
				return array(
					'result' => false,
					'message' => 'JSONファイルの保存に失敗しました。',
				);
			}
		}

		return array(
			'result' => true,
			'message' => 'OK',
		);
	}

	/**
	 * レイアウトを削除
	 */
	public function delete_layout( $theme_id, $layout_id ){
		if( !strlen(''.$theme_id) ){
			return array(
				'result' => false,
				'message' => 'テーマIDが指定されていません。',
			);
		}
		if( !strlen(''.$layout_id) ){
			return array(
				'result' => false,
				'message' => 'レイアウトIDが指定されていません。',
			);
		}

		$px2all = $this->main->px2all();
		$realpath_theme_root = $this->main->fs()->get_realpath($px2all->realpath_theme_collection_dir.urlencode($theme_id).'/');

		if( !is_dir($realpath_theme_root) ){
			return array(
				'result' => false,
				'message' => 'テーマが存在しません。',
			);
		}
		if( !is_file($realpath_theme_root.$layout_id.'.html') ){
			return array(
				'result' => false,
				'message' => 'レイアウトID '.$layout_id.' は、存在しません。',
			);
		}

		$this->main->fs()->rm($realpath_theme_root.'/'.urlencode($layout_id).'.html');

		if( is_dir( $realpath_theme_root.'/guieditor.ignore/'.urlencode($layout_id).'/' ) ){
			$this->main->fs()->rm( $realpath_theme_root.'/guieditor.ignore/'.urlencode($layout_id).'/' );
		}
		if( is_dir( $realpath_theme_root.'/theme_files/layouts/'.urlencode($layout_id).'/' ) ){
			$this->main->fs()->rm( $realpath_theme_root.'/theme_files/layouts/'.urlencode($layout_id).'/' );
		}

		return array(
			'result' => true,
			'message' => 'OK',
		);
	}
}

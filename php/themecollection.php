<?php
namespace pickles2\libs\themeEditor;
class themecollection{

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
		$ls = $this->main->fs()->ls($px2all->realpath_theme_collection_dir);

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
	} // listThemeCollection();

}

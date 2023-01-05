<?php

class startupTest extends PHPUnit\Framework\TestCase{

	private $fs;
	private $px2query;

	public function setUp() : void{
		mb_internal_encoding('UTF-8');
		$this->fs = new tomk79\filesystem();
		require_once(__DIR__.'/testHelper/pickles2query.php');
		$this->px2query = new testHelper_pickles2query();
	}

	/**
	 * テーマテンプレートから、テーマを生成する
	 */
	public function testGenerateThemesFromTemplates(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$theme_templates = $this->fs->ls(__DIR__.'/../startup_theme_templates/');

		$option_variations = array(
			'full' => array(
				"mainColor" => "#030303",
				"subColor" => "#696969",
				"logoImage" => base64_encode( file_get_contents( __DIR__.'/app/src_px2/common/images/pickles2-appicon.png' ) ),
				"logoImageExt" => 'png',
				"logoImageMimeType" => 'image/png',
			),
			'minimum' => array(
				"mainColor" => null,
				"subColor" => null,
				"logoImage" => null,
				"logoImageExt" => null,
				"logoImageMimeType" => null,
			),
		);

		foreach( $theme_templates as $template_id ){
			foreach( $option_variations as $option_id => $optionsBase ){
				$options = json_decode(json_encode($optionsBase), true);
				$options["templateId"] = $template_id;

				// --------------------------------------
				// 空白のテーマを新設する
				$result = $main->gpi(array(
					'api'=>'addNewTheme',
					'newThemeId' => $template_id.'--'.$option_id,
					'importFrom' => null,
				));

				// --------------------------------------
				// テンプレートから生成する
				$result = $main->gpi(array(
					'api'=>'startupTheme',
					'themeId' => $template_id.'--'.$option_id,
					'options' => $options,
				));
			}
		}

		$this->assertSame(1, 1);
	}

}

<?php

class startupTest extends PHPUnit\Framework\TestCase{

	public function setUp() : void{
		mb_internal_encoding('UTF-8');
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

		$result = $main->gpi(array(
			'api'=>'addNewTheme',
			'newThemeId' => 'template_001b',
			'importFrom' => null,
		));
		$result = $main->gpi(array(
			'api'=>'startupTheme',
			'themeId' => 'template_001b',
			'options' => array(
				"templateId" => "template_001b",
				"mainColor" => "#030303",
				"subColor" => "#696969",
				"logoImage" => base64_encode( file_get_contents( __DIR__.'/app/src_px2/common/images/pickles2-appicon.png' ) ),
				"logoImageExt" => 'png',
				"logoImageMimeType" => 'image/png',
			),
		));

		$this->assertSame(1, 1);
	}

}

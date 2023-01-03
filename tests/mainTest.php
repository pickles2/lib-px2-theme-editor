<?php

class mainTest extends PHPUnit\Framework\TestCase{

	public function setUp() : void{
		mb_internal_encoding('UTF-8');
	}


	/**
	 * インスタンス初期化 - getBootupInformations
	 */
	public function testInitialize(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$bootupInformations = $main->gpi(array('api'=>'getBootupInformations'));
		// var_dump($bootupInformations);
		$this->assertSame($bootupInformations['conf']['appMode'], 'web');
		$this->assertSame(is_string($bootupInformations['languageCsv']), true);
		$this->assertSame(is_array($bootupInformations['multithemePluginOptions']), true);
		$this->assertSame(count($bootupInformations['multithemePluginOptions']), 1);
		$this->assertSame($bootupInformations['theme_collection_dir_exists'], true);
		$this->assertSame(is_array($bootupInformations['listThemeCollection']), true);
		$this->assertSame(count($bootupInformations['listThemeCollection']), 2);
		$this->assertSame($bootupInformations['listThemeCollection'][0]['id'], 'pickles2');
		$this->assertSame($bootupInformations['listThemeCollection'][0]['name'], 'pickles2');
	}

	/**
	 * addNewTheme
	 */
	public function testAddNewTheme(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$result = $main->gpi(array(
			'api'=>'addNewTheme',
			'newThemeId'=>'new-test-theme',
		));
		// var_dump($result);
		$this->assertSame($result['result'], true);
		$this->assertSame($result['message'], 'OK');
	}


	/**
	 * renameTheme
	 */
	public function testRenameTheme(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$result = $main->gpi(array(
			'api'=>'renameTheme',
			'newThemeId'=>'test-theme',
			'renameFrom'=>'new-test-theme',
		));
		// var_dump($result);
		$this->assertSame($result['result'], true);
		$this->assertSame($result['message'], 'OK');

		$bootupInformations = $main->gpi(array('api'=>'getBootupInformations'));
		// var_dump($bootupInformations);
		$this->assertSame(count($bootupInformations['listThemeCollection']), 3);
		$this->assertTrue(is_dir(__DIR__.'/app/src_px2/px-files/themes/test-theme/'));
	}


	/**
	 * addNewLayout
	 */
	public function testAddNewLayout(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$result = $main->gpi(array(
			'api'=>'addNewLayout',
			'themeId'=>'test-theme',
			'newLayoutId'=>'testlayout001',
			'editMode'=>'html.gui',
		));
		// var_dump($result);
		$this->assertSame($result['result'], true);
		$this->assertSame($result['message'], 'OK');

		$themeInfo = $main->gpi(array('api'=>'getThemeInfo', 'themeId'=>'test-theme'));
		// var_dump($themeInfo);
		$this->assertSame(count($themeInfo['layouts']), 2);
		$this->assertTrue(is_file(__DIR__.'/app/src_px2/px-files/themes/test-theme/testlayout001.html'));
	}


	/**
	 * deleteTheme
	 */
	public function testDeleteTheme(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$result = $main->gpi(array(
			'api'=>'deleteTheme',
			'themeId'=>'test-theme',
		));
		// var_dump($result);
		$this->assertSame($result['result'], true);
		$this->assertSame($result['message'], 'OK');
	}


	/**
	 * 後処理
	 */
	public function testCleaning(){
		$this->assertEquals(1, 1);
	}

}

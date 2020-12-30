<?php

class mainTest extends PHPUnit_Framework_TestCase{

	public function setup(){
		mb_internal_encoding('UTF-8');
	}


	/**
	 * インスタンス初期化 - getBootupInfomations
	 */
	public function testInitialize(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$bootupInfomations = $main->gpi(array('api'=>'getBootupInfomations'));
		// var_dump($bootupInfomations);
		$this->assertSame($bootupInfomations['conf']['appMode'], 'web');
		$this->assertSame(is_string($bootupInfomations['languageCsv']), true);
		$this->assertSame(is_array($bootupInfomations['multithemePluginOptions']), true);
		$this->assertSame($bootupInfomations['theme_collection_dir_exists'], true);
		$this->assertSame(is_array($bootupInfomations['listThemeCollection']), true);
		$this->assertSame(count($bootupInfomations['listThemeCollection']), 1);
		$this->assertSame($bootupInfomations['listThemeCollection'][0]['id'], 'pickles2');
		$this->assertSame($bootupInfomations['listThemeCollection'][0]['name'], 'pickles2');
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

		$bootupInfomations = $main->gpi(array('api'=>'getBootupInfomations'));
		// var_dump($bootupInfomations);
		$this->assertSame(count($bootupInfomations['listThemeCollection']), 2);
		$this->assertTrue(is_dir(__DIR__.'/app/src_px2/px-files/themes/test-theme/'));
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

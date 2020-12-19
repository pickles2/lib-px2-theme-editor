<?php

class mainTest extends PHPUnit_Framework_TestCase{

	public function setup(){
		mb_internal_encoding('UTF-8');
	}


	/**
	 * インスタンス初期化
	 */
	public function testInitialize(){
		$main = new \pickles2\libs\themeEditor\main();
		$main->init(array(
			'entryScript' => __DIR__.'/app/src_px2/.px_execute.php',
		));
		$this->assertEquals(is_object($main), true);

		$bootupInfomations = $main->gpi(array('api'=>'getBootupInfomations'));
		// var_dump($bootupInfomations);
		$this->assertEquals($bootupInfomations['conf']['appMode'], 'web');
	}


	/**
	 * 後処理
	 */
	public function testCleaning(){
		$this->assertEquals(1, 1);
	}

}

<?php

class mainTest extends PHPUnit_Framework_TestCase{

	public function setup(){
		mb_internal_encoding('UTF-8');
	}


	/**
	 * インスタンス初期化
	 */
	public function testInitialize(){
		$main = new \pickles2ThemeEditor\main();
		$this->assertEquals(is_object($main), true);
	}


	/**
	 * 後処理
	 */
	public function testCleaning(){
		$this->assertEquals(1, 1);
	}

}

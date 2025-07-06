/**
 * Kaleflower
 */
module.exports = function( main, $ ){
	const _this = this;
	const it79 = require('iterate79');
	const templates = {
		"thumb": require("./thumb.twig"),
	};


	/**
	 * サムネイルを更新する
	 */
	this.update = function($thumb, userOptions){
        console.log('Update thumb:', userOptions);
		$thumb.html( templates.thumb(userOptions) );
		return;
	}

}

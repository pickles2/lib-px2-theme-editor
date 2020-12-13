/**
 * main.js
 */
(function(module){
	var __dirname = (function() {
		if (document.currentScript) {
			return document.currentScript.src;
		} else {
			var scripts = document.getElementsByTagName('script'),
			script = scripts[scripts.length-1];
			if (script.src) {
				return script.src;
			}
		}
	})().replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');

	module.exports = function(){

		var _this = this;
		var it79 = require('iterate79');
		var $canvas;

		/**
		 * broccoli-client を初期化する
		 * @param  {Object}   options  options.
		 * @param  {Function} callback callback function.
		 * @return {Object}            this.
		 */
		this.init = function(options, callback){
			options = options || {};
			options.gpiBridge = options.gpiBridge || function(){};
			this.options = options;

			$canvas = $(options.elmCanvas);
			$canvas.addClass('pickles2-theme-editor');

			it79.fnc(
				{},
				[
					function(it1){
						// リソースファイルの読み込み
						var css = [
							__dirname+'/pickles2-theme-editor.css',
						];
						$('head *[data-pickles2-theme-editor-resource]').remove(); // 一旦削除
						it79.ary(
							css,
							function(it2, row, idx){
								console.log('リソースを読み込んでいます...。 ('+(Number(idx)+1)+'/'+(css.length)+')');
								var link = document.createElement('link');
								link.addEventListener('load', function(){
									it2.next();
								});
								$('head').append(link);
								link.rel = 'stylesheet';
								link.href = row;
								link.setAttribute('data-pickles2-theme-editor-resource', true);
							},
							function(){
								it1.next();
							}
						);
					} ,
					function(it1){
						$canvas.html('').append('<p>開発中です</p>');
						it1.next();
					},
					function(it1){
						console.log('Pickles2 Theme Editor: init done.');
					}
				]
			);
			return this;
		}

		/**
		 * GPIから値を得る
		 */
		this.gpi = function(query, callback){
			query = query || {};
			query.lang = query.lang || this.options.lang;
			this.options.gpiBridge(query, function(result,a,b,c){
				if(typeof(result) == typeof({}) && result.errors && result.errors.length){
					for(var i in result.errors){
						console.error(result.errors[i]);
					}
				}
				callback(result);
			});
			return;
		} // gpi()


	}

})(module);

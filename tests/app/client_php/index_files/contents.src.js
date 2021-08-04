var $ = require('jquery');
var it79 = require('iterate79');

$(window).on('load', function(){
	var params = parseUriParam(window.location.href);
	// console.log(params);
	var $canvas = $('#canvas');

	/**
	* window.resized イベントハンドラ
	*/
	var windowResized = function(callback){
		callback = callback || function(){};
		$canvas.height( $(window).height() - 200 );
		callback();
		return;
	}

	it79.fnc({}, [
		function(it1, arg){
			$.ajax({
				"url": "./apis.php",
				"type": 'get',
				'data': {'client_resources':1},
				"success": function(resources){
					// console.info('-------',resources);

					it79.ary(
						resources.css,
						function(it2, row, idx){
							var link = document.createElement('link');
							link.addEventListener('load', function(){
								it2.next();
							});
							$('head').append(link);
							link.rel = 'stylesheet';
							link.href = 'caches/'+row;
						},
						function(){
							it79.ary(
								resources.js,
								function(it3, row, idx){
									var script = document.createElement('script');
									script.addEventListener('load', function(){
										it3.next();
									});
									$('head').append(script);
									script.src = 'caches/'+row;
								},
								function(){
									it1.next(arg);
								}
							);
						}
					);

				}
			});
		},
		function(it1, arg){
			var pickles2ThemeEditor = new Pickles2ThemeEditor();
			windowResized(function(){
				pickles2ThemeEditor.init(
					{
						'elmCanvas': $canvas.get(0),
						'lang': 'ja',
						'gpiBridge': function(input, callback){
							// GPI(General Purpose Interface) Bridge
							// broccoliは、バックグラウンドで様々なデータ通信を行います。
							// GPIは、これらのデータ通信を行うための汎用的なAPIです。
							// console.info('=-=-=-=-=-=-=-= gpiBridge', input);
							// var startTime = (new Date()).getTime();
							$.ajax({
								"url": "./apis.php",
								"type": 'post',
								'data': {'page_path':params.page_path, 'target_mode':params.target_mode, 'data':JSON.stringify(input)},
								"success": function(data){
									// console.log(data);
									// console.log('--- record: ', (new Date()).getTime() - startTime);
									callback(data);
								}
							});
							return;
						},
						'themeLayoutEditor': function(themeId, layoutId){
							window.open('./px2ce.php?theme_id='+themeId+'&layout_id='+layoutId);
						},
						'openInFinder': function(path){
							alert('openInFinder: '+path);
						},
						'openInTextEditor': function(path){
							alert('openInTextEditor: '+path);
						}
					},
					function(){

						// $(window).resize(function(){
						// 	// このメソッドは、canvasの再描画を行います。
						// 	// ウィンドウサイズが変更された際に、UIを再描画するよう命令しています。
						// 	windowResized(function(){
						// 		pickles2ThemeEditor.redraw();
						// 	});
						// });

						console.info('standby!!');
						it1.next(arg);
					}
				);

			});
		}
	]);

});

/**
 * GETパラメータをパースする
 */
var parseUriParam = function(url){
	var paramsArray = [];
	parameters = url.split("?");
	if( parameters.length > 1 ) {
		var params = parameters[1].split("&");
		for ( var i = 0; i < params.length; i++ ) {
			var paramItem = params[i].split("=");
			for( var i2 in paramItem ){
				paramItem[i2] = decodeURIComponent( paramItem[i2] );
			}
			paramsArray.push( paramItem[0] );
			paramsArray[paramItem[0]] = paramItem[1];
		}
	}
	return paramsArray;
}

window.darkmode = function(){
	$('body').addClass('px2-darkmode');
}

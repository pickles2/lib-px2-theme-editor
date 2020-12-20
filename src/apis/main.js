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
		var $ = require('jquery');
		var it79 = require('iterate79');
		var twig = require('twig');
		var px2style = new(require('px2style'))();
		px2style.setConfig('additionalClassName', 'pickles2-theme-editor');
		var bootupInfomations;
		var px2all,
			themePluginList,
			realpathThemeCollectionDir,
			realpathThemeCollectionDir_exists,
			multithemePluginOptions;
		var $elms = {'editor': $('<div>')};
		var $canvas;
		var templates = {
			'form-layout-delete': require('../templates/form-layout-delete.html'),
			'form-layout': require('../templates/form-layout.html'),
			'form-theme-delete': require('../templates/form-theme-delete.html'),
			'form-theme': require('../templates/form-theme.html'),
			'list': require('../templates/list.html'),
			'not-enough-api-version': require('../templates/not-enough-api-version.html'),
			'theme-home': require('../templates/theme-home.html'),
		};


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

			px2style.loading();

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
						// --------------------------------------
						// 初期化に必要な諸情報を取得する
						_this.gpi({
							'api': 'getBootupInfomations'
						}, function(result){
							console.log(result);
							bootupInfomations = result;
							px2all = bootupInfomations.px2all;

							themePluginList = [];
							try {
								themePluginList = px2all.packages.package_list.themes;
							} catch (e) {
							}
							// console.log(themePluginList);

							// テーマコレクションディレクトリのパスを求める
							realpathThemeCollectionDir = px2all.realpath_theme_collection_dir;
							realpathThemeCollectionDir_exists = bootupInfomations.theme_collection_dir_exists;

							try {
								multithemePluginOptions = bootupInfomations.multithemePluginOptions[0].options;
							} catch (e) {
								console.error(e);
							}
							// console.log(multithemePluginOptions);

							it1.next();
							return;
						});
					},
					function(it1){
						$(window).on('resize', function(){
							onWindowResize();
						});
						it1.next();
					},
					function(it1){
						px2style.closeLoading();
						_this.pageHome();
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


		/**
		 * ホーム画面を開く
		 */
		this.pageHome = function(){

			if( !realpathThemeCollectionDir_exists ){
				// テーマコレクションディレクトリが存在しなければ終了
				var err = 'Theme Collection Dir is NOT exists.';
				console.log(err, realpathThemeCollectionDir);
				_this.pageNotEnoughApiVersion([err]);
				return;
			}

			var html = bindTwig(
				templates['list'],
				{
					'themePluginList': themePluginList,
					'themeCollection': bootupInfomations.listThemeCollection,
					'realpathThemeCollectionDir': realpathThemeCollectionDir,
					'default_theme_id': multithemePluginOptions.default_theme_id
				}
			);
			$canvas.html( html );

			$canvas.find('.cont-theme-list a[data-theme-id]').on('click', function(){
				_this.pageThemeHome($(this).attr('data-theme-id'));
				return false;
			});
			return;
		}

		/**
		 * テーマのホーム画面を開く
		 */
		this.pageThemeHome = function(themeId){
			console.log('Theme: '+themeId);
			var themeInfo;

			it79.fnc({}, [
				function(it1, arg){
					// テーマの情報を取得する
					_this.gpi({
						'api': 'getThemeInfo',
						'themeId': themeId,
					}, function(result){
						console.log(result);
						themeInfo = result;
						arg.layouts = themeInfo.layouts;
						arg.readme = themeInfo.readme;
						arg.thumb = themeInfo.thumb;
						it1.next(arg);
						return;
					});
				},
				function(it1, arg){
					// テンプレート描画
					var html = bindTwig(
						templates['theme-home'],
						{
							'themeId': themeId,
							'layouts': arg.layouts,
							'thumb': arg.thumb,
							'readme': arg.readme,
							'realpathThemeCollectionDir': realpathThemeCollectionDir,
							'default_theme_id': multithemePluginOptions.default_theme_id
						}
					);
					$canvas.html( html );
					it1.next(arg);
				},
				function(it1, arg){
					// イベント処理登録
					$canvas.find('.cont-layout-list a button').on('click', function(e){
						e.stopPropagation();
					});
					$canvas.find('a').on('click', function(e){
						var href = this.href;
						main.utils.openURL( href );
						return false;
					});
					$canvas.find('.cont-theme-home-set-default__btn-set-default').on('click', function(e){
						pj.configEditor().setDefaultTheme(themeId, function(result){
							if(!result.result){
								alert(result.message);
								return;
							}
							multithemePluginOptions.default_theme_id = themeId;
							_this.pageThemeHome(themeId);
							pj.updateGitStatus();
						});
					});
					it1.next(arg);
				}
			]);
			return;
		}

		/**
		 * 新規テーマを作成またはリネームする
		 */
		this.addNewTheme = function(theme_id){

			var html = bindTwig(
				templates['form-theme'],
				{
					'themeId': theme_id,
					'themePluginList': themePluginList,
					'themeCollection': bootupInfomations.listThemeCollection
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': (theme_id ? 'テーマのリネーム' : '新規テーマ作成'),
					'body': $body,
					'buttons': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(e){
								$form.submit();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				var newThemeId = $form.find('input[name=themeId]').val();
				var importFrom = $form.find('input[name=import_from]:checked').val();
				var $errMsg = $form.find('[data-form-column-name=themeId] .cont-error-message')
				if( !newThemeId.length ){
					$errMsg.text('テーマIDを指定してください。');
					return;
				}
				if( !newThemeId.match(/^[a-zA-Z0-9\_\-]+$/) ){
					$errMsg.text('テーマIDに使えない文字が含まれています。');
					return;
				}
				if( newThemeId.length > 128 ){
					$errMsg.text('テーマIDが長すぎます。');
					return;
				}
				if( theme_id ){
					if( theme_id == newThemeId ){
						$errMsg.text('テーマIDが変更されていません。');
						return;
					}
				}


				var realpathTheme = realpathThemeCollectionDir+encodeURIComponent(newThemeId)+'/';
				if( main.utils79.is_dir( realpathTheme ) ){
					$errMsg.text('テーマID '+newThemeId+' は、すでに存在します。');
					return;
				}

				if( theme_id ){
					// フォルダ名変更
					main.fs.renameSync( realpathThemeCollectionDir+theme_id+'/', realpathTheme );
				}else{
					// フォルダ生成
					main.fsEx.mkdirsSync( realpathTheme );
					if( !importFrom ){
						main.fs.writeFileSync( realpathTheme+'/default.html', '' );
						main.fs.writeFileSync( realpathTheme+'/plain.html', '' );
						main.fs.writeFileSync( realpathTheme+'/naked.html', '' );
						main.fs.writeFileSync( realpathTheme+'/popup.html', '' );
						main.fs.writeFileSync( realpathTheme+'/top.html', '' );
					}else{
						importFrom.match(/^(themeCollection|themePlugin)\:([\S]+)$/);
						var fromDiv = RegExp.$1;
						var fromId = RegExp.$2;
						if( fromDiv == 'themeCollection' ){
							main.utils.copy_r(
								realpathThemeCollectionDir+fromId,
								realpathTheme
							);
						}else if(fromDiv == 'themePlugin'){
							var pluginInfo = themePluginList[fromId];
							main.utils.copy_r(
								pluginInfo.path,
								realpathTheme
							);
						}
					}
				}

				var msg = (theme_id ? 'テーマ '+theme_id+' を '+newThemeId+' にリネームしました。' : 'テーマ '+newThemeId+' を作成しました。')
				main.message(msg);
				px2style.closeModal();
				pj.updateGitStatus();
				_this.pageThemeHome(newThemeId);
			});

			return;
		}

		/**
		 * テーマをリネームする
		 */
		this.renameTheme = function(theme_id){
			return this.addNewTheme(theme_id);
		}

		/**
		 * テーマを削除する
		 */
		this.deleteTheme = function(theme_id){
			var html = bindTwig(
				templates['form-theme-delete'],
				{
					'themeId': theme_id
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': 'テーマ削除',
					'body': $body,
					'buttons': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--danger">')
							.text('削除する')
							.on('click', function(e){
								$form.submit();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				// フォルダを削除
				main.fsEx.removeSync( realpathThemeCollectionDir+theme_id+'/' );

				main.message('テーマ ' + theme_id + ' を削除しました。');
				px2style.closeModal();
				pj.updateGitStatus();
				_this.pageHome();
			});

			return;
		}

		/**
		 * 新規レイアウトを作成またはリネームする
		 */
		this.addNewLayout = function(theme_id, layout_id){
			if( !theme_id ){
				return;
			}
			var html = bindTwig(
				templates['form-layout'],
				{
					'themeId': theme_id,
					'layoutId': layout_id
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': (layout_id ? 'レイアウトのリネーム' : '新規レイアウト作成'),
					'body': $body,
					'buttons': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(e){
								$form.submit();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				var newLayoutId = $form.find('input[name=layoutId]').val();
				var editMode = $form.find('input[name=editMode]:checked').val();
				var $errMsg = $form.find('[data-form-column-name=layoutId] .cont-error-message')
				if( !newLayoutId.length ){
					$errMsg.text('レイアウトIDを指定してください。');
					return;
				}
				if( !newLayoutId.match(/^[a-zA-Z0-9\_\-]+$/) ){
					$errMsg.text('レイアウトIDに使えない文字が含まれています。');
					return;
				}
				if( newLayoutId.length > 128 ){
					$errMsg.text('レイアウトIDが長すぎます。');
					return;
				}
				if( layout_id ){
					if( layout_id == newLayoutId ){
						$errMsg.text('レイアウトIDが変更されていません。');
						return;
					}
				}
				if( !layout_id ){
					if( !editMode ){
						$errMsg.text('編集方法が選択されていません。');
						return;
					}
					if( editMode != 'html' && editMode != 'html.gui' ){
						$errMsg.text('編集方法が不正です。');
						return;
					}
				}


				var realpathLayout = realpathThemeCollectionDir+theme_id+'/'+encodeURIComponent(newLayoutId)+'.html';
				if( main.utils79.is_file( realpathLayout ) ){
					$errMsg.text('レイアウトID '+newLayoutId+' は、すでに存在します。');
					return;
				}

				if( layout_id ){
					// ファイル名変更
					main.fs.renameSync( realpathThemeCollectionDir+theme_id+'/'+encodeURIComponent(layout_id)+'.html', realpathLayout );
					if( main.utils79.is_dir( realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(layout_id)+'/' ) ){
						main.fs.renameSync(
							realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(layout_id)+'/',
							realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(newLayoutId)+'/'
						);
					}
					if( main.utils79.is_dir( realpathThemeCollectionDir+theme_id+'/theme_files/layouts/'+encodeURIComponent(layout_id)+'/' ) ){
						main.fs.renameSync(
							realpathThemeCollectionDir+theme_id+'/theme_files/layouts/'+encodeURIComponent(layout_id)+'/',
							realpathThemeCollectionDir+theme_id+'/theme_files/layouts/'+encodeURIComponent(newLayoutId)+'/'
						);
					}
				}else{
					// ファイル生成
					main.fs.writeFileSync( realpathLayout, '<!DOCTYPE html>'+"\n" );
					if( editMode == 'html.gui' ){
						main.fsEx.mkdirsSync( realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(newLayoutId)+'/data/' );
						main.fs.writeFileSync( realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(newLayoutId)+'/data/data.json', '{}'+"\n" );
					}
				}

				var msg = (layout_id ? 'レイアウト '+layout_id+' を '+newLayoutId+' にリネームしました。' : 'レイアウト '+newLayoutId+' を作成しました。')
				main.message(msg);
				px2style.closeModal();
				pj.updateGitStatus();
				_this.pageThemeHome(theme_id);
			});

			return;
		}

		/**
		 * レイアウトをリネームする
		 */
		this.renameLayout = function(theme_id, layout_id){
			return this.addNewLayout(theme_id, layout_id);
		}

		/**
		 * レイアウトを削除する
		 */
		this.deleteLayout = function(theme_id, layout_id){
			var html = bindTwig(
				templates['form-layout-delete'],
				{
					'themeId': theme_id,
					'layoutId': layout_id
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': 'レイアウト削除',
					'body': $body,
					'buttons': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							}),
						$('<button class="px2-btn px2-btn--danger">')
							.text('削除する')
							.on('click', function(e){
								$form.submit();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				// ファイルを削除
				main.fs.unlinkSync( realpathThemeCollectionDir+theme_id+'/'+encodeURIComponent(layout_id)+'.html' );
				if( main.utils79.is_dir( realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(layout_id)+'/' ) ){
					main.fsEx.removeSync( realpathThemeCollectionDir+theme_id+'/guieditor.ignore/'+encodeURIComponent(layout_id)+'/' );
				}
				if( main.utils79.is_dir( realpathThemeCollectionDir+theme_id+'/theme_files/layouts/'+encodeURIComponent(layout_id)+'/' ) ){
					main.fsEx.removeSync( realpathThemeCollectionDir+theme_id+'/theme_files/layouts/'+encodeURIComponent(layout_id)+'/' );
				}

				main.message('レイアウト ' + layout_id + ' を削除しました。');
				px2style.closeModal();
				pj.updateGitStatus();
				_this.pageThemeHome(theme_id);
			});

			return;
		}

		/**
		 * APIバージョンが不十分(旧画面)
		 */
		this.pageNotEnoughApiVersion = function( errors ){
			var html = bindTwig(
				templates['not-enough-api-version'],
				{'errors': errors}
			);
			$canvas.html( html );
		}

		/**
		 * broccoli-html-editor-php が利用不可
		 */
		this.pageBroccoliHtmlEditorPhpIsNotAvailable = function( errors ){
			// ↓このケースでは、 `realpathThemeCollectionDir` を返すAPIが利用できないため、
			// 　古い方法でパスを求める。
			realpathThemeCollectionDir = pj.get('path')+'/'+pj.get('home_dir')+'/themes/';

			var html = bindTwig(
				templates['broccoli-html-editor-php-is-not-available'],
				{'errors': errors}
			);
			$canvas.html( html );
		}

		/**
		 * エディター画面を開く
		 */
		this.openEditor = function( themeId, layoutId ){
			var realpathLayout = realpathThemeCollectionDir+themeId+'/'+layoutId+'.html';
			if( !main.utils79.is_file( realpathLayout ) ){
				alert('ERROR: Layout '+themeId + '/' + layoutId + ' is NOT exists.');
				return;
			}

			main.preview.serverStandby( function(result){
				if(result === false){
					main.message('プレビューサーバーの起動に失敗しました。');
					return;
				}

				_this.closeEditor();//一旦閉じる

				// プログレスモード表示
				main.progress.start({
					'blindness':true,
					'showProgressBar': true
				});

				$elms.editor = $('<div>')
					.css({
						'position':'fixed',
						'top':0,
						'left':0 ,
						'z-index': '1000',
						'width':'100%',
						'height':$(window).height()
					})
					.append(
						$('<iframe>')
							//↓エディタ自体は別のHTMLで実装
							.attr( 'src', '../../mods/editor/index.html'
								+'?theme_id='+encodeURIComponent( themeId )
								+'&layout_id='+encodeURIComponent( layoutId )
							)
							.css({
								'border':'0px none',
								'width':'100%',
								'height':'100%'
							})
					)
					.append(
						$('<a>')
							.html('&times;')
							.attr('href', 'javascript:;')
							.on( 'click', function(){
								// if(!confirm('編集中の内容は破棄されます。エディタを閉じますか？')){ return false; }
								_this.closeEditor();
							} )
							.css({
								'position':'absolute',
								'bottom':5,
								'right':5,
								'font-size':'18px',
								'color':'#333',
								'background-color':'#eee',
								'border-radius':'0.5em',
								'border':'1px solid #333',
								'text-align':'center',
								'opacity':0.4,
								'width':'1.5em',
								'height':'1.5em',
								'text-decoration': 'none'
							})
							.hover(function(){
								$(this).animate({
									'opacity':1
								});
							}, function(){
								$(this).animate({
									'opacity':0.4
								});
							})
					)
				;
				$('body')
					.append($elms.editor)
					.css({'overflow':'hidden'})
				;
			} );

			// main.progress.close();
			return;
		} // openEditor()

		/**
		 * エディター画面を閉じる
		 * 単に閉じるだけです。編集内容の保存などの処理は、editor.html 側に委ねます。
		 */
		this.closeEditor = function(){
			$elms.editor.remove();
			$('body')
				.css({'overflow':'auto'})
			;
			pj.updateGitStatus();
			return;
		} // closeEditor()

		/**
		 * フォルダを開く
		 */
		this.openInFinder = function( theme_id ){
			var url = realpathThemeCollectionDir;
			if(theme_id){
				url += theme_id+'/';
			}
			main.fsEx.mkdirsSync( url );
			main.utils.openURL( url );
			pj.updateGitStatus();
		}

		/**
		 * 外部テキストエディタで開く
		 */
		this.openInTextEditor = function( theme_id, layout_id ){
			var url = realpathThemeCollectionDir;
			if(theme_id){
				url += theme_id+'/';
			}
			if(layout_id){
				url += layout_id+'.html';
			}
			main.openInTextEditor( url );
			pj.updateGitStatus();
		}


		/**
		 * twig テンプレートにデータをバインドする
		 */
		function bindTwig( tpl, data, options ){
			var rtn = '';
			try {
				rtn = new twig.twig({
					'data': tpl
				}).render(data);
			} catch (e) {
				var errorMessage = 'TemplateEngine "Twig" Rendering ERROR.';
				console.log( errorMessage );
				rtn = errorMessage;
			}

			return rtn;
		}

		/**
		 * ウィンドウリサイズイベントハンドラ
		 */
		function onWindowResize(){
			$elms.editor
				.css({
					'height': $(window).innerHeight() - 0
				})
			;

		}

	}

})(module);
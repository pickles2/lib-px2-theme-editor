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
		require('px2style/dist/px2style.js');
		var px2style = window.px2style;
		var bootupInformations;
		var px2all,
			themePluginList,
			realpathThemeCollectionDir,
			realpathThemeCollectionDir_exists,
			multithemePluginOptions;
		var $elms = {'editor': $('<div>')};
		var $canvas;
		var appMode;
		var templates = {
			'form-layout-change-edit-mode': require('-!text-loader!../templates/form-layout-change-edit-mode.html'),
			'form-layout-delete': require('-!text-loader!../templates/form-layout-delete.html'),
			'form-layout': require('-!text-loader!../templates/form-layout.html'),
			'form-theme-delete': require('-!text-loader!../templates/form-theme-delete.html'),
			'form-theme': require('-!text-loader!../templates/form-theme.html'),
			'index': require('-!text-loader!../templates/index.html'),
			'not-enough-api-version': require('-!text-loader!../templates/not-enough-api-version.html'),
			'theme-home': require('-!text-loader!../templates/theme-home.html'),
		};
		const Startup = require('./startup/startup.js');


		/**
		 * broccoli-client を初期化する
		 * @param  {Object}   options  options.
		 * @param  {Function} callback callback function.
		 * @return {Object}            this.
		 */
		this.init = function(options, callback){
			options = options || {};
			options.gpiBridge = options.gpiBridge || function(){};
			options.themeLayoutEditor = options.themeLayoutEditor || false;
			options.openInBrowser = options.openInBrowser || false;
			options.openInFinder = options.openInFinder || false;
			options.openInTextEditor = options.openInTextEditor || false;
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
							// __dirname+'/pickles2-theme-editor.css',
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
						updateBootupInformations(function(){
							it1.next();
						});
					},
					function(it1){
						// --------------------------------------
						// テーマテンプレートのサムネイルのCSSを配置する
						if( !bootupInformations.themeTemplatesThumbsCss ){
							it1.next();
						}
						var style = document.createElement('style');
						$('head').append(style);
						style.innerHTML = bootupInformations.themeTemplatesThumbsCss;
						it1.next();
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
						it1.next();
					},
					function(){
						console.log('Pickles2 Theme Editor: init done.');
						callback();
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
				templates['index'],
				{
					'appMode': appMode,
					'themePluginList': themePluginList,
					'themeCollection': bootupInformations.listThemeCollection,
					'realpathThemeCollectionDir': realpathThemeCollectionDir,
					'default_theme_id': multithemePluginOptions.default_theme_id,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			$canvas.html( html );

			// Events
			setStandardEventHandlers($canvas);
			$canvas.find('.pickles2-theme-editor__theme-collection-list a[data-theme-id]').on('click', function(){
				_this.pageThemeHome($(this).attr('data-theme-id'));
				return false;
			});
			return;
		}

		/**
		 * テーマのホーム画面を開く
		 */
		this.pageThemeHome = function(themeId){
			// console.log('Theme: '+themeId);
			var themeInfo;
			var isStartup = false;

			it79.fnc({}, [
				function(it1, arg){
					// テーマの情報を取得する
					_this.gpi({
						'api': 'getThemeInfo',
						'themeId': themeId,
					}, function(result){
						// console.log(result);
						themeInfo = result;
						arg.layouts = themeInfo.layouts;
						arg.readme = themeInfo.readme;
						arg.thumb = themeInfo.thumb;
						it1.next(arg);
						return;
					});
				},
				function(it1, arg){
					// テーマがスタートアップ状態か調べる
					if( themeInfo.layouts.length != 1 ){
						it1.next(arg);
						return;
					}
					if( themeInfo.layouts[0].id != 'default' ){
						it1.next(arg);
						return;
					}
					if( themeInfo.layouts[0].size != 0 ){
						it1.next(arg);
						return;
					}
					isStartup = true;
					it1.next(arg);
					return;
				},
				function(it1, arg){
					// テンプレート描画
					var html = bindTwig(
						templates['theme-home'],
						{
							'appMode': appMode,
							'themeId': themeId,
							'layouts': arg.layouts,
							'thumb': arg.thumb,
							'readme': arg.readme,
							'realpathThemeCollectionDir': realpathThemeCollectionDir,
							'default_theme_id': multithemePluginOptions.default_theme_id,
							'is_startup': isStartup,
							'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
							'can_openInBrowser': (_this.options.openInBrowser ? true : false),
							'can_openInFinder': (_this.options.openInFinder ? true : false),
							'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
						}
					);
					$canvas.html( html );
					it1.next(arg);
				},
				function(it1, arg){
					// Events
					// $canvas.find('.pickles2-theme-editor__theme-collection-list a[data-theme-id]').on('click', function(){
					// 	_this.pageThemeHome($(this).attr('data-theme-id'));
					// 	return false;
					// });
					$canvas.find('[data-pickles2-theme-editor-action=pageHome]').on('click', function(){
						_this.pageHome();
						return false;
					});
					$canvas.find('[data-pickles2-theme-editor-action=deleteTheme]').on('click', function(){
						var strOptions = $(this).attr('data-pickles2-theme-editor-options');
						var options = JSON.parse( strOptions );
						_this.deleteTheme(options.themeId);
						return false;
					});

					// イベント処理登録
					setStandardEventHandlers($canvas);
					$canvas.find('.pickles2-theme-editor__layout-list a button').on('click', function(e){
						e.stopPropagation();
					});

					// Startup
					if( isStartup ){
						const $startupCanvas = $('.pickles2-theme-editor__startup').eq(0);
						const startup = new Startup( _this, bootupInformations.listThemeTemplates, {
							'appMode': appMode,
							'themeId': themeId,
							'layouts': arg.layouts,
							'thumb': arg.thumb,
							'readme': arg.readme,
							'realpathThemeCollectionDir': realpathThemeCollectionDir,
							'default_theme_id': multithemePluginOptions.default_theme_id,
							'is_startup': isStartup,
						}, $startupCanvas, $, px2style );
						startup.init();
					}

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
					'appMode': appMode,
					'themeId': theme_id,
					'themePluginList': themePluginList,
					'themeCollection': bootupInformations.listThemeCollection,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': (theme_id ? 'テーマのリネーム' : '新規テーマ作成'),
					'body': $body,
					'buttons': [
						$('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(e){
								$form.submit();
							})
					],
					'buttonsSecondary': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				var newThemeId = $form.find('input[name=themeId]').val();
				var importFrom = $form.find('input[name=import_from]:checked').val();
				var $errMsg = $form.find('[data-form-column-name=themeId] .pickles2-theme-editor__error-message')
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

				px2style.loading();

				if( theme_id ){
					// --------------------
					// テーマ名の変更
					_this.gpi({
						'api': 'renameTheme',
						'newThemeId': newThemeId,
						'renameFrom': theme_id,
					}, function(result){
						console.log(result);
						if( result === false ){
							alert('[FATAL] Unknown Error.');
							px2style.closeLoading();
							return;
						}
						if( !result.result ){
							alert(result.message);
							px2style.closeLoading();
							return;
						}

						var msg = 'テーマ '+theme_id+' を '+newThemeId+' にリネームしました。';
						_this.message(msg);
						px2style.closeModal();
						updateBootupInformations(function(){
							px2style.closeLoading();
							_this.pageThemeHome(newThemeId);
						});
						return;
					});
				}else{
					// --------------------
					// 新規テーマ
					_this.gpi({
						'api': 'addNewTheme',
						'newThemeId': newThemeId,
						'importFrom': importFrom,
					}, function(result){
						console.log(result);
						if( result === false ){
							alert('[FATAL] Unknown Error.');
							px2style.closeLoading();
							return;
						}
						if( !result.result ){
							alert(result.message);
							px2style.closeLoading();
							return;
						}

						var msg = 'テーマ '+newThemeId+' を作成しました。';
						_this.message(msg);
						px2style.closeModal();
						updateBootupInformations(function(){
							px2style.closeLoading();
							_this.pageThemeHome(newThemeId);
						});
						return;
					});
				}

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
		 * デフォルトテーマをセットする
		 */
		this.setDefaultTheme = function(theme_id){
			px2style.loading();
			_this.gpi({
				'api': 'setDefaultTheme',
				'themeId': theme_id,
			}, function(result){
				console.log(result);
				updateBootupInformations(function(){
					px2style.closeLoading();
					_this.pageThemeHome(theme_id);
				});
				return;
			});
			return false;
		}

		/**
		 * テーマを削除する
		 */
		this.deleteTheme = function(theme_id){

			var html = bindTwig(
				templates['form-theme-delete'],
				{
					'themeId': theme_id,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': 'テーマ削除',
					'body': $body,
					'buttons': [
						$('<button class="px2-btn px2-btn--danger">')
							.text('削除する')
							.on('click', function(e){
								$form.submit();
							})
					],
					'buttonsSecondary': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				// --------------------
				// テーマを削除
				px2style.loading();
				_this.gpi({
					'api': 'deleteTheme',
					'themeId': theme_id,
				}, function(result){
					console.log(result);
					if( result === false ){
						alert('[FATAL] Unknown Error.');
						px2style.closeLoading();
						return;
					}
					if( !result.result ){
						alert(result.message);
						px2style.closeLoading();
						return;
					}

					var msg = 'テーマ '+theme_id+' を削除しました。';
					_this.message(msg);
					px2style.closeModal();
					updateBootupInformations(function(){
						px2style.closeLoading();
						_this.pageHome();
					});
					return;
				});
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
					'layoutId': layout_id,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': (layout_id ? 'レイアウトのリネーム' : '新規レイアウト作成'),
					'body': $body,
					'buttons': [
						$('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(e){
								$form.submit();
							})
					],
					'buttonsSecondary': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				var newLayoutId = $form.find('input[name=layoutId]').val();
				var editMode = $form.find('input[name=editMode]:checked').val();
				var $errMsg = $form.find('[data-form-column-name=layoutId] .pickles2-theme-editor__error-message');

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

				px2style.loading();

				if( layout_id ){
					// --------------------
					// レイアウト名の変更
					_this.gpi({
						'api': 'renameLayout',
						'themeId': theme_id,
						'newLayoutId': newLayoutId,
						'renameFrom': layout_id,
					}, function(result){
						// console.log(result);
						if( !result ){
							alert( 'ERROR' );
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
							return;
						}
						if( !result.result ){
							alert( result.message );
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
							return;
						}

						var msg = 'レイアウト '+layout_id+' を '+newLayoutId+' にリネームしました。';
						_this.message(msg);
						px2style.closeModal();
						updateBootupInformations(function(){
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
						});
						return;
					});
				}else{
					// --------------------
					// 新規レイアウト
					_this.gpi({
						'api': 'addNewLayout',
						'themeId': theme_id,
						'newLayoutId': newLayoutId,
						'editMode': editMode,
					}, function(result){
						// console.log(result);
						if( !result ){
							alert( 'ERROR' );
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
							return;
						}
						if( !result.result ){
							alert( result.message );
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
							return;
						}

						var msg = 'レイアウト '+newLayoutId+' を作成しました。';
						_this.message(msg);
						px2style.closeModal();
						updateBootupInformations(function(){
							px2style.closeLoading();
							_this.pageThemeHome(theme_id);
						});
						return;
					});
				}

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
		 * 編集方法を変更する
		 */
		this.changeEditModeLayout = function(theme_id, layout_id, edit_mode){
			if( !theme_id ){
				return;
			}
			if( !layout_id ){
				return;
			}
			var html = bindTwig(
				templates['form-layout-change-edit-mode'],
				{
					'themeId': theme_id,
					'layoutId': layout_id,
					'editMode': edit_mode,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': '編集方法を変更する',
					'body': $body,
					'buttons': [
						$('<button class="px2-btn px2-btn--primary">')
							.text('OK')
							.on('click', function(e){
								$form.submit();
							})
					],
					'buttonsSecondary': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				var newEditMode = $form.find('input[name=editMode]:checked').val();
				var $errMsg = $form.find('[data-form-column-name=layoutId] .pickles2-theme-editor__error-message');

				if( !newEditMode ){
					$errMsg.text('編集方法が選択されていません。');
					return;
				}
				if( newEditMode != 'html' && newEditMode != 'html.gui' ){
					$errMsg.text('編集方法が不正です。');
					return;
				}

				px2style.loading();

				// --------------------
				// レイアウト名の変更
				_this.gpi({
					'api': 'changeEditModeLayout',
					'themeId': theme_id,
					'layoutId': layout_id,
					'newEditMode': newEditMode,
				}, function(result){
					// console.log(result);
					if( !result ){
						alert( 'ERROR' );
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
						return;
					}
					if( !result.result ){
						alert( result.message );
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
						return;
					}

					var msg = 'レイアウト '+layout_id+' の編集方法を '+newEditMode+' に変更しました。';
					_this.message(msg);
					px2style.closeModal();
					updateBootupInformations(function(){
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
					});
					return;
				});

			});
			return;
		}

		/**
		 * レイアウトを削除する
		 */
		this.deleteLayout = function(theme_id, layout_id){
			var html = bindTwig(
				templates['form-layout-delete'],
				{
					'themeId': theme_id,
					'layoutId': layout_id,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			var $body = $('<div>').append( html );
			var $form = $body.find('form');

			px2style.modal(
				{
					'title': 'レイアウト削除',
					'body': $body,
					'buttons': [
						$('<button class="px2-btn px2-btn--danger">')
							.text('削除する')
							.on('click', function(e){
								$form.submit();
							})
					],
					'buttonsSecondary': [
						$('<button class="px2-btn">')
							.text('キャンセル')
							.on('click', function(e){
								px2style.closeModal();
							})
					]
				},
				function(){}
			);

			$form.on('submit', function(e){
				// --------------------
				// レイアウトを削除

				px2style.loading();

				_this.gpi({
					'api': 'deleteLayout',
					'themeId': theme_id,
					'layoutId': layout_id,
				}, function(result){
					// console.log(result);
					if( !result ){
						alert( 'ERROR' );
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
						return;
					}
					if( !result.result ){
						alert( result.message );
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
						return;
					}

					var msg = 'レイアウト ' + layout_id + ' を削除しました。';
					_this.message(msg);
					px2style.closeModal();
					updateBootupInformations(function(){
						px2style.closeLoading();
						_this.pageThemeHome(theme_id);
					});
					return;
				});
			});

			return;
		}

		/**
		 * APIバージョンが不十分(旧画面)
		 */
		this.pageNotEnoughApiVersion = function( errors ){
			var html = bindTwig(
				templates['not-enough-api-version'],
				{
					'errors': errors,
					'can_themeLayoutEditor': (_this.options.themeLayoutEditor ? true : false),
					'can_openInBrowser': (_this.options.openInBrowser ? true : false),
					'can_openInFinder': (_this.options.openInFinder ? true : false),
					'can_openInTextEditor': (_this.options.openInTextEditor ? true : false),
				}
			);
			$canvas.html( html );
		}

		/**
		 * エディター画面を開く
		 */
		this.openEditor = function( themeId, layoutId ){
			if( !this.options.themeLayoutEditor ){
				return;
			}
			this.options.themeLayoutEditor( themeId, layoutId );
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
		 * ブラウザで開く
		 */
		this.openInBrowser = function( path ){
			if( !this.options.openInBrowser ){
				return;
			}
			this.options.openInBrowser( path );
			return;
		}

		/**
		 * フォルダを開く
		 */
		this.openInFinder = function( path ){
			if( !this.options.openInFinder ){
				return;
			}
			this.options.openInFinder( path );
			return;
		}

		/**
		 * 外部テキストエディタで開く
		 */
		this.openInTextEditor = function( path ){
			if( !this.options.openInTextEditor ){
				return;
			}
			this.options.openInTextEditor( path );
			return;
		}

		/**
		 * ユーザーにメッセージを伝える
		 */
		this.message = function(msg){
			console.info(msg);
			px2style.flashMessage(msg);
		}


		/**
		 * 標準的なイベントハンドラをセットする
		 */
		function setStandardEventHandlers($canvas){
			function parseOptions($this){
				var options = {};
				try{
					var strOptions = $this.attr('data-pickles2-theme-editor-options');
					if(typeof(strOptions) == typeof('string')){
						options = JSON.parse(strOptions);
					}
				}catch(e){
					console.error('JSON parse error', e);
				}
				options = options || {};
				return options;
			}
			$canvas.find('[data-pickles2-theme-editor-action=openInBrowser]').on('click', function(){
				var options = parseOptions($(this));
				_this.openInBrowser(options.path);
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=openInFinder]').on('click', function(){
				var options = parseOptions($(this));
				options.path = options.path || '/';
				_this.openInFinder(options.path);
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=openInTextEditor]').on('click', function(){
				var options = parseOptions($(this));
				options.path = options.path || '/';
				_this.openInTextEditor(options.path);
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=addNewTheme]').on('click', function(){
				_this.addNewTheme();
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=renameTheme]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				_this.renameTheme( options.themeId );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=setDefaultTheme]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				_this.setDefaultTheme( options.themeId );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=addNewLayout]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				_this.addNewLayout( options.themeId );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=renameLayout]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				options.layoutId = options.layoutId || undefined;
				_this.renameLayout( options.themeId, options.layoutId );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=changeEditModeLayout]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				options.layoutId = options.layoutId || undefined;
				options.editMode = options.editMode || undefined;
				_this.changeEditModeLayout( options.themeId, options.layoutId, options.editMode );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=deleteLayout]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				options.layoutId = options.layoutId || undefined;
				_this.deleteLayout( options.themeId, options.layoutId );
				return false;
			});
			$canvas.find('[data-pickles2-theme-editor-action=openEditor]').on('click', function(){
				var options = parseOptions($(this));
				options.themeId = options.themeId || undefined;
				options.layoutId = options.layoutId || undefined;
				_this.openEditor( options.themeId, options.layoutId );
				return false;
			});
		}


		/**
		 * 初期化に必要なデータを更新する
		 */
		function updateBootupInformations(callback){
			callback = callback || function(){};
			_this.gpi({
				'api': 'getBootupInformations'
			}, function(result){
				// console.log('getBootupInformations:', result);
				bootupInformations = result;
				px2all = bootupInformations.px2all;

				themePluginList = [];
				try {
					themePluginList = px2all.packages.package_list.themes;
				} catch (e) {
				}
				// console.log(themePluginList);

				// appMode
				appMode = result.conf.appMode;

				// テーマコレクションディレクトリのパスを求める
				realpathThemeCollectionDir = px2all.realpath_theme_collection_dir;
				realpathThemeCollectionDir_exists = bootupInformations.theme_collection_dir_exists;

				try {
					if( bootupInformations.multithemePluginOptions[0] ){
						multithemePluginOptions = bootupInformations.multithemePluginOptions[0].options;
					}
				} catch (e) {
					console.error(e);
				}
				// console.log(multithemePluginOptions);

				callback();
				return;
			});
		}
		this.updateBootupInformations = updateBootupInformations;

		/**
		 * twig テンプレートにデータをバインドする
		 */
		function bindTwig( tpl, data ){
			var rtn = '';
			data = data || {};
			if( templates[tpl] ){
				tpl = templates[tpl];
			}
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
					'height': $(window).innerHeight() - 0,
				})
			;
		}

	}

})(module);

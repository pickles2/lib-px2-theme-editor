/**
 * startup.js
 */
module.exports = function( main, tplOptions, $canvas, $, px2style ){
	const _this = this;
	const it79 = require('iterate79');
	const templates = {
		"home": require("./templates/home.twig"),
	};
	const themeTemplates = {};
	themeTemplates.template_001 = new (require("../../../startup_theme_templates/template_001/frontend/main.js"))(main, $);
	themeTemplates.template_002 = new (require("../../../startup_theme_templates/template_002/frontend/main.js"))(main, $);
	const themeTemplateThumbs = {};
	let $form;


	/**
	 * 画面を初期化する
	 */
	this.init = function(){
		it79.fnc({}, [
			function(it1){
				$canvas.append(templates.home(tplOptions));

				$form = $canvas.find('form[data-pickles2-theme-editor-form=startup]');

				let $thumbs = $canvas.find('.pickles2-theme-editor__startup-thumb');
				themeTemplateThumbs['template_001'] = $('<a>').attr('data-value', 'template_001');
				themeTemplateThumbs['template_002'] = $('<a>').attr('data-value', 'template_002');
				for(var idx in themeTemplateThumbs){
					$thumbs.append( themeTemplateThumbs[idx] );
				}

				it1.next();
			},
			function(it1){
				// --------------------------------------
				// イベントハンドラをセット
				$form.on('submit', function(e){
					e.stopPropagation();
					e.preventDefault();

					var themeId = $form.find('input[name=theme_id]').val();
					var options = getSelectedOptions();

					px2style.loading();
					main.gpi({
						'api': 'startupTheme',
						'themeId': themeId,
						'options': options,
					}, function(result){
						// console.log(result);
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

						var msg = 'テーマ '+themeId+' を保存しました。';
						main.message(msg);

						main.updateBootupInfomations(function(){
							px2style.closeLoading();
							main.pageThemeHome(themeId);
						});
						return;
					});

					return false;
				});

				$canvas.find('form[data-pickles2-theme-editor-form=startup] input[name=logo_image]')
					.on('change', function(e){
						var $this = $(this);
						// console.log(e.target.files);
						var fileInfo = e.target.files[0];
						var realpathSelected = $this.val();
						var $img = $canvas.find('.pickles2-theme-editor__logo-image-preview img');

						if( realpathSelected ){
							function readSelectedLocalFile(fileInfo, callback){
								var reader = new FileReader();
								reader.onload = function(evt) {
									callback( evt.target.result );
								}
								reader.readAsDataURL(fileInfo);
							}

							readSelectedLocalFile(fileInfo, function(dataUri){
								var base64 = (function(dataUri){
									dataUri = dataUri.replace(new RegExp('^data\\:[^\\;]*\\;base64\\,'), '');
									// console.log(dataUri);
									return dataUri;
								})(dataUri);
								var ext = (function(basename){
									if( basename.match(/\.([a-zA-Z0-9\-\_]+)$/) ){
										var ext = RegExp.$1;
										return ext;
									}
									return '';
								})(fileInfo.name);
								$this.attr({
									"data-base64": base64,
									"data-mime-type": fileInfo.type,
									"data-ext": ext,
								});
								$img
									.attr({
										"src": dataUri ,
										"data-size": fileInfo.size ,
										"data-mime-type": fileInfo.type ,
										"data-ext": ext,
										"data-base64": base64,
									})
								;
								updateThumbs();
							});
						}
					})
				;

				let classNameCurrent = 'pickles2-theme-editor__startup-thumb-current';
				for(var idx in themeTemplateThumbs){
					themeTemplateThumbs[idx]
						.attr({
							"href": "javascript:;",
						})
						.on('click', function(e){
							const $this = $(this);
							const selectedValue = $this.attr('data-value');
							$canvas.find('input[name=template_id]').val(selectedValue);

							$canvas.find('.pickles2-theme-editor__startup-thumb > a').removeClass(classNameCurrent);
							$this.addClass(classNameCurrent);
						})
					;
				}
				$canvas.find('.pickles2-theme-editor__startup-thumb > a[data-value="template_001"]').addClass(classNameCurrent);


				$canvas.find('form[data-pickles2-theme-editor-form=startup]').find('input,select,textarea')
					.on('change', function(){
						updateThumbs();
					})
				;
				it1.next();
			},
			function(it1){
				// サムネイルを更新する
				updateThumbs();
				it1.next();
			},
		]);
		return;
	}

	/**
	 * サムネイルを更新する
	 */
	function updateThumbs(){
		const userOptions = getSelectedOptions();
		themeTemplates.template_001.update( themeTemplateThumbs['template_001'], userOptions);
		themeTemplates.template_002.update( themeTemplateThumbs['template_002'], userOptions);
		return;
	}

	/**
	 * ユーザーの選択内容を取得する
	 */
	function getSelectedOptions(){
		var options = {};
		options.templateId = $form.find('input[name=template_id]').val();
		options.mainColor = $form.find('input[name=main_color]').val();
		options.subColor = $form.find('input[name=sub_color]').val();
		options.logoImage = $form.find('input[name=logo_image]').attr('data-base64');
		options.logoImageMimeType = $form.find('input[name=logo_image]').attr('data-mime-type');
		options.logoImageExt = $form.find('input[name=logo_image]').attr('data-ext');
		if(options.logoImage && !options.logoImageExt){
			options.logoImageExt = 'png';
		}
		if(options.logoImage && !options.logoImageMimeType){
			options.logoImageMimeType = 'image/png';
		}
		return options;
	}

}

/**
 * startup.js
 */
module.exports = function( main, _themeTemplates, tplOptions, $canvas, $, px2style ){
	const _this = this;
	const it79 = require('iterate79');
	const Pickr = require('@simonwep/pickr/dist/pickr.es5.min');
	const templates = {
		"home": require("./templates/home.twig"),
	};
	const themeTemplates = _themeTemplates;
	themeTemplates.pickles2_2023.frontendThumb = new (require("../../../startup_theme_templates/pickles2_2023/frontend/thumb.js"))(main, $);
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
				for(var themeId in themeTemplates){
					themeTemplateThumbs[themeId] = $('<a>')
						.attr('data-value', themeId)
						.attr('title', themeTemplates[themeId].info.name)
					;
					$thumbs.append( themeTemplateThumbs[themeId] );
				}

				it1.next();
			},
			function(it1){
				// Pickr を配置する
				setup_Pickr(
					$canvas.find('.px2-form-input-list__pickr-main_color'),
					$canvas.find('input[name=main_color]'),
					function(){
						setup_Pickr(
							$canvas.find('.px2-form-input-list__pickr-sub_color'),
							$canvas.find('input[name=sub_color]'),
							function(){
								it1.next();
							}
						);
					}
				);
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

						main.updateBootupInformations(function(){
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
				var defaultThemeTemplateId = $('input[name=template_id]').val();
				$canvas.find('.pickles2-theme-editor__startup-thumb > a[data-value="'+defaultThemeTemplateId+'"]').addClass(classNameCurrent);


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
		userOptions._rootClassName = 'pickles2-theme-editor__thumb-'+userOptions.templateId;
		for(var themeId in themeTemplates){
			themeTemplates[themeId].frontendThumb.update( themeTemplateThumbs[themeId], userOptions);
		}
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

	/**
	 * Pickr をセットアップする
	 */
	function setup_Pickr ( $wrapper, $formElm, callback){
		let $Cleared = $('<a>');
		let $PickrW = $('<div>');
		let $Pickr = $('<div>');
		let $wrapper_c1 = $('<div>');
		let $wrapper_c2 = $('<div>');
		$wrapper.append($wrapper_c1).append($wrapper_c2);


		$formElm.attr({
			"type": "hidden",
		});


		$wrapper.css({
			'display': 'flex',
		});
		$wrapper_c2.css({
			'font-size': '24px',
			'padding-left': '20px',
			'font-weight': 'bold',
		});

		function updateIcon(){
			let val = $formElm.val();
			if( val ){
				$Cleared.hide();
				$PickrW.show();
				$wrapper_c2.text(val);
			}else{
				$PickrW.hide();
				$Cleared.show();
				$wrapper_c2.text('なし');
			}
			updateThumbs();
		}

		$wrapper_c1.append($PickrW.append($Pickr));
		let pickr = new Pickr({
			el: $Pickr.get(0),
			container: $wrapper_c1.get(0),
			theme: 'classic', // or 'monolith', or 'nano'
			default: $formElm.val(),
			autoReposition: false,
			closeOnScroll: true,
			inline: false,
			showAlways: false,

			swatches: [
				'rgba(244, 67, 54, 1)',
				'rgba(233, 30, 99, 0.95)',
				'rgba(156, 39, 176, 0.9)',
				'rgba(103, 58, 183, 0.85)',
				'rgba(63, 81, 181, 0.8)',
				'rgba(33, 150, 243, 0.75)',
				'rgba(3, 169, 244, 0.7)',
				'rgba(0, 188, 212, 0.7)',
				'rgba(0, 150, 136, 0.75)',
				'rgba(76, 175, 80, 0.8)',
				'rgba(139, 195, 74, 0.85)',
				'rgba(205, 220, 57, 0.9)',
				'rgba(255, 235, 59, 0.95)',
				'rgba(255, 193, 7, 1)'
			],

			components: {

				// Main components
				preview: true,
				opacity: true,
				hue: true,

				// Input / output Options
				interaction: {
					hex: true,
					rgba: true,
					hsla: true,
					hsva: true,
					cmyk: true,
					input: true,
					cancel: true,
					clear: true,
					save: true
				}
			}
		}).on('save', function(color, instance){
			pickr.hide();
			var val = '';
			if(pickr.getSelectedColor()){
				var hexa = pickr.getColor().toHEXA();
				// console.log(hexa);
				val = hexa.toString();
			}
			$formElm.val(val);
			updateIcon();
		}).on('change', function(color, instance){
			// console.log('++ change', color, instance);
		}).on('clear', function(instance) {
			// console.log('++ clear', instance);
		}).on('cancel', function(instance) {
			// console.log('++ cancel', instance);
		});

		$Cleared
			.text('なし')
			.attr({
				"href": "javascript:;"
			})
			.css({
				'display': 'block',
				'width': '32px',
				'height': '32px',
				'border': '1px solid #999',
				'border-radius': '5px',
				'text-align': 'center',
				'color': '#999999',
				'font-size': '9px',
			})
			.on('click', function(){
				pickr.show();
				return false;
			});
		$wrapper_c1.append($Cleared);

		updateIcon();

		setTimeout(function(){
			callback();
		}, 1);
		return;
	}
}

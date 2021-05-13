/**
 * startup.js
 */
module.exports = function( main, tplOptions, $canvas, $, px2style ){
	const _this = this;
	const templates = {
		"home": require("./templates/home.twig"),
		"thumbs": {
			"template_001": require("./theme_templates/template_001/thumb.twig"),
		},
	};
	$canvas.append(templates.home(tplOptions));

	const $thumb = $canvas.find('.pickles2-theme-editor__startup-thumb');
	const $form = $canvas.find('[data-pickles2-theme-editor-form=startup]');

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
	$canvas.find('[data-pickles2-theme-editor-form=startup] input[name=logo_image]')
		.on('change', function(e){
			var $this = $(this);
			// console.log(e.target.files);
			var fileInfo = e.target.files[0];
			var realpathSelected = $this.val();
			var $img = $canvas.find('img.pickles2-theme-editor__logo-image-preview');

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
				});
			}
		})
	;

	function getSelectedOptions(){
		var options = {};
		options.templateId = $form.find('input[name=template_id]').val();
		options.mainColor = $form.find('input[name=main_color]').val();
		options.subColor = $form.find('input[name=sub_color]').val();
		options.logoImage = $form.find('input[name=logo_image]').attr('data-base64');
		options.logoImageExt = $form.find('input[name=logo_image]').attr('data-ext');
		if(!options.logoImageExt){
			options.logoImageExt = 'png';
		}
		return options;
	}

console.log(getSelectedOptions());
console.log(templates.thumbs.template_001(getSelectedOptions()));
	$thumb.html( templates.thumbs.template_001(getSelectedOptions()) );

}

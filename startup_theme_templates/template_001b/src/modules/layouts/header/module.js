(function(){
	const $ = require('jquery');
	const $body = $('body');
	const isIphone = window.navigator.userAgent.match(/iPhone/);
	let presetOverflow = {};
	$(document)
		.on('click', '.theme-header__menu-open-btn button', function(){
			const $menu = $(this).closest('.theme-header__menu').find('.theme-header__menu-body');
			$menu
				.addClass('theme-header__menu-body--visible')
				.removeClass('theme-header__menu-body--closed')
				;

			presetOverflow = {
				"hasClass": $body.hasClass('theme-scroll-lock'),
				"scrollY": window.scrollY,
				"scrollX": window.scrollX,
				"css_overflow": $body.css('overflow'),
				"css_top": $body.css('top'),
			};
			$body.addClass('theme-scroll-lock');
			if( isIphone ){
				$body
					.addClass('theme-scroll-lock--iphone')
					.css({"top": presetOverflow.scrollY * -1});
			}

		})
		.on('click', '.theme-header__menu-close-btn button', function(){
			const $menu = $(this).closest('.theme-header__menu').find('.theme-header__menu-body');
			$menu
				.removeClass('theme-header__menu-body--visible')
				.addClass('theme-header__menu-body--closed')
				;
			setTimeout(function(){
				$menu
					.removeClass('theme-header__menu-body--closed')
					;
			}, 300);

			$body
				.removeClass('theme-scroll-lock')
				.removeClass('theme-scroll-lock--iphone');
			if( isIphone ){
				window.scroll(presetOverflow.scrollX, presetOverflow.scrollY);
				$body.css({"top": presetOverflow.css_top});
			}
		});
})();

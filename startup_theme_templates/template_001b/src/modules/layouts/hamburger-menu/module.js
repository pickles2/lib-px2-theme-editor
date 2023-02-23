(function(){
	const $ = require('jquery');
	const $body = $('body');
	const isIphone = window.navigator.userAgent.match(/iPhone/);
	let presetOverflow = {};
	$(document)
		.off('click', '.theme-hamburger-menu__open-btn button')
		.on('click', '.theme-hamburger-menu__open-btn button', function(){
			const $menu = $(this).closest('.theme-hamburger-menu').find('.theme-hamburger-menu__body');
			$menu
				.addClass('theme-hamburger-menu__body--visible')
				.removeClass('theme-hamburger-menu__body--closed')
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
		.off('click', '.theme-hamburger-menu__close-btn button')
		.on('click', '.theme-hamburger-menu__close-btn button', function(){
			const $menu = $(this).closest('.theme-hamburger-menu').find('.theme-hamburger-menu__body');
			$menu
				.removeClass('theme-hamburger-menu__body--visible')
				.addClass('theme-hamburger-menu__body--closed')
				;
			setTimeout(function(){
				$menu
					.removeClass('theme-hamburger-menu__body--closed')
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

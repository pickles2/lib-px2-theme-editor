(function(){
	const $ = require('jquery');
	const isIphone = window.navigator.userAgent.match(/iPhone/);

	$(function(){
		const $body = $('body');
		const $hamburgerMenus = $('.theme-hamburger-menu');
		let presetOverflow = {};

		function bodyScrollLockSwitch( flgOn ){
			if( flgOn ) {
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
			}else{
				$body
					.removeClass('theme-scroll-lock')
					.removeClass('theme-scroll-lock--iphone');
				if( isIphone ){
					window.scroll(presetOverflow.scrollX, presetOverflow.scrollY);
					$body.css({"top": presetOverflow.css_top});
				}
			}
		}

		$hamburgerMenus.each(function(hamburgerMenuIndex, elmHamburgerMenu){
			const $hamburgerMenu = $(elmHamburgerMenu);
			const $backgroundScreen = $hamburgerMenu.find('.theme-hamburger-menu__body');
			const $backgroundScreenInner = $hamburgerMenu.find('.theme-hamburger-menu__body-inner');
			const $toggleButton = $hamburgerMenu.find('button.theme-hamburger-menu__open-btn');
			const $win = $(window);

			$toggleButton
				.off('click.theme-hamburger-menu')
				.on('click.theme-hamburger-menu', function(){
					if( !$hamburgerMenu.hasClass('theme-hamburger-menu--visible') ){
						// 開く
						$hamburgerMenu.addClass('theme-hamburger-menu--visible');
						setTimeout(function(){
							$hamburgerMenu.addClass('theme-hamburger-menu--opening');
						}, 0);
						bodyScrollLockSwitch(true);
						$backgroundScreen.on('click.theme-hamburger-menu', function(){
							$toggleButton.trigger('click');
						});
						$win.on('keydown.theme-hamburger-menu', function(e){
							if( e.originalEvent.keyCode == 27 ){ // Escキー
								$toggleButton.trigger('click');
							}
						});
						return;
					}else{
						// 閉じる
						$hamburgerMenu.removeClass('theme-hamburger-menu--opening');
						setTimeout(function(){
							$hamburgerMenu.removeClass('theme-hamburger-menu--visible');
						}, 300);
						bodyScrollLockSwitch(false);
						$backgroundScreen.off('click.theme-hamburger-menu');
						$win.off('keydown.theme-hamburger-menu');
						return;
					}
				});
			$backgroundScreenInner
				.off('click.theme-hamburger-menu')
				.on('click.theme-hamburger-menu', function(e){
					e.stopPropagation();
				});
		});
	});
})();

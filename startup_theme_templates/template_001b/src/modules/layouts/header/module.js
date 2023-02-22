(function(){
	const $ = require('jquery');
	$(document).on('click', '.theme-header__menu-btn button', function(){
		const $menu = $(this).closest('.theme-header__menu').find('.theme-header__menu-body');
		$menu.html('<p>開発中</p>');
		$menu
			.addClass('theme-header__menu-body--visible')
			.removeClass('theme-header__menu-body--closed')
			;
	});
	$(document).on('click', '.theme-header__menu-body', function(){
		const $menu = $(this);
		$menu
			.removeClass('theme-header__menu-body--visible')
			.addClass('theme-header__menu-body--closed')
			;
	});
})();

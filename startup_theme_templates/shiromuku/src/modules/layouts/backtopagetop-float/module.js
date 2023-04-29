(function(){
	const $ = require('jquery');

	$(function(){
		const $moduleInstances = $('.theme-back-to-pagetop-float');
		const $win = $(window);
		const classVisible = `theme-back-to-pagetop-float--visible`;

		$(window)
			.off('scroll.theme-back-to-pagetop-float')
			.on('scroll.theme-back-to-pagetop-float', function(){
				const scrollTop = $win.scrollTop();
				if( scrollTop > 400 ){
					$moduleInstances.addClass(classVisible);
				}else{
					$moduleInstances.removeClass(classVisible);
				}
			})
			.trigger('scroll');
	});
})();

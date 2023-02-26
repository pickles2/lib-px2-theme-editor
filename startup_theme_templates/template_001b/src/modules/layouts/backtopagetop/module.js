(function(){
	const $ = require('jquery');

	$(function(){
		const $as = $('a[href]');
		const $body = $('html,body');

		$as.each(function(backToPageTopIndex, elmBackToPageTop){
			const $backToPageTop = $(elmBackToPageTop);
			const href = $(this).attr('href');
			if( !href || !href.match(/^\#/) ){
				return;
			}

			$backToPageTop
				.off('click.theme-back-to-pagetop')
				.on('click.theme-back-to-pagetop', function(e){
					e.stopPropagation();
					e.preventDefault();
					const href = $(this).attr('href');
					let targetTop = 0;
					if( href && href.match(/^\#/) ){
						targetTop = $(href).offset().top;
					}
					$body.animate({
						"scrollTop": targetTop,
					}, {
						"duration": 300,
						"easing": "swing",
						"complete": function(){
							if( href && href.match(/^\#/) ){
								window.location.hash = href;
							}
						},
					});
					return;
				});
		});
	});
})();

<?php /*
すべての layout について共通の、footセクションの記述
*/ ?>
		<script src="<?= htmlspecialchars( $theme->files('/scripts/sidebarFix.js') ); ?>"></script>
		<script>
			window.addEventListener('load', function(){
				// .sidebar-fix を固定します
				sidebarFix('.theme-layouts__rnavi-inner', {
					frame: $('.theme-layouts__rnavi'),
					topBuffer: 10,
					force: true
				});
			});
		</script>

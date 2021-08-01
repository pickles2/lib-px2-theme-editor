<?php /*
すべての layout について共通の、headセクションの記述
*/ ?>

		<meta name="viewport" content="width=device-width, initial-scale=1" />

<?= $px->get_contents_manifesto(); ?>

		<style>
		:root {
			--theme-keycolor: {{ mainColor }};
			--theme-textcolor-on-keycolor: {{ textColorOnMainColor }};
			--theme-subcolor: {{ subColor }};
			--theme-textcolor-on-subcolor: {{ textColorOnSubColor }};
		}
		</style>
		<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files('/modules.css') ); ?>" />
		<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files('/styles/theme.css') ); ?>">

const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test: /\.txt$/i,
					use: ['raw-loader'],
				},
				{
					test: /\.csv$/i,
					loader: 'csv-loader',
					options: {
						dynamicTyping: true,
						header: false,
						skipEmptyLines: false,
					},
				},
				{
					test:/\.twig$/,
					use:['twig-loader']
				}
			]
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": require.resolve("stream-browserify"),
			}
		}
	})

	// --------------------------------------
	// Pickles 2 Theme Editor
	.js('./src/pickles2-theme-editor.js', './dist/pickles2-theme-editor.js')
	.sass('./src/pickles2-theme-editor.css.scss', './dist/pickles2-theme-editor.css')

	// .min files
	.copy('./dist/pickles2-theme-editor.js', './dist/pickles2-theme-editor.min.js')
	.copy('./dist/pickles2-theme-editor.css', './dist/pickles2-theme-editor.min.css')

	// --------------------------------------
	// Theme: pickles2_2023
	.copy('./vendor/pickles2/px2style/dist/themes/default.css', './startup_theme_templates/pickles2_2023/basefiles/theme_files/styles/px2style_themes/default.css')
	.copy('./vendor/pickles2/px2style/dist/themes/default.css.map', './startup_theme_templates/pickles2_2023/basefiles/theme_files/styles/px2style_themes/default.css.map')
	.copy('./vendor/pickles2/px2style/dist/themes/darkmode.css', './startup_theme_templates/pickles2_2023/basefiles/theme_files/styles/px2style_themes/darkmode.css')
	.copy('./vendor/pickles2/px2style/dist/themes/darkmode.css.map', './startup_theme_templates/pickles2_2023/basefiles/theme_files/styles/px2style_themes/darkmode.css.map')
	.js('./startup_theme_templates/pickles2_2023/src/modules/layouts/backtopagetop/module.js', './startup_theme_templates/pickles2_2023/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop/module.js')
	.js('./startup_theme_templates/pickles2_2023/src/modules/layouts/backtopagetop-float/module.js', './startup_theme_templates/pickles2_2023/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop-float/module.js')
	.js('./startup_theme_templates/pickles2_2023/src/modules/layouts/hamburger-menu/module.js', './startup_theme_templates/pickles2_2023/basefiles/broccoli_module_packages/themeEditorModules/layouts/hamburger-menu/module.js')

	// --------------------------------------
	// Theme: pickles2_2023_darkmode
	.copy('./vendor/pickles2/px2style/dist/themes/default.css', './startup_theme_templates/pickles2_2023_darkmode/basefiles/theme_files/styles/px2style_themes/default.css')
	.copy('./vendor/pickles2/px2style/dist/themes/default.css.map', './startup_theme_templates/pickles2_2023_darkmode/basefiles/theme_files/styles/px2style_themes/default.css.map')
	.copy('./vendor/pickles2/px2style/dist/themes/darkmode.css', './startup_theme_templates/pickles2_2023_darkmode/basefiles/theme_files/styles/px2style_themes/darkmode.css')
	.copy('./vendor/pickles2/px2style/dist/themes/darkmode.css.map', './startup_theme_templates/pickles2_2023_darkmode/basefiles/theme_files/styles/px2style_themes/darkmode.css.map')
	.js('./startup_theme_templates/pickles2_2023_darkmode/src/modules/layouts/backtopagetop/module.js', './startup_theme_templates/pickles2_2023_darkmode/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop/module.js')
	.js('./startup_theme_templates/pickles2_2023_darkmode/src/modules/layouts/backtopagetop-float/module.js', './startup_theme_templates/pickles2_2023_darkmode/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop-float/module.js')
	.js('./startup_theme_templates/pickles2_2023_darkmode/src/modules/layouts/hamburger-menu/module.js', './startup_theme_templates/pickles2_2023_darkmode/basefiles/broccoli_module_packages/themeEditorModules/layouts/hamburger-menu/module.js')

	// --------------------------------------
	// Local Dev
	.js('./tests/app/client_php/index_files/contents.src.js', './tests/app/client_php/index_files/contents.js')
;

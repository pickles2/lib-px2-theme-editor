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
	// Theme: template_001b
	.js('./startup_theme_templates/template_001b/src/modules/layouts/backtopagetop/module.js', './startup_theme_templates/template_001b/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop/module.js')
	.js('./startup_theme_templates/template_001b/src/modules/layouts/backtopagetop-float/module.js', './startup_theme_templates/template_001b/basefiles/broccoli_module_packages/themeEditorModules/layouts/backtopagetop-float/module.js')
	.js('./startup_theme_templates/template_001b/src/modules/layouts/hamburger-menu/module.js', './startup_theme_templates/template_001b/basefiles/broccoli_module_packages/themeEditorModules/layouts/hamburger-menu/module.js')

	// --------------------------------------
	// Local Dev
	.js('./tests/app/client_php/index_files/contents.src.js', './tests/app/client_php/index_files/contents.js')
;

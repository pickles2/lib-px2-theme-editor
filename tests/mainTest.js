var assert = require('assert');
var Pickles2ThemeEditor = require('../node/main.js');

describe('Tests', function() {

	it("Test", function(done) {
		this.timeout(60*1000);
		var pickles2ThemeEditor = new Pickles2ThemeEditor();
		assert.ok( pickles2ThemeEditor );
		assert.equal( 1, 1 );
		done();
	});

});

/**
 * User: seb
 * Date: 03/10/12
 * Time: 10:07
 * To change this template use File | Settings | File Templates.
 */

var assert = require("assert");
	OS = require("../lib/opensubtitles.js");

describe('Opensubtitles', function() {

	describe('#computeHash()', function(){

		it('should return a opensubtitles hash of the movie file ', function(done){
			var os = new OS();
			os.computeHash(process.cwd()+'/test/breakdance.avi', function(err, size){
				if (err) return done(err);
				assert.equal(size, '8e245d9679d31e12');
				done();
			});
		});


		it('should return a 64bits length opensubtitles hash of the movie file ', function(done){
			var os = new OS();
			os.computeHash(process.cwd()+'/test/breakdance.avi', function(err, size){
				if (err) return done(err);
				assert.equal(size.length, '8e245d9679d31e12'.length);
				done();
			});
		});

	});

	describe('#padLeft', function() {
		it('should left pad a string as occurence of max char', function() {

			var os = new OS();
			assert.equal(os.padLeft("123456", 0, 10), "0000123456");
			assert.equal(os.padLeft("123456", "0", 10), "0000123456");
		});
	});

	describe('#read64LE', function() {
		it('should read 64 bits Little indian order from buffer ', function() {

			var os = new OS();
			var buf = new Buffer([
				0x00, 0x11, 0x22, 0x33, 0X44, 0x55, 0x66, 0x77
			]);

			assert.equal(os.read64LE(buf, 0), "7766554433221100");
		});
	});

	describe('#sumHex64Bits', function() {
		it('should add 64 bits hex string', function() {
			var os = new OS();
			assert.equal(
				os.sumHex64bits(
					"3a3e2a2340",
					"4d6b464332"
					),
				"87a9706672"
			);
			//assert.equal(os.padLeft("123456", "0", 10), "0000123456");
		});
	});

	describe('#sumHex64Bits', function() {
		it('should add 64 bits hex string', function() {
			var os = new OS();
			assert.equal(
				os.sumHex64bits(
					"22ac84f761e",
					"0000000062773130"
				),
				"22b2ac6a74e"
			);
		});
	});

	describe('#checkMovieHash', function() {
		it('should identify Mar adentro', function(done) {
			var os = new OS();
			assert.equal(
				os.checkMovieHash(['8e245d9679d31e12'], function(err, res) {
					if(err) return done(err);
					assert.equal(res.data['8e245d9679d31e12'].MovieName, "Mar adentro");
					done();
				})
			);
		});
	});
});


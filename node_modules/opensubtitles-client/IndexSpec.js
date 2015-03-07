
var expect = require("expect.js");

describe('IndexSpec', function(){

    this.timeout(10000);

    beforeEach(function(done){

        done();

    });


    it('.API.login()', function(done){

        var OpenSubtitles = require('./Index.js');

        OpenSubtitles.api.login()
            .done(function(token){

                expect(token).to.not.be.empty();
                done();

            });

    });


});
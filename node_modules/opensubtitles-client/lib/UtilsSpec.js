
var expect = require("expect.js");

describe('indexSpec', function(){


    beforeEach(function(done){

        done();

    });

  
    it('.getOpenSubtitlesLanguage()', function(done){

        var Utils = require('./Utils');

        var lang = Utils.getOpenSubtitlesLanguage('pob');
        expect(lang).to.be('pob');

        lang = Utils.getOpenSubtitlesLanguage('pt-BR');
        expect(lang).to.be('pob');

        done();
        
    });

  
});
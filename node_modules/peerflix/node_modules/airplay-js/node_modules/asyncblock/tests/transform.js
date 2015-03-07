var vows = require('vows');
var assert = require('assert');

var asyncblock = require('asyncblock');
asyncblock.enableTransform();

Error.stackTraceLimit = 100;

var suite = vows.describe('transform');
var defer = require('../test_data/transform/defer.js');
var sync = require('../test_data/transform/sync.js');
var parse = require('../test_data/transform/parse.js');
var no_transform = require('../test_data/transform/no_transform.js');

var makeTests = function(file, name){
    var tests = {};
    var i = 1;

    while(true) {
        if(file['test' + i]) {
            (function(i){
                tests[name + i] = {
                    topic: function(){
                        file['test' + i](this.callback);
                    },

                    'Correct result': function(result){
                        assert.equal(result, 'test');
                    }
                };
            })(i);
        } else {
            break;
        }

        i++;
    }

    return tests;
};

suite.addBatch(makeTests(defer, 'defer'));
suite.addBatch(makeTests(sync, 'sync'));

suite.addBatch({
    'Parser maintains line numbers correctly': {
        topic: function(){
            parse.test(this.callback);
        },

        'Line numbers correct': function(result){
            assert.equal(result, 'test');
        }
    }
});

suite.addBatch({
    'Transformer ignores files it does not need to change': {
        topic: function(){
            this.callback(null, no_transform);
        },

        'Not transformed': function(no_transform){
            assert.isFalse(!!no_transform.transformed);
        }
    }
});

suite.export(module);
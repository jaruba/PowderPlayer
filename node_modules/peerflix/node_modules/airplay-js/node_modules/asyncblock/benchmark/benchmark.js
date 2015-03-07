var vows = require('vows');
var assert = require('assert');
var asyncblock = require('../asyncblock.js');
var os = require('os');
var package = require('../package.json');

var suite = vows.describe('benchmark');

console.log('Machine name: ' + os.hostname());
console.log('OS: ' + os.type() + ' ' + os.release());
console.log('CPU: ' + os.cpus()[0].model + ' ' + os.arch() + ' ' + os.cpus()[0].speed + ' Mhz');
console.log('Virtual machine: ' + true);

console.log('----');
console.log('asyncblock version: ' + package.version);
console.log('node version: ' + process.version);
console.log('----');

var ONE_HUNDRED_THOUSAND = 100 * 1000;

var printMemory = function(){
    var memory = process.memoryUsage();

    memory.rss = Math.round((memory.rss / (1024 * 1024))) + ' MB';
    memory.heapTotal = Math.round((memory.heapTotal / (1024 * 1024))) + ' MB';
    memory.heapUsed = Math.round((memory.heapUsed / (1024 * 1024))) + ' MB';

    console.log('Memory:', memory);
};

printMemory();
console.log('');

var printStatus = function(name, time){
    console.log('');
    console.log(name + ': ' + time + ' ms');
    printMemory();
};

var assertMetrics = function(time){
    assert.greater(10 * 1000, time);

    assert.greater(100 * 1024 * 1024, process.memoryUsage().heapUsed);
};

var echo = function(message, callback){
    setImmediate(
        function(){
            callback(null, message);
        }
    );
};

suite.addBatch({
    'When creating 100,000 asyncblocks': {
        topic: function(){
            var start = new Date();

            for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                asyncblock(function(flow){

                });
            }

            this.callback(null, new Date() - start);
        },

        'It takes': function(time){
            printStatus('When creating 100,000 asyncblocks', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When creating 100,000 asyncblock.nostacks': {
        topic: function(){
            var start = new Date();

            for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                asyncblock.nostack(function(flow){

                });
            }

            this.callback(null, new Date() - start);
        },

        'It takes': function(time){
            printStatus('When creating 100,000 asyncblock.nostacks', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with add / wait in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    echo(i, flow.add());
                    flow.wait();
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with add / wait in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with add / wait in parallel': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    echo(i, flow.add());
                }

                flow.wait();

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with add / wait in parallel', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with get / set in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    echo(i, flow.set(i));
                    flow.get(i);
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with get / set in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with flow.sync(1) in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    flow.sync( echo(i, flow.callback()) );
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with flow.sync(1) in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with flow.sync(2) in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    flow.sync(echo, i);
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with flow.sync(2) in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with flow.future(1) in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    var future = flow.future( echo(i, flow.callback() ));
                    future.result;
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with flow.future(1) in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 100,000 echos with flow.future(2) in series': {
        topic: function(){
            var self = this;
            var start = new Date();

            asyncblock(function(flow){
                for(var i = 0; i < ONE_HUNDRED_THOUSAND; i++){
                    var future = flow.future();
                    echo(i, future);
                    future.result;
                }

                self.callback(null, new Date() - start);
            });
        },

        'It takes': function(time){
            printStatus('When doing 100,000 echos with flow.future(2) in series', time);

            assertMetrics(time);
        }
    }
});

suite.addBatch({
    'When doing 1,000 source transforms': {
        topic: function(){
            var start = new Date();
            var filename = __dirname + '/transform_test_file.js';
            asyncblock.enableTransform();

            for(var i = 0; i < 1000; i++){
                require(filename);
                delete require.cache[filename];
            }

            this.callback(null, new Date() - start);
        },

        'It takes': function(time){
            printStatus('When doing 1,000 source transforms', time);

            assertMetrics(time);
        }
    }
});

suite.export(module);
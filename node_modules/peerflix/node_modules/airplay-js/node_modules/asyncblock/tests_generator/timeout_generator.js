var vows = require('vows');
var assert = require('assert');

var asyncblock = require('../asyncblock.js');

var suite = vows.describe('timeout_generator');

// sleeps for the specified amount of time and then calls the callback
var sleep = function(sleepTime, callback) {
    setTimeout(
        function() {
            callback();
        },

        sleepTime
    );
};

suite.addBatch({
    'When running a 200ms task with a 100ms timeout': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;

                sleep(200, flow.add());
                yield flow.wait();

                throw new Error("This line shouldn't execute");
            });
        },

        'The task times out': function(err, result){
            assert.isTrue(err.taskTimedOut);
            assert.lesser(err.taskRunTime, 125);
        }
    },


    'When running a 200ms task with a 100ms timeout': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = function(){};
                flow.taskTimeout = 100;

                flow.on('taskTimeout', function(info){
                    self.callback(null, info);
                });

                sleep(200, flow.add('key'));
                yield flow.wait();

                throw new Error("This line shouldn't execute");
            });
        },

        'The taskTimeout event is emitted': function(result){
            assert.equal(result.key, 'key');
            assert.greater(result.runtime, 97);
        }
    },

    'When running a 100ms task with a 200ms timeout': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 200;

                sleep(100, flow.add());
                yield flow.wait();

                sleep(100, flow.add());
                yield flow.wait();

                self.callback();
            });
        },

        'It should not time out': function(){

        }
    },

    'When running a 200ms task with a 100ms timeout, using object add syntax': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;

                sleep(200, flow.add({ timeout: 100 }));
                yield flow.wait();

                throw new Error("This line shouldn't execute");
            });
        },

        'The task times out': function(err, result){
            assert.isTrue(err.taskTimedOut);
            assert.lesser(err.taskRunTime, 125);
        }
    },

    'When running a 200ms task with a 100ms timeout, ignoring the error': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;

                sleep(200, flow.addIgnoreError());
                yield flow.wait();

                self.callback();
            });
        },

        'It should not throw an error': function(){

        }
    },

    'When running a 200ms task with a 100ms timeout, task.timeoutIsError = false': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;

                sleep(200, flow.add({ timeoutIsError: false }));
                yield flow.wait();

                flow.queue({ timeoutIsError: false }, function(callback){
                    setTimeout(callback, 200);
                });
                yield flow.wait();

                self.callback();
            });
        },

        'It should not throw an error': function(){

        }
    },

    'When running a 200ms task with a 100ms timeout, flow.timeoutIsError = false': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;
                flow.timeoutIsError = false;

                sleep(200, flow.add());
                yield flow.wait();

                flow.queue(function(callback){
                    setTimeout(callback, 200);
                });
                yield flow.wait();

                self.callback();
            });
        },

        'It should not throw an error': function(){

        }
    },

    'When running a 200ms task with a 100ms timeout, using queue': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;

                flow.queue(function(callback){
                    setTimeout(callback, 200);
                });

                yield flow.wait();

                self.callback();
            });
        },

        'The task times out': function(err, result){
            assert.isTrue(err.taskTimedOut);
            assert.lesser(err.taskRunTime, 125);
        }
    },

    'When running a task that times out with an explicit key wait': {
        topic: function(){
            var self = this;

            asyncblock(function*(flow){
                flow.errorCallback = self.callback;
                flow.taskTimeout = 100;

                sleep(200, flow.add('timer'));

                yield flow.wait('timer');

                self.callback();
            });
        },

        'The task times out': function(err, result){
            assert.isTrue(err.taskTimedOut);
            assert.lesser(err.taskRunTime, 125);
        }
    }
});

suite.export(module);
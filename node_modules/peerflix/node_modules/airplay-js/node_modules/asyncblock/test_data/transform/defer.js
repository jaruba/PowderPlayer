var utility = require('./utility.js');
var asyncblock = require('asyncblock');

exports.test1 = function(callback){
    asyncblock(function(flow){
        var result = utility.echo('test').defer();

        callback(null, result);
    });
};

exports.test2 = function(callback){
    asyncblock(function(flow){
        var result;
        result = utility.echo('test').defer();

        callback(null, result);
    });
};

exports.test3 = function(callback){
    asyncblock(function(flow){
        var result;
        result = utility.echo('asdf').defer();

        result = 'test';

        callback(null, result);
    });
};

exports.test4 = function(callback){
    asyncblock(function(flow){
        var result = utility.echo('test').defer();

        var test = function(result){
            return result;
        };

        callback(null, test(result));
    });
};

exports.test5 = function(callback){
    asyncblock(function(flow){
        var result;

        var test = function(){
            result = utility.echo('test').defer();
        };

        test();

        callback(null, result);
    });
};

exports.test6 = function(callback){
    asyncblock(function(flow){
        var result = utility.echoImmed('test').defer();

        callback(null, result);
    });
};

exports.test7 = function(callback){
    asyncblock(function(){
        var test = function(){
            return utility.echo('test').defer(['message']);
        };

        callback(null, test().message);
    });
};

exports.test8 = function(callback){
    asyncblock(function(){
        var test = function(callback){
            asyncblock(function(flow){
                var result = utility.echo('test').sync();
                callback(null, result);
            });
        };

        var result = test().defer();

        callback(null, result);
    });
};

exports.test9 = function(callback){
    asyncblock(function(){
        var test = function(callback){
            var result = utility.echo('test').defer().substring(0, 4);
            callback(null, result);
        };

        var result = test().sync();

        callback(null, result);
    });
};

exports.test10 = function(callback){
    asyncblock(function(){
        var result;

        result = utility.echo('test').defer();

        (function(result){
            result = 5;
        })();

        callback(null, result);
    });
};

exports.test11 = function(callback){
    asyncblock(function(){
        var result;
        result = 1;

        result = utility.echo('test').defer();

        callback(null, result);
    });
};

exports.test12 = function(callback){
    asyncblock(function(){
        var deferred = utility.echo('test').defer();

        var hash = {};
        hash.defer = deferred;

        callback(null, hash.defer);
    });
};

exports.test13 = function(callback){
    asyncblock(function(flow){
        var deferred = utility.echo('test').defer();

        flow.wait();

        callback(null, deferred);
    });
};

exports.test14 = function(callback){
  asyncblock(function(){
    var echo = utility.echo('test').defer();
    return echo;
  }, callback);
};

exports.test15 = function(callback){
  asyncblock(function(){
    var x = utility.echo('test').defer();
    var y = x;

    return y;
  }, callback);
};

exports.test16 = function(callback){
  asyncblock(function(){
    var x = utility.echo('test').defer();
    var y = x.length;

    if(y === 4){
      return 'test';
    }
  }, callback);
};

exports.test17 = function(callback) {
  asyncblock(function() {
    var x = utility.echo('test').defer();
    var y = utility.echo(x).defer();

    return y;
  }, callback);

};
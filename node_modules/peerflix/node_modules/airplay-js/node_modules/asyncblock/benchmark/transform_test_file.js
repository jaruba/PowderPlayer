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

        var result = test().sync();

        callback(null, result);
    });
};

exports.test8 = function(callback){
    asyncblock(function(){
        var test = function(callback){
            var result = utility.echo('test').sync().substring(0, 4);
            callback(null, result);
        };

        var result = test().sync();

        callback(null, result);
    });
};
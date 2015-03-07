var asyncblock;
asyncblock = require('asyncblock'); //Test coffeescript style

if(false){
  return; //Make sure top-level returns are supported by the parser
}

var utility = require('./utility.js');
var Fiber = require('fibers');

exports.test1 = function(callback){
    asyncblock(function(flow){
        var result = utility.echo('test').sync();

        callback(null, result);
    });
};

exports.test2 = function(callback){
    asyncblock(function(flow){
        var result;
        result = utility.echo('test').sync();

        callback(null, result);
    });
};

exports.test3 = function(callback){
    asyncblock(function(flow){
        var result;
        result = utility.echo('asdf').sync();

        result = 'test';

        callback(null, result);
    });
};

exports.test4 = function(callback){
    asyncblock(function(flow){
        var result = utility.echo('test').sync();

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
            result = utility.echo('test').sync(['message']);
        };

        test();

        callback(null, result.message);
    });
};

exports.test6 = function(callback){
    asyncblock(function(flow){
        var result = utility.echoImmed('test').sync();

        callback(null, result);
    });
};

exports.test7 = function(callback){
    asyncblock(function(flow){
        flow.errorCallback = function(err){
            callback(null, err.message);
        };

        var result = utility.error('test').sync();

        callback(null, result);
    });
};

exports.test8 = function(callback){
    asyncblock(function(flow){
        flow.errorCallback = function(err){
            callback(null, err.message);
        };

        var result = utility.errorImmed('test').sync();

        callback(null, result);
    });
};

//Verify nested syncs reuse the fiber
exports.test9 = function(callback){
    var inner = function(callback){
        asyncblock(function(){
            var innerFlow = Fiber.current;

            process.nextTick(function(){
                callback(null, innerFlow);
            });
        });
    };

    asyncblock(function(){
        var flow = Fiber.current;
        var innerFiber = inner().sync();

        callback(null, flow === innerFiber ? 'test' : 'Fiber not reused');
    });
};

//Verify fiber isn't reused for parallel operation
exports.test10 = function(callback){
    var inner = function(callback){
        asyncblock(function(){
            var innerFlow = Fiber.current;

            process.nextTick(function(){
                callback(null, innerFlow);
            });
        });
    };

    asyncblock(function(){
        var flow = Fiber.current;
        var innerFiber = inner().defer();

        callback(null, flow !== innerFiber ? 'test' : 'Fiber reused');
    });
};

//Verify fiber isn't reused for parallel operation
exports.test10 = function(callback){
    var inner = function(callback){
        asyncblock(function(){
            var innerFlow = Fiber.current;

            process.nextTick(function(){
                callback(null, innerFlow);
            });
        });
    };

    asyncblock(function(){
        var flow = Fiber.current;
        inner().sync();

        var innerFiber = inner().defer();

        callback(null, flow !== innerFiber ? 'test' : 'Fiber reused');
    });
};

exports.test11 = function(callback){
    asyncblock(function(flow){
        var test = utility.echo('test').sync();

        flow.wait();

        callback(null, test);
    });
};

exports.test12 = function(callback){
    asyncblock(function(){
        try {
            utility.error('error').sync();
        } catch(e) {

        }

        callback(null, 'test');
    });
};
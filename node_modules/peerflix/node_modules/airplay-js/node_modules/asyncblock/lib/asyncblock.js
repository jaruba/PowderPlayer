/*jshint newcap: false */
//newcap allows fiber = Fiber(fiberContents);

var FiberFlow = require('./flow_fiber.js').FiberFlow;
var GeneratorFlow = require('./flow_generator.js').GeneratorFlow;
var transform = require('./transform.js');

//Don't include Fibers until it's used
var getFibers = (function(){
    var _Fibers;
    return function(){
        if(_Fibers == null){
            _Fibers = require('fibers');
        }

        return _Fibers;
    };
})();

var asyncblock = function(fn, done, options) {
    if(options == null){
        options = {};
    }

    if(fn && fn.constructor && fn.constructor.name === 'GeneratorFunction'){
        return handleGenerator(fn, done, options);
    } else {
        return handleFiber(fn, done, options);
    }
};

module.exports = function(fn, done, options){
    //Capture stack trace by default
    var err = new Error();
    //Currently not capturing stack trace as it's about 60% slower than just making the error (and just takes 1 frame off stack trace)
    //Error.captureStackTrace(err, module.exports);

    if(options == null){
        options = {};
    }

    options.stack = err;

    asyncblock(fn, done, options);
};

module.exports.enableTransform = function(mod){
    var notEnabled = transform.enableTransform();

    if(notEnabled && mod){
        delete require.cache[mod.filename];
        mod.exports = require(mod.filename);
    }

    return notEnabled;
};

module.exports.compileContents = transform.compileContents;

module.exports.fullstack = module.exports;

module.exports.nostack = function(fn, done){
    asyncblock(fn, done);
};

module.exports.getCurrentFlow = function(){
    var currFiber = getFibers().current;
    if(currFiber){
        var currFlow = currFiber._asyncblock_flow;
        currFiber = null;

        return currFlow;
    }
};

//Creates a callback handler which only calls its callback in the case of an error
//This is just some sugar provided for a case like this:
//app.get('/handler', function(req, res, next) {
//  asyncblock(function(){
//    //do stuff here
//  }, asyncblock.ifError(next)); //Only calls next if an error is thrown / returned
//});
module.exports.ifError = function(callback){
    return function(err){
        if(err != null){
            callback.apply(this, arguments);
        }
    };
};

//Allow other modules to determine whether asyncblock has been loaded. Placing on the process object to avoid a "global" variable.
process.__asyncblock_included__ = module.exports;

var handleFiber = function(fn, done, options){
    var currFiber = getFibers().current;
    var parentFlow;
    if(currFiber != null){
        parentFlow = currFiber._asyncblock_flow;
    }

    var fiber;

    var fiberContents = function() {
        var flow = new FiberFlow(fiber);
        flow.errorCallback = done;
        flow._parentFlow = parentFlow;

        fiber._asyncblock_flow = flow;
        flow._originalError = options.stack;

        try {
            var result = fn(flow);

            if(done){
                done(null, result);
            }
        } catch(e) {
            flow._errorHandler(e);
        } finally {
            //Prevent memory leak
            fn = null;
            fiber = null;
            flow = null;
        }
    };

    if(currFiber && currFiber._asyncblock_reuseFiber){
        currFiber = null; //It's important to null out references to Fiber.current

        fiber = parentFlow._fiber;
        fiberContents();
    } else {
        currFiber = null; //It's important to null out references to Fiber.current

        fiber = getFibers()(fiberContents);
        fiber.run();
    }
};

var handleGenerator = function(genfun, done, options){
    var flow = new GeneratorFlow();
    flow._generator = genfun(flow);
    flow._done = done;
    flow._nostack = options.nostack;

    flow.errorCallback = done;

    try {
        flow._start();
    } catch(e){
        flow._errorHandler(e);
    }
};

var _generatorsSupported;
module.exports.areGeneratorsSupported = function(){
    if(_generatorsSupported == null){
        try{
            eval('(function*(){})');
            _generatorsSupported = true;
        } catch(e){
            _generatorsSupported = false;
        }
    }

    return _generatorsSupported;
};


var util = require('util');
var Flow = require('./flow.js').Flow;

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

var FiberFlow = function(fiber){
    this._fiber = fiber;

    Flow.call(this, fiber);
};

util.inherits(FiberFlow, Flow);

FiberFlow.prototype._taskFinished = function(task){
    if(task.resultWasAsync){
        this._fiber.run(task);
    }
};

FiberFlow.prototype._yield = function() {
    this._light = false;
    var task = getFibers().yield();

    errorHandler(this, task);
};

FiberFlow.prototype._waitForAllTasks = function(){
    //The task queue needs to be drained before checking if we should yield, in the case that all the tasks in the queue finish without going async
    this._runTaskQueue();

    while(this._shouldYield()){
        this._yield();

        //The task queue needs to be drained again incase something else was added after the yield
        this._runTaskQueue();
    }

    return this._formatResult();
};

FiberFlow.prototype._waitForKey = function(key){
    this._runTaskQueue(); //Task queue must be run here first in case the task calls the callback immediately

    while(!this._finishedTasks.hasOwnProperty(key)) {
        this._yield();

        this._runTaskQueue(); //Run queued tasks in case we're waiting on any of them
    }

    var task = this._finishedTasks[key];
    return this._processSingleTaskResult(task);
};

FiberFlow.prototype._onDoneAdding = function(){
    //If currently yielding, need to run again
    if(!this._light) {
        this._light = true;
        this._fiber.run();
    }
};

FiberFlow.prototype._onQueueTask = function(){
    if(!this._light){
        this._light = true;
        this._fiber.run();
    }
};

FiberFlow.prototype._afterWaitForKey = function(key){
    //Clean up
    delete this._finishedTasks[key];
};

FiberFlow.prototype._onAddTask = function(task){
    this._fiber._asyncblock_reuseFiber = task.reuseFiber;

    //Pause the fiber when adding tasks if we're up to max parallel tasks
    //Note that this is only possible with fibers, it is not supported with harmony generators
    //as they can't yield outside of the generator function
    while (this.maxParallel > 0 && this.unfinishedCount >= this.maxParallel) {
        // too many fibers running.  Yield until the fiber count goes down.
        this._yield();
    }
};

FiberFlow.prototype._throwError = function(err){
    throw err;
};

var errorHandler = function(self, task){
    if(task != null && task.result && task.result[0] && task.firstArgIsError){
        if(!task.ignoreError) {
            if(task.resultWasAsync) {
                var err = new Error();
                Error.captureStackTrace(err, self.wait);

                //Append the stack from the fiber, which indicates which wait call failed
                task.error.stack += '\n=== Pre-async stack ===\n' + err.stack;
            }

            var curr = self;
            while(curr != null){
                if(curr._originalError){
                    task.error.stack += '\n=== Pre-asyncblock stack ===\n' + curr._originalError.stack;
                }

                curr = curr._parentFlow;
            }

            task.error.__asyncblock_caught = true;
            throw task.error;
        }
    }
};

exports.FiberFlow = FiberFlow;

var util = require('util');
var Flow = require('./flow.js').Flow;

var GeneratorFlow = function(generator){
    this._generator = generator;

    Flow.call(this);
};

util.inherits(GeneratorFlow, Flow);

GeneratorFlow.prototype._start = function(){
    this._resume();
};

GeneratorFlow.prototype._resume = function(result){
    var res = this._generator.next(result);

    if(res.done){
        this._done && this._done(null, res.value);
    } else {
        if(this.listeners('taskFinished').length === 0 && this._lastAddedTask && !this._lastAddedTask.dontWait){
            //We yielded without calling wait ("var res = yield x(flow.callback());" syntax)
            //Return the value for the last added task

            this._waitForKey(this._lastAddedTask.key);
        }
    }
};

GeneratorFlow.prototype._taskFinished = function(task){
    this.emit('taskFinished', task);
};

GeneratorFlow.prototype._waitForAllTasks = function(){
    var self = this;

    this._runTaskQueue();

    if(!this._shouldYield()){
        //formatResult may throw an error. It's ok for it to bubble up as we haven't gone async yet
        var result = self._formatResult();

        //If the tasks all return before going async, they will already be done by this point
        //setImmediate is to prevent an error indicating the generator is already running
        setImmediate(function(){
            self._resume(result);
        });

        return;
    }

    var handler = function(task){
        self._runTaskQueue();

        if(self._shouldYield()){
            return; //Still waiting on other tasks
        }

        self.removeListener('taskFinished', handler);

        try{
            self._resume(self._formatResult());
        } catch(e){
            self._errorHandler(e, true);
        }
    };

    //Save the stack at the point wait was called to report it if an error occurs
    if(!this._nostack){
        this._originalError = new Error();
    }

    this.on('taskFinished', handler);
};

GeneratorFlow.prototype._waitForKey = function(key, preserveTask){
    var self = this;
    this._runTaskQueue();

    var handler = function(task){
        if(task.key === key){
            self.removeListener('taskFinished', handler);
            if(!preserveTask){
                delete self._finishedTasks[key];
            }

            try{
                self._resume(self._processSingleTaskResult(task));
            } catch(e){
                self._errorHandler(e, true);
            }
        } else {
            self._runTaskQueue();
        }
    };

    if(this._finishedTasks.hasOwnProperty(key)){
        //Task finished synchronously before wait was called
        setImmediate(function(){
            self.emit('taskFinished', self._finishedTasks[key]);
        });
    }

    //Save the stack at the point wait was called to report it if an error occurs
    if(!this._nostack){
        this._originalError = new Error();
    }

    this.on('taskFinished', handler);
};

GeneratorFlow.prototype._onDoneAdding = function(){
    this._runTaskQueue();

    //All tasks may have finished before we call doneAdding
    //If that's the case, trigger the wait handler directly
    if(!this._shouldYield()){
        this.emit('taskFinished', {});
    }
};

GeneratorFlow.prototype._onQueueTask = function(){

};

GeneratorFlow.prototype._afterWaitForKey = function(){

};

GeneratorFlow.prototype._onAddTask = function(){

};

GeneratorFlow.prototype._throwError = function(err){
    var res;
    try{
        res = this._generator.throw(err);
    } catch(e){
        if(this.errorCallback){
            this.errorCallback(e);
        } else {
            throw e;
        }
    }

    if(res && res.done){
        this._done && this._done(null, res.value);
    }
};

exports.GeneratorFlow = GeneratorFlow;

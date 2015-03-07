var events = require('events');
var util = require('util');

var Flow = function() {
    this._parallelCount = 0; //The number of currently active tasks
    this._parallelFinished = 0; //The number of finished tasks since the last call to wait

    this._taskQueue = []; //A placeholder for queued tasks
    this._forceWait = false; //Internal state that indicates that the fiber should yield until doneAdding is called

    this._light = true; //Determines whether the fiber is currently running or not. true = running
    this._finishedTasks = {}; //Buffers information about finished tasks until results are requested

    this.errorCallback = null; //Call this function when an error occurs

    this.taskTimeout = null; //Number of milliseconds the task may run for. Null means no limit.
    this.timeoutIsError = null; //If a timeout should be treated as an error, or if the task should simply be aborted and flow continue.

    this._originalError = null; //Used to store the stack at the time of asyncblock creation

    this._parentFlow = null; //In the case of nested asyncblocks, a reference to the outer block. Used to tie together stack traces

    this.maxParallel = 0; // max number of parallel tasks. maxParallel <= 0 means no limit

    this.firstArgIsError = true; //The first argument to the callback is treated as data instead of as an error

    this._lastAddedTask = null; //A stack of last added tasks, used to keep track of which task to wait on for flow.sync calls
};

util.inherits(Flow, events.EventEmitter);

Flow.prototype._getNextTaskId = (function(){
    var taskId = 1;

    return function(){
        ++taskId;

        return '_ab_' + taskId;
    };
})();


// returns the number of currently running fibers
Flow.prototype.__defineGetter__("unfinishedCount", function(){
    return this._parallelCount - this._parallelFinished;
});

var callbackHandler = function(self, task){
    if(self.taskTimeout != null && task.timeout == null){
        task.timeout = self.taskTimeout;
    }

    if(self.timeoutIsError != null && task.timeoutIsError == null){
        task.timeoutIsError = self.timeoutIsError;
    }

    var callbackCalled = false;

    task.callback = function taskCallback(err, result){
        var args = Array.prototype.slice.call(arguments);

        //Allow the error to be thrown again from an outer asyncblock, even if callbackCalled is true
        if(task.error){
            task.error.__asyncblock_handled = false;
        }

        if(callbackCalled){
            return;
        }

        callbackCalled = true; //Prevent this callback from getting called again

        if(task.timeoutId) {
            clearTimeout(task.timeoutId);
        }

        if(!task.dontWait) {
            self._parallelFinished++;
        }

        task.result = args;
        task.completed = true;
        var val = resultHandler(self, task);

        if(task.key != null){
            task.formattedResult = val;
            self._finishedTasks[task.key] = task;
        }

        //Allow the error to be thrown again from an outer asyncblock (task.error may not be set until resultHandler is called)
        if(task.error){
            task.error.__asyncblock_handled = false;
        }

        if(self._light === false) {
            task.resultWasAsync = true;
            self._light = true;
        } else {
            task.resultWasAsync = false;
        }

        self._taskFinished(task);
    };

    if(task.timeout != null){
        task.timeoutId = setTimeout(
            function(){
                var runtime = (new Date()) - task.startTime;

                task.timedOut = true;
                var timeoutError = new Error('Timeout exceeded for task (' + task.key + ') after ' + runtime + 'ms');
                timeoutError.taskTimedOut = true;
                timeoutError.taskRunTime = runtime;

                task._flow.emit('taskTimeout', { key: task.key, runtime: runtime });

                if(task.timeoutIsError == null || task.timeoutIsError === true) {
                    task.callback(timeoutError);
                } else {
                    task.callback();
                }
            },

            task.timeout
        );
    }

    task.startTime = new Date();

    return task.callback;
};

var addTask = function(self, task){
    task._flow = self;

    if(self._lastAddedTask) {
        self._lastAddedTask._nextTask = task;
        task._previousTask = self._lastAddedTask;
    }

    self._lastAddedTask = task;

    if(task.key == null) {
        if(self._parallelCount === 0){
            task.key = '__defaultkey__';
        } else {
            task.key = self._getNextTaskId();
            task.dontIncludeInResult = true;
        }
    }

    if(task.firstArgIsError == null){
        task.firstArgIsError = self.firstArgIsError;
    }

    self._onAddTask(task);

    if(!task.dontWait){
        self._parallelCount++;
    }

    return callbackHandler(self, task);
};

Flow.prototype._addTask = function(task){
    addTask(this, task);
};

var parseAddArgs = Flow.prototype._parseAddArgs = function(key, responseFormat){
    var timeout;
    var timeoutIsError;
    var dontWait = false;
    var ignoreError = false;
    var firstArgIsError;
    var reuseFiber = false;

    //Support single argument of responseFormat
    if(key instanceof Array){
        responseFormat = key;
        key = null;
    } else if(Object.prototype.toString.call(key) === '[object Object]') {
        //Support single argument object property bag
        var obj = key;
        key = obj.key;
        responseFormat = obj.responseFormat;
        timeout = obj.timeout;
        timeoutIsError = obj.timeoutIsError;
        dontWait = obj.dontWait;
        ignoreError = obj.ignoreError;
        firstArgIsError = obj.firstArgIsError;
        reuseFiber = obj.reuseFiber;
    }

    return {
        key: key,
        responseFormat: responseFormat,
        timeout: timeout,
        timeoutIsError: timeoutIsError,
        dontWait: dontWait,
        ignoreError: ignoreError,
        firstArgIsError: firstArgIsError,
        reuseFiber: reuseFiber
    };
};

Flow.prototype.add = Flow.prototype.callback = Flow.prototype.cb = function(key, responseFormat){
    var task = parseAddArgs(key, responseFormat);

    return addTask(this, task);
};

//Undocumented - used by source transformation to optimize nested sync() calls (don't create unnecessary fibers)
Flow.prototype.addAndReuseFiber = function(key, responseFormat){
    var task = parseAddArgs(key, responseFormat);
    task.reuseFiber = true;

    return addTask(this, task);
};

Flow.prototype.set = function(key, responseFormat) {
    var task = parseAddArgs(key, responseFormat);
    task.dontWait = true; //Don't include in results in flow.wait() is called

    if(task.key == null){
        throw new Error('Key is missing');
    }

    return addTask(this, task);
};

Flow.prototype.addIgnoreError = Flow.prototype.callbackIgnoreError = function(key, responseFormat) {
    var task = parseAddArgs(key, responseFormat);
    task.ignoreError = true;

    return addTask(this, task);
};

Flow.prototype._runTaskQueue = function(){
    //Check if there are any new queued tasks to add
    while(this._taskQueue.length > 0) {
        if(this.maxParallel > 0 && this.unfinishedCount >= this.maxParallel){
            return;
        }

        var task = this._taskQueue.splice(0, 1)[0];

        if(typeof task.toApply !== 'undefined') {
            var toApply = task.toApply.concat(addTask(this, task));
            task.toExecute.apply(task.self, toApply);
        } else {
            task.toExecute(addTask(this, task));
        }
    }
};

var errorParser = function(self, task) {
    if(task.result && task.result[0] && task.firstArgIsError){
        var err;
        var firstArg = task.result[0];

        if(firstArg instanceof Error){
            //An error object was thrown, just use it
            err = firstArg;
        } else if(typeof firstArg === 'object'){
            //Some sort of object was thrown, convert it into an error object to not lose stack info
            err = new Error(JSON.stringify(firstArg));
            Error.captureStackTrace(err, task.callback);
        } else {
            //Some primitive-ish thing was thrown, convert it into an error object to not lose stack info
            err = new Error(firstArg);
            Error.captureStackTrace(err, task.callback);
        }

        err.originalError = firstArg;

        task.error = err;

        return err;
    }
};

var resultHandler = function(self, task){
    if(task == null){
        return null;
    }

    //If the task is ignoring errors, we return the error
    var error = errorParser(self, task);

    if(error != null){
        return error;
    }

    if(task.responseFormat instanceof Array) {
        return convertResult(task);
    } else {
        return task.result[task.firstArgIsError ? 1 : 0];
    }
};

var convertResult = function(task){
    var formatted = {};
    var ret = task.result;
    var responseFormat = task.responseFormat;
    var offset = task.firstArgIsError ? 1 : 0;

    var min = Math.min(ret.length - offset, responseFormat.length);

    for(var i = 0; i < min; i++) {
        formatted[responseFormat[i]] = ret[i + offset];
    }

    return formatted;
};

Flow.prototype._shouldYield = function() {
    return this._parallelFinished < this._parallelCount || this._forceWait || this._taskQueue.length > 0;
};

Flow.prototype._removeTaskFromLastAddedTasks = function(task){
    if(this._lastAddedTask === task){
        this._lastAddedTask = task._previousTask;
        if(this._lastAddedTask){
            this._lastAddedTask._nextTask = null;
        }
    } else {
        if(task._previousTask){
            task._previousTask._nextTask = task._nextTask;
        }

        if(task._nextTask){
            task._nextTask._previousTask = task._previousTask;
        }
    }
};

Flow.prototype._formatResult = function(){
    var self = this;
    var toReturn;
    var err;
    var ignoreError;

    //If add was called once and no parameter name was set, just return the value as is
    if(this._parallelCount === 1 && '__defaultkey__' in this._finishedTasks) {
        var task = this._finishedTasks.__defaultkey__;

        toReturn = task.formattedResult;

        this._removeTaskFromLastAddedTasks(task);

        delete this._finishedTasks.__defaultkey__;

        if(task.error){
            err = task.error;
            ignoreError = task.ignoreError;
        }
    } else {
        var defaultTask = this._finishedTasks.__defaultkey__;

        //Make sure we don't miss reporting this error
        if(defaultTask != null){
            this._removeTaskFromLastAddedTasks(defaultTask);

            if(defaultTask.error){
                err = defaultTask.error;
                ignoreError = defaultTask.ignoreError;
            }
        }

        delete this._finishedTasks.__defaultkey__;

        toReturn = {};

        Object.keys(this._finishedTasks).forEach(function(key){
            var task = self._finishedTasks[key];

            if(!task.dontWait) {
                if(task.error){
                    err = err || task.error;
                    ignoreError = ignoreError || task.ignoreError;
                }

                if(!task.dontIncludeInResult){
                    toReturn[key] = task.formattedResult;
                }

                self._removeTaskFromLastAddedTasks(task);
                delete self._finishedTasks[key];
            }
        });
    }

    //Prepare for the next run
    this._parallelFinished = 0;
    this._parallelCount = 0;

    if(err != null && !ignoreError){
        throw err;
    }

    return err || toReturn;
};

Flow.prototype._processSingleTaskResult = function(task){
    if(task && !task.dontWait) {
        this._parallelCount--;
        this._parallelFinished--;
    }

    this._removeTaskFromLastAddedTasks(task);

    if(!task.ignoreError && task.error){
        throw task.error;
    }

    return task.formattedResult;
};

Flow.prototype.wait = function(key) {
    if(key != null){
        var result = this._waitForKey(key);
        this._afterWaitForKey(key);

        return result;
    } else {
        return this._waitForAllTasks();
    }
};

Flow.prototype.get = function(key){
    if(key == null){
        throw new Error('key is missing');
    }

    return this._waitForKey(key, true);
};

Flow.prototype.del = function(key){
    delete this._finishedTasks[key];
};

Flow.prototype.forceWait = function() {
    this._forceWait = true;

    return this._waitForAllTasks();
};

var parseSyncArgs = function(args){
    var applyBegin, toExecute, options;

    if(typeof args[0] === 'function'){
        toExecute = args[0];
        applyBegin = 1;
    } else if(typeof args[1] === 'function'){
        options = args[0];
        toExecute = args[1];
        applyBegin = 2;
    }

    return {
        toExecute: toExecute,
        options: options,
        toApply: Array.prototype.slice.call(args, applyBegin)
    };
};

Flow.prototype.sync = function(options, toExecute/*, apply*/){
    if(arguments.length === 1 && typeof arguments[0] !== 'function'){
        //flow.sync(asyncFunction(..., flow.add()); usage
        var lastTask = this._lastAddedTask;

        if(lastTask == null){
            throw new Error('flow.sync usage not correct -- no task has been added');
        }

        return this.wait(lastTask.key);
    } else {
        //flow.sync(asyncfunction, ...); usage
        var task = parseSyncArgs(arguments);
        task.key = this._getNextTaskId();
        task.dontWait = true;

        var callback = this.add(task);
        task.toApply.push(callback);

        task.toExecute.apply(task.self, task.toApply);

        return this.wait(task.key);
    }
};

Flow.prototype.doneAdding = function(){
    if(!this._forceWait) {
        throw new Error('doneAdding should only be called in conjunction with forceWait');
    }

    this._forceWait = false;

    this._onDoneAdding();
};

Flow.prototype._errorHandler = function(e, throwOnly){
    if(!e.__asyncblock_caught) {
        var curr = this;
        while(curr != null){
            if(curr._originalError){
                e.stack += '\n=== Pre-asyncblock stack ===\n' + curr._originalError.stack;
            }

            curr = curr._parentFlow;
        }
    }

    e.__asyncblock_caught = true;

    if(this.errorCallback && !throwOnly){
        //Make sure we haven't already passed this error to the errorCallback
        if(!e.__asyncblock_handled) {
            e.__asyncblock_handled = true;
            this.errorCallback(e);
        }
    } else {
        this._throwError(e);
    }
};

exports.Flow = Flow;

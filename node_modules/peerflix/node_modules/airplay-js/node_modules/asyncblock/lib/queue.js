var Flow = require('./flow.js').Flow;

var parseQueueArgs = function(key, responseFormat, toExecute){
    var timeout;
    var timeoutIsError;
    var ignoreError = false;
    var firstArgIsError;

    //Support single argument of responseFormat
    if(key instanceof Array){
        responseFormat = key;
        key = null;
    }

    if(typeof key === 'function') {
        toExecute = key;
        key = null;
    } else if(typeof responseFormat === 'function') {
        toExecute = responseFormat;
        responseFormat = null;
    }

    if(Object.prototype.toString.call(key) === '[object Object]'){
        var obj = key;

        key = obj.key;
        responseFormat = obj.responseFormat;
        //toExecute would be set from if block above
        timeout = obj.timeout;
        timeoutIsError = obj.timeoutIsError;
        ignoreError = obj.ignoreError;
        firstArgIsError = obj.firstArgIsError;
    }

    return {
        key: key,
        responseFormat: responseFormat,
        toExecute: toExecute,
        timeout: timeout,
        timeoutIsError: timeoutIsError,
        ignoreError: ignoreError,
        firstArgIsError: firstArgIsError
    };
};

Flow.prototype._queueTask = function(task){
    this._taskQueue.push(task);
    this._onQueueTask();
};

Flow.prototype.queue = function(key, responseFormat, toExecute) {
    var task = parseQueueArgs(key, responseFormat, toExecute);

    this._queueTask(task);
};

Flow.prototype.queueIgnoreError = function(key, responseFormat, toExecute){
    var task = parseQueueArgs(key, responseFormat, toExecute);
    task.ignoreError = true;

    this._queueTask(task);
};
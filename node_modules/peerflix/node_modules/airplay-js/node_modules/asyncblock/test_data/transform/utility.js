exports.echo = function(message, callback){
    process.nextTick(function(){
        callback(null, message);
    });
};

exports.echoImmed = function(message, callback){
    callback(null, message);
};

exports.error = function(message, callback){
    process.nextTick(function(){
        callback(message);
    });
};

exports.errorImmed = function(message, callback){
    callback(message);
};
//Vows seems to be masking uncaught exceptions and not printing anything...
process.on('uncaughtException', function(err){
    console.log('uncaught exception');
    console.log(err.stack || err);
    process.exit(1);
});

var asyncblock = require('asyncblock');
var utility = require('./utility.js');

asyncblock(function(flow){
    var result = flow.sync(utility.echo('test', flow.add()));
});

exports.transformed = module.__asyncblock_transformed;
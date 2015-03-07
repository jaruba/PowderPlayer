//ensure we only have a single asyncblock / Fibers instance running within the process
if(process.__asyncblock_included__){
  module.exports = process.__asyncblock_included__;
  return;
}

module.exports = require('./lib/asyncblock.js');

require('./lib/flow.js');
require('./lib/future.js');
require('./lib/queue.js');

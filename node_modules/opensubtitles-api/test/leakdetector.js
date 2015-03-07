var heapdump = require("heapdump");

var OS = require("../lib/opensubtitles.js");
var os = new OS();

var current = 0;
var limit = 500;

function computeHashUntilLimit() {
  console.log("compute hash current %d/%d", current, limit);
  
  if (current === 0) {
    writeSnapshot();
  }
  
  if (current === limit) {
    writeSnapshot();
    return;
  }
  
  os.computeHash(__dirname + '/breakdance.avi', function (err, size) {
    current++;
    computeHashUntilLimit();
  });
  
}

function writeSnapshot() {
  heapdump.writeSnapshot(__dirname + '/' + Date.now() + '.heapsnapshot');
}


computeHashUntilLimit();
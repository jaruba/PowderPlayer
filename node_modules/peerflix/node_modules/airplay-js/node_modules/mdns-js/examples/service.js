var mdns = require('../');

var service = mdns.createAdvertisement(mdns.tcp('_http'), 9876,
{
  name:'hello',
  txt:{
    txtvers:'1'
  }
});
service.start();

// read from stdin
process.stdin.resume();

// stop on Ctrl-C
process.on('SIGINT', function () {
  service.stop();

  // give deregistration a little time
  setTimeout(function onTimeout() {
    process.exit();
  }, 1000);
});


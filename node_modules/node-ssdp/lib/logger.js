/**
 * Use logging facilities when available
 * and stub it out when not.
 */

try {
  var bunyan = require('bunyan');
  var PrettyStream = require('bunyan-prettystream');

  process.stdout.setMaxListeners(100)
} catch(e) {
  module.exports = function () {
    var stubs = {};

    ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(function (level) {
      stubs[level] = function () {}
    })

    return stubs
  }

  return
}

module.exports = function(config) {
  if (!config) config = {}
  
  var loggerConfig = {
    name: 'ssdp',
    streams: [],
    src: true
  }
  
  if (config.logLevel) {
    var prettyStdOut = new PrettyStream()
    prettyStdOut.pipe(process.stdout)
    
    loggerConfig.streams.push({
      level: 'error',
      type: 'raw',
      stream: prettyStdOut
    })
  }
  
  var logger = bunyan.createLogger(loggerConfig)

  config.logLevel && logger.level(config.logLevel)

  return logger
}

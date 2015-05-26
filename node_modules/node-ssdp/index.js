module.exports = {
  Server: process.env.SSDP_COV ? require('./lib-cov/server') : require('./lib/server'),
  Client: process.env.SSDP_COV ? require('./lib-cov/client') : require('./lib/client'),
  Base: process.env.SSDP_COV ? require('./lib-cov/index') : require('./lib/index')
}

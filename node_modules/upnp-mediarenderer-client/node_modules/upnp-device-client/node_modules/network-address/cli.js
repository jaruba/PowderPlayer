#!/usr/bin/env node
if (process.argv.indexOf('-6') > -1) console.log(require('./index').ipv6())
else console.log(require('./index')())

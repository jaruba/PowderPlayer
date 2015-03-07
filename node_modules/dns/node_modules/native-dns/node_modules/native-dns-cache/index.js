module.exports = require('./cache');
module.exports.MemoryStore = require('./memory').MemoryStore;
module.exports.Lookup = require('./lookup').Lookup;
module.exports.is_absolute = require('./lookup').is_absolute;
module.exports.ensure_absolute = require('./lookup').ensure_absolute;

var app = require('tomahawk').create({
    routes:[__dirname + '/lib/routes'],
    logger : {log : function (level, msg) { console.log.apply(this, arguments); }},
    socket : {level: 'error'}
}).start();
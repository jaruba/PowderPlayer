module.exports = function () {
    function create(app, config, io) {
        var context    = config.store.context  || '/dns/api/v1',
            interval   = config.store.interval || interval,
            prefix     = config.dns.prefix     || 'dns:',
            prefixSize = prefix.length,
            store      = config.store;

        // GET
        app.get(context + '/hostname/:hostname?', function (req, res) {
            var hostname = req.params.hostname || '*',
                exact    = hostname.indexOf('*') === -1;
            res.header('X-tomahawk-http-method', 'GET');
            res.header('X-tomahawk-operation', 'get');
            res.header('X-tomahawk-multi-hostname', !exact);
            res.header('X-tomahawk-hostname', hostname);

            store.get(prefix+hostname, function (err, values) {
                if (err) {
                    return res.status(500).json({hostname:hostname,error:err}).end();
                }
                if (values) {
                    var records;
                    try {
                        records = values;
                        if (records instanceof(Array)) {
                            var recordsWithoutPrefix = records.map(function (record) {
                                return {hostname:record.key.substring(prefixSize), record:JSON.parse(record.value)};
                            });
                            records = recordsWithoutPrefix;
                        }
                    } catch (e) {
                        console.log('GET:' + prefix+hostname + "=", values, " >>> ", e);
                        return res.status(500).json({hostname:hostname,error:err}).end();
                    }
                    return res.json(records).end();
                }
                return res.status(404).json({hostname:hostname}).end();
            });
        });

        // PUT
        app.put(context + '/hostname/:hostname', function (req, res) {
            res.header('X-tomahawk-http-method', 'PUT');
            res.header('X-tomahawk-operation', 'set');
            res.header('X-tomahawk-multi-hostname', false);
            res.header('X-tomahawk-hostname', req.params.hostname);

            var record = {
                host : req.params.hostname,
                PTR  : null
            };

            if (req.body) {
                if (req.body.ipv4) {
                    record.A = req.body.ipv4 instanceof Array ? req.body.ipv4 : [req.body.ipv4];
                }
                if (req.body.ipv6) {
                    record.AAAA = req.body.ipv4 instanceof Array ? req.body.ipv6 : [req.body.ipv6];
                }
            }

            store.set(prefix+req.params.hostname, JSON.stringify(record), function (err, result) {
                if (err) {
                    return res.status(500).json({hostname:req.params.hostname,error:err}).end();
                }
                io.sockets.emit('/set', {hostname:req.params.hostname, record:record});

                var successes = 0,
                    failures  = 0;

                function createArpa(hostnames) {
                    if (!hostnames || hostnames.length < 1) {
                        if (failures)
                            return res.status(500).json({hostname:req.params.hostname,error:failures}).end();
                        else
                            return res.status(204).end();
                    }
                    var hostname  = ''+hostnames.shift(); // Make sure it is a string
                    var arpa = hostname.split('.').reverse().join('.') + '.in-addr.arpa';
                    store.set(prefix + arpa, JSON.stringify(record), function (err, result) {
                        if (err) {
                            failures += 1;
                        } else {
                            successes += 1;
                            io.sockets.emit(context+'/set', {hostname: arpa, record: record});
                        }
                        process.nextTick(function () {
                            createArpa(hostnames);
                        });
                    });
                }
                createArpa(record.A ? record.A instanceof(Array) ? record.A.slice(0) : [record.A] : []);
            });
        });

        // DELETE
        app.delete(context + '/hostname/:hostname?', function (req, res) {
            var hostname = req.params.hostname || '*',
                exact    = hostname.indexOf('*') === -1;
            res.header('X-tomahawk-http-method', 'DELETE');
            res.header('X-tomahawk-operation', 'del');
            res.header('X-tomahawk-multi-hostname', !exact);
            res.header('X-tomahawk-hostname', hostname);

            if (hostname === '*' && req.query.force !== 'true') {
                return res.status(400).json({error:"To delete all the entries, you must use the 'force' option"}).end();
            }

            store.delete(prefix+hostname, function (err, value) {
                if (err) {
                    return res.status(500).json({hostname:hostname,error:err}).end();
                }
                io.sockets.emit('/del', {hostname:hostname});
                return res.status(204).end();
            });
        });

        app.get(context + '/zone', function (req, res) {
            res.header('X-tomahawk-http-method', 'GET');
            res.header('X-tomahawk-operation', 'zone');
            return res.json({zone:config.dns.zone}).end();
        });

        // GET status
        app.get(context + '/status', function (req, res) {
            res.header('X-tomahawk-http-method', 'GET');
            res.header('X-tomahawk-operation', 'status');
            store.status(function (err, value) {
                if (err) {
                    return res.status(500).json({error:err}).end();
                }
                return res.status(204).end();
            });
        });
        ////////////////////////////////////////////////////////////////////////
        return {
            constructor : function (next) {
                if (next) process.nextTick(next);
            },
            shutdown : function (next) {
                if (next) process.nextTick(next);
            }
        };
    }

    return create;
}();



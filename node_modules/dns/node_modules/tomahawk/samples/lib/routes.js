module.exports = function () {

    function routes(app, config, io) {
        var database = {
            captains : {
                "jim"    : "James Tiberius Kirk",
                "picard" : "Jean-Luc Picard"
            },
            starShips : {
                "jim": "NCC1701-A",
                "picard": "NCC1701-D"
            }
        };

        // GET
        app.get('/api/v1/captain/:id?', function (req, res) {
            var withStarship = req.query.starship === 'true';
            if (req.params.id) {
                res.json(withStarship ?
                {id:req.params.id,name:database.captains[req.params.id], starship:database.starShips[req.params.id]} :
                {id:req.params.id,name:database.captains[req.params.id]});
            } else {
                res.json(database.captains);
            }
            res.end();
        });

        // PUT
        app.put('/api/v1/captain/:id', function (req, res) {
            database.captains[req.params.id] = req.body;
            io.sockets.emit('new:captain', {id:req.params.id, name:req.body});  // Optional, if you want to use websocket
            res.json({id:req.params.id,operation:"put",status:"OK"});
            res.end();
        });

        // DELETE
        app.delete('/api/v1/captain/:id', function (req, res) {
            delete database.captains[req.params.id];
            io.sockets.emit('del:captain', {id:req.params.id}); // Optional, if you want to use websocket
            res.json({id:req.params.id,operation:"delete", status:"OK"});
            res.end();
        });
    }

    return routes;
}();
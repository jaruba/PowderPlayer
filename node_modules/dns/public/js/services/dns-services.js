angular.module('dnsServices', ['ngResource'])
    .filter('objectFilter', function ($rootScope) {
        return function (input, query) {
            if (!query) return input;
            var result = [];

            angular.forEach(input, function (object) {
                var copy = {};
                var regex = new RegExp(query, 'im');
                for (var i in object) {
                    // angular adds '$$hashKey' to the object.
                    if (object.hasOwnProperty(i) && i !== '$$hashKey')
                        copy[i] = object[i];
                }
                if (JSON.stringify(copy).match(regex)) {
                    result.unshift(object);
                }
            });
            return result;
        };
    })
    .factory('socket', function($rootScope) {
        var socket = io.connect('');
            return {
                on: function(eventName, callback) {
                    socket.on(eventName, function() {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function() {
                        var args = arguments;
                        $rootScope.$apply(function() {
                            if (callback)
                                callback.apply(socket, args);
                        });
                    });
                }
            };
    })

    .factory('Hosts', function ($rootScope, $resource) {
        return $resource($rootScope.baseAPIurl + '/hostname/:hostname?', null, {
            "list"    : { method : "GET", isArray : true  },
            "get"     : { method : "GET", isArray : false },
            "put"     : { method : "PUT" },
            "delete"  : { method : "DELETE" }
        });
    })
    .factory('Zone', function ($rootScope, $resource) {
        return $resource($rootScope.baseAPIurl + '/zone', null, {
            "get"     : { method : "GET", isArray : false }
        });
    })
;



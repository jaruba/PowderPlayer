angular.module('dnsControllers', ['dnsServices', 'dnsModels'])
    .controller('dnsCtrl', function($scope, $location, socket, Hosts, Zone) {
    	$scope.dns = {
    		zone  : Zone.get(),
        	hosts : Hosts.list()
        };
        socket.on('/set', function (host) {
        	var found = false;
        	if ($scope.dns.hosts) {
	        	for (var i = 0 ; i < $scope.dns.hosts.length ; ++i) {
	        		if ($scope.dns.hosts[i].hostname === host.hostname) {
	        			found = true;
	        			$scope.dns.hosts[i].record = host.record;
	        			break;
	        		}
	        	}
	        }
        	if (!found) {
        		if (!$scope.dns.hosts)
        			$scope.dns.hosts = [];
        		$scope.dns.hosts.push(host);
        	}
        });
        socket.on('/del', function (host) {
        	if ($scope.dns.hosts) {
	        	for (var i = 0 ; i < $scope.dns.hosts.length ; ++i) {
	        		if ($scope.dns.hosts[i].hostname === host.hostname) {
	        			$scope.dns.hosts.splice(i, 1);
	        			break;
	        		}
	        	}
	        }
        });

    })
;

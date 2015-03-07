// To have one place where we define both the 'url' use in the javascript pages and the routes (because the
// $routeProvider cannot use the $rootScope, we have to define a global (beuark) variable here.
var ___g_dnsRoutePrefix___ = '/home';
angular.module('dns', ['ngRoute', 'dnsServices', 'dnsControllers'])
    .run(function ($rootScope) {
        $rootScope.baseAPIurl = '/dns/api/v1';
        $rootScope.baseUIurl = '/';
        $rootScope.urlBasePath = ___g_dnsRoutePrefix___;
    })
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when(___g_dnsRoutePrefix___, {controller: 'dnsCtrl', templateUrl: 'views/dns.html'}).
            otherwise({redirectTo: ___g_dnsRoutePrefix___});
    }])
;

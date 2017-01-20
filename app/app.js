import * as login from "./login/login.js";
import * as dashboard from "./dashboard/dashboard.js";


angular.module('livePost', [
    'relativeDate',
    'ui.materialize',
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'firebase',
    'livePost.dashboard',
    'livePost.login'
])
.config(['$routeProvider', function($routeProvider) {
    // Set defualt view of our app to home
    $routeProvider.otherwise({
        redirectTo: '/dashboard'
    });
}])
.controller('MainCtrl', ["$scope", function($scope, $sce) {
    
}]);
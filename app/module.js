const TypingTestModule = angular.module('TypingTestModule', ['ngRoute']);

TypingTestModule.config(function($routeProvider){
    $routeProvider.when('/', {
            'templateUrl': 'app/views/login.html',
            'controller' : 'LoginController'
    });
    $routeProvider.when('/menu', {
            'templateUrl' : 'app/views/menu.html',
            'controller' : 'MenuController'
    });
    $routeProvider.when('/typing-test', {
            'templateUrl' : 'app/views/test.html',
            'controller' : 'TypingTestController'
    });
})
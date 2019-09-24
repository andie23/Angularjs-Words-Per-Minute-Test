const TypingTestModule = angular.module('TypingTestModule', ['ngRoute']);

TypingTestModule.config(function($routeProvider){
    $routeProvider.when('/', {
            'templateUrl' : 'app/views/test.html',
            'controller' : 'TypingTestController'
        });
})
const TypingTestModule = angular.module('TypingTestModule', ['ngRoute']);

TypingTestModule
        .config(function($routeProvider){
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
        .config(['$httpProvider', function($httpProvider) {
                $httpProvider.interceptors.push(function($q, $rootScope){
                        if ($rootScope.activeCalls == undefined) {
                                $rootScope.activeCalls = 0;
                        }
                        return {
                                request: function (config) {
                                        $rootScope.activeCalls +=1;
                                        return config;
                                },
                                requestError: function(rejection){
                                        $rootScope.activeCalls -= 1;
                                        return rejection;
                                },
                                response: function(response){
                                        $rootScope.activeCalls -=1;
                                        return response;
                                },
                                responseError: function(rejection){
                                        $rootScope.activeCalls -=1;
                                        return rejection;
                                }
                        }
                })
        }])
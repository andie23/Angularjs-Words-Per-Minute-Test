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
                                        return $q.reject(rejection);
                                },
                                response: function(response){
                                        $rootScope.activeCalls -=1;
                                        if (response.data.error !== undefined){
                                                appAlert.error(response.data.error);
                                        }
                                        return response;
                                },
                                responseError: function(rejection) {
                                        $rootScope.activeCalls -=1;
                                        if (rejection.status === -1){
                                                appAlert.error("Failed to connect to server/ You're offline");
                                        }else if(rejection.status >= 400 && rejection.status <= 499){
                                                appAlert.error("Resource not found/Authorization Error..");
                                        }else if(rejection.status >= 500 && rejection.status <= 599){
                                                appAlert.error("An error has occured while processing request");
                                        }
                                        return $q.reject(rejection);
                                }
                        }
                })
        }]);
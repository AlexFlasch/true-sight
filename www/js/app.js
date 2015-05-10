var app = angular.module('app', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common["X-Requested-With"];
    $httpProvider.defaults.headers.common["Accept"] = "application/json";
    $httpProvider.defaults.headers.common["Content-Type"] = "application/json";

    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl'
    })

    .state('search', {
        url: '/search',
        templateUrl: 'templates/search.html',
        controller: 'SearchCtrl'
    })

    .state('results', {
        url: '/results/:steamId',
        templateUrl: 'templates/results.html',
        controller: 'ResultsCtrl',
        resolve: {
            results: function(matchResults, $stateParams){
                return matchResults.all($stateParams.steamId);
            }
        }
    })

    .state('details', {
        url: '/details:matchId',
        templateUrl: 'templates/match-details.html',
        controller: 'DetailsCtrl',
        resolve: {
            details: function(matchDetails, $stateParams){
                return matchDetails.all($stateParams.matchId);
            }
        }
    })
});

app.run(function($ionicPlatform, $rootScope, $state, $ionicLoading) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        $rootScope.baseUrl = 'https://true-sight.azurewebsites.net/api/steamapi/';
        $rootScope.currentUserEmail = '';

        $ionicPlatform.registerBackButtonAction(function(){
            if($state.current.name == 'login'){
                return;
            }else{
                navigator.app.backHistory();
            }
        }, 100);

        $rootScope.showLoading = function(text){
            $ionicLoading.show({
                content: '<i class="ion-loading"></i> <br/>' + text,
            });
        }

        $rootScope.hideLoading = function(){
            $ionicLoading.hide();
        }

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
            console.log('Error: ' + error + '\n'
                + 'Event: ' + event + '\n'
                + 'toState: ' + toState + '\n'
                + 'toParams: ' + toParams + '\n'
                + 'fromState: ' + fromState + '\n'
                + 'fromParams: ' + fromParams + '\n'
            );
        });
    });
});

app.controller('LoginCtrl', function($scope, $state, $http, $rootScope) {

    $scope.user = {};

    $scope.login = function() {
        $rootScope.showLoading('Logging In...');
        $http.get($rootScope.baseUrl + 'login/' + $scope.user.email + '/' + $scope.user.password)
            .then(function(response){
                //if success $rootScope.currentUserEmail = user.email
                if(response.data.success){
                    $rootScope.currentUserEmail = $scope.user.email;

                    $state.go('search');
                }
                $rootScope.hideLoading();
            }, function(error){
                console.log(error);
                $rootScope.hideLoading();
            });
    }

    $scope.sendToRegister = function() {
        $state.go('register');
    }

});

app.controller('SearchCtrl', function($scope, $state, $http, $rootScope, $ionicLoading, $ionicHistory, $ionicModal, matchResults) {

    $scope.vanityName;
    $scope.saveId = false;

    if(window.localStorage['vanityName'] !== undefined){
        $scope.vanityName = window.localStorage['vanityName'];
    }

    $scope.search = function() {
        $rootScope.showLoading('Searching...');
        if($rootScope.currentUserEmail == ''){
            $rootScope.hideLoading();
            //tell user to re-log. they got here before they should be somehow.
            return;
        }
        if($scope.saveId){
            window.localStorage['vanityName'] = $scope.vanityName;
        }
        $http.get($rootScope.baseUrl + 'getsteamid/' + $rootScope.currentUserEmail + '/' + $scope.vanityName + '/' + $scope.saveId )
            .then(function(response){
                if(response.data.success == 1){
                    $rootScope.hideLoading();
                    $state.transitionTo('results', {
                        steamId: response.data.steamid
                    });
                }
                else {
                    $rootScope.hideLoading();
                    console.log(response);
                }
            }, function(error){
                console.log(error);
                $rootScope.hideLoading();
            });
    }

    $scope.logout = function(){
        $rootScope.currentUserEmail = '';
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
        $state.go('login');
    }

    $ionicModal.fromTemplateUrl('templates/help-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.showModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //cleanup modal
    $scope.$on('$destroy', function(){
        $scope.modal.remove();
    });

});

app.controller('RegisterCtrl', function($scope, $state, $http, $rootScope){

    $scope.newUser = {};

    $scope.createUser = function(user) {
        $rootScope.showLoading('Creating account...');
        $http.get($rootScope.baseUrl + 'register/' + $scope.newUser.email + '/' + $scope.newUser.password )
            .then(function(response){
                if(response.data.success){
                    $state.go('search');
                }
                $rootScope.hideLoading();
            }, function(error){
                console.log(error);
                $rootScope.hideLoading();
            })
    }

});

app.controller('ResultsCtrl', function($scope, $state, $http, $ionicModal, $rootScope, $stateParams, matchResults, matchDetails){

    $scope.steamId = $stateParams.steamId; //Flascher should be 76561198011514271
    $scope.results = [];
    $scope.statusCode = -1;

    $scope.getHeaderStyle = function(victory){
        if(victory){
            return "radiant";
        } else {
            return "dire";
        }
    }

    $scope.getResults = function(){
        $rootScope.showLoading();
        var promise = matchResults.all($scope.steamId);
        promise.then(function(response){
            if(response.data.response.success){
                $scope.statusCode = response.data.result.status;
                if($scope.statusCode == 15){
                    $rootScope.hideLoading();
                    return;
                }
                var resultData = [];
                var matches = response.data.result.matches;
                for(var i = 0; i < matches.length; i++){

                    var temp = {

                    }

                    var detPromise = matchDetails.all(matches[i].match_id);
                    detPromise.then(function(response){
                        if(response.data.response.success){
                            var detailsData = [];
                            var details = response;
                        }
                    })

                    resultData.push(matches[i]);
                }
            }
            $rootScope.hideLoading();
            $scope.results = resultData;
        }, function(error){
            console.log(error);
        });
    };

    $ionicModal.fromTemplateUrl('templates/result-help-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.showModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    //cleanup modal
    $scope.$on('$destroy', function(){
        $scope.modal.remove();
    });

    $scope.getResults();

})

app.factory('matchResults', function($http){
    return {
        all: function(steamId){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getmatchhistory/' + steamId);
        }
    }
});

app.factory('matchDetails', function($http){
    return {
        all: function(matchId){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getmatchdetails/' + matchId);
        }
    }
});

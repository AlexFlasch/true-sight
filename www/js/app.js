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

app.run(function($ionicPlatform, $rootScope, $state, $ionicLoading, heroListFactory, itemListFactory, abilityListFactory, lobbyListFactory, modeListFactory, regionListFactory) {
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
        $rootScope.currentUserAccountId;
        $rootScope.currentUserSteamId;

        $rootScope.heroList;
        $rootScope.itemList;
        $rootScope.abilityList;
        $rootScope.lobbyList;
        $rootScope.modeList;
        $rootScope.regionList;

        var heroPromise = heroListFactory.all();
        heroPromise.then(function(response){
            $rootScope.heroList = response.data.heroes;
        }, function(error){
            console.log(error);
        });

        var itemPromise = itemListFactory.all();
        itemPromise.then(function(response){
            $rootScope.itemList = response.data.items;
        }, function(error){
            console.log(error);
        });

        var abilityPromise = abilityListFactory.all();
        abilityPromise.then(function(response){
            $rootScope.abilityList = response.data.abilities;
        }, function(error){
            console.log(error);
        });

        var lobbyPromise = lobbyListFactory.all();
        lobbyPromise.then(function(response){
            $rootScope.lobbyList = response.data.lobbies;
        }, function(error){
            console.log(error);
        });

        var modePromise = modeListFactory.all();
        modePromise.then(function(response){
            $rootScope.modeList = response.data.modes;
        }, function(error){
            console.log(error);
        });

        var regionPromise = regionListFactory.all();
        regionPromise.then(function(response){
            $rootScope.regionList = response.data.regions;
        }, function(error){
            console.log(error);
        });

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
                    $rootScope.currentUserAccountId = response.data.accountid;
                    $rootScope.currentUserSteamId = response.data.steamid;
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

app.controller('ResultsCtrl', function($scope, $state, $http, $ionicModal, $rootScope, $stateParams, $q, matchResults, matchDetails){

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
        var resultData = [{}];
        $rootScope.showLoading();

        $q.all([
            getMatches(),
            getMatchDetails()
        ]).then(function(data){
            resultData = data;
            $rootScope.hideLoading();
            $scope.results = resultData;
        });
    }

    var getMatches = function(){
        var matches = [];

        var promise = matchResults.all($scope.steamId);
        promise.then(function(response){
            if(response.data.response.success){
                $scope.statusCode = response.data.result.status;
                if($scope.statusCode == 15){
                    $rootScope.hideLoading();
                    return;
                }
                matches = response.data.result.matches;
            }
        }, function(error){
            console.log(error);
        });

        return matches;
    };

    var getMatchDetails = function(matches){
        var matchdetails = {};

        //loop over every match in the array.
        for(match in matches){
            var detPromise = matchDetails.all(match.match_id);
            detPromise.then(function(response){
                if(response.data.response.success){
                    var detailsData = [];
                    var details = response.data.result;

                    var currentPlayer = {};

                    //find the player who whose match history this is
                    for(var j = 0; j < details.players.length; j++){
                        if(details.players[j].account_id == $rootScope.currentUserAccountId){
                            currentPlayer = details.players[j];
                            if(j <= 4) {
                                currentPlayer.team = "radiant";
                            } else {
                                currentPlayer.team = "dire";
                            }
                        }
                    }

                    var tempDate = new Date(parseInt(details.start_time*1000));
                    var today = new Date();

                    var daysAgo = Math.round((today - tempDate)/(1000*60*60*24));

                    var heroName = '';
                    for(hero in $rootScope.heroList){
                        if(hero.id == currentPlayer.hero_id){
                            heroName = hero.localized_name;
                        }
                    }

                    matchdetails.duration = details.duration;
                    matchdetails.lobbyType = details.lobby_type;
                    matchdetails.matchId = details.match_id;
                    matchdetails.players = details.players;
                    matchdetails.victory = ((details.radiant_victory && currentPlayer.team == "radiant")
                                        || (!details.radiant_victory && currentPlayer.team == "dire"));
                    matchdetails.daysAgo = daysAgo;
                    matchdetails.kills = currentPlayer.kills;
                    matchdetails.deaths = currentPlayer.deaths;
                    matchdetails.assists = currentPlayer.assists;
                    matchdetails.playerHero = heroName;
                    matchdetails.playerheroId = currentPlayer.hero_id;

                    match.matchdetails = matchdetails;
                } else {
                    //not really sure... assign default values?
                }
            }, function(error){
                console.log(error);
                //set temp's values to be default or something.
            });
        }
    }

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

app.factory('heroListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getherolist');
        }
    }
});

app.factory('abilityListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getabilitylist');
        }
    }
});

app.factory('itemListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getitemlist');
        }
    }
});

app.factory('lobbyListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getlobbylist');
        }
    }
});

app.factory('modeListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getmodelist');
        }
    }
});

app.factory('regionListFactory', function($http){
    return {
        all: function(){
            return $http.get('https://true-sight.azurewebsites.net/api/steamapi/getregionlist');
        }
    }
});

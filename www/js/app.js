var ts = angular.module('ts', ['ionic', 'ionMdInput']);

ts.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

    $stateProvider.state('login', {
        url: 'login',
        views: {
            'login': {
                templateurl: 'templates/login.html',
                controller: 'LoginCtrl'
            }
        }
    });

    $stateProvider.state('search', {
        url: 'search',
        views: {
            'search': {
                templateUrl: 'templates/search.html',
                controller: 'SearchCtrl'
            }
        }
    });

    $stateProvider.state('results', {
        url: '/results',
        views: {
            'results': {
                tempalteUrl: 'templates/results.html',
                controller: 'ResultsCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/login');
});

ts.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
});

ts.controller('LoginCtrl', function($scope, $state) {

    $scope.user = {};

    $scope.login = function() {
        //eventually send data and stuff.
        // $scope.user = angular.copy(user);

        $state.go('login.search');
        console.log($state.is('search'));
    }

});

ts.controller('SearchCtrl', function($scope, $state) {

    //dummy data
    $scope.results = [{
        steamId: 0,
        profilePicture: "urlToPicture",
        displayName: "Flascher",
        lastMatch: new Date(),
    }];

});

ts.factory('Searches', function() {

    //Some more fake testing data
    var results = [{
        steamId: 0,
        displayName: "Flascher",
        lastMatch: new Date(),
    }];

    return {
        all: function() {
            return results;
        },
        get: function(id) {
            for (var i = 0; i < results.length; i++) {
                if (results[i].steamId === parseInt(id)) {
                    return results[i];
                }
            }
            return null;
        }
    };
});

ts.factory('Matches', function() {

  // Some fake testing data
  var matches = [{
    id: 0,
    team: "Dire",
    date: new Date("1/1/2015"),
    gameType: "All Pick",
    duration: "56m",
    kills: 8,
    deaths: 2,
    assists: 4,
    victory: true,
    heroId: "Mirana",
    gpm: 500,
    xpm: 700,
    gold: 1800
  }];

  return {
    all: function() {
      return matches;
    },
    get: function(matchId) {
      for (var i = 0; i < matches.length; i++) {
        if (matches[i].id === parseInt(matchId)) {
          return matches[i];
        }
      }
      return null;
    }
  };
});

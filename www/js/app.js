var ts = angular.module('ts', ['ionic', 'firebase']);

// var fb = new Firebase("https://true-sight.firebaseio.com/")
var key;

ts.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('register', {
        url: 'register',
        template: 'templates/register.html'
    })

    .state('search', {
        url: 'search',
        template: 'templates/search.html'
    })

    .state('results', {
        url: '/results',
        template: 'templates/results.html'
    })
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

ts.controller('LoginCtrl', function($scope, $state, $firebaseObject) {


    // key = db.child("https://true-sight.firebaseio.com/apikey");

    $scope.user = {};

    $scope.login = function() {
        //eventually send data and stuff.
        // $scope.user = angular.copy(user);
    }

    $scope.sendToRegister = function() {
        $state.go('register');
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

ts.controller('RegisterCtrl', function($scope, $state){

    $scope.registerUser = function(input) {

    }

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

var app = angular.module('app', ['ionic', 'firebase']);

var key;

app.config(function($stateProvider, $urlRouterProvider) {
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
        url: 'search',
        template: 'templates/search.html'
    })

    .state('results', {
        url: '/results',
        template: 'templates/results.html'
    })
});

app.run(function($ionicPlatform, $rootScope, $state, fbAuth, $ionicLoading) {
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

        ionic.Platform.fullscreen();

        $rootScope.fbUrl = 'https://true-sight.firebasio.com'

        fbAuth.$onAuth(function (authData){
            if(authData) {
                console.log('Logged in as: ' + authData.uid);
            } else {
                console.log('Logged out');
                $ionicLoading.hide();
                $state.go('login');
            }
        });

        $rootScope.logout = function () {
            console.log("Logging out from the app.");
            $ionicLoading.show({
                template: 'Logging out...'
            });
            fbAuth.$unauth();
        };

        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
            if(error === 'AUTH_REQUIRED'){
                $state.go('login')
            } else {
                console.log('Error: ' + error + '\n'
                    + 'Event: ' + event + '\n'
                    + 'toState: ' + toState + '\n'
                    + 'toParams: ' + toParams + '\n'
                    + 'fromState: ' + fromState + '\n'
                    + 'fromParams: ' + fromParams + '\n'
                );
            }
        })
    });
});

app.controller('LoginCtrl', function($scope, $state, $firebaseAuth) {


    // key = db.child("https://true-sight.firebaseio.com/apikey");

    var user = {};

    $scope.login = function() {
        var email = $scope.user.email;
        var password = $scope.user.password;

        console.log(email, password);

    }

    $scope.sendToRegister = function() {
        $state.go('register');
    }

});

app.controller('SearchCtrl', function($scope, $state) {

});

app.controller('RegisterCtrl', function($scope, $state, $firebaseAuth, $rootScope){

    $scope.newUser = {};

    var ref = new Firebase('https://true-sight.firebaseio.com');
    var auth = $firebaseAuth(ref);

    $scope.createUser = function(user) {
        auth.$createUser({
            username: $scope.newUser.username,
            email: $scope.newUser.email,
            password: $scope.newUser.password
        }).then(function(userData){
            ref.child('users').child(userData.uid).set({
                username: $scope.newUser.username,
                email: $scope.newUser.email,
                password: $scope.newUser.password
            })
        }).catch(function(error){
            alert("Error: " + error);
        });
    }

});

app.factory('fbAuth', ['$firebaseAuth', '$rootScope', function($firebaseAuth, $rootScope){
    var fb = new Firebase('https://true-sight.firebaseio.com');
    return $firebaseAuth(fb);
}]);

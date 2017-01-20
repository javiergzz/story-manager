
export default angular.module('livePost.login', ['ngRoute', 'firebase'])

// Declared route
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
    });
}])

// Home controller
.controller('LoginCtrl', ['$scope', "$location", "$cookies", '$firebaseAuth', function($scope, $location, $cookies, $firebaseAuth) {

  $scope.callbackLoginError = function(error){
    var message = "Error logging user in:" + error;
    if (error) {
      switch (error.code) {
        case "INVALID_EMAIL":
          message = "The specified user account email is invalid.";
          break;
        case "INVALID_PASSWORD":
          message = "The specified user account password is incorrect.";
          break;
        case "INVALID_USER":
          message = "The specified user account does not exist.";
          break;
        default:
          break;
      }
    }
    return message;
  };

  $scope.SignIn = function(event) {
    event.preventDefault();  // To prevent form refresh
    var username = $scope.user.email;
    var password = $scope.user.password;
    loginObj.$authWithPassword({
      email: username,
      password: password
    })
    .then(function(user) {
      // CommonProp.setUser(user.password.email);
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      $cookies.put('user_livepost', user.password.email, {expires: expireDate});
      $cookies.put('user_livepost_pw', user.password, {expires: expireDate});
      $location.path("/dashboard");
      //console.log('Authentication successful');
      //console.log($scope.user);
    }, function(error) {
        Materialize.toast('Oops! '+ $scope.callbackLoginError(error), 4000, 'rounded red lighten-2 center-align');
        $scope.authError = true;
        $scope.authErrorMessage = error.message;
        //console.log('Authentication failure');
    });
  };

  $scope.twitterSignIn = function() {
    // $location.path("/dashboard"); 
    var ref = new Firebase("https://sweltering-torch-4080.firebaseio.com");
    ref.authWithOAuthPopup("twitter", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
	      $location.path("/dashboard");
      	$scope.$apply();
	      console.log("User signed up");
	      var expireDate = new Date();
      	expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('user_livepost', '@' + authData.twitter.displayName, {expires: expireDate});
        // $cookies.put('user_livepost_pw', user.password, {expires: expireDate});
        //console.log("Authenticated successfully with payload: ", authData);
      }
    });
  }

  $scope.SignUp = function(event) {
    event.preventDefault();  // To prevent form refresh
    var username = $scope.user.email;
    var password = $scope.user.password;
    loginObj.$createUser({
      email: username,
      password: password
    }).then(function(userData) {
      //console.log("User " + userData.uid + " created successfully!");
      $scope.SignIn(event);
    }).then(function(authData) {
      //console.log("Logged in as:", authData.uid);
    }).catch(function(error) {
      console.error("Error: ", error);
      Materialize.toast('Oops! There was an error: '+error, 4000, 'rounded red lighten-2 center-align');
    });
  };

var firebaseObj = new Firebase("https://sweltering-torch-4080.firebaseio.com/");
var loginObj = $firebaseAuth(firebaseObj);
}]);

// ****************************************IMPORTING FUNCTION MODULES****************************************

import {selectedStories, unselectedStories, reverse} from "./filters";
import {storyScroll, infiniteScroll, ngEnter} from "./directives";
import {submitTestUpdate} from "./testFunctions";
import * as helpers from "./helpers";
import * as storyFunctions from "./storyFunctions";
import * as updateFunctions from "./updateFunctions";
import * as deleteFunctions from "./deleteFunctions";

// ****************************************Initialization & Dependency Injection****************************************

export default angular.module('livePost.dashboard', ['ngRoute', 'firebase', 'ngAnimate', 'ngSanitize', 'infinite-scroll', 'angular-sortable-view'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.html',
    controller: 'DashboardCtrl'
  });
}])

// ****************************************DASHBOARD CONTROLLER BEGINS HERE****************************************

.controller("DashboardCtrl", ["$scope", "$window", "$sce", "$location", "$parse", "$firebaseArray", "$firebaseObject", function($scope, $window, $sce, $location, $parse, $firebaseArray, $firebaseObject) {
  
	// Main reference to the LP database
  var ref = new Firebase("https://sweltering-torch-4080.firebaseio.com");

	// Call currentUser fn to know which stories to load up
	helpers.currentUser(ref, $scope);

	// Load all stories related to user in an object. These will all be concatenated in an ng-repeat in dashboard.html
	$scope.userStories = {
		created: $firebaseArray(ref.child("users/"+$scope.currentUser+"/posts_created")),
		contributed: $firebaseArray(ref.child("users/"+$scope.currentUser+"/posts_contributed_to"))
	};

  $scope.activeStories = []; // Initially there are no active stories
  $scope.activeStoriesIDs = []; // Initially there are no active stories
	$scope.willMakeAvailable = true; //This FLAG will determine wether story columns will be closed when clicking on their titles.
  $scope.newUpdates = {}; // Currently updates are counted form the moment a user opens the webapp
  
  // This object holds the limits for how many of any collection is loaded into the view.
  // Each Active story will be added with their own key in here.
  // This object is altered via the Inifnite Scrolling function
  $scope.collectionLimits = { 
    bigDashboard: 16,
    smallDashboard: 16
  }

  // Set up listeners to check and notify whenever a story recieves an update
  $scope.userStories.created.$loaded().then(
  	$scope.userStories.contributed.$loaded().then(function() {
  		helpers.setupListeners(ref, $scope);
  	})
	);

  // This function will be called from the view when displaying how many new updates a story has
  $scope.showNewUpdates = function(key) {
    return $scope.newUpdates[key];
  }

	// This function decides wether to highlight a time badge when showcasing stories based on how long ago the last update was made. This is invoked directly in the view.
  $scope.diffTime = function(timestamp) {
  	return helpers.diffTime(timestamp);
  }

  // Appearently this function is necessary for displaying videos correctly.
  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  };

  // This function will check wether user is logged in, and if not, redirects to login page.
  $scope.checkLogin = function() {
  	helpers.checkLogin(ref, $scope, $location)
  };

  // Function to log the user out.
  $scope.SignOut = function() {
  	helpers.SignOut(ref, $scope, $location);
  }

  // This function passes the story and it's corresponding updates to the activeStories array when as story is clicked.
  // All stories in activeStories will be displayed in columns.
  $scope.MakeActive = function(story) {
  	storyFunctions.MakeActive(story, ref, $scope, $firebaseArray, $firebaseObject);
  }

  // This function removes the story from activeStories so it is displayed once more on the "Showcase"
  $scope.MakeAvailable = function(story) {
  	storyFunctions.MakeAvailable(story, $scope)
  }

  // This function opens the modal and sets the environment to edit a specific Update
  $scope.setupUpdate = function(item, update) {
  	updateFunctions.setupUpdate(item, update, $scope)
  }

  // This function opens the modal and sets the environment to edit a specific Story
  $scope.setupStoryUpdate = function(item) {
  	storyFunctions.setupStoryUpdate(item, $scope)
  }

  //This function persists updates made to updates into the Firebase
  $scope.updateUpdate = function() {
  	updateFunctions.updateUpdate(ref, $scope);
  }

  //This function persists updates made to stories into the Firebase
  //This function must update the story in the Posts node, for the user doing the update, 
  //and for all users linked as contributors
  $scope.updateStory = function() {
  	storyFunctions.updateStory(ref, $scope, $firebaseArray);
  }

  // Function open modal and setup environment to add/remove contributors to a Story
  $scope.manageCollaborators = function(story) {
  	storyFunctions.manageCollaborators(story, ref, $scope, $firebaseArray);
  }

  // This function simply adds an icon beside the contributor name inside the contributors list. 
  // This can be expanded for different roles and icons later on.
  $scope.collaboratorRole = function(role) {
    return helpers.collaboratorRole(role);
  };

  //function to add contributor to a story. Validates wether contributor already exists, and if not, creates him/her.	
  //NEEDS FIXING... NEW COLLABROATOR DOES NOT GET THE STORY ADDED UNDER "STORIES_CONTRIBUTED_TO"
  $scope.addCollaborator = function() {
  	storyFunctions.addCollaborator(ref, $scope);
  }

  // Function to remove contributors from stories
  $scope.removeCollaborator = function(member) {
  	storyFunctions.removeCollaborator(member, ref, $scope);
  }

  // Function to confirm if a story/update really should be deleted after clicking the delete button
  // This is used for BOTH stories and updates. Works through a modal. 
  $scope.confirmDelete = function(type, item, parent) {
  	deleteFunctions.confirmDelete(type, item, parent, ref, $scope);
  }

  // Function to delete story/update after confirmation
  $scope.deleteItem = function() {
  	deleteFunctions.deleteItem(ref, $scope, $firebaseArray);
  }

  // This function allows re-ordering the custom index of updates through the GUI and persist it in the Firebase
  $scope.reorderUpdates = function(position1, position2, story) {
   updateFunctions.reorderUpdates(position1, position2, story, ref, $scope, $firebaseArray);
  }

  // Function to determine wether the updates's message is media or text
  $scope.notMedia = function(data) {
   return helpers.notMedia(data);
  }

  // Check login upon page load
  $scope.checkLogin();

  // Dyanmically resize columns and title cards upon window resize 
  // ---> This fixes the weird overflwoing title cards bug upon window reize
 	angular.element($window).bind('resize', function(){
 		resizeColumns($scope);
    $scope.$apply();
	});
 	


  // **********************************TEST FUNCTIONS***************************************************

 // This function is used to submit dummy updates for testing purposes
  $scope.submitTest = function() {
  	submitTestUpdate(ref, $scope, $firebaseArray, $firebaseObject);
  }
 
  // **********************************END OF TEST FUNCTIONS******************************


}])


// ========================================== Custom Filters ===========================================


.filter('selectedStories', selectedStories)
.filter('unselectedStories', unselectedStories)
.filter('reverse', reverse)

// ========================================== Custom Fire on Scroll ===========================================


.directive("storyScroll", storyScroll)

.directive("infiniteScroll", infiniteScroll)

.directive('ngEnter', ngEnter);



// ========================================== To Be Done ===========================================
// Share update --->> Javi
// Cookies

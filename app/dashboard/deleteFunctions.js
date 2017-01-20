export function confirmDelete(type, item, parent, ref, scope) {
	scope.willMakeAvailable = false;
  scope.type = type;
  switch (type) {
    case "Update":
      scope.itemToDelete = ref.child("updates/" + parent.$id + "/" + item.$id);
      break;
    case "Story":
      scope.itemToDelete = ref.child("posts/" + item.$id);
      scope.itemToDeleteObj = item;
      break;
  }
  $('#deleteModal').openModal();
  setTimeout(function() {scope.willMakeAvailable = true;}, 100);
};

export function deleteItem(ref, scope, firebaseArray) {
	// If it is a story, first we have to remove it from its other locations: 
	// Members, nested inside the main authors's profile, and nested inside contributors' profiles
  if (scope.type == "Story") { 
  	var key = scope.itemToDeleteObj[0].$id;
  	var members = ref.child("members/" + key); // Story inside members node
    members.remove(); // Remove story from member's node
    var collaborators = firebaseArray(members); // Array of all collaborators
    collaborators.$loaded(function() {
    	for (var i = collaborators.length - 1; i >= 0; i--) {
    		var peopleCreatedFb = ref.child("users/"+ collaborators[i].$id +"/posts_created/");//Two possible places where the story may be for other users
    		var peopleContributedFb = ref.child("users/"+ collaborators[i].$id +"/posts_contributed_to/");//Two possible places where the story may be for other users
    		peopleCreatedFb.once('value', function(snapshot) {
		      if (snapshot.hasChild(key)) { //check where the story is really found (else stories will be duplicated)
		      	peopleCreatedFb.child(key).remove();
		      }
		    });
		    peopleContributedFb.once('value', function(snapshot) {
		      if (snapshot.hasChild(key)) { //check where the story is really found (else stories will be duplicated)
		      	peopleContributedFb.child(key).remove();
		      }
		    });
	   	}
    })
  	var authorFb = ref.child("users/"+scope.itemToDeleteObj[0].author+"/posts_created/"); //Author's Copy Location
  	authorFb.child(key).remove(); // Remove author's copy
    var index = scope.activeStories.indexOf(scope.itemToDeleteObj);
    if (index > -1) {
      scope.activeStories.splice(index, 1); // Remove from active stories in the View
    };
  }
  // This deletes the main story/update
  // If the item is an update it will jump straight to this action.
  scope.itemToDelete.remove(); // Delete Main item
  $("#deleteModal").closeModal();
  Materialize.toast(scope.type + " removed.", 4000, 'red lighten-2 rounded center-align');
};
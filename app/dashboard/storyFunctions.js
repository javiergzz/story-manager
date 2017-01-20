import {resizeColumns, maxColumns} from "./helpers";

export const MakeActive = function(story, ref, scope, firebaseArray, firebaseObject) {
  if (maxColumns(scope)) {
  	 Materialize.toast('These are too many stories to be displayed correctly on your screen!', 4000, 'rounded center-align');
  	 setTimeout(function() {
  	 	  	 Materialize.toast('Click on the title of an open story to minimize it. ', 4000, 'rounded center-align');
  	 }, 1000);
  } else {
		var key = story.$id;
	  scope.activeStories.push([firebaseObject(ref.child("posts/" + key)), firebaseArray(ref.child("/updates/" + key).orderByChild("customindex"))]);
	  scope.activeStoriesIDs.push(key);
	  scope.collectionLimits[key] = 6;
	  scope.newUpdates[key] = null;
	  resizeColumns(scope);
  }
};

export const MakeAvailable = function(story, scope) {
  if (scope.willMakeAvailable) {
  	var index = scope.activeStories.indexOf(story);
    var indexIDs = scope.activeStoriesIDs.indexOf(story[0].$id);
    if (index > -1) {
      scope.activeStories.splice(index, 1);
    };
    if (indexIDs > -1) {
      scope.activeStoriesIDs.splice(indexIDs, 1);
    };
    resizeColumns(scope);
  }
};

export const setupStoryUpdate = function(item, scope) {
	scope.willMakeAvailable = false;
  scope.storyToUpdate = item;
  $('#updateStoryModal').openModal();
	setTimeout(function() {
		scope.willMakeAvailable = true;
	}, 100);
};

//This function persists updates made to stories into the Firebase
//This function must update the story in the Posts node, for the user doing the update, 
//and for all users linked as contributors
export const updateStory = function(ref, scope, firebaseArray) {
  var fb = ref.child("posts/" + scope.storyToUpdate.$id); //Posts node
  var authorFb = ref.child("users/"+scope.storyToUpdate.author+"/posts_created/"); //Location of Author's copy
  var collaborators = firebaseArray(ref.child("members/" + scope.storyToUpdate.$id)); // Collaborators array
  collaborators.$loaded(function() {
  	for (var i = collaborators.length - 1; i >= 0; i--) {
  		var personContributedFb = ref.child("users/"+ collaborators[i].$id +"/posts_contributed_to/"); // Location to each collaborator's copy
    	personContributedFb.child(scope.storyToUpdate.$id).update({ title: scope.storyToUpdate.title })
   	}
  })
  fb.update({ title: scope.storyToUpdate.title });
  authorFb.child(scope.storyToUpdate.$id).update({ title: scope.storyToUpdate.title })
  Materialize.toast('Successfully updated!', 4000, 'rounded green lighten-2 center-align');
};

export const manageCollaborators = function(story, ref, scope, firebaseArray) {
	scope.willMakeAvailable = false;
  var fb = ref.child("members/" + story.$id);
  var collaborators = firebaseArray(fb);
  scope.collaborators = collaborators;
  scope.storyToUpdate = story;
  $('#collaboratorsModal').openModal();
  setTimeout(function() {scope.willMakeAvailable = true;}, 1000);
}

export const addCollaborator = function(ref, scope) {
    var id = scope.newMember.uid.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    var members = ref.child("members/" + scope.storyToUpdate.$id);
    var users = ref.child("users/");
    members.once('value', function(snapshot) {
      if (snapshot.hasChild(id)) {
        Materialize.toast('Collaborator is already listed! ', 4000, 'rounded red lighten-2 center-align');
      } else {
        members.child(id).update({
          role: scope.newMember.role,
          uid: scope.newMember.uid
        });
        users.child(id).update({
          name: scope.newMember.role,
          email: scope.newMember.uid,
          profile_picture: "https://livepostrocks.s3.amazonaws.com/default_user_profile.png",
          uid: scope.newMember.uid
        });
        users.child(id + "/posts_contributed_to/" + scope.storyToUpdate.$id).set({
        	author: scope.storyToUpdate.author,
					author_name: scope.storyToUpdate.author_name,
					category: scope.storyToUpdate.category,
					last_message: scope.storyToUpdate.last_message,
					last_time: scope.storyToUpdate.last_time,
					lat: scope.storyToUpdate.lat,
					lng: scope.storyToUpdate.lng,
					location: scope.storyToUpdate.location,
					posts_picture: scope.storyToUpdate.posts_picture,
					subcategory: scope.storyToUpdate.subcategory,
					timestamp: scope.storyToUpdate.timestamp,
					title: scope.storyToUpdate.title,
        });
        Materialize.toast('New ' + scope.newMember.role + ' added!', 4000, 'rounded green lighten-2 center-align');
      }
    });
  };

export const removeCollaborator = function(member, ref, scope) {
  var memberFb = ref.child("members/" + scope.storyToUpdate.$id + "/" + member.$id);
  var userFb = ref.child("users/" + member.$id +"/posts_contributed_to" + scope.storyToUpdate.$id);
  memberFb.remove();
  userFb.remove();
  Materialize.toast('Successfully removed.', 4000, 'red lighten-2 rounded center-align');
}
const submitTestUpdate = function(ref, scope, $firebaseArray, $firebaseObject) {
	var foo = ["Never", "Gonna", "Give", "You", "Up"];
  var testStories = scope.userStories.created.concat(scope.userStories.contributed);
  scope.userStories.contributed.$loaded().then(function() {
    var testStory = testStories[Math.floor(Math.random() * testStories.length)].$id;
    var lastPost = $firebaseArray(ref.child("/updates/" + testStory).orderByChild("customindex").limitToLast(1));
    lastPost.$loaded().then(function() {
      var newIndex = lastPost[0].customindex + 1;
      var storyObj = $firebaseObject(ref.child("posts/" + testStory));
      storyObj.$loaded(function() {
      	var author = storyObj.author;
        var time = Date.now();
        var contributors = $firebaseArray(ref.child("members/" + testStory));
        ref.child("updates/" + testStory).child("Test" + time).update({ message: foo[Math.floor(Math.random()*(foo.length))], timestamp: Date.now(), customindex: newIndex });
        ref.child("posts/" + testStory).update({ last_time: time });
        console.log("users/" + author + "/" + testStory);
        ref.child("users/" + author + "/posts_created/" + testStory).update({ last_time: time });
        contributors.$loaded(function() {
        	for (var i = contributors.length - 1; i >= 0; i--) {
	        	ref.child("users/" + contributors[i].$id + "/posts_contributed_to/" + testStory).update({ last_time: time });
	        }
        })
      })
    });
  });
}


 // This function is used to submit dummy stories for testing purposes
  // CURRENTLY NOT WORKING CORRECTLY, CANNOT GET KEY() OF THE STORY BEING ADDED TO THE USER'S NODE

const submitTestStory = function(ref, scope) {
	var testStory = {
		author: scope.currentUser,
		last_time: Date.now(),
		title: "Matt Damon"
	}
	var newStoryRef = ref.child("users/"+scope.currentUser+"/posts_contributed_to");
	newStoryRef.push(testStory);
	var storyID = newStoryRef.key();
	console.log(storyID);

	// ref.child("posts").child(storyID).set(testStory);
}

// ****************FUNCTION TO AUTOMATICALLY ASSIGN A CUSTOM INDEX TO EACH AND EVERY UPDATE *********
  // function assignCustomIndex(ref, scope) {
  //     var things = $firebaseArray(ref.child("/updates"));
  //     things.$loaded().then(function (stories) {
  //         for (var i = 0; i<things.length; i++){
  //             var updates = stories[i];
  //             var j = 0;
  //             // //console.log(updates);
  //             for(var key in updates){
  //                 var simpleKey = key.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
  //                 if ((simpleKey != "id") && (simpleKey != "priority")) {
  //                     var fb = ref.child("/updates/"+updates.$id+"/"+simpleKey);
  //                     fb.update({customindex: j});
  //                     j++;
  //                 }
  //             }
  //         }    
  //     })
  // }

  // assignCustomIndex();
  // *************************************************************************************

  export {
  	submitTestUpdate
  }
  // Generic function to replace strings. Used to convert user emails to usernames in currentUser function  
export const stringReplacer = function(string, find, replace) {
   function escapeRegExp(string) {
       return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
   }
 	return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// This function will check wether user is logged in, and if not, redirects to login page.
export const checkLogin = function(ref, scope, location) {
  var authData = ref.getAuth();
  if (authData == null) {
    location.path("/login");
    Materialize.toast('You need to login first! ', 4000, 'rounded red lighten-2 center-align');
  } else {
    switch (authData.provider) {
      case 'password':
        scope.username = authData.password.email.replace(/@.*/, '');
        break;
      case 'twitter':
        scope.username = authData.twitter.displayName;
        break;
    }
    Materialize.toast('Welcome ' + scope.username + '!', 4000, 'rounded green lighten-2 center-align');
  }
};

export const SignOut = function(ref, scope, location) {
  ref.unauth();
  location.path("/login");
  Materialize.toast('Signed out ' + scope.username + '.', 4000, 'rounded green lighten-2 center-align');
}

// Function to validate logged-in user against LivePost users. This will later be used to load up only stories related to the user
export const currentUser = function(ref, scope) {
	var authData = ref.getAuth();
  if (authData) {
    switch (authData.provider) {
      case 'password':
        scope.currentUser = stringReplacer(authData.password.email, '.', '');
        break;
      case 'twitter':
        scope.currentUser = ('@'+authData.twitter.displayName);
        break;
    }
  } 
};

// Set up listeners to check and notify whenever a story recieves an update
export const setupListeners = function(ref, scope) {
  var storiesLength1 = scope.userStories.created.length;
  var storiesLength2 = scope.userStories.contributed.length;
  for (var i = 0; i < storiesLength1; i++) {
    ref.child("updates/").child(scope.userStories.created[i].$id).orderByChild('timestamp').startAt(Date.now()).on('child_added', function(snapshot) {
      var parts = (snapshot.ref().toString()).split('/');
      var key = parts[parts.length - 2];
      scope.newUpdates[key] = ((scope.newUpdates[key] + 1) || 1);
    });
  }
  for (var i = 0; i < storiesLength2; i++) {
    ref.child("updates/").child(scope.userStories.contributed[i].$id).orderByChild('timestamp').startAt(Date.now()).on('child_added', function(snapshot) {
      var parts = (snapshot.ref().toString()).split('/');
      var key = parts[parts.length - 2];
      scope.newUpdates[key] = ((scope.newUpdates[key] + 1) || 1);
    });
  }
}

export function notMedia(data) {
	if (data.indexOf('https://livepostrocks.s3.amazonaws.com/') == -1) {
    return true;
  }
}

// This function decides wether to highlight a time badge when showcasing stories based on how long ago the last update was made. This is invoked directly in the view.
export const diffTime = function(timestamp) {
  if ((new Date(new Date() - timestamp)).getTime() >= (1000 * 60 * 60 * 24)) {
    return "grey darken-1";
  } else
    return "teal lighten-2"
};

	// Function to resize columns dinamically.
// This is called upon adding stories to the activeStories array, as well as when the window is resized.
export const resizeColumns = function(scope) {
  if (scope.activeStories.length == 1) {
    scope.columnWidth = 50;
  } else {
    scope.columnWidth = 100 / (scope.activeStories.length);
  };
  scope.minColumnWidth = ((((document.getElementById("mainRow").offsetWidth) * (10 / 12)) * (scope.columnWidth / 100)) + "px");
};

export function collaboratorRole(role) {
if (role == "contributor") {
    return "group_add";
  }
}

export function maxColumns(scope) {
	if (scope.activeStories.length >= 3) {
		return true;
	} else {
		return false;
	}
}
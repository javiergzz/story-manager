export const setupUpdate = function(item, update, scope) {
  scope.updateToUpdate = item;
  scope.parentOfTargetUpdate = update;
  $('#updateModal').openModal();
};

export const updateUpdate = function(ref, scope) {
  var fb = ref.child("/updates/" + scope.parentOfTargetUpdate + "/" + scope.updateToUpdate.$id);
  var message = scope.updateToUpdate.message;    
  fb.update({ message: message }, function(error) {
    if (error) {
      Materialize.toast('Oops! There was an error: ' + error, 4000, 'rounded red lighten-2 center-align');
    } else {
      Materialize.toast('Successfully updated!', 4000, 'rounded green lighten-2 center-align');
    }
  })
};

export function reorderUpdates(position1, position2, story, ref, scope, firebaseArray) {
    var indexFrom = (story[1][(story[1].length - 1) - position1].customindex);
    var indexTo = (story[1][(story[1].length - 1) - position2].customindex);
    console.log("Front Index From: " + position1 + ", New Index: " + indexTo);
    console.log("Front Index To: " + position2 + ", Old Index: " + indexFrom);
    var difference = (indexTo - indexFrom);
    if (difference < 0) {
      var updatesInRange = firebaseArray(ref.child("/updates/" + story[0].$id).orderByChild("customindex").startAt((indexTo)).endAt(indexFrom -1));
      updatesInRange.$loaded().then(function() {
        var movedUpdate = ref.child("/updates/" + story[0].$id + "/" + story[1][(story[1].length - 1) - position1].$id);
        for (var i = 0; i < updatesInRange.length; i++) {
          var displacedIndex = (updatesInRange[i].customindex + 1);
          var fb = ref.child("/updates/" + story[0].$id + "/" + updatesInRange[i].$id);
          fb.update({ customindex: displacedIndex });
        }
        movedUpdate.update({ customindex: indexTo });
      });
    }
    if (difference > 0) {
      var updatesInRange = firebaseArray(ref.child("/updates/" + story[0].$id).orderByChild("customindex").startAt((indexFrom+1)).endAt(indexTo));
      updatesInRange.$loaded().then(function() {
        var movedUpdate = ref.child("/updates/" + story[0].$id + "/" + story[1][(story[1].length - 1) - position1].$id);
        for (var i = 0; i < updatesInRange.length; i++) {
          var displacedIndex = (updatesInRange[i].customindex - 1);
          var fb = ref.child("/updates/" + story[0].$id + "/" + updatesInRange[i].$id);
          fb.update({ customindex: displacedIndex });
        }
        movedUpdate.update({ customindex: indexTo });
      });
    }
  }
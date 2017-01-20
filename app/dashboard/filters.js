	const selectedStories = function() {
    return function(stories, activeStories) {
      return stories.filter(function(story) {
        if (activeStories.indexOf(story.$id) != -1) {
          return true;
        }
        return false;
      });
    };
  }

  const unselectedStories = function() {
    return function(stories, activeStoriesIDs) {
      return stories.filter(function(story) {
        if (activeStoriesIDs.indexOf(story.$id) != -1) {
          return false;
        }
        return true;
      });
    };
  }

  const reverse = function() {
    return function(items) {
      return items.slice().reverse();
    }
  }

export {
	selectedStories,
	unselectedStories,
	reverse
}
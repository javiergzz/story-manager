const storyScroll = function($parse) {
  return function(scope, element, attrs) {
    var thisTop;
    angular.element(element).bind("scroll", function() {
      // //console.log("HeY");
      thisTop = angular.element(element).scrollTop();
      if (thisTop > 60) {
        angular.element(element).addClass("active");
      } else {
        var key = angular.element(element).data("storyid");
        angular.element(element).removeClass("active");
        scope.newUpdates[key] = null;
        scope.$apply();
      }
    });
  };
}

const infiniteScroll = function($parse) {
  return function(scope, element, attrs) {
    angular.element(element).bind("scroll", function() {
      if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
        var key = angular.element(element).data("collectionkey");
        var ammount = angular.element(element).data("ammounttoload");
        scope.collectionLimits[key] += ammount;
        scope.$apply();
      }
    });
  };
}

const ngEnter = function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
}

export {
	storyScroll, infiniteScroll, ngEnter
}
angular.module('pmpBrowser.controllers', [])
.controller('AppCtrl', function($scope, $pmp, $ionicLoading, CollectionDoc) {

  $scope.search = {};

  $scope.items = [];

  $scope.$watch('search.string', function(newValue, oldValue) {
    debouncedSearch();
  });

  var debouncedSearch = ionic.debounce(function () {
    $scope.$apply(function (){
      $scope.items = [];
      $scope.pmpSearch($scope.search.string, {});
    });
  }, 400, false);


  $scope.moreDataCanBeLoaded = function () {
    return false;
  };

  $scope.loadMore = function () {
    var nextLink = $filter('filter')($scope.search.result.links.navigation, function(l) { return l.rels[0] == 'next' } )[0];
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.pmpSearch = function (query, options) {
    if (angular.isUndefined(query) || query.length <= 2) {
      $scope.search.result = null;
      return $scope.search.result;
    }

    console.log('pmp query', $scope.search.string);

    $ionicLoading.show({ template: '<i class="icon ion-refreshing"></i> Loading...', noBackdrop: true });

    // $pmp.search($scope.search.string).then(
    CollectionDoc.search($scope.search.string).then(
      function (doc) {
        console.log('pmp doc', doc, doc.items());
        window.result = doc;
        $scope.search.result = doc;
        $scope.items = $scope.items.concat(doc.items());
        $ionicLoading.hide();
      },
      function (data) {
        $scope.search.result = null;
        $ionicLoading.hide();
      }
    );


  };

});

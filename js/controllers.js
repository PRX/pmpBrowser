angular.module('pmpBrowser.controllers', [])
.controller('DocCtrl', function ($scope, doc) {
  $scope.doc = doc;
})
.controller('AppCtrl', function ($scope, $pmp, $ionicLoading, CollectionDoc, metadata) {

  $scope.items = [];

  $scope.search = {};

  window.search = $scope.search;

  $scope.totalItems = function () {
    if ($scope.search && $scope.search.result && $scope.search.result.hasLink('self')) {
      return $scope.search.result.findLink('self').totalitems;
    }
    return 0;
  }

  $scope.orgFor = function (doc) {
    return metadata.orgInfo(doc.links.creator[0].href);
  }

  $scope.$watch('search.string', function (newValue, oldValue) {
    debouncedSearch(newValue, oldValue);
  });

  var debouncedSearch = ionic.debounce(function (newValue, oldValue) {
    $scope.$apply(function (){
      if ((newValue || '') != (oldValue || '')) {
        $scope.search.result = null;
        $scope.items = [];
        $scope.pmpSearch($scope.search.string);
      }
    });
  }, 400, false);

  $scope.moreDataCanBeLoaded = function () {
    var loadMore = false;

    if (!$scope.search || !$scope.search.result) {
      loadMore = true;
    } else {
      loadMore = $scope.search.result.hasLink('next');
    }
    return loadMore;
  };

  $scope.loadMore = function () {
    if ($scope.search && $scope.search.result) {
      $scope.search.result.next().then(
        function (doc) {
          if (doc) {
            $scope.search.result = doc;
            $scope.items = $scope.items.concat(doc.items);
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
        }
      );
    } else {
      $scope.pmpSearch($scope.search.string).then( function() {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }
  };

  $scope.pmpSearch = function (query, options) {
    $ionicLoading.show({ template: '<i class="icon ion-loading-d icon-refreshing"></i> Loading...', noBackdrop: true });
    var vars = options || {};
    if (query) {
      vars['text'] = query;
    }

    return CollectionDoc.search(vars).then(
      function (doc) {
        $scope.search.result = doc;
        $scope.items = $scope.items.concat(doc.items);
        $ionicLoading.hide();
      },
      function (data) {
        $scope.search.result = null;
        $ionicLoading.hide();
      }
    );
  };

});

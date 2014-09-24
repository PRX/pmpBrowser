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
    var loadMore = !!($scope.search.result && $scope.search.result.hasLink('next'));
    console.log('moreDataCanBeLoaded', loadMore);
    return loadMore;
  };

  $scope.loadMore = function () {
    console.log('loadMore');

    $scope.search.result.next().then(
      function (doc) {
        console.log('loadMore doc', doc);
        if (doc) {
          $scope.search.result = doc;
          $scope.items = $scope.items.concat(doc.items);
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      }
    );

  };

  $scope.pmpSearch = function (query, options) {
    // // use this to prevent search unless there is text
    // if (angular.isUndefined(query) || query.length <= 2) {
    //   $scope.search.result = null;
    //   return $scope.search.result;
    // }

    // console.log('pmp query', $scope.search.string);

    $ionicLoading.show({ template: '<i class="icon ion-refreshing"></i> Loading...', noBackdrop: true });

    // $pmp.search($scope.search.string).then(
    CollectionDoc.search($scope.search.string).then(
      function (doc) {
        // console.log('pmp doc', doc, doc.items);
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

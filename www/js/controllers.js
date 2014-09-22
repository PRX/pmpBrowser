angular.module('pmpBrowser.controllers', [])
.controller('AppCtrl', function($scope, $pmp) {

  $scope.search = {};

  $scope.pmpSearch = function(query) {
    console.log('pmp query', $scope.search.string);
    $pmp.search($scope.search.string).then(function(data){
      console.log('pmp data', data);
    });
  };

});

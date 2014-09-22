var pmpClient = function($q, $http) {
  var url = 'http://support.pmp.io.dev/proxy/sandbox';

  return {

    search: function(query) {
      var q = $q.defer();
      search_url = url + '/docs?text=' + query;
      $http.get(search_url).
      success(function(data, status, headers, config) {
        q.resolve(data, status, headers, config);
      }).
      error(function(data, status, headers, config) {
        q.reject(data, status, headers, config);
      });
      return q.promise;
    },

    follow: function(locationString) {
    }

  }
};

angular.module('pmpBrowser.services', [])
.factory('$pmp', pmpClient);

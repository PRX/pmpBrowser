angular.module('pmp', [])
.factory('CollectionDoc', function () {

  function CollectionDoc(data) {
    this.data = (data || {});
  }

  CollectionDoc.prototype = {
  };

  return CollectionDoc;
}).factory('$pmp', function($q, $http, CollectionDoc) {

  var url = 'http://support.pmp.io.dev/proxy/sandbox';

  return {

    search: function(query) {
      var q = $q.defer();
      search_url = url + '/docs?profile=story&limit=20&text=' + query;
      $http.get(search_url)
      .success(function(data, status, headers, config) {
        q.resolve(data, status, headers, config);
      })
      .error(function(data, status, headers, config) {
        q.reject(data, status, headers, config);
      });

      return q.promise;
    },

    follow: function(locationString) {
    }

  }
});

angular.module('pmp', ['ngLodash', 'uri-template'])
.factory('CollectionDoc', function ($pmp, $document, UriTemplate, lodash) {

  var rootPromise = null;

  function CollectionDoc(data) {
    this.data = (data || {});
  }

  CollectionDoc.init = function () {
    this.root().then( function (rootDoc) {
      console.log('Collection.init complete', rootDoc);
    } );
  };

  CollectionDoc.root = function () {
    rootPromise = rootPromise || $pmp.root().then( function (data) {
      rootDoc = new CollectionDoc(data.data);
      return rootDoc;
    } );
    return rootPromise;
  };

  CollectionDoc.search = function (query) {
    return this.root().then( function (rootDoc) {
      return rootDoc.search(query);
    } );
  }

  CollectionDoc.prototype = {

    items: function () {
      return this.data.items;
    },

    next: function () {
      var nextLink = this.findLink('navigation', 'next');
      if (angular.isDefined(nextLink)) {
        return $pmp.follow(nextLink.href);
      }
    },

    findLink: function (type, rel) {
      var linkType = this.data.links[type];
      if (angular.isDefined(linkType)) {
        return lodash.find(linkType, function(l) { return lodash.contains(l.rels, rel); });
      }
    },

    request: function (url) {
      $pmp.follow(url);
    },

    search: function (query) {
      return CollectionDoc.root().then( function (rootDoc) {
        var queryLink = rootDoc.findLink('query', 'urn:collectiondoc:query:docs');
        console.log('queryLink', queryLink);
        return $pmp.search(query).then( function (data) { return new CollectionDoc(data.data); } );
      });
    }

  };

  window.CollectionDoc = CollectionDoc;

  return CollectionDoc;
}).factory('$pmp', function ($q, $http) {

  var baseUrl = 'http://support.pmp.io.dev/proxy/sandbox/';

  return {

    root: function () {
      return this.request(baseUrl);
    },

    search: function (query) {
      var searchUrl = baseUrl + 'docs?profile=story&limit=20&text=' + query;
      return this.request(searchUrl);
    },

    follow: function (locationString) {
      var followUrl = baseUrl + this.extractQuery(locationString);
      return this.request(followUrl);
    },

    extractQuery: function (fullUrl) {
      var parser = $document.createElement('a');
      parser.href = fullUrl;
      return (parser.pathname + parser.search);
    },

    request: function (requestUrl) {
      return $http.get(requestUrl);
    }

  }
});

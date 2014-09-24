angular.module('pmp', ['ngLodash', 'uri-template'])
.factory('CollectionDoc', function ($pmp, UriTemplate, lodash) {

  var rootPromise = null;

  function CollectionDoc(data) {
    this.data       = data;
    this.href       = data.href || null;
    this.version    = data.version || '1.0';
    this.attributes = data.attributes;
    this.links      = data.links;
    this.items      = lodash.map(lodash.compact(this.data.items), function (i) { return new CollectionDoc(i); });
  }

  CollectionDoc.init = function () {
    this.root().then( function (rootDoc) {
      console.log('Collection.init complete', rootDoc);
    } );
  };

  CollectionDoc.root = function () {
    rootPromise = rootPromise || $pmp.root().then( function (response) {
      rootDoc = new CollectionDoc(response.data);
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

    next: function () {
      if (this.hasLink('next')) {
        return this.follow('next');
      }
    },

    follow: function (rel, options) {
      var link = this.findLink(rel);
      // console.log('follow link', link);
      var followUrl = null;

      if (link.href) {
        followUrl = link.href;
      } else if (link['href-template']) {
        var tpl   = link['href-template'];
        var vars  = lodash.pick((options || {}), lodash.keys(link['href-vars']));
        followUrl = UriTemplate.parse(tpl).expand(vars);
      }
      // console.log('follow url', followUrl);

      return this.request(followUrl).then( function (response) { return new CollectionDoc(response.data); } );
    },

    hasLink: function (rel) {
      return angular.isDefined(this.findLink(rel));
    },

    findLink: function (rel) {
      var link = null;
      lodash.find(this.links, function (typeLinks, type) {
        return link = lodash.find(typeLinks, function (l) {
          return lodash.contains(l.rels, rel);
        });
      });
      return link;
    },

    request: function (url) {
      return $pmp.follow(url);
    },

    search: function (query, options) {
      return CollectionDoc.root().then( function (rootDoc) {
        var vars = lodash.merge({text: query, profile: 'story', limit: 20}, (options || {}));
        return rootDoc.follow('urn:collectiondoc:query:docs', vars);
      });
    }

  };

  window.CollectionDoc = CollectionDoc;

  return CollectionDoc;
}).factory('$pmp', function ($q, $http, $document) {

  var baseUrl = 'http://support.pmp.io.dev/proxy/sandbox/';

  return {

    root: function () {
      return this.request(baseUrl);
    },

    follow: function (locationString) {
      var followUrl = baseUrl + this.extractQuery(locationString);
      return this.request(followUrl);
    },

    extractQuery: function (fullUrl) {
      var parser = $document[0].createElement('a');
      parser.href = fullUrl;
      console.log('parser', fullUrl, parser, parser.pathname, parser.search);
      return (parser.pathname + parser.search);
    },

    request: function (requestUrl) {
      return $http.get(requestUrl);
    }

  }
});

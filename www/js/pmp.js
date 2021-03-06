angular.module('pmp', ['ngLodash', 'uri-template', 'angular-data.DSCacheFactory',])
.factory('CollectionDoc', function ($pmp, UriTemplate, lodash, DSCacheFactory) {

  var docCache = DSCacheFactory('pmpDocCache');

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

  CollectionDoc.search = function (options) {
    return this.root().then( function (rootDoc) {
      return rootDoc.search(options);
    } );
  }

  CollectionDoc.findDoc = function (guid) {
    return this.root().then( function (rootDoc) {
      return rootDoc.findDoc(guid);
    } );
  }

  CollectionDoc.prototype = {

    profile: function () {
      if (p = this.links.profile) {
        return p[0].href.split('/').pop();
      }
    },

    imageUrl: function () {
      var imageHref = null;
      // find items with a profile of 'image'
      var images = lodash.filter(this.items, function(i){ return i.profile() == 'image'; });

      if (!images) {
        return;
      }

      var image = images[0];

      if (angular.isUndefined(image)) {
        return;
      }

      // console.log('image', image);

      if (image.links['enclosure'].length > 0 ) {
        imageHref = image.links['enclosure'][0].href;
      }

      if (image.links['enclosure'].length > 1) {
        var enc = lodash.find(image.links['enclosure'], function (e) { return (e['meta'] && e['meta']['crop'] == 'primary'); });
        enc = enc || lodash.find(image.links['enclosure'], function (e) { return (e['meta'] && e['meta']['crop'] == 'square'); });
        if (enc) {
          // console.log('found an enc!', enc);
          imageHref = enc.href;
        }
      }

      return imageHref;
    },

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

    search: function (options) {
      return CollectionDoc.root().then( function (rootDoc) {
        var vars = lodash.merge({profile: 'story', limit: 20}, (options || {}));
        return rootDoc.follow('urn:collectiondoc:query:docs', vars);
      });
    },
    findDoc: function (guid) {
      return CollectionDoc.root().then( function (rootDoc) {
        return rootDoc.follow('urn:collectiondoc:hreftpl:docs', {'guid': guid});
      });
    }
  };

  window.CollectionDoc = CollectionDoc;
  window.lodash = lodash;

  return CollectionDoc;
}).factory('$pmp', function ($q, $http, $document) {

  // var baseUrl = 'http://support.pmp.io.dev/proxy/sandbox';
  var baseUrl = 'https://support.pmp.io/proxy/public';

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

      // console.log('parser', fullUrl, parser, parser.pathname, parser.search);
      return (parser.pathname + parser.search);
    },

    request: function (requestUrl) {
      return $http.get(requestUrl);
    }

  }
});

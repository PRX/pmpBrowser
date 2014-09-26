// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('pmpBrowser', ['ionic', 'pmpBrowser.controllers', 'pmp', 'pmpBrowser.services.metadata'])

.run(function($ionicPlatform, CollectionDoc) {
  $ionicPlatform.ready(function() {

    CollectionDoc.init();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider, CollectionDocProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
    .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/recommended.html"
        }
      }
    })
    .state('app.recommended', {
      url: "/recommended",
      views: {
        'menuContent' :{
          templateUrl: "templates/recommended.html"
        }
      }
    })
    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })
    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent' :{
          templateUrl: "templates/browse.html"
        }
      }
    })
    .state('app.doc', {
      url: "/docs/:guid",
      views: {
        'menuContent' :{
          templateUrl: "templates/doc.html",
          controller: 'DocCtrl'
        }
      },
      resolve: {
        doc: function ($rootScope, $stateParams, CollectionDoc) {
          return CollectionDoc.findDoc($stateParams.guid);
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/search');
});

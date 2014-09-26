angular.module('pmpBrowser.services.metadata', [])
.factory('metadata', function() {

  var orgMetadata = {
    '6140faf0-fb45-4a95-859a-070037fafa01': {
      abbreviation: 'NPR',
      title: 'National Public Radio',
      imageUrl: 'img/npr.jpg'
    },
    'fc53c568-e939-4d9c-86ea-c2a2c70f1a99': {
      abbreviation: 'PBS',
      title: 'Public Broadcasting Service',
      imageUrl: 'img/pbs.png'
    },
    '7a865268-c9de-4b27-a3c1-983adad90921': {
      abbreviation: 'PRI',
      title: 'Public Radio International',
      imageUrl: 'img/pri.png'
    },
    '98bf597a-2a6f-446c-9b7e-d8ae60122f0d': {
      abbreviation: 'APM',
      title: 'American Public Media',
      imageUrl: 'img/apm.jpg'
    },
    '609a539c-9177-4aa7-acde-c10b77a6a525': {
      abbreviation: 'PRX',
      title: 'Public Radio Exchange',
      imageUrl: 'img/prx.png'
    },
    'default': {
      abbreviation: 'PMP',
      title: 'Public Media Platform',
      imageUrl: 'logo.png'
    }
  };

  function metadata() {
  }

  metadata.orgInfo = function (creatorUrl) {
    var guid = creatorUrl.split('/').pop();
    return (orgMetadata[guid] || orgMetadata['default']);
  };

  metadata.recommendedCollection = function() {
   return ''; 
  }

  return metadata;

});
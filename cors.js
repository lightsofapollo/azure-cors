var azure = require('azure');
var azureCommon = require('azure-common');
var WebResource = azureCommon.WebResource;

var js2xmlparser = require('js2xmlparser');
var table = azure.createTableService();

table.apiVersion = '2013-08-15';

function getServiceProperties(callback) {
  var req = WebResource.get().
              withQueryOption('restype', 'service').
              withQueryOption('comp', 'properties');

  table.performRequest(req, null, {}, function(result, next) {
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }

    next(result, function(result) {
      var body = result.response.body;
      callback(result.error, body);
    });
  });
}

function updateServiceProperties(values, callback) {
  var req = WebResource.put().
              withQueryOption('restype', 'service').
              withHeader('x-ms-version', '2013-08-15').
              withHeader('Content-Type', 'application/xml').
              withQueryOption('comp', 'properties');


  var xml =
    js2xmlparser('StorageServiceProperties', values.StorageServiceProperties);

  table.performRequest(req, xml, {}, function(result, next) {
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }

    next(result, function(result) {
      var body = result.response.body;
      callback(result.error, body);
    });
  });
}

getServiceProperties(function(err, value) {
  console.log(JSON.stringify(value, null, 2));
  value.StorageServiceProperties.Cors = {
    CorsRule: {
      AllowedOrigins: '*',
      AllowedMethods: 'GET, HEAD, POST, PUT, DELETE, MERGE',
      MaxAgeInSeconds: 3600,
      ExposedHeaders: 'ms-*',
      AllowedHeaders: 'ms-*'
    }
  };

  updateServiceProperties(value, function() {
  });
});

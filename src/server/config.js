var fs = require('fs');

var getIpAddress = function() {
  var os = require('os');
  var interfaces = os.networkInterfaces();
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family == 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return null;
};

var CONFIG_FILENAME = __dirname + '/config.json';
var CONFIG_OPTIONS = {
  port: 8080,
  speakerPort: 1400,
  ip: getIpAddress(),
  callbackPath: '/notify'
};

var getOptions = function(filename, options) {
  filename = filename || CONFIG_FILENAME;
  options = options || CONFIG_OPTIONS;
  if (fs.existsSync(filename)) {
    var optionsFromFile = JSON.parse(fs.readFileSync(filename, 'utf8'));
    for (var key in optionsFromFile) {
      options[key] = optionsFromFile[key];
    }
  }
  return options;
};

var getHandler = function(options) {
  return function(req, res, next) {
    var o = {};
    o.lastFmApiKey = options.lastFmApiKey;
    res.send('var options = ' + JSON.stringify(o) + ';');
  };
};

module.exports.getOptions = getOptions;
module.exports.getHandler = getHandler;

var fs = require('fs');

var getIpAddress = function() {
  var os = require('os');
  var interfaces = os.networkInterfaces();
  for (k in interfaces) {
    for (k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family == 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return null;
};

var CONFIG_FILENAME = 'config.json';
var CONFIG_OPTIONS = {
  port: 8080,
  ip: getIpAddress(),
  notificationPath: '/notify'
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

module.exports.getOptions = getOptions;

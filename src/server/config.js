var fs = require('fs'),
    minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
// Remove this additional param added by minimist.
delete argv._;

var Options = require('./options');

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

var getCallbackUrl = function(ip, port, callbackPath) {
  return 'http://' + ip + ':' + port + callbackPath;
};

var configFilename = __dirname + '/config.json';

var defaultOptions = {
  port: 8080,
  speakerPort: 1400,
  ip: getIpAddress(),
  callbackPath: '/notify'
};
defaultOptions.callbackUrl = getCallbackUrl(defaultOptions.ip,
    defaultOptions.port, defaultOptions.callbackPath);

var getOptions = function(filename, opts) {
  // Precedence: command-line values, file values, default values
  opts = new Options(opts, defaultOptions);

  filename = filename || configFilename;
  if (fs.existsSync(filename)) {
    var optionsFromFile = JSON.parse(fs.readFileSync(filename, 'utf8'));
    opts.set(optionsFromFile);
  }

  opts.set(argv);
  return opts;
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

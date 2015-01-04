var constants = require('./constants');

module.exports.makeRequest = function(callbackUrl, options) {
  options = options || {};
  options.method = constants.SUBSCRIBE_METHOD;
  options.path = constants.EVENT_PATH;
  options.header = {
    // TODO: Should this be XML escaped?
    'CALLBACK': '<' + callbackUrl + '>',
    'NT': 'upnp:event'
  };
  return options;
};

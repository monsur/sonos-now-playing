var xml2js = require('xml2js');
var Options = require('./options');

var defaultOptions = {
  explicitArray: false,
  mergeAttrs: true
};

var RecursiveXml2Js = function(opts) {
  this.opts = new Options(opts, defaultOptions);
};

RecursiveXml2Js.prototype.isXmlString = function(xml) {
  return typeof xml === 'string' && xml[0] === '<';
};

RecursiveXml2Js.prototype.parse = function(xml, callback) {
  var root = {};
  this.parseHelper(xml, root, callback);
};

RecursiveXml2Js.prototype.walkObject = function(root, result) {
  for (var key in result) {
    var val = result[key];
    if (this.isXmlString(val)) {
      root[key] = {};
      this.parseHelper(val, root[key]);
    } else if (typeof val === 'object') {
      root[key] = {};
      this.walkObject(root[key], val);
    } else {
      root[key] = val;
    }
    // TODO: handle arrays.
  }
};

RecursiveXml2Js.prototype.parseHelper = function(xml, root, callback) {
  var that = this;
  xml2js.parseString(xml, this.opts, function(err, result) {
    if (!err) {
      that.walkObject(root, result);
    }
    if (callback) {
      callback(err, root);
    }
  });
};

module.exports = RecursiveXml2Js;

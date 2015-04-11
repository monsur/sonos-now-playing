var Event = require('./event');
var Logger = require('../utils/logger');
var Options = require('../utils/options');

var Events = function(opts) {
  this.opts = new Options(opts);
  this.events = [];
  this.eventsBySid = {};
  this.eventsByPath = {};
};

Events.prototype.subscribe = function(opts, callback) {
  opts.callbackUrl = this.opts.callbackUrl;
  opts.speakerIp = this.opts.speakerIp;
  opts.port = this.opts.port;

  var that = this;
  var evt = new Event();

  var callbackWrapper = function(err, data) {
    if (err && callback) {
      return callback(err, null);
    }

    that.events.push(evt);
    var pos = that.events.length - 1;
    that.eventsBySid[evt.getSid()] = pos;
    that.eventsByPath[evt.getPath()] = pos;
    if (callback) {
      callback(null, data);
    }
  };

  evt.subscribe(opts, callbackWrapper);
};

Events.prototype.getEvent = function(opts) {
  var pos = -1;
  if (opts.sid) {
    pos = this.eventsBySid[opts.sid];
  } else if (opts.path) {
    pos = this.eventsByPath[opts.path];
  }
  if (pos >= 0) {
    return this.events[pos];
  }
  return null;
};

Events.prototype.handle = function(opts, resp) {
  var evt = this.getEvent(opts);
  if (evt === null) {
    Logger.error('Could not find handler for: ' + JSON.stringify(opts));
    return;
  }

  return evt.getHandler()(resp);
};

Events.prototype.unsubscribe = function(opts, callback) {
  var evt = this.getEvent(opts);
  if (evt === null) {
    Logger.error('Could not find event for: ' + JSON.stringify(opts));
    return;
  }

  return evt.unsubscribe(callback);
};

module.exports = Events;

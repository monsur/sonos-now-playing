var Logger = require('./logger');
var Options = require('./options');

var Screensaver = function(opts) {
  this.opts = new Options(opts);
  this.id = null;
  this.isSleeping = false;
};

Screensaver.prototype.check = function() {
  if (this.isSleeping) {
    this.isSleeping = false;
    this.wak();
  }
  if (this.id) {
    clearTimeout(this.id);
    this.id = null;
  }
  var that = this;
  this.id = setTimeout(function() {
    that.isSleeping = true;
    that.sleep();
  }, this.opts.timeout);
};

Screensaver.prototype.sleep = function() {
  Logger.info("Starting screensaver");
};

Screensaver.prototype.wake = function() {
  Logger.info("Stopping screensaver");
};

module.exports = Screensaver;



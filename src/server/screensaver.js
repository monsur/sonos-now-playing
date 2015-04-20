var exec = require('child_process').exec;
var Logger = require('./logger');
var Options = require('./options');

var Screensaver = function(opts) {
  this.opts = new Options(opts);
  this.id = null;
  this.isSleeping = false;
};

Screensaver.execHandler = function (error, stdout, stderr) {
  Logger.info(stdout);
  Logger.info(stderr);
  if (error !== null) {
    Logger.error(error);
  }
};

Screensaver.prototype.check = function() {
  if (this.isSleeping) {
    this.wake();
  }
  if (this.id) {
    clearTimeout(this.id);
    this.id = null;
  }
  var that = this;
  this.id = setTimeout(function() {
    that.sleep();
  }, this.opts.timeout * 1000);
};

Screensaver.prototype.sleep = function() {
  this.isSleeping = true;
  Logger.info("Starting screensaver");
  exec('../bin/sleep.sh', Screensaver.execHandler);
};

Screensaver.prototype.wake = function() {
  this.isSleeping = false;
  Logger.info("Stopping screensaver");
  exec('../bin/wake.sh', Screensaver.execHandler);
};

module.exports = Screensaver;



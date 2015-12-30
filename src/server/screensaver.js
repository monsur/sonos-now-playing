var Logger = require('./logger');
var Options = require('./options');

var Screensaver = function(exec, opts) {
  this.exec = exec;
  this.timeout = opts.timeout || 900;
  this.id = null;
  this.isSleeping = false;
};

Screensaver.execHandler = function (error, stdout, stderr) {
  if (stdout) {
    Logger.info(stdout);
  }
  if (stderr) {
    Logger.info(stderr);
  }
  if (error) {
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
  }, this.timeout * 1000);
};

Screensaver.prototype.sleep = function() {
  this.isSleeping = true;
  Logger.info("Starting screensaver");
  this.exec.sleep(Screensaver.execHandler);
};

Screensaver.prototype.wake = function() {
  this.isSleeping = false;
  Logger.info("Stopping screensaver");
  this.exec.wake(Screensaver.execHandler);
};

module.exports = Screensaver;



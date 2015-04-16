var exec = require('child_process').exec;
var Logger = require('./logger');
var Options = require('./options');

var Screensaver = function(opts) {
  this.opts = new Options(opts);
  this.id = null;
  this.isSleeping = false;
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
  exec('/home/pi/Documents/sonos-now-playing/dest/sleep.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      Logger.error('exec error: ' + error);
    }
  });
};

Screensaver.prototype.wake = function() {
  this.isSleeping = false;
  Logger.info("Stopping screensaver");
  exec('/home/pi/Documents/sonos-now-playing/dest/wake.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      Logger.error('exec error: ' + error);
    }
  });
};

module.exports = Screensaver;



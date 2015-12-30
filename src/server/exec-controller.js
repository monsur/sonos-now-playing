var exec = require('child_process').exec;

// Module for executing OS commands.
var ExecController = function(opts) {
  // Commands are only executed on the live frame itself.
  this.enabled = (opts.live === 'true');
};

ExecController.prototype.exec = function(cmd, handler) {
  if (!this.enabled) {
    return;
  }
  exec(cmd, handler);
};

ExecController.prototype.reboot = function() {
  this.exec('.../bin/reboot.sh');
};

ExecController.prototype.sleep = function(handler) {
  this.exec('.../bin/sleep.sh', handler);
};

ExecController.prototype.wake = function(handler) {
  this.exec('.../bin/wake.sh', handler);
};

module.exports = ExecController;

var Options = function() {
  this.opts = {};
  for (var i = arguments.length-1; i >= 0; i--) {
    this.set(arguments[i]);
  }
};

Options.prototype.set = function(opts) {
  for (var key in opts) {
    this[key] = this.opts[key] = opts[key];
  }
};

module.exports = Options;

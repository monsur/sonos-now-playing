var Screensaver = function(timeout, callback) {
  this.timeout = timeout || 900000;
  this.callback = callback || function() {};
  this.currentId = null;
};

Screensaver.sleep = function() {
  document.getElementById('content').style.display = 'none';
  document.body.style.backgroundImage = 'none';
};

Screensaver.prototype.start = function() {
  if (this.currentId) {
    clearTimeout(this.currentId);
    this.currentId = null;
  }
  var that = this;
  this.currentId = setTimeout(function() {
    that.callback();
  }, this.timeout);
};


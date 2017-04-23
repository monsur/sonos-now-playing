var PhotosController = function() {
  this.timeoutId = null;
};

PhotosController.prototype.start = function() {
  this.getPhoto();
};

PhotosController.prototype.stop = function() {
  if (this.timeoutId) {
    clearInterval(this.timeoutId);
  }
};

PhotosController.prototype.getPhoto = function() {
  var that = this;
  document.getElementById('photoSrc').src = 'http://localhost:8080/photo?' + Math.floor(Math.random() * 1000000);
  this.timeoutId = setTimeout(function() {
    that.getPhoto();
  }, 5000);
};
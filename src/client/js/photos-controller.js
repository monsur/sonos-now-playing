var PhotosController = function() {
  this.timeoutId = null;
  this.elem = document.getElementById('imageContent');
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
  this.elem.className = 'fadeOut';
  setTimeout(function() {
    that.elem.src = '';
    that.elem.src = 'http://localhost:8080/photo?' + Math.floor(Math.random() * 1000000);
    that.elem.className = "";
    that.timeoutId = setTimeout(function() {
        that.getPhoto();
      }, 5000);
    }, 800);
};

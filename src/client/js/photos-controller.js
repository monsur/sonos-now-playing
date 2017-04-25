var PhotosController = function() {
  this.timeoutId = null;
  this.cache = [];
  this.cachePos = 0;
  this.showPos = 0;
  this.elem = document.getElementById('imageContent');
};

PhotosController.prototype.start = function() {
  this.getPhoto();
  this.showPhoto();
};

PhotosController.prototype.stop = function() {
  if (this.timeoutId) {
    clearInterval(this.timeoutId);
  }
};

PhotosController.prototype.showPhoto = function() {
  var that = this;
  this.elem.className = 'fadeOut';
  setTimeout(function() {
    that.elem.src = '';
    that.elem.src = that.cache[that.showPos++ % 2].src;
    that.elem.className = "";
    that.getPhoto();
    that.timeoutId = setTimeout(function() {
        that.showPhoto();
      }, 5000);
    }, 600);
};

PhotosController.prototype.getPhoto = function() {
  var img = new Image();
  img.src = 'http://localhost:8080/photo?' + Math.floor(Math.random() * 1000000);
  this.cache[this.cachePos++ % 2] = img;
};
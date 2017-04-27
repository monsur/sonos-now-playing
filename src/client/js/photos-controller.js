var PhotosController = function() {
  this.timeoutId = null;
  this.pos = 0;
  this.elem = [];
  this.elem[0] = document.getElementById('slideshow0');
  this.elem[1] = document.getElementById('slideshow1');
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
  if (this.elem[0].className == 'on') {
    this.elem[0].className = 'off';
    this.elem[1].className = 'on';
  } else {
    this.elem[0].className = 'on';
    this.elem[1].className = 'off';
  }
  var that = this;
  setTimeout(function() {
    that.getPhoto();
    that.timeoutId = setTimeout(function() {
      that.showPhoto();
    }, 6000);
  }, 1100);
};

PhotosController.prototype.getPhoto = function() {
  this.elem[this.pos++ % 2].src = 'http://localhost:8080/photo?' + Math.floor(Math.random() * 1000000);
};
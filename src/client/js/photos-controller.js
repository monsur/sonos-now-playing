var PhotosController = function() {
  var that = this;
  this.timeoutId = null;

  var handler = function(event) {
    that.transitionendHandler(event);
  };

  this.elem = [];
  for (var i = 0; i < 2; i++) {
    var img = document.createElement('img');
    img.id = 'slideshow' + i;
    img.className = i === 0 ? 'off' : 'on';
    img.addEventListener('transitionend', handler, false);
    this.elem.push(img);
    document.getElementById('slideshow').appendChild(img);
  }
};

PhotosController.prototype.start = function() {
  for (var i = 0; i < this.elem.length; i++) {
    var img = this.elem[i];
    img.className = img.className == 'on' ? 'off' : 'on';
  }
  var that = this;
  this.timeoutId = setTimeout(function() {
    that.start();
  }, 6000);
};

PhotosController.prototype.stop = function() {
  if (this.timeoutId) {
    clearInterval(this.timeoutId);
  }
};

PhotosController.prototype.transitionendHandler = function(event) {
  if (event.target.className == 'off') {
    event.target.src = getPhotoUrl();
  }
};

var getPhotoUrl = function() {
  return '/photo?' + Math.floor(Math.random() * 1000000);
};

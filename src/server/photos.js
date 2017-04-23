var https = require('https');
var fs = require('fs');
var url = require('url');
var Flickr = require("flickrapi");

var Photos = function(opts) {
  this.options =  {
    api_key: opts.flickrApiKey,
    secret: opts.flickrSecret,
    user_id: opts.flickrUserId, 
    access_token: opts.flickrAccessToken, 
    access_token_secret: opts.flickrAccessTokenSecret,
    progress: false
  };
  this.flickr = null;
  this.photos = [];
  this.pos = 0;
};

Photos.prototype.init = function() {
  var that = this;
  Flickr.authenticate(this.options, function(err, flickr) {
    if (err) {
      return console.log(err);
    }
    that.flickr = flickr;
    that.reloadPhotos();
  });
};

Photos.prototype.reloadPhotos = function(callback) {
  var that = this;
  that.getAllPhotos(function(photos) {
    that.photos = photos;
    if (callback) {
      callback(photos);
    }
  });
};

Photos.prototype.getAllPhotos = function(callback) {
  var photos = [];
  var that = this;
  var innerCallback = function(err, result) {
    if (err) return console.log(err);
    var page = result.photos.page;
    var pages = result.photos.pages;
    for (var i = 0; i < result.photos.photo.length; i++) {
      var photoUrl = getPhotoUrl(result.photos.photo[i]);
      photos.push(photoUrl);
    }
    if (page < pages) {
      that.getPhotos(page+1, innerCallback);
    } else {
      shuffle(photos);
      callback(photos);
    }
  };
  that.getPhotos(1, innerCallback);
};

Photos.prototype.getPhotos = function(page, callback) {
  this.flickr.people.getPhotos({
    api_key: this.options.api_key,
    user_id: this.options.user_id,
    authenticated: true,
    page: page,
    per_page: 500
  }, callback);
};

Photos.prototype.nextPhoto = function(res) {
  if (this.pos >= this.photos.length) {
    // TODO: Reload photos.
  }
  var photo = this.photos[this.pos++];
  var filename = getPhotoFilename(photo);
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  if (!fs.existsSync(filename)) {
    https.get(photo, function (clientRes) {
      var fileStream = fs.createWriteStream(filename);
      clientRes.on('data', function(chunk) {
        fileStream.write(chunk);
        res.write(chunk);
      });
      clientRes.on('end', function() {
        res.end();
        console.log('writing image to ' + filename);
      });
    });
  } else {
    console.log('reading image from ' + filename);
    fs.createReadStream(filename).pipe(res);
  }
};

var getPhotoFilename = function(photo) {
  var photoPath = url.parse(photo).pathname;
  return 'photocache/' + photoPath.substring(photoPath.lastIndexOf('/') + 1);
};

var getPhotoUrl = function(photo) {
  return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server +
         '/' + photo.id + '_' + photo.secret + '_b.jpg';
};

var shuffle = function(input) {
  for (var i = 0; i < input.length; i++) {
    var rand = Math.floor(Math.random() * input.length);
    var temp = input[i];
    input[i] = input[rand];
    input[rand] = temp;
  }
  return input;
};

module.exports = Photos;

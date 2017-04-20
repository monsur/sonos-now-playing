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
};

Photos.prototype.init = function() {
  var that = this;
  Flickr.authenticate(this.options, function(err, flickr) {
    if (err) {
      return console.log(err);
    }
    that.flickr = flickr;

    that.getAllPhotos(flickr, function(photos) {
      that.photos = photos;
      console.log(JSON.stringify(photos, null, 2));
    });
  });
};

Photos.prototype.getAllPhotos = function(flickr, callback) {
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
      that.getPhotos(flickr, page+1, innerCallback);
    } else {
      shuffle(photos);
      callback(photos);
    }
  };
  that.getPhotos(flickr, 1, innerCallback);
};

Photos.prototype.getPhotos = function(flickr, page, callback) {
  flickr.people.getPhotos({
    api_key: this.options.api_key,
    user_id: this.options.user_id,
    authenticated: true,
    page: page,
    per_page: 500
  }, callback);
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

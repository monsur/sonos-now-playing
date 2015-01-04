var assert = require('assert');
var SonosController = require('../../src/server/sonos-controller');

describe('subscribe', function() {
  it('Throws an error if there is no callback url', function() {
    var s = new SonosController();
    try {
      s.subscribe();
    } catch (e) {
      // expected
      return;
    }
    throw new Error('Expected an error.');
  });

  it('Verifies the correct callback header', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      assert.equal('<foo>', options.headers['CALLBACK']);
    };
    s.subscribe('foo');
  });

  it('Processes an error', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      callback({msg: 'ERROR'}, null);
    };
    s.subscribe('foo', function(error, res) {
      assert.equal('ERROR', error.msg);
    });
  });
});

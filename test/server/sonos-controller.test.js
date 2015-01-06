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
    s.subscribeInternal = function(headers, callback) {
      assert.equal('<foo>', headers.CALLBACK);
    };
    s.subscribe('foo');
  });
});

describe('subscribeInternal', function() {
  it('Processes an error', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      callback({msg: 'ERROR'}, null);
    };
    s.subscribe('foo', function(error, res) {
      assert.equal('ERROR', error.msg);
    });
  });

  it('Returns a valid response', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      callback(null, {
        headers: {
          sid: '123',
          timeout: 'Second-456'
        }
      });
    };
    s.subscribe('foo', function(error, res) {
      assert.equal(res.sid, '123');
      assert.equal(res.timeout, '456');
    });
  });

  it('Returns a valid response with NaN timeout', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      callback(null, {
        headers: {
          sid: '123',
          timeout: 'foo'
        }
      });
    };
    s.subscribe('foo', function(error, res) {
      assert.equal(res.sid, '123');
      assert.ok(!('timeout' in res));
    });
  });

  it('Returns a valid response with empty timeout', function() {
    var s = new SonosController();
    s.makeRequest = function(options, callback) {
      callback(null, {
        headers: {
          sid: '123',
          timeout: ''
        }
      });
    };
    s.subscribe('foo', function(error, res) {
      assert.equal(res.sid, '123');
      assert.ok(!('timeout' in res));
    });
  });
});

describe('makeRequest', function() {
  it('Checks the request options', function() {
    var s = new SonosController('1.2.3.4', null,
      function(options, callback) {
        assert.equal('1.2.3.4', options.hostname);
        assert.equal('1400', options.port);
        assert.equal('bar', options.foo);
      }
    );
    s.makeRequest({'foo': 'bar'}, function(res) {});
  });

  it('Sends a valid response', function() {
    var s = new SonosController('1.2.3.4', null,
      function(options, callback) {
        callback({
          statusCode: 200,
          foo: 'bar'
        });
      }
    );
    s.makeRequest({}, function(error, res) {
      assert.ok(!error);
      assert.equal('bar', res.foo);
    });
  });

  it('Sends a 501 response', function() {
    var s = new SonosController('1.2.3.4', null,
      function(options, callback) {
        callback({
          statusCode: 501,
          headers: {
            'foo': 'bar'
          }
        });
      }
    );
    s.makeRequest({}, function(error, res) {
      assert.ok(!res);
      assert.equal(501, error.statusCode);
      assert.equal('Unable to accept renewal', error.msg);
      assert.equal('bar', error.headers.foo);
    });
  });

  it('Sends a 400 response', function() {
    var s = new SonosController('1.2.3.4', null,
      function(options, callback) {
        callback({
          statusCode: 400,
          headers: {
            'foo': 'bar'
          }
        });
      }
    );
    s.makeRequest({}, function(error, res) {
      assert.ok(!res);
      assert.equal(400, error.statusCode);
      assert.equal('Incompatible header fields', error.msg);
      assert.equal('bar', error.headers.foo);
    });
  });

  it('Sends a 401 response', function() {
    var s = new SonosController('1.2.3.4', null,
      function(options, callback) {
        callback({
          statusCode: 401,
          headers: {
            'foo': 'bar'
          }
        });
      }
    );
    s.makeRequest({}, function(error, res) {
      assert.ok(!res);
      assert.ok(!error.msg);
      assert.equal(401, error.statusCode);
      assert.equal('bar', error.headers.foo);
    });
  });

});

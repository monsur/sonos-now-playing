var assert = require('assert');
var Event = require('../../../src/server/sonos/event');

describe('parse timeout header', function() {
  it('is a valid timeout header', function() {
    var timeout = Event.parseTimeout('Second-1');
    assert.equal(timeout, 1);
  });

  it('is not a valid timeout number', function() {
    var timeout = Event.parseTimeout('Timeout-1');
    assert.equal(timeout, Event.DEFAULT_TIMEOUT);
  });

  it('is not a valid timeout header', function() {
    var timeout = Event.parseTimeout('Timeout');
    assert.equal(timeout, Event.DEFAULT_TIMEOUT);
  });
});

describe('parse http error', function() {
  it('is a successful http response', function() {
    var res = {
      statusCode: 200
    };
    var error = Event.parseHttpError(res);
    assert.equal(error, null);
  });

  it('is a 400 error response', function() {
    var res = {
      statusCode: 400,
      headers: []
    };
    var error = Event.parseHttpError(res);
    assert.equal(error.message, 'Incompatible header fields');
    assert.equal(error.details.statusCode, 400);
    assert.ok('headers' in error.details);
  });

  it('is a 500 error response', function() {
    var res = {
      statusCode: 501
    };
    var error = Event.parseHttpError(res);
    assert.equal(error.message, 'Unable to accept renewal');
  });

  it('is an unknown error response', function() {
    var res = {
      statusCode: 1
    };
    var error = Event.parseHttpError(res);
    assert.equal(error.message, 'HTTP status code 1');
  });
});

/*
describe('subscribe', function() {
  it('Throws an error if there is no callback url', function() {
    var s = new SonosController('1.2.3.4');
    s.subscribe(null, function(error, data) {
      assert.ok(error);
      assert.ok(!data);
    });
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

describe('renew', function() {
  it('No SID', function() {
    var s = new SonosController('1.2.3.4');
    s.renew(null, null, function(error, data) {
      assert.ok(error);
      assert.ok(!data);
    });
  });

  it('Timeout is not a number', function() {
    var s = new SonosController('1.2.3.4');
    s.renew('1', 'foo', function(error, data) {
      assert.ok(error);
      assert.ok(!data);
    });
  });

  it('No timeout specified', function() {
    var s = new SonosController('1.2.3.4');
    s.subscribeInternal = function(headers, callback) {
      assert.equal('Second-43200000', headers.TIMEOUT);
      callback('ok');
    };
    s.renew('1', function(ok) {
      //assert.equal(ok === 'ok');
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
      assert.equal('Unable to accept renewal', error.message);
      assert.equal(501, error.details.statusCode);
      assert.equal('bar', error.details.headers.foo);
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
      assert.equal('Incompatible header fields', error.message);
      assert.equal(400, error.details.statusCode);
      assert.equal('bar', error.details.headers.foo);
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
      assert.equal('HTTP status code 401', error.message);
      assert.equal(401, error.details.statusCode);
      assert.equal('bar', error.details.headers.foo);
    });
  });
});
*/


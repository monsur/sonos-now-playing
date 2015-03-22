var assert = require('assert');
var Event = require('../../../src/server/sonos/event');

describe('parse timeout header', function() {
  var event = new Event();
  it('is a valid timeout header', function() {
    var timeout = event.parseTimeout('Second-1');
    assert.equal(timeout, 1);
  });

  it('invalid timeout number returns default', function() {
    var timeout = event.parseTimeout('Timeout-1');
    assert.equal(timeout, 43200);
  });

  it('invalid timeout header returns default', function() {
    var timeout = event.parseTimeout('Timeout');
    assert.equal(timeout, 43200);
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

describe('creating an Event', function() {
  it('creates a new empty Event', function() {
    var event = new Event();
    assert.equal(event.sid, null);
    assert.equal(event.timeout, 43200);
    assert.equal(event.timeoutId, null);
  });
});

describe('Event request', function() {
  it('checks the speaker options', function() {
    var event = new Event({
        'speakerIp': '1.2.3.4',
        'port': 80,
        'path': '/foo/bar'});
    Event.request = function(options, successCallback, errorCallback) {
      assert.equal(options.hostname, '1.2.3.4');
      assert.equal(options.port, 80);
      assert.equal(options.path, '/foo/bar');
    };
    event.request();
  });

  it('recieves an error response', function() {
    var event = new Event({
        'speakerIp': '1.2.3.4',
        'port': 80,
        'path': '/foo/bar'});
    Event.request = function(options, successCallback, errorCallback) {
      successCallback({statusCode: 512});
    };
    event.request({}, function(error, res) {
      assert.ok(error !== null);
      assert.ok(res === null);
    });
  });

  it('recieves a successful response', function() {
    var event = new Event({
        'speakerIp': '1.2.3.4',
        'port': 80,
        'path': '/foo/bar'});
    Event.request = function(options, successCallback, errorCallback) {
      successCallback({statusCode: 200});
    };
    event.request({}, function(error, res) {
      assert.ok(error === null);
      assert.ok(res !== null);
    });
  });

  it('recieves an error', function() {
    var event = new Event({
        'speakerIp': '1.2.3.4',
        'port': 80,
        'path': '/foo/bar'});
    Event.request = function(options, successCallback, errorCallback) {
      errorCallback({});
    };
    event.request({}, function(error, res) {
      assert.ok(error !== null);
      assert.ok(res === null);
    });
  });
});

describe('Unsubscribe', function() {
  it('has no SID', function() {
    var event = new Event();
    assert.throws(
      function() { event.unsubscribe(); },
      function(e) {
        if (e.message === 'Must specify a SID.') {
          return true;
        }
        return false;
      });
  });

  it('has valid http values', function() {
    var event = new Event();
    event.sid = '123';
    event.request = function(opts) {
      assert.equal(opts.method, 'UNSUBSCRIBE');
      assert.equal(opts.headers.SID, '123');
    };
    event.unsubscribe();
  });

  it('has an error when unsubscribing', function() {
    var event = new Event();
    event.sid = '123';
    event.request = function(opts, callback) {
      callback(new Error('Error'), null);
    };
    event.unsubscribe(function(err, data) {
      assert.equal(err.message, 'Error');
      assert.equal(data, null);
    });
  });

  it('successful unsubscribe request', function() {
    var event = new Event();
    event.sid = '123';
    event.timeoutId = '123tid';
    event.timeout = '123t';
    event.request = function(opts, callback) {
      callback(null, 'data');
    };
    Event.clearTimeout = function(timeoutId) {
      assert.equal(timeoutId, '123tid');
    };
    event.unsubscribe(function(err, data) {
      assert.equal(err, null);
      assert.equal(event.sid, null);
      assert.equal(event.timeout, null);
      assert.equal(event.timeoutId, null);
      assert.equal(data, 'data');
    });
  });
});

describe('subscribe internal', function() {
  it('validate http details', function() {
    var event = new Event();
    event.request = function(options, callback) {
      assert.equal(options.method, 'SUBSCRIBE');
      assert.equal(options.headers.Foo, 'Bar');
    };
    event.subscribeInternal({'Foo': 'Bar'});
  });

  it('has an error', function() {
    var event = new Event();
    event.request = function(options, callback) {
      callback(new Error('Expected'), null);
    };
    event.subscribeInternal({}, function(error, data) {
      assert.equal(error.message, 'Expected');
      assert.equal(data, null);
    });
  });

  it('has sid and timeout, no renew', function() {
    var event = new Event({'autoRenew': false});
    event.request = function(options, callback) {
      callback(null, {'headers': {
        'sid': '123',
        'timeout': 'Second-1'
      }});
    };
    Event.setTimeout = function(callback, timeout) {
      throw new Error('setTimeout should not be called');
    };
    event.subscribeInternal({}, function(error, data) {
      assert.equal(error, null);
      assert.equal(data.sid, '123');
      assert.equal(data.timeout, 1);
    });
  });

  it('has sid and timeout, with renew', function() {
    var event = new Event();
    event.request = function(options, callback) {
      callback(null, {'headers': {
        'sid': '123',
        'timeout': 'Second-1'
      }});
    };
    event.renew = function() {
      // TODO: Validate that renew is actually called.
    };
    Event.setTimeout = function(callback, timeout) {
      assert.equal(timeout, 1000);
      callback();
    };
    event.subscribeInternal({}, function(error, data) {
      assert.equal(error, null);
      assert.equal(data.sid, '123');
      assert.equal(data.timeout, 1);
    });
  });

  it('has sid and default timeout, with renew', function() {
    var event = new Event();
    event.request = function(options, callback) {
      callback(null, {'headers': {
        'sid': '123',
        'timeout': 'INVALID'
      }});
    };
    Event.setTimeout = function(callback, timeout) {
      assert.equal(timeout, 43200000);
    };
    event.subscribeInternal({}, function(error, data) {
      assert.equal(error, null);
      assert.equal(data.sid, '123');
      assert.equal(data.timeout, 43200);
    });
  });
});

describe('renew subscription', function() {
  it('no sid throws an error', function() {
    var event = new Event();
    assert.throws(event.renew,
      function(e) {
        if (e.message === 'Must specify a SID.') {
          return true;
        }
        return false;
      }
    );
  });

  it('renew calls subscribeInternal', function() {
    var event = new Event();
    event.sid = '123';
    event.timeout = 456;
    event.subscribeInternal = function(headers, callback) {
      assert.equal(headers.SID, '123');
      assert.equal(headers.TIMEOUT, 'Second-456');
    };
    event.renew();
  });
});

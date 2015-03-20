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

describe('creating an Event', function() {
  it('creates a new empty Event', function() {
    var event = new Event();
    assert.equal(event.sid, null);
    assert.equal(event.timeout, 43200);
    assert.equal(event.timeoutId, null);
  });
});


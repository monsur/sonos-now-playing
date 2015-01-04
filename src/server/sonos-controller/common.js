module.exports = {
  SUBSCRIBE_METHOD: 'SUBSCRIBE',

  EVENT_PATH: '/MediaRenderer/AVTransport/Event',

  getError: function(res) {
    var status = res.statusCode;
    if (status === 200) {
      return null;
    }

    var msg;
    if (status === 400) {
      msg = 'Incompatible header fields';
    } else if (status === 412) {
      msg = 'Precondition failed';
    } else if (status >= 500) {
      msg = 'Unable to accept renewal';
    }

    var error = {};
    error.msg = msg;
    error.statusCode = status;
    return error;
  }
};

var pad = function(p, v) {
  v = v + '';
  var padLength = p - v.length;
  return padLength > -1 ? Array(padLength + 1).join('0') + v : v;
};

var getFormatFunctions = function(utc) {
  var getf = function(name, padding) {
    return function(d) {
      var val = d[name]();
      return padding ? pad(padding, val) : val;
    };
  };
  var utcStr = utc ? 'UTC' : '';
  return {
    '%D': getf('to' + utcStr + 'String'),
    '%Y': getf('get' + utcStr + 'FullYear'),
    '%m': function(d) { return pad(2, d['get' + utcStr + 'Month']() + 1); },
    '%d': getf('get' + utcStr + 'Date', 2),
    '%H': getf('get' + utcStr + 'Hours', 2),
    '%M': getf('get' + utcStr + 'Minutes', 2),
    '%S': getf('get' + utcStr + 'Seconds', 2),
    '%f': getf('get' + utcStr + 'Milliseconds', 3),
    '%%': function() { return '%'; },
    '%L': function(d, l, a) { return l.toUpperCase(); },
    '%l': function(d, l, a) { return l.toLowerCase(); },
    '%a': function(d, l, a) { return a; }
  };
};

var Logger = exports.Logger = function(level, options) {
  var getBooleanValue = function(val, default_val) {
    return (val === true || val === false) ? val : default_val;
  };
  this.level(level || 'info');
  options = options || {};
  options.enabled = getBooleanValue(options.enabled, true);
  options.color = getBooleanValue(options.color, true);
  options.format = options.format || '%Y-%m-%d %H:%M:%S.%f %l: %a';
  options.writer = options.writer || console.log;
  this.options = options;
  this.formatFunctions = getFormatFunctions(getBooleanValue(options.utc, false));
};

Logger.LOG_LEVELS = {
  'DEBUG': {value: 10, color: '\033[34m'},
  'INFO': {value: 20},
  'WARN': {value: 30, color: '\033[33m'},
  'ERROR': {value: 40, color: '\033[31m'}
};

Logger.prototype.enable = function() {
    this.options.enabled = true;
    return this;
  };

Logger.prototype.disable = function() {
  this.options.enabled = false;
  return this;
};

Logger.prototype.level = function(opt_level) {
  if (opt_level) this.level_key = opt_level.toUpperCase();
  return this.level_key;
};

Logger.prototype.log = function(level, msg) {
  if (!this.options.enabled) return this;
  var msg_val = Logger.LOG_LEVELS[level.toUpperCase()];
  var log_val = Logger.LOG_LEVELS[this.level_key.toUpperCase()];
  if (msg_val.value < log_val.value) return this;
  var date = new Date();
  var formattedMsg = this.options.format;
  // http://jsperf.com/multiple-string-replace/2
  for (var format in this.formatFunctions) {
    if (formattedMsg.indexOf(format) > -1) {
      formattedMsg = formattedMsg.replace(format,
          this.formatFunctions[format].call({}, date, level, msg));
    }
  }
  if (this.options.color && msg_val.color) {
    formattedMsg = msg_val.color + formattedMsg + '\033[0m';
  }
  var writer = msg_val.writer || this.options.writer;
  var args = [].splice.call(arguments, 0).splice(2);
  args.unshift(formattedMsg);
  writer.apply(this, args);
  return this;
};

for (var level in Logger.LOG_LEVELS) {
  (function(level) {
    Logger.prototype[level.toLowerCase()] = function(msg) {
      var args = [].splice.call(arguments, 0);
      args.unshift(level);
      return this.log.apply(this, args);
    };
  })(level);
}

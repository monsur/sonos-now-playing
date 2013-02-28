var pad = function(p, v) {
  p--;
  while (p > 0) {
    if (v < (10^p)) {
      v = '0' + v;
    }
    p--;
  }
  return v + '';
};

var getDateFunctions = function(utc) {

  var getf = function(name, padding) {
    return function(d) {
      var val = d[name].call(d);
      if (padding) {
        val = pad(padding, val);
      }
      return val;
    }
  };

  var utcStr = utc ? 'UTC' : '';

  return {
    '%D': getf('to' + utcStr + 'String'),
    '%Y': getf('get' + utcStr + 'FullYear'),
    '%m': function(d) { return pad(2, d.getMonth() + 1); },
    '%d': getf('get' + utcStr + 'Date', 2),
    '%H': getf('get' + utcStr + 'Hours', 2),
    '%M': getf('get' + utcStr + 'Minutes', 2),
    '%S': getf('get' + utcStr + 'Seconds', 2),
    '%f': getf('get' + utcStr + 'Milliseconds', 3),
  }
};

var Logger = exports.Logger = function(level, options) {
  this.level(level || 'info');

  options = options || {};
  options.color = 'color' in options ? options.color : true;
  options.utc = 'utc' in options ? options.utc : false;
  options.format = options.format || '%Y-%m-%d %H:%M:%S.%f %l: %a';
  options.writer = options.writer || console.log;
  this.options = options;

  this.dateFunctions = getDateFunctions(this.options.utc);
};

Logger.LOG_LEVELS = {
  'DEBUG': {value: 10, color: '\033[34m'},
  'INFO': {value: 20},
  'WARN': {value: 30, color: '\033[33m'},
  'ERROR': {value: 40, color: '\033[31m'}
};

Logger.prototype.level = function(opt_level) {
  if (opt_level) {
    this.level_key = opt_level.toUpperCase();
  }
  return this.level_key;
};

Logger.prototype.log = function(level, msg) {
  var msg_val = Logger.LOG_LEVELS[level.toUpperCase()];
  var log_val = Logger.LOG_LEVELS[this.level_key.toUpperCase()];
  var date = new Date();
  var msg_ = this.options.format;
  for (var format in this.dateFunctions) {
    if (msg_.indexOf(format) > -1) {
      var result = this.dateFunctions[format].call({}, date);
      msg_ = msg_.replace(format, result);
    }
  }
  msg_ = msg_.replace('%l', level).replace('%a', msg);
  if (this.options.color && msg_val.color) {
    msg_ = msg_val.color + msg_ + '\033[0m';
  }
  if (msg_val.value >= log_val.value) {
    var writer = msg_val['writer'] || this.options.writer;
    writer(msg_);
  }
  return {
    date: date,
    level: level,
    message: msg,
    formattedMessage: msg_
  };
};

for (var level in Logger.LOG_LEVELS) {
  (function(level) {
    Logger.prototype[level.toLowerCase()] = function(msg) {
      return this.log(level, msg);
    };
  })(level);
}

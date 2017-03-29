var config = require('./config');

module.exports = function(text) {
  if(config.debugMode) {
    console.log('DEBUG >> ' + text);
  }
}

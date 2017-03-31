// Snake.io - debug.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
// Gabriele Giuli, All rights reserved

var config = require('./config');

module.exports = function(text) {
  if(config.debugMode) {
    console.log('DEBUG >> ' + text);
  }
}

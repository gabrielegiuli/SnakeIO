// Snake.io - snake.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
// Gabriele Giuli, All rights reserved

var UP_CODE = 38;
var DOWN_CODE= 40;
var LEFT_CODE = 37;
var RIGHT_CODE = 39;
var NONE_CODE = -1;

var Part = require('./part');
var config = require('../config');
var debugPrint = require('../debug');

class Snake {
  constructor(x, y) {
    this.firstPart = new Part(x, y);
    this.x = x;
    this.y = y;
    this.ammo = 0;
    this.direction = NONE_CODE;
    this.score = 0;
  }

  update() {
    var size = this.firstPart.size;

    switch(this.direction) {
      case UP_CODE:
        this.y -= size;
        break;
      case DOWN_CODE:
        this.y += size;
        break;
      case LEFT_CODE:
        this.x -= size;
        break;
      case RIGHT_CODE:
        this.x += size;
        break;
    }

    if(this.x < 5) {
      this.x = config.window.width - 5;
    } else if(this.x > config.window.width - 5) {
      this.x = 5;
    }

    if(this.y < 5) {
      this.y = config.window.height - 5;
    } else if(this.y > config.window.height - 5) {
      this.y = 5;
    }

    debugPrint(this.x);

    this.firstPart.updatePosition(this.x, this.y);
  }

  updateDirection(code) {
    if(code == UP_CODE || code == DOWN_CODE || code == LEFT_CODE || code == RIGHT_CODE) {
      //this.direction = code;


      if(code == UP_CODE && this.direction != DOWN_CODE) {
        this.direction = code;
      } else if(code == DOWN_CODE && this.direction != UP_CODE) {
        this.direction = code;
      } else if(code == RIGHT_CODE && this.direction != LEFT_CODE) {
        this.direction = code;
      } else if(code == LEFT_CODE && this.direction != RIGHT_CODE) {
        this.direction = code;
      }

      //console.log('Direction: ' + this.direction);

    } else if(code == 83 && config.debugMode) { //'s'
      this.scored();
    } else if(code == 82 && config.debugMode) { //'r'
      this.resetToSingle();
    } else if(code == 65 && config.debugMode) { //'a'
      this.removeLastPart();
    }
  }

  summonPart() {
    var partPosition = this.firstPart.getPosition();
    var nx;
    var ny;

    var size = this.firstPart.size;

    switch(this.direction) {
      case UP_CODE:
        ny = partPosition.y + size;
        break;
      case DOWN_CODE:
        ny = partPosition.y - size;
        break;
      case LEFT_CODE:
         nx = partPosition.x + size;;
        break;
      case RIGHT_CODE:
        ny = partPosition.x - size;
        break;
    }

    this.firstPart.appendPart(new Part(nx, ny));
  }

  getLength() {
    return this.firstPart.countLength(1);
  }

  removeLastPart() {
    let length = this.getLength();
    if(length > 1) {
      this.score --;
      this.firstPart.removePartAtIndex(length - 1);
    }
  }

  getPositions() {
    return this.firstPart.getPositions();
  }

  scored() {
    this.score ++;
    this.summonPart();
  }

  resetToSingle() {
    this.score -= this.getLength() - 1;
    this.firstPart.removePartAtIndex(1);
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  addAmmo() {
    this.ammo += this.getRandomInt(3, 5);
  }
}

module.exports = Snake;

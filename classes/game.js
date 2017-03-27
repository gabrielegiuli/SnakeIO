// Snake.io - game.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
// Gabriele Giuli, All rights reserved

var NONE_CODE = -1;

var Snake = require('./snake');
var Bullet = require('./bullet');

class Game {
  constructor(sockets, callback) {
    this.active = true;
    this.callback = callback;
    this.sockets = sockets;
    this.snakes = [];
    this.bullets = [];
    this.agreed = [];
    this.ammoPositions = [];
    this.frameSize = { width: 600, height: 600};
    this.remainingTime = 180;
    var self = this;

    for(var i = 0; i < this.sockets.length; i++) {
      this.snakes[i] = new Snake(i*100 + 105, 205);
      this.agreed.push(false);
      let currentSnake = this.snakes[i];
      let currentSocket = this.sockets[i];
      var self = this;

      currentSocket.on('keyPressed', function(data) {
        if(data == 32 && currentSnake.direction != NONE_CODE && currentSnake.ammo > 0) {
          currentSnake.ammo --;
          self.bullets.push(new Bullet(currentSnake.x, currentSnake.y, currentSnake.direction));
        } else {
          currentSnake.updateDirection(data);
        }
      });
    }

    this.emit('timeUpdate', this.remainingTime);
    this.summonTarget();
    this.loopTimer = setInterval(function() { self.updateSnakes(); }, 100); //100
    this.bulletsUpdater = setInterval(function() { self.updateBullets(); }, 40);
    this.timeUpdater = setInterval(function() { self.updateTime(); }, 1000);
    this.ammoSpawner = setInterval(function() { self.summonAmmo(); }, 10000);
  }

  completelyAgreed() {
    console.log(this.agreed);
    for(var i = 0; i < this.agreed.length; i++) {
      if(!this.agreed[i]) {
        return false;
      }
    }
    return true;
  }

  enterStandbyMode() {
    this.active = false;
    for(var i = 0; i < this.sockets.length; i++) {
      let currentSocket = this.sockets[i];
      let currentAgreed = this.agreed[i];
      let index = i;
      let self = this;

      currentSocket.on('mousePressed', function(data) {
        self.agreed[index] = true;
        console.log(index)
        if(self.callback != null && self.completelyAgreed()) {
          self.callback();
        }
      });
    }
  }

  updateTime() {
    this.remainingTime--;

    if(this.remainingTime == 0) {
      this.endGame();
      this.emit('serverMessage', 'Time is over!');
      this.enterStandbyMode();
      return;
    }

    this.emit('timeUpdate', this.remainingTime);
  }

  emit(type, data) {
    for(var i = 0; i < this.sockets.length; i++) {
      this.sockets[i].emit(type, data);
    }
  }

  updateBullets() {
    for(var i = 0; i < this.bullets.length; i++) {
      if(this.bullets[i].x < 0 || this.bullets[i].x > this.frameSize.width || this.bullets[i].y < 0 || this.bullets[i].x > this.frameSize.height) {
        this.bullets.splice(i, 1);
      }
    }
    for(var i = 0; i < this.bullets.length && this.bullets[i]; i++) {
      this.bullets[i].update();

      for(var j = 0; j < this.snakes.length && this.bullets[i]; j++) {
        let positions = this.snakes[j].getPositions();

        for(var k = 0; k < positions.length && this.bullets[i]; k++) {
          if(this.bullets[i].x == positions[k].x && this.bullets[i].y == positions[k].y) {
            this.snakes[j].removeLastPart();
            this.bullets.splice(i, 1);
          }
        }
      }
    }
    this.emit('bulletsUpdate', this.bullets);
  }

  updateSnakes() {
    //loop1:
    for(var i = 0; i < this.snakes.length; i++) {
      this.snakes[i].update();
      if(this.snakes[i].firstPart.x == this.targetPosition.x && this.snakes[i].firstPart.y == this.targetPosition.y) {
        this.snakes[i].scored();
        this.summonTarget();
      }

      for(var j = 0; j < this.ammoPositions.length; j++) {
        if(this.snakes[i].firstPart.x == this.ammoPositions[j].x && this.snakes[i].firstPart.y == this.ammoPositions[j].y) {
          this.ammoPositions.splice(j, 1);
          this.snakes[i].addAmmo();
        }
      }

      var positions = this.snakes[i].getPositions();
      //loop2:
      for(var j = 0; j < positions.length; j++) {
        //loop3:
        for(var k = 0; k < positions.length; k++) {
          if(j != k) {
            if(positions[j].x == positions[k].x && positions[j].y == positions[k].y) {
              this.snakes[i].resetToSingle();
            }
          }
        }
      }
    }

    for(var i = 0; i < this.sockets.length; i++) {
      let enemySnakes = [];
      let friendSnake = { positions: this.snakes[i].getPositions(), score: this.snakes[i].score };
      for(var j = 0; j < this.sockets.length; j++) {
        if(i != j) {
          enemySnakes.push({ positions: this.snakes[j].getPositions(), score: this.snakes[j].score });
        }
      }
      this.sockets[i].emit('updateSnakes', {
        friend : friendSnake,
        enemies: enemySnakes,
        target: this.targetPosition,
        remainingTime: this.remainingTime,
        bullets: this.bullets,
        ammos: this.ammoPositions,
        ammoQuantity: this.snakes[i].ammo
      });
    }
  }

  endGame() {
    clearInterval(this.bulletsUpdater);
    clearInterval(this.timeUpdater);
    clearInterval(this.loopTimer);
    clearInterval(this.ammoSpawner);
    this.active = false;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  summonAmmo() {
    var rawPosition;
    var ok;

    do {
      ok = true;
      rawPosition = { x: (this.getRandomInt(0, 60) * 10) + 5, y: (this.getRandomInt(0, 60) * 10) + 5 };

      for(var i = 0; i < this.snakes.length; i++) {
        let positions = this.snakes[i].getPositions();
        for(var j = 0; j < positions.length; j++) {
          if(positions[j].x == rawPosition.x && positions[j].y == rawPosition.y) {
            ok = false;
          }
        }
      }

      if(this.targetPosition != null) {
        if(this.targetPosition.x == rawPosition.x && this.targetPosition.y == rawPosition.y) {
          ok = false;
        }
      }

      for(var i = 0; i < this.ammoPositions.length; i++) {
        let position = this.ammoPositions[i];

        if(position.x == rawPosition.x && position.y == rawPosition.x) {
          ok = false;
        }
      }
      console.log('LOOP');
    } while(!ok);

    this.ammoPositions.push(rawPosition);
  }

  summonTarget() {
    var rawPosition;
    var ok; //Once was var ok = true; (CHANGE IN CASE OF MISBEHAVIOUR)

    do {
      ok = true;
      rawPosition = { x: (this.getRandomInt(0, 60) * 10) + 5, y: (this.getRandomInt(0, 60) * 10) + 5 };
      //rawPosition = { x: (this.getRandomInt(9, 13) * 10) + 5, y: 205 };
      for(var i = 0; i < this.snakes.length; i++) {
        let positions = this.snakes[i].getPositions();
        for(var j = 0; j < positions.length; j++) {
          if(positions[j].x == rawPosition.x && positions[j].y == rawPosition.y) {
            ok = false;
          }
        }
      }
    } while(!ok);

    this.targetPosition = rawPosition;
    console.log('New Target: ' + this.targetPosition.x + " " + this.targetPosition.y);
  }
}

module.exports = Game;

// Snake.io - part.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
//Gabriele Giuli, All rights reserved

class Part {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
  }

  updatePosition(x, y) {
    if(this.followingPart) {
      this.followingPart.updatePosition(this.x, this.y);
    }
    this.x = x;
    this.y = y;
  }

  appendPart(part) {
    if(!this.followingPart) {
      this.followingPart = part;
    } else {
      this.followingPart.appendPart(part);
    }
  }

  getPosition() {
    if(!this.followingPart) {
      return { x : this.x, y : this.y };
    } else {
      return this.followingPart.getPosition();
    }
  }

  getPositions() {
    var positions = [{ x : this.x, y : this.y }];
    if(!this.followingPart) {
      return positions;
    } else {
      return this.followingPart.processPositions(positions);
    }
  }

  processPositions(prev) {
    var pos = prev;
    pos.push({ x : this.x, y : this.y });
    if(!this.followingPart) {
      return pos;
    } else {
      return this.followingPart.processPositions(pos);
    }
  }

  countLength(number) {
    if(!this.followingPart) {
      return number;
    } else {
      return this.followingPart.countLength(number + 1);
    }
  }

  removePartAtIndex(index) {
    if(index == 1) {
      this.followingPart = null;
    } else if(index - 1 >= 0) {
      this.followingPart.removePartAtIndex(index - 1);
    }
  }
}

module.exports = Part;

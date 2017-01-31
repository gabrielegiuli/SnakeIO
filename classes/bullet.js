var UP_CODE = 38;
var DOWN_CODE= 40;
var LEFT_CODE = 37;
var RIGHT_CODE = 39;
var NONE_CODE = -1;

class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.update();
  }

  update() {
    switch(this.direction) {
      case UP_CODE:
        this.y -= 10;
        break;
      case DOWN_CODE:
        this.y += 10;
        break;
      case LEFT_CODE:
        this.x -= 10;
        break;
      case RIGHT_CODE:
        this.x += 10;
        break;
    }
  }
}

module.exports = Bullet;

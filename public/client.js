// Snake.io - client.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
//Gabriele Giuli, All rights reserved

var socket;
var frameSize = { width: 600, height: 600 }

var UP_CODE = 38;
var DOWN_CODE= 40;
var LEFT_CODE = 37;
var RIGHT_CODE = 39;
var NONE_CODE = -1;

var rawTime = 600;
var bullets = [];
var snakesData;

var gameIsOn = false;

function setup() {
  let canvas = createCanvas(frameSize.width, frameSize.height);
  canvas.parent('sketch-holder');
  background(0);
  textAlign(CENTER);
  fill(255);
  text("Ciao GJGGJGJGJJGulia", 300, 300);
}

function draw() {

}

function keyPressed() {
  socket.emit('keyPressed', keyCode);
}

function mousePressed() {
  if(!gameIsOn) {
    background(0);
    textAlign(CENTER);
    fill(255);
    text("Looking for an opponent, please wait...", 300, 300);

    gameIsOn = true;

    socket = io();

    socket.on('timeUpdate', function(data) {
      rawTime = data;
      updateFrame();
    });

    socket.on('bulletsUpdate', function(data) {
      bullets = data;
      updateFrame();
    });

    socket.on('updateSnakes', function(data) {
      snakesData = data;
      updateFrame();
    });

    socket.on('serverMessage', function(data) {
      background(0);
      fill(255);
      textAlign(CENTER);
      text(data, 300, 300);
    });

  }
}

function updateFrame() {
  background(0);

  if(rawTime) {
    let time = parseTime(rawTime);
    print(time.minutes + " Bla " + time.seconds);
    printTime(time.minutes, time.seconds);
  }

  for(var i = 0; i < bullets.length; i++) {
    displayBullet(bullets[i]);
  }

  if(snakesData) {
    var friend = snakesData.friend;
    var enemies = snakesData.enemies;

    fill(0, 255, 0);
    noStroke();
    displaySnake(friend.positions);

    var enemyScores = [];

    for(var i = 0; i < enemies.length; i++) {
      fill(255, 0, 0);
      noStroke();
      displaySnake(enemies[i].positions);
      enemyScores.push(enemies[i].score);
    }

    displayScores(friend.score, enemyScores);
    displayTarget(snakesData.target);
  }
}

function displaySnake(positions) {
  let size = 10;

  for(var i = 0; i < positions.length; i++) {
    rectMode(CENTER);
    rect(positions[i].x, positions[i].y, size, size);
  }
}

function displayScores(friendScore, enemyScores) {
  fill(0, 255, 0);
  textAlign(CENTER);
  text(friendScore, 50, 50);

  var space = frameSize.width/(2*enemyScores.length);

  for(var i = 0; i < enemyScores.length; i++) {
    fill(255, 0, 0);
    textAlign(CENTER);
    text(enemyScores[i], frameSize.width - i*space - 50, 50);
  }
}

function displayTarget(position) {
  fill(0, 0, 255);
  rectMode(CENTER);
  rect(position.x, position.y, 10, 10);
}

function parseTime(raw) {
  var minutes = 0;
  var seconds = raw;

  while(seconds - 60 >= 0) {
    minutes++;
    seconds -= 60;
  }

  return { minutes: minutes, seconds: seconds };
}

function printTime(minutes, seconds) {
  fill(255, 255, 255);
  textAlign(CENTER);

  if(minutes < 10) {
    minutes = '0' + minutes;
  }
  if(seconds < 10) {
    seconds = '0' + seconds;
  }

  text(minutes + ':' + seconds, 300, 550);
}

function displayBullet(bullet) {
  fill(200, 200, 200);
  rectMode(CENTER);

  let direction = bullet.direction;

  let width;
  let height;

  if(direction == UP_CODE || direction == DOWN_CODE) {
    width = 5;
    height = 10;
  } else {
    width = 10;
    height = 5;
  }

  print(bullet.x + " " + bullet.y + " " + width + " " + height);
  rect(bullet.x, bullet.y, width , height);
}

/*
socket.on('update', function(data) {
  var friend = data.friend;
  var enemies = data.enemies;
  var time = parseTime(data.remainingTime);
  var bullets = data.bullets;

  background(0);

  fill(0, 255, 0);
  noStroke();
  displaySnake(friend.positions);

  var enemyScores = [];

  for(var i = 0; i < enemies.length; i++) {
    fill(255, 0, 0);
    noStroke();
    displaySnake(enemies[i].positions);
    enemyScores.push(enemies[i].score);
  }

  displayScores(friend.score, enemyScores);
  displayTarget(data.target);

  for(var i = 0; i < bullets.length; i++) {
    displayBullet(bullets[i]);
  }

  printTime(time.minutes, time.seconds);
});
*/

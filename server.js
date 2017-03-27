// Snake.io - server.js
//
// Simple online game that allows multiple players to play snake together,
// merging the classic arcade game with the concept of slither.io
//
// Gabriele Giuli, All rights reserved

var http = require('http');
var fs = require("fs");
var mime = require('mime-types');
var config = require('./config');

console.log('Starting server...');

function handleRequest(request, response) {
  var pathUrl = request.url;

  if(pathUrl == "/") {
    pathUrl = "/index.html";
  }

  console.log("Request URL: " + pathUrl);

  var contentType = mime.lookup(pathUrl);

  fs.readFile("./public" + pathUrl, function(error, data) {
    if(error) {
      response.writeHead(500);
      response.end("Error while loading page");
    } else {
      response.writeHead(200, { "Content-Type" : contentType });
      response.end(data);
    }
  });
}

var server = http.createServer(handleRequest);
server.listen(process.env.PORT || config.port);
var data = server.address();

process.openStdin().addListener("data", function(data) {
    var string = data.toString().trim()

    if(string == "clear") {
      process.stdout.write("\u001b[0J\u001b[1J\u001b[2J\u001b[0;0H\u001b[0;0W");
      process.stdout.write('\0');
    } else if(string == "exit") {
      process.exit();
    } else if(string == "help") {
      console.log("clear - Clears the current shell view");
      console.log("exit - Exits from the process");
    } else {
      console.log("Command not found! Type 'help'");
    }
});

var Game = require('./classes/game');

var roomsNumber = 2;
var rooms = [];
var quedClients = [];

for(var i = 0; i < roomsNumber; i++) {
  rooms[i] = { player1 : null, player2 : null, game: null};
}

function insertPlayer(socket) {
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].player1 && !rooms[i].player2) {
      rooms[i].player2 = socket;
      checkRooms();
      return;
    }
    if(rooms[i].player2 && !rooms[i].player1) {
      rooms[i].player1 = socket;
      checkRooms();
      return;
    }
  }
  for(var i = 0; i < rooms.length; i++) {
    if(!rooms[i].player1) {
      rooms[i].player1 = socket;
      checkRooms();
      return;
    }
    if(!rooms[i].player2) {
      rooms[i].player2 = socket;
      checkRooms();
      return;
    }
  }
  socket.emit('serverMessage', 'Currently all the rooms on the server are full, wait online to enter a room');
  quedClients.push(socket);
}

function removePlayer(socket) {
  //NEW
  for(var i = 0; i < quedClients.length; i++) {
    if(socket == quedClients[i]) {
      quedClients.splice(i, 1);
      return;
    }
  }

  for(var i = 0; i < rooms.length; i++) {
    if(socket == rooms[i].player1) {
      rooms[i].player1 = null;
      if(rooms[i].player2) {
        rooms[i].player2.emit('serverMessage', 'The other player has left, looking for an opponent...');
      }
      checkRooms();
      return;
    }
    if(socket == rooms[i].player2) {
      rooms[i].player2 = null;
      if(rooms[i].player1) {
        rooms[i].player1.emit('serverMessage', 'The other player has left, looking for an opponent...');
      }
      checkRooms();
      return;
    }
  }
}

function organizeRooms() {
  for(var i = 0; i < rooms.length; i++) {
    if(!rooms[i].player1 && rooms[i].player2) {
      let player = rooms[i].player2;
      rooms[i].player2 = null;
      insertPlayer(player);
    }
    if(rooms[i].player1 && !rooms[i].player2) {
      let player = rooms[i].player1;
      rooms[i].player1 = null;
      insertPlayer(player);
    }
  }
  for(var i = 0; i < rooms.length; i++) {
    if(!rooms[i].player1 && rooms[i].player2 && quedClients[0]) {
      rooms[i].player1 = quedClients[0];
      quedClients.splice(0, 1);
      checkRooms();
    }
    if(rooms[i].player1 && !rooms[i].player2 && quedClients[0]) {
      rooms[i].player2 = quedClients[0];
      quedClients.splice(0, 1);
      checkRooms();
    }
  }
}

function checkRooms() {
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].player1 != null && rooms[i].player2 != null && !rooms[i].game) {
      let currentGame = rooms[i].game;
      rooms[i].game = new Game([rooms[i].player1, rooms[i].player2], checkGames);
      console.log('New game started');
    }
    if((rooms[i].player1 == null || rooms[i].player2 == null) && rooms[i].game) {
      rooms[i].game.endGame();
      rooms[i].game = null;
      if(rooms[i].player1 != null) {
        rooms[i].player1.removeAllListeners('keyPressed');
        rooms[i].player1.removeAllListeners('mousePressed');
      }
      if(rooms[i].player2 != null) {
        rooms[i].player2.removeAllListeners('keyPressed');
        rooms[i].player2.removeAllListeners('mousePressed');
      }
      console.log('Game stopped');
      organizeRooms();
    }
  }
}

function checkGames() {
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].game != null) {
      if(!rooms[i].game.active) {
        console.log("EXECUTED");
        rooms[i].game.endGame();
        rooms[i].game = null;

        rooms[i].player1.removeAllListeners('keyPressed');
        rooms[i].player1.removeAllListeners('mousePressed');
        rooms[i].player2.removeAllListeners('keyPressed');
        rooms[i].player2.removeAllListeners('mousePressed');

        checkRooms();
      }
    }
  }
}

function printRooms() {
  for(var i = 0; i < rooms.length; i++) {
    console.log(i + 1 + ' - ' + (rooms[i].player1 != null) + ' - ' + (rooms[i].player2 != null) + ' - ' + (rooms[i].game != null));
  }
}

var io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log("We have a new client: " + socket.id);
  insertPlayer(socket);
  printRooms();

  socket.on('disconnect', function() {
    console.log("Client has disconnected: " + socket.id);
    removePlayer(socket);
    printRooms();
  });
});

console.log("Server started on port: " + data.port);

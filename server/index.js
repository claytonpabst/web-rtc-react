const express = require('express'),
  bodyParser = require('body-parser'),
  socket = require('socket.io');

const app = express();

app.use(bodyParser.json());

const PORT = 8080;
const io = socket(app.listen(PORT, () => console.log(`We have lift off on port ${PORT}`)));

// write socket stuff here
io.on('connection', function(socket){
  console.log('hit')
  socket.on("joinRoom", function(roomNumber){
    console.log('room joined:', roomNumber)
    socket.join(roomNumber)
  })

  socket.on('callPeer', function(data){
    io.to(data.room).emit('callPeer', data)
  })

  socket.on('answerPeer', function(data){
    io.to(data.room).emit('answerPeer', data)
  })
})
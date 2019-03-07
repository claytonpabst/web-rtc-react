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
    socket.join(roomNumber)
  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  })

  socket.on('call peer', function(data){
    console.log('hit')
    io.to(data.room).emit('call peer', data)
  })

  socket.on('answer peer', function(data){
    io.to(data.room).emit('answer peer', data)
  })
})
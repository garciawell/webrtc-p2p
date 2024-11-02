const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

// 1f63db9a-ec11-4710-9bc4-3901a8e0d9c0
app.get('/:room', (req, res) => {
  res.send({ room: req.params.room });
})

app.use('/assets', express.static(__dirname + '/assets'));

// This will render your frontend at http://localhost:PORT/
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});


io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    console.log('roomId', roomId);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  })
});


server.listen(3000, () => {
  console.log('Server listening on port 3000');
});

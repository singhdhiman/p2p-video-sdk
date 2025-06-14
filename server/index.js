const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 5000;

let rooms = {};

io.on('connection', (socket) => {
  socket.on('join', (roomID) => {
    socket.join(roomID);
    const users = io.sockets.adapter.rooms.get(roomID);
    const numUsers = users ? users.size : 0;

    if (!rooms[roomID]) rooms[roomID] = [];
    rooms[roomID].push(socket.id);

    socket.emit('joined', { id: socket.id, peers: [...rooms[roomID].filter(id => id !== socket.id)] });

    socket.to(roomID).emit('new-peer', { id: socket.id });
  });

  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      socket.to(room).emit('peer-left', socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running at http://localhost:${PORT}`);
});

const { Server } = require('socket.io');
const logger = require('./logger');
const { addUserToRoom, removeUserFromRoom } = require('./instanceManager');

function attach(server, sessionMiddleware, socketAuth) {
  const io = new Server(server);

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });
  if (socketAuth) {
    io.use((socket, next) => socketAuth(socket, next));
  }

  io.on('connection', (socket) => {
    const sessUser = socket.request.session && socket.request.session.user;
    const userSafe = sessUser ? { id: sessUser.id, username: sessUser.username } : null;
    const username = userSafe ? userSafe.username : 'guest';

    logger.info(`Socket connected: ${socket.id}`, { user: username });

socket.emit('welcome', { you: socket.id, user: userSafe });

socket.on('joinRoom', (roomName, cb) => {
  const newRoom = String(roomName || 'general');

  // Leave ALL rooms except the socket's private room
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      socket.leave(room);
    }
  }

  socket.join(newRoom);
  socket.currentRoom = newRoom;

  io.to(newRoom).emit('systemMessage', {
    text: `${username} joined ${newRoom}`,
    user: userSafe
  });

  if (typeof cb === 'function') {
    cb({ ok: true, room: newRoom });
  }
});


socket.on('chatMessage', (message) => {
  if (!socket.currentRoom || !message) return;

  io.to(socket.currentRoom).emit('chatMessage', {
    user: username,
    message,
    ts: Date.now()
  });
});


    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`, { user: username });
    });
  });

  return { io };
}

module.exports = { attach };

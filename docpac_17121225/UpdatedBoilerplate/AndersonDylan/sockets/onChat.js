// modules/socketHandlers/onChat.js

module.exports = function onChat(io, socket) {
  socket.on('chatMessage', (message) => {
    // Validate message
    if (!message || !message.trim()) return;

    const msgData = {
      user: socket.user,
      message: message.trim(),
      timestamp: new Date()
    };

    // Broadcast to the current room
    io.to(socket.currentRoom).emit('chatMessage', msgData);
  });
};

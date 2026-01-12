module.exports = function(socket, io) {
  socket.on('chatMessage', (payload) => {
    const room = payload.room;
    const message = payload.message;
    const user = socket.request.session.user || { username: 'guest' };
    io.to(room).emit('chatMessage', { user: user.username || 'guest', message, ts: Date.now() });
  });
};

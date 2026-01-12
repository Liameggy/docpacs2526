module.exports = function(socket, io) {
  socket.emit('welcome', { message: 'Welcome!', you: socket.id, user: socket.request.session.user || null });
};

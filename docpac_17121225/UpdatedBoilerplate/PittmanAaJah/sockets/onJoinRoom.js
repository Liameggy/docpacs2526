const instanceManager = require('../modules/instanceManager');

module.exports = function(socket, io) {
  socket.on('joinRoom', (roomName, cb) => {
    const user = socket.request.session.user || { username: 'guest' };
    const roomId = String(roomName || 'lobby');
    instanceManager.addUserToRoom(roomId, user.username || 'guest');
    socket.join(roomId);
    io.to(roomId).emit('systemMessage', { text: `${user.username || 'guest'} joined ${roomId}` });
    if (cb) cb({ ok: true, room: roomId });
  });
};

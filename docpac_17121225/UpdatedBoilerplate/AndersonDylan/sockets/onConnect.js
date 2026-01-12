// modules/socketHandlers/onConnect.js

const {
  addUserToRoom,
  getRooms,
  getRoomMembers,
  removeUserFromAllRooms
} = require('../modules/instanceManager');

const PUBLIC_ROOM = 'public';

module.exports = function onConnect(io, socket) {
  const { id: userId, username } = socket.user;

  // 1. Join public room (Socket.IO)
  socket.join(PUBLIC_ROOM);
  socket.currentRoom = PUBLIC_ROOM;

  // 2. Track in instance manager
  addUserToRoom(userId, username, PUBLIC_ROOM);

  // 3. Send initial state to this user
  socket.emit('init', {
    user: socket.user,
    rooms: getRooms(),
    currentRoom: PUBLIC_ROOM,
    members: getRoomMembers(PUBLIC_ROOM)
  });

  // 4. Notify others in the public room
  socket.to(PUBLIC_ROOM).emit('userJoined', {
    room: PUBLIC_ROOM,
    user: { userId, username }
  });

  // 5. Broadcast updated member list
  io.to(PUBLIC_ROOM).emit('roomMembers', {
    room: PUBLIC_ROOM,
    members: getRoomMembers(PUBLIC_ROOM)
  });

  // ---- DISCONNECT HANDLER MUST BE HERE ----
  socket.on('disconnect', () => {
    // 1. Remove user from all rooms in instance manager
    const affectedRooms = removeUserFromAllRooms(userId);

    // 2. Leave all Socket.IO rooms
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }

    // 3. Notify affected rooms
    affectedRooms.forEach(roomName => {
      socket.to(roomName).emit('userLeft', {
        room: roomName,
        user: { userId, username },
        reason: 'disconnect'
      });

      io.to(roomName).emit('roomMembers', {
        room: roomName,
        members: getRoomMembers(roomName)
      });
    });
  });
};

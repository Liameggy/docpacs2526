// modules/socketHandlers/onJoinRoom.js

const {
  addUserToRoom,
  removeUserFromRoom,
  getRoomMembers
} = require('../modules/instanceManager');


module.exports = function onJoinRoom(io, socket) {
    socket.on('joinRoom', (newRoom) => {
        const { id: userId, username } = socket.user;
        const currentRoom = socket.currentRoom;

        // Prevent joining the same room
        if (currentRoom === newRoom) {
            return;
        }

        // ---- Leave current room ----
        if (currentRoom) {
            // Socket.IO
            socket.leave(currentRoom);

            // Instance manager
            removeUserFromRoom(userId, currentRoom);

            // Notify old room
            socket.to(currentRoom).emit('userLeft', {
                room: currentRoom,
                user: { userId, username }
            });

            // Update member list for old room
            io.to(currentRoom).emit('roomMembers', {
                room: currentRoom,
                members: getRoomMembers(currentRoom)
            });
        }

        // ---- Join new room ----
        socket.join(newRoom);
        addUserToRoom(userId, username, newRoom);

        socket.currentRoom = newRoom;

        // Notify new room
        socket.to(newRoom).emit('userJoined', {
            room: newRoom,
            user: { userId, username }
        });

        // Update member list for new room
        io.to(newRoom).emit('roomMembers', {
            room: newRoom,
            members: getRoomMembers(newRoom)
        });

        // Confirm to the user
        socket.emit('roomChanged', {
            room: newRoom,
            members: getRoomMembers(newRoom)
        });
    });
};

//server-side room event handlers
module.exports = (io, logger, socketServer) => {
    io.on('connection', (socket) => {
        
        // Handling joining a room
        socket.on('join-room', (data) => {
            const { roomName, username } = data;
            
            if (!roomName || !username) {
                socket.emit('error', { message: 'Room name and username are required' });
                return;
            }

            // Leave current room if in one
            const user = socketServer.getConnectedUser(socket.id);
            if (user && user.currentRoom) {
                socket.leave(user.currentRoom);
                socketServer.removeUserFromRoom(socket.id, user.currentRoom);
                
                socket.to(user.currentRoom).emit('user-left', {
                    username: user.username,
                    message: `${user.username} left the room`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }

            // Join new room
            socket.join(roomName);
            socketServer.addUserToRoom(socket.id, roomName);
            
            // Update user info
            if (user) {
                user.username = username; // Update username if changed
            }

            logger.info(`🎭 ${username} joined room: ${roomName}`);
            
            // Notify others in the room
            socket.to(roomName).emit('user-joined', {
                username: username,
                message: `${username} joined the room`,
                timestamp: new Date().toLocaleTimeString()
            });
            
            // Send confirmation to the user
            socket.emit('room-joined', {
                roomName: roomName,
                message: `You joined room: ${roomName}`,
                timestamp: new Date().toLocaleTimeString(),
                usersInRoom: socketServer.getUsersInRoom(roomName).size
            });
        });

        // Handle leaving a room
        socket.on('leave-room', () => {
            const user = socketServer.getConnectedUser(socket.id);
            
            if (user && user.currentRoom) {
                const roomName = user.currentRoom;
                const username = user.username;
                
                socket.to(roomName).emit('user-left', {
                    username: username,
                    message: `${username} left the room`,
                    timestamp: new Date().toLocaleTimeString()
                });
                
                socket.leave(roomName);
                socketServer.removeUserFromRoom(socket.id, roomName);
                
                logger.info(`👻 ${username} left room: ${roomName}`);
            }
        });

    });
};

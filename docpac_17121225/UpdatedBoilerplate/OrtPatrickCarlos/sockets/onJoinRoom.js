const logger = require('../modules/logger');
const instanceManager = require('../modules/instanceManager');

function onJoinRoom(socket, roomId) {
    try {
        const session = socket.request.session;
        
        // Allow guests or authenticated users
        const userId = session && session.user ? session.user.id : socket.id;
        const username = session && session.user ? session.user.username : 'Guest';

        // Auto-create room if it doesn't exist
        let room = instanceManager.getRoomById(roomId);
        if (!room) {
            room = instanceManager.createRoom(roomId, roomId);
            logger.info(`Auto-created room: ${roomId}`);
        }

        // Add user to room
        const success = instanceManager.addUserToRoom(userId, roomId);
        if (!success) {
            logger.warn(`User ${userId} could not join room ${roomId}`);
            socket.emit('error', 'Could not join room (full or already in another room)');
            return;
        }

        // Join socket to room
        socket.join(roomId);
        logger.info(`User ${username} (${userId}) joined room: ${roomId}`);
        
        // Notify the user
        socket.emit('joinedRoom', { roomId });
        
        // Notify others in the room
        socket.to(roomId).emit('systemMessage', { message: `${username} joined the room` });
    } catch (err) {
        logger.error('Error in onJoinRoom: ' + err.message);
        socket.emit('error', 'Failed to join room');
    }
}

module.exports = onJoinRoom;
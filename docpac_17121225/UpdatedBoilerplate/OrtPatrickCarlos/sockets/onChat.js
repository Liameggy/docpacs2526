const logger = require('../modules/logger');
const utilities = require('../shared/utilities');
const instanceManager = require('../modules/instanceManager');

function onChat(socket, messageData) {
    try {
        const session = socket.request.session;
        const userId = session && session.user ? session.user.id : socket.id;
        const username = session && session.user ? session.user.username : 'Guest';
        const roomId = messageData.roomId;
        const message = messageData.message;

        // Validate room exists
        const room = instanceManager.getRoomById(roomId);
        if (!room) {
            logger.warn(`User ${userId} attempted to send message to non-existent room: ${roomId}`);
            socket.emit('error', 'Room does not exist');
            return;
        }

        // Broadcast the message to the entire room (including sender)
        socket.emit('chatMessage', {
            username,
            message,
            timestamp: utilities.getCurrentTimestamp()
        });
        socket.to(roomId).emit('chatMessage', {
            username,
            message,
            timestamp: utilities.getCurrentTimestamp()
        });

        logger.info(`User ${username} sent message in room ${roomId}: ${message}`);
    } catch (err) {
        logger.error('Error in onChat: ' + err.message);
        socket.emit('error', 'Failed to send message');
    }
}

module.exports = onChat;
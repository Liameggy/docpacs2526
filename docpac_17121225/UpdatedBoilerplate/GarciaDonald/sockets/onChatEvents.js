// sockets/onChatEvents.js - Server-side chat event handlers
module.exports = (io, logger, socketServer) => {
    io.on('connection', (socket) => {
        
        // Handle chat messages
        socket.on('chat-message', (data) => {
            const { message } = data;
            const user = socketServer.getConnectedUser(socket.id);
            
            if (!user || !user.currentRoom || !user.username) {
                socket.emit('error', { message: 'You must be in a room to send messages' });
                return;
            }

            if (!message || message.trim().length === 0) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }

            // Basic message filtering
            const filteredMessage = filterMessage(message.trim());
            
            logger.info(`💬 Chat message from ${user.username} in ${user.currentRoom}: ${filteredMessage}`);
            
            // Send message to all users in the room (including sender)
            io.to(user.currentRoom).emit('receive-message', {
                username: user.username,
                message: filteredMessage,
                timestamp: new Date().toLocaleTimeString(),
                socketId: socket.id,
                userId: user.userId
            });
        });

        // Handle custom events/spells
        socket.on('custom-event', (data) => {
            const { eventType, eventData } = data;
            const user = socketServer.getConnectedUser(socket.id);
            
            if (!user || !user.currentRoom || !user.username) {
                socket.emit('error', { message: 'You must be in a room to cast spells' });
                return;
            }

            if (!eventType || !eventData) {
                socket.emit('error', { message: 'Event type and data are required' });
                return;
            }

            logger.info(`🪄 Custom event from ${user.username} in ${user.currentRoom}: ${eventType} - ${eventData}`);
            
            // Broadcast custom event to room (excluding sender)
            socket.to(user.currentRoom).emit('receive-custom-event', {
                username: user.username,
                eventType: eventType,
                eventData: eventData,
                timestamp: new Date().toLocaleTimeString(),
                userId: user.userId
            });
        });

    });
};

// Basic message filtering function
function filterMessage(message) {
    const forbiddenWords = ['spam', 'hack', 'cheat', 'exploit'];
    let filteredMessage = message;
    
    forbiddenWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredMessage = filteredMessage.replace(regex, '***');
    });
    
    // Limit message length
    if (filteredMessage.length > 500) {
        filteredMessage = filteredMessage.substring(0, 500) + '...';
    }
    
    return filteredMessage;
}

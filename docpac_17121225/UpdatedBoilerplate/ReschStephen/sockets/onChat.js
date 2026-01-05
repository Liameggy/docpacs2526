// Listens for a chatMessage event, emits the message to all users in the same room, includes username and timestamp in the message payload
import { logging } from '../modules/logger.js';
import { userTracker } from '../server.js';


export default function onChat(io) {
    io.on('connection', (socket) => {
        socket.on('chatMessage', async (message) => {
            const userId = socket.request.session.user ? socket.request.session.user.username : 'Guest';
            try {
                const userRoom = userTracker.getUserInstance(userId);
                if (userRoom) {
                    const timestamp = new Date().toISOString();
                    const chatPayload = {
                        username: userId,
                        message,
                        timestamp,
                    };
                    io.to(userRoom).emit('chatMessage', chatPayload);
                    logging('INFO', `User ${userId} sent message to room ${userRoom}: ${message}`);
                } else {
                    logging('WARN', `User ${userId} attempted to send message without being in a room.`);
                    socket.emit('error', { message: 'You must join a room to send messages.' });
                }
            } catch (error) {
                logging('ERROR', `Error processing chat message from user ${userId}: ${error.message}`);
                socket.emit('error', { message: error.message });
            }
        });
    });
}

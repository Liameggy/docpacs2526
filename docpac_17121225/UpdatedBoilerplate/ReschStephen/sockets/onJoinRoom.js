// Listens for a joinRoom event from the client, uses instanceManager to add the user to a room, and joins the socket to that room 
import { logging } from '../modules/logger.js';
import { addUserToRoom, getRoomData } from '../modules/instanceManager.js';
import { userTracker } from '../server.js';


export default function onJoinRoom(io) {
    io.on('connection', (socket) => {
        socket.on('joinRoom', async (roomId) => {
            const userId = socket.request.session.user ? socket.request.session.user.username : 'Guest';
            try {
                addUserToRoom(io, roomId, socket);
                userTracker.setUserInstance(userId, roomId);
                const room = getRoomData(io, roomId);
                logging('INFO', `User ${userId} joined room: ${roomId} (Socket ID: ${socket.id})`);
                socket.emit('joinedRoom', room);
            } catch (error) {
                logging('ERROR', `Error adding user ${userId} to room ${roomId}: ${error.message}`);
                socket.emit('error', { message: error.message });
            }
        });
    });
}

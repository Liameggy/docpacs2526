const { Server } = require('socket.io');
const sessionMiddleware = require('../middleware/session');
const logger = require('../modules/logger');

function setupSocketServer(server) {
    // 1. Create Socket.IO server from HTTP server
    const io = new Server(server);
    
    // 2. Set up session middleware for Socket.IO
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });
    
    // 3. Import event handlers
    const onConnect = require('../sockets/onConnect');
    const onJoinRoom = require('../sockets/onJoinRoom');
    const onChat = require('../sockets/onChat');

    // 4. Set up connection handler
    io.on('connection', (socket) => {
        const session = socket.request.session;
        if (session && session.user) {
            logger.info(`User ${session.user.username} connected via Socket.IO`);
            socket.emit('welcome', `Welcome back, ${session.user.username}!`);
        } else {
            logger.info('An unauthenticated user connected via Socket.IO');
            socket.emit('welcome', 'Welcome, guest!');
        }
        
        socket.on('disconnect', () => {
            logger.info('User disconnected from Socket.IO');
        });
        
        // 5. Set up event listeners
        socket.on('joinRoom', (roomData) => onJoinRoom(socket, roomData));
        socket.on('chatMessage', (messageData) => onChat(socket, messageData));
    });
    
    // 6. Return the io instance
    return io;
}

module.exports = setupSocketServer;

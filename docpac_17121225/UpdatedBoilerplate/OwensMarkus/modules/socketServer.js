const { Server } = require("socket.io");
const logger = require('./logger');
const socketAuth = require('../middleware/socketAuth')
const onConnect = require('../sockets/onConnect');
const onChat = require('../sockets/onChat');  
const onJoinRoom = require('../sockets/onJoinRoom');
function createSocketServer(httpServer, sessionMiddleware) {
    const io = new Server(httpServer);
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, (err) => {
            if (err) return next(err);
            socketAuth(socket, next);
        });
    });
    io.on('connection', (socket) => {
        logger.info('a user connected');
        onConnect(socket, io);
        onChat(socket, io);
        onJoinRoom(socket, io);
    socket.on('connect_auth', () => {
        logger.info('Connected to auth server');
        });

    socket.on('disconnect', () => {
            logger.info('User disconnected from Socket.io');
        });});
    return io;
}

module.exports = { createSocketServer };

// modules/socketServer.js
const { Server } = require('socket.io');
const { io: clientIo } = require('socket.io-client');
const logger = require('./logger');

const socketAuth = require('../middleware/socketAuth');

// Socket handlers
const onConnect = require('../sockets/onConnect');
const onJoinRoom = require('../sockets/onJoinRoom');
const onChat = require('../sockets/onChat');

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const API_KEY = process.env.API_KEY || 'your_api_key';

let io;
let authSocket;

const initializeSocketServer = (httpServer, sessionMiddleware) => {
    // ---- Create Socket.IO server ----
    io = new Server(httpServer);

    // ---- Attach session middleware ----
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    // ---- Authenticate socket ----
    io.use(socketAuth);

    // ---- Main connection handler (ONLY ONE) ----
    io.on('connection', (socket) => {
        const user = socket.user;

        logger.info('Socket client connected', {
            socketId: socket.id,
            user: user?.username || 'anonymous'
        });

        onConnect(io, socket);
        onJoinRoom(io, socket);
        onChat(io, socket);
        // disconnect is handled inside onConnect
    });

    // ---- Connect to Formbar auth server ----
    authSocket = clientIo(AUTH_URL, {
        extraHeaders: {
            api: API_KEY
        }
    });

    authSocket.on('connect', () => {
        logger.info('Connected to auth server');
        authSocket.emit('getActiveClass');
    });

    authSocket.on('disconnect', () => {
        logger.info('Disconnected from auth server');
    });

    authSocket.on('setClass', (classData) => {
        logger.info('Received class data', { classData });
        authSocket.emit('classUpdate');
    });

    authSocket.on('classUpdate', (classroomData) => {
        logger.info('Classroom update', {
            id: classroomData.id,
            className: classroomData.className,
            isActive: classroomData.isActive,
            totalResponses: classroomData.poll.totalResponses,
            totalResponders: classroomData.poll.totalResponders
        });
        logger.info('Poll responses', {
            responses: classroomData.poll.responses
        });
    });

    return io;
};

const getIO = () => io;
const getAuthSocket = () => authSocket;

module.exports = {
    initializeSocketServer,
    getIO,
    getAuthSocket
};

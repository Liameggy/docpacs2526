// Set up socket.io server and attach it to the HTTP server
const { Server } = require('socket.io');
function setupSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}
module.exports.setupSocketServer = setupSocketServer;

// Integrate session middleware so socket connections know which user they belong to
function integrateSessionMiddleware(io, sessionMiddleware) {
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });
}
module.exports.integrateSessionMiddleware = integrateSessionMiddleware;

// Loads event handlers from the sockets/ folder
const fs = require('fs');
const path = require('path');
function loadSocketEventHandlers(io, socketDir) {
    fs.readdirSync(socketDir).forEach(file => {
        if (file.endsWith('.js')) {
            const eventHandler = require(path.join(socketDir, file));
            if (typeof eventHandler === 'function') {
                eventHandler(io);
            }
        }
    });
}
module.exports.loadSocketEventHandlers = loadSocketEventHandlers;

// Manage basic connection and disconnection logging via the logger
const logging = require('./logger');
function setupConnectionLogging(io) {
    io.on('connection', (socket) => {
        const userId = socket.request.session.userId || 'Unknown';
        logging('INFO', `User connected: ${userId} (Socket ID: ${socket.id})`);

        socket.on('disconnect', () => {
            logging('INFO', `User disconnected: ${userId} (Socket ID: ${socket.id})`);
        });
    });
}
module.exports.setupConnectionLogging = setupConnectionLogging;
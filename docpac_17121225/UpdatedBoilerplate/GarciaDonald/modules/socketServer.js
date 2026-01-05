
// session middleware
const db = require('sqlite3').verbose();
const session = require('express-session');
const connect_sqlite3 = require('connect-sqlite3')(session);
const sessionStore = new connect_sqlite3({
    db: 'session.db',
    dir: './',
    table: 'sessions'
});
module.exports = function sessionMiddleware(options) {
    return session({
        store: sessionStore,
        ...options
    });
}

// Socket.IO server setup and management
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

class SocketServer {
    constructor(httpServer, sessionMiddleware, logger) {
        this.httpServer = httpServer;
        this.sessionMiddleware = sessionMiddleware;
        this.logger = logger;
        this.io = null;
        this.connectedUsers = new Map(); // Track connected users
        this.roomUsers = new Map(); // Track users in each room
    }

    // Initializing the Socket.IO server
    initialize() {
        this.io = new Server(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Integrating the session middleware with Socket.IO
        this.setupSessionMiddleware();

        // Set up connection handling
        this.setupConnectionHandling();

        // Load all event handlers from sockets/ folder
        this.loadEventHandlers();

        this.logger.info('Socket.IO server initialized successfully');
        return this.io;
    }

    // Setup session middleware for Socket.IO
    setupSessionMiddleware() {
        // Convert Express session middleware to work with Socket.IO
        const wrap = (middleware) => (socket, next) => {
            middleware(socket.request, {}, next);
        };

        this.io.use(wrap(this.sessionMiddleware));

        // Additional middleware to extract user info
        this.io.use((socket, next) => {
            const session = socket.request.session;
            
            if (session) {
                socket.userId = session.user ? session.user.id : null;
                socket.username = session.user ? session.user.username : 'Anonymous';
                socket.sessionId = session.id;
                
                this.logger.info(`Socket middleware - User: ${socket.username}, Session: ${socket.sessionId}`);
            } else {
                socket.username = 'Anonymous';
            }
            
            next();
        });
    }

    // Setup basic connection and disconnection handling
    setupConnectionHandling() {
        this.io.on('connection', (socket) => {
            const userInfo = {
                socketId: socket.id,
                userId: socket.userId,
                username: socket.username,
                sessionId: socket.sessionId,
                connectedAt: new Date(),
                currentRoom: null
            };

            // Store connected user info
            this.connectedUsers.set(socket.id, userInfo);

            // Log connection
            this.logger.info(`🎭 User connected: ${socket.username} (${socket.id}) - Session: ${socket.sessionId}`);
            this.logger.info(`📊 Total connected users: ${this.connectedUsers.size}`);

            // Handle disconnection
            socket.on('disconnect', (reason) => {
                const user = this.connectedUsers.get(socket.id);
                
                if (user) {
                    // Remove from room tracking if in a room
                    if (user.currentRoom) {
                        this.removeUserFromRoom(socket.id, user.currentRoom);
                        
                        // Notify others in room about disconnection
                        socket.to(user.currentRoom).emit('user-left', {
                            username: user.username,
                            message: `${user.username} disconnected`,
                            timestamp: new Date().toLocaleTimeString()
                        });
                    }

                    // Remove from connected users
                    this.connectedUsers.delete(socket.id);

                    // Log disconnection
                    this.logger.info(`👻 User disconnected: ${user.username} (${socket.id}) - Reason: ${reason}`);
                    this.logger.info(`📊 Total connected users: ${this.connectedUsers.size}`);
                }
            });

            // Store socket server reference in socket for event handlers
            socket.socketServer = this;
        });
    }

    // Load all event handlers from sockets/ folder
    loadEventHandlers() {
        const socketsDir = path.join(__dirname, '../sockets');
        
        try {
            // Check if sockets directory exists
            if (!fs.existsSync(socketsDir)) {
                fs.mkdirSync(socketsDir, { recursive: true });
                this.logger.warn('📁 Created sockets directory as it did not exist');
                return;
            }

            // Read all files in sockets directory
            const files = fs.readdirSync(socketsDir);
            const handlerFiles = files.filter(file => 
                file.startsWith('on') && 
                file.endsWith('.js') && 
                file !== 'index.js'
            );

            this.logger.info(`🔄 Loading ${handlerFiles.length} socket event handlers...`);

            handlerFiles.forEach(file => {
                try {
                    const handlerPath = path.join(socketsDir, file);
                    const handler = require(handlerPath);
                    
                    // Calling the handler with io instance and logger
                    if (typeof handler === 'function') {
                        handler(this.io, this.logger, this);
                        this.logger.info(`✅ Loaded socket handler: ${file}`);
                    } else {
                        this.logger.warn(`⚠️ Invalid handler format in ${file} - expected function`);
                    }
                } catch (error) {
                    this.logger.error(`❌ Failed to load socket handler ${file}:`, error);
                }
            });

        } catch (error) {
            this.logger.error('❌ Error loading socket event handlers:', error);
        }
    }

    // Room management methods
    addUserToRoom(socketId, roomName) {
        if (!this.roomUsers.has(roomName)) {
            this.roomUsers.set(roomName, new Set());
        }
        
        this.roomUsers.get(roomName).add(socketId);
        
        const user = this.connectedUsers.get(socketId);
        if (user) {
            user.currentRoom = roomName;
        }
        
        this.logger.info(`🏠 User ${socketId} added to room: ${roomName}`);
    }

    removeUserFromRoom(socketId, roomName) {
        if (this.roomUsers.has(roomName)) {
            this.roomUsers.get(roomName).delete(socketId);
            
            // Clean up empty rooms
            if (this.roomUsers.get(roomName).size === 0) {
                this.roomUsers.delete(roomName);
                this.logger.info(`🧹 Room ${roomName} deleted (empty)`);
            }
        }
        
        const user = this.connectedUsers.get(socketId);
        if (user) {
            user.currentRoom = null;
        }
        
        this.logger.info(`🚪 User ${socketId} removed from room: ${roomName}`);
    }

    // Utility methods for event handlers
    getUsersInRoom(roomName) {
        return this.roomUsers.get(roomName) || new Set();
    }

    getConnectedUser(socketId) {
        return this.connectedUsers.get(socketId);
    }

    getAllConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }

    getRoomStats() {
        const stats = {};
        for (const [roomName, users] of this.roomUsers.entries()) {
            stats[roomName] = users.size;
        }
        return stats;
    }

    // Get Socket.IO instance
    getIO() {
        return this.io;
    }
}

module.exports = SocketServer;

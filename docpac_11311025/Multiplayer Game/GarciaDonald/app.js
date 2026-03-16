// Imports
require('dotenv').config();
const express = require('express')
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database.')
    }
})
// Constants
const PORT = process.env.port || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'monkey';
const AUTH_URL = process.env.AUTH_URL || 'https://formbeta.yorktechapps.com/oauth'
const THIS_URL = process.env.THIS_URL || 'http://172.16.3.179:3000'
const API_KEY = process.env.API_KEY || 'nutsonme'

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'));
// app.use(express.json()):
// app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore ({ db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('http://172.16.3.179:3000/login')
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {user: req.session.user})
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        //save user to database if not exists
        db.run('INSERT OR REPLACE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`)
        });
        res.redirect('/');
    } else {
        console.log('No token found, redirecting to auth server.', THIS_URL);
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');

});

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 104,
        to: 114,
        amount: 2,
        pin: 404902,
        reason: 'test'
    };
    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
})

// game menu
app.get('/gamemenu', isAuthenticated, (req, res) => {
    res.render('gamemenu', {user: req.session.user})
});

// the game itself (solo)
app.get('/game', isAuthenticated, (req, res) => {
    res.render('game', {user: req.session.user})
});
const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

// Game state management
const gameRooms = new Map();
const lobbies = new Map();

// Helper function to initialize a game room
function initializeGameRoom(roomId) {
    if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
            players: [],
            currentTurn: 0,
            scores: {},
            isGameStarted: false
        });
    }
}

// Helper function to initialize a lobby
function initializeLobby(roomId) {
    if (!lobbies.has(roomId)) {
        lobbies.set(roomId, {
            players: new Set(),
            readyPlayers: new Set()
        });
    }
    return lobbies.get(roomId);
}

// multiplayer game lobby
app.get('/lobby', isAuthenticated, (req, res) => {
    res.render('lobby', {user: req.session.user})
});

// the multiplayer game itself
app.get('/multigame', isAuthenticated, (req, res) => {
    const roomId = req.query.roomId;
    res.render('multigame', {
        user: req.session.user,
        roomId: roomId
    });
});

socket.on('connect', () => {
    console.log('Connected');
    socket.emit('getActiveClass');
});

socket.on('setClass', (newClassId) => {
    console.log(`The user is currently in the class with id ${newClassId}`);
});

// Game socket events will be handled in the Socket.IO server connection handler

// Create HTTP server and Socket.IO instance
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const serverIO = socketIO(server);

// Socket.IO server event handlers
serverIO.on('connection', (clientSocket) => {
    console.log('A user connected');

    // Handle getting available lobbies
    clientSocket.on('getLobbies', () => {
        const availableLobbies = [];
        for (const [roomId, lobby] of lobbies.entries()) {
            if (lobby.players.size < 2) {
                availableLobbies.push({
                    roomId,
                    host: Array.from(lobby.players)[0], // First player is the host
                    playerCount: lobby.players.size
                });
            }
        }
        clientSocket.emit('lobbiesList', { lobbies: availableLobbies });
    });

    // Handle lobby creation
    clientSocket.on('createLobby', (data) => {
        const { roomId, username } = data;
        clientSocket.username = username;
        clientSocket.currentRoom = roomId;
        
        console.log(`${username} created lobby: ${roomId}`);
        
        const lobby = initializeLobby(roomId);
        lobby.players.add(username);
        clientSocket.join(roomId);
        
        // Broadcast lobby update to all players
        serverIO.to(roomId).emit('lobbyUpdate', {
            players: Array.from(lobby.players)
        });
        
        // Broadcast new lobby to all connected clients
        serverIO.emit('lobbiesList', {
            lobbies: Array.from(lobbies.entries()).map(([id, l]) => ({
                roomId: id,
                host: Array.from(l.players)[0],
                playerCount: l.players.size
            }))
        });
    });

    // Handle lobby joining
    clientSocket.on('joinLobby', (data) => {
        const { roomId, username } = data;
        clientSocket.username = username;
        clientSocket.currentRoom = roomId;
        
        console.log(`${username} joined lobby: ${roomId}`);
        
        const lobby = initializeLobby(roomId);
        lobby.players.add(username);
        clientSocket.join(roomId);
        
        // Broadcast lobby update to all players in the room
        serverIO.to(roomId).emit('lobbyUpdate', {
            players: Array.from(lobby.players)
        });
        
        // Broadcast updated lobby list to all connected clients
        serverIO.emit('lobbiesList', {
            lobbies: Array.from(lobbies.entries()).map(([id, l]) => ({
                roomId: id,
                host: Array.from(l.players)[0],
                playerCount: l.players.size
            }))
        });
    });

    // Handle leaving a lobby
    clientSocket.on('leaveLobby', (data) => {
        const { roomId, username } = data;
        const lobby = lobbies.get(roomId);
        
        if (lobby) {
            console.log(`${username} left lobby: ${roomId}`);
            
            lobby.players.delete(username);
            lobby.readyPlayers.delete(username);
            clientSocket.leave(roomId);
            
            if (lobby.players.size === 0) {
                lobbies.delete(roomId);
            } else {
                serverIO.to(roomId).emit('lobbyUpdate', {
                    players: Array.from(lobby.players)
                });
            }
            
            // Broadcast updated lobby list
            serverIO.emit('lobbiesList', {
                lobbies: Array.from(lobbies.entries()).map(([id, l]) => ({
                    roomId: id,
                    host: Array.from(l.players)[0],
                    playerCount: l.players.size
                }))
            });
        }
    });

    // Handle player ready state
    clientSocket.on('playerReady', (data) => {
        const { roomId, username } = data;
        const lobby = lobbies.get(roomId);
        
        if (lobby) {
            console.log(`${username} is ready in lobby ${roomId}`);
            lobby.readyPlayers.add(username);
            
            // Broadcast ready status update
            serverIO.to(roomId).emit('playerReadyUpdate', {
                readyPlayers: lobby.readyPlayers.size,
                totalPlayers: lobby.players.size
            });
            
            // If all players are ready, start the game
            if (lobby.players.size >= 2 && lobby.readyPlayers.size === lobby.players.size) {
                console.log(`All players ready in lobby ${roomId}, starting game...`);
                
                // Initialize the game room with the same ID as the lobby
                initializeGameRoom(roomId);
                const gameRoom = gameRooms.get(roomId);
                
                // Move players from lobby to game
                Array.from(lobby.players).forEach(player => {
                    gameRoom.players.push(player);
                    gameRoom.scores[player] = 0;
                });
                
                gameRoom.isGameStarted = true;
                gameRoom.currentTurn = 0;
                
                // Tell clients to start the game
                serverIO.to(roomId).emit('gameReady', { 
                    gameId: roomId,
                    players: gameRoom.players,
                    currentPlayer: gameRoom.players[0]
                });
                
                // Clean up lobby
                lobbies.delete(roomId);
            }
        }
    });

    // Handle game joining
    clientSocket.on('joinGame', (data) => {
        const { roomId, username } = data;
        clientSocket.username = username;
        clientSocket.currentRoom = roomId;
        
        initializeGameRoom(roomId);
        const room = gameRooms.get(roomId);
        
        if (room.players.length < 2) {
            room.players.push(username);
            room.scores[username] = 0;
            clientSocket.join(roomId);
            
            // Emit room status update to all clients in the room
            serverIO.to(roomId).emit('roomUpdate', {
                players: room.players,
                playerCount: room.players.length
            });
            
            if (room.players.length === 2) {
                room.isGameStarted = true;
                room.currentTurn = 0;
                serverIO.to(roomId).emit('gameStart', {
                    players: room.players,
                    currentPlayer: room.players[0]
                });
            }
        }
    });

    // Handle disconnections
    clientSocket.on('disconnect', () => {
        console.log('A user disconnected');
        const username = clientSocket.username;
        const roomId = clientSocket.currentRoom;
        
        // Check and clean up lobby
        const lobby = lobbies.get(roomId);
        if (lobby) {
            lobby.players.delete(username);
            lobby.readyPlayers.delete(username);
            
            if (lobby.players.size === 0) {
                lobbies.delete(roomId);
            } else {
                serverIO.to(roomId).emit('lobbyUpdate', {
                    players: Array.from(lobby.players)
                });
            }
        }
        
        // Check and clean up game room
        const gameRoom = gameRooms.get(roomId);
        if (gameRoom) {
            const playerIndex = gameRoom.players.indexOf(username);
            if (playerIndex !== -1) {
                gameRoom.players.splice(playerIndex, 1);
                delete gameRoom.scores[username];
                
                serverIO.to(roomId).emit('roomUpdate', {
                    players: gameRoom.players,
                    playerCount: gameRoom.players.length
                });

                if (gameRoom.players.length === 0) {
                    gameRooms.delete(roomId);
                }
            }
        }
    });

    clientSocket.on('scoreUpdate', (data) => {
        const { roomId, username, score } = data;
        const room = gameRooms.get(roomId);
        
        if (room && room.players.includes(username)) {
            room.scores[username] = score;
            
            serverIO.to(roomId).emit('scoresUpdated', {
                scores: room.scores
            });
        }
    });

    // Handle chat messages
    clientSocket.on('chatMessage', (data) => {
        const { roomId, username, message } = data;
        console.log(`Chat message from ${username} in room ${roomId}: ${message}`);
        serverIO.to(roomId).emit('chatMessage', {
            username,
            message
        });
    });

    clientSocket.on('endTurn', (data) => {
        const { roomId, username, score } = data;
        const room = gameRooms.get(roomId);
        
        if (room && room.players[room.currentTurn] === username) {
            room.scores[username] = score;
            room.currentTurn = (room.currentTurn + 1) % room.players.length;
            
            serverIO.to(roomId).emit('turnChanged', {
                nextPlayer: room.players[room.currentTurn],
                scores: room.scores
            });
        }
    });

    clientSocket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running at http://172.16.3.179:${PORT}`);
});
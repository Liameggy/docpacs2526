// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const server = http.createServer(app);
const io = new Server(server);
const path = require('path');
const TicTacToe = require('./scripts/ttt').TicTacToe;





//database setup
const db = new sqlite3.Database('./db/venture.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

//Constants
const port = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${port}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')))


const sessionMiddleware = session({
    store: new SQLiteStore({db : 'sessions.db', dir: './db'}),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
});
app.use(sessionMiddleware);

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;

        //save user to database if not exists
        db.run (`INSERT OR IGNORE INTO users (username) VALUES (?)`, [tokenData.displayName], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });

         res.redirect('/');

    } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});
app.get('/joinGameCode', isAuthenticated, (req, res) => {
    const code = req.query.code; // Get code from URL parameter
    if (!code) {
        return res.status(400).send('Game code is required');
    }
    res.redirect(`/ttt?code=${code}`);
});

// HTTP Routes
app.get('/createGame', isAuthenticated, (req, res) => {
    let gameCode = generateGameCode();
    while (activeGames.has(gameCode)) {
        gameCode = generateGameCode();
    }
    activeGames.add(gameCode);
    req.session.gameCode = gameCode; // Store the game code in the session
    res.redirect(`/ttt?code=${gameCode}`);
});

app.get('/joinRandomGame', isAuthenticated, (req, res) => {
    for (const gameCode of activeGames) {
        const room = io.sockets.adapter.rooms.get(gameCode);
        if (room && room.size < 2) {
            req.session.gameCode = gameCode; // Store the game code in the session
            res.redirect(`/ttt?code=${gameCode}`);
            return;
        }
    }
    res.status(404).send('No available games to join.');
});

app.get('/joinGame', isAuthenticated, (req, res) => {
    res.render('joinGame', { user: req.session.user });
});

app.get('/ttt', isAuthenticated, (req, res) => {
    res.render('ttt', { user: req.session.user });
});



app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


// Socket.io client setup
const socket = ioClient(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next); // Share session with WebSocket
});


const games = {}; // Map game codes to TicTacToe instances
const players = {}; // Map socket IDs to player info (game code and symbol)
const activeGames = new Set(); // Track active game codes

function generateGameCode() {
    let code;
    do {
        code = Math.floor(Math.random() * 1000) + 1; // Generate a code between 1 and 1000
    } while (activeGames.has(code)); // Ensure the code is unique
    return code.toString();
}

function updateGameStatus(gameCode) {
    const room = io.sockets.adapter.rooms.get(gameCode);
    const playerCount = room ? room.size : 0;
    
    if (playerCount === 0) {
        return; // No players to update
    }
    
    if (playerCount === 1) {
        // Only one player - waiting for another
        io.to(gameCode).emit('statusUpdate', {
            message: 'Waiting for another player to join...',
            canPlay: false,
            playerCount: playerCount
        });
    } else if (playerCount === 2) {
        // Both players present - game can proceed
        const game = games[gameCode];
        if (game && !game.winner) {
            io.to(gameCode).emit('statusUpdate', {
                message: `Player ${game.currentPlayer}'s turn.`,
                canPlay: true,
                playerCount: playerCount
            });
        }
    }
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle game creation
    socket.on('createGame', () => {
        const gameCode = generateGameCode();
        activeGames.add(gameCode);
        games[gameCode] = new TicTacToe(); // Create a new game instance
        socket.join(gameCode); // Join the room
        players[socket.id] = { gameCode, symbol: 'X', host: true }; // Assign "X" to the creator and set host to true
        socket.emit('gameCreated', { gameCode, symbol: 'X', host: true });
        console.log(`Game created with code: ${gameCode}`);
    });

// Handle joining a game by code
socket.on('joinGameCode', (code) => {
    console.log(`Player ${socket.id} is trying to join game: ${code}`);
    console.log('Active games:', Array.from(activeGames));
    console.log('Games object:', Object.keys(games));

    // Validate the game code
    if (!activeGames.has(code)) {
        socket.emit('error', 'Invalid game code.');
        return;
    }

    // Ensure the game instance exists
    if (!games[code]) {
        console.log(`Game instance for code ${code} does not exist. Creating a new instance.`);
        games[code] = new TicTacToe(); // Create the game instance if it doesn't exist
    }

    const room = io.sockets.adapter.rooms.get(code);
    const roomSize = room ? room.size : 0;

    if (roomSize < 2) {
        const symbol = roomSize === 0 ? 'X' : 'O'; // Assign "X" to the first player, "O" to the second
        const host = roomSize === 0; // Set host to true for the first player
        socket.join(code); // Join the room
        players[socket.id] = { gameCode: code, symbol, host }; // Include host value
        socket.emit('playerAssigned', { gameCode: code, symbol, host });

        // Add these lines:
        if (roomSize + 1 === 1) {
            // First player joined - waiting for second
            updateGameStatus(code);
        } else if (roomSize + 1 === 2) {
            // Second player joined - game ready
            io.to(code).emit('gameReady', 'Game is ready! Players assigned.');
            updateGameStatus(code);
        }

        if (roomSize + 1 === 2) { // Check if the room is now full
            io.to(code).emit('gameReady', 'Game is ready! Players assigned.');
        }
    } else {
        socket.emit('error', 'Room is full.');
    }
});

    socket.on('makeMove', ({ row, col }) => {
        const player = players[socket.id];
        if (!player) {
            socket.emit('error', 'You are not part of a game.');
            return;
        }

        const { gameCode, symbol } = player;
        const game = games[gameCode];
        if (!game) {
            socket.emit('error', 'Game not found.');
            return;
        }

        if (game.currentPlayer !== symbol) {
            socket.emit('error', 'It is not your turn.');
            return;
        }

        const moveResult = game.makeMove(row, col);
        if (moveResult) {
            io.to(gameCode).emit('updateGame', {
                board: game.board,
                currentPlayer: game.currentPlayer,
                winner: game.winner,
            });

            if (!game.winner && !game.checkDraw()) {
                updateGameStatus(gameCode);
            }
            
            if (game.winner) {
                io.to(gameCode).emit('gameOver', { winner: game.winner });
            } else if (game.checkDraw()) {
                io.to(gameCode).emit('gameOver', { draw: true });
            }
        } else {
            socket.emit('error', 'Invalid move.');
        }
    });

    // Handle leaving a game
socket.on('leaveGame', () => {
    const player = players[socket.id];
    if (!player) {
        socket.emit('error', 'You are not part of a game.');
        return;
    }

    const { gameCode, host } = player;
    
    // Remove player from the game
    socket.leave(gameCode);
    delete players[socket.id];
    
    // Check remaining players in the room
    const room = io.sockets.adapter.rooms.get(gameCode);
    const remainingPlayers = room ? room.size : 0;
    
    if (remainingPlayers === 0) {
        // No players left, close the game
        activeGames.delete(gameCode);
        delete games[gameCode];
        console.log(`Game ${gameCode} closed - no players remaining`);
    } else if (host && remainingPlayers > 0) {
        // Host left, transfer host to remaining player
        // Find the remaining player and make them host
        for (let socketId in players) {
            if (players[socketId].gameCode === gameCode) {
                players[socketId].host = true;
                io.to(socketId).emit('hostTransferred', { newHost: true });
                console.log(`Host transferred to ${socketId} in game ${gameCode}`);
                break;
            }
        }
    }
    
    if (remainingPlayers > 0) {
        // Update status for remaining players
        updateGameStatus(gameCode);
        // Also notify remaining players about the departure
        io.to(gameCode).emit('playerLeft', { 
            message: 'A player has left the game. Waiting for another player...' 
        });
    }
    
    // Redirect the leaving player
    socket.emit('redirectToIndex');
});

// Handle closing lobby (host only)
socket.on('closeLobby', () => {
    const player = players[socket.id];
    if (!player) {
        socket.emit('error', 'You are not part of a game.');
        return;
    }
    
    if (!player.host) {
        socket.emit('error', 'Only the host can close the lobby.');
        return;
    }
    
    const { gameCode } = player;
    
    // Notify all players in the lobby
    io.to(gameCode).emit('lobbyClosed');
    
    // Remove all players from this game
    for (let socketId in players) {
        if (players[socketId].gameCode === gameCode) {
            delete players[socketId];
        }
    }
    
    // Close the game
    activeGames.delete(gameCode);
    delete games[gameCode];
    console.log(`Lobby ${gameCode} closed by host`);
});


    socket.on('resetGame', () => {
        console.log('=== RESET EVENT RECEIVED ==='); // Add this line
        console.log('Socket ID:', socket.id); // Add this line
        
        const player = players[socket.id];
        console.log('Player found:', player); // Add this line
        
        if (!player) {
            console.log('No player found for socket ID'); // Add this line
            socket.emit('error', 'You are not part of a game.');
            return;
        }
    
        const { gameCode } = player;
        console.log('Game code:', gameCode); // Add this line
        
        const game = games[gameCode];
        console.log('Game found:', !!game); // Add this line
        
        if (!game) {
            console.log('No game found for code:', gameCode); // Add this line
            socket.emit('error', 'Game not found.');
            return;
        }

        console.log('About to reset game...'); // Add this line
        game.reset(); // Reset the game state
        console.log('Game reset completed'); // Add this line
        console.log('Board after reset:', game.board); // Add this line
        console.log('Current player after reset:', game.currentPlayer); // Add this line
        
        console.log('About to emit gameReset event...'); // Add this line
        io.to(gameCode).emit('gameReset', {
            board: game.board,
            currentPlayer: game.currentPlayer,
        });
        console.log('gameReset event emitted'); // Add this line
    });

// Handle disconnects
socket.on('disconnect', () => {
    const player = players[socket.id];
    if (player) {
        const { gameCode } = player;
        const room = io.sockets.adapter.rooms.get(gameCode);

        if (!room || room.size === 0) {
            activeGames.delete(gameCode);
            delete games[gameCode];
            console.log(`Game with code ${gameCode} ended due to all players disconnecting.`);
        }

        delete players[socket.id];
    }

    console.log(`Player disconnected: ${socket.id}`);
});
});





server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
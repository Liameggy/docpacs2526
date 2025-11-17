// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');

const server = http.createServer(app);
const io = new Server(server);

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'https://formbeta.yorktechapps.com/oauth';
const THIS_URL = process.env.THIS_URL || `http://172.16.3.240:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
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

        //Save use to database if not exists
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            //console.log(`User ${tokenData.displayName} saved to database.`);
        });

        res.redirect('/');

    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login'); // Redirect to the login page after logout
    });
});
/*app.get('sendpogs'), isAuthenticated, (req, res) => {
    const data = {
        from: 1,
        to: 97,
        amount: 10,
        pin: 1234,
        reason: 'Test pogs transfer'
    }

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
};*/

app.get('/game', isAuthenticated, (req, res) => {
    res.render('game', { user: req.session.user });
});

// Socket.IO game logic
let gameState = {
    players: {},
    usersConnected: 0,
    isGameStarted: false,
    readyPlayers: 0,
    board: Array(9).fill(''),
    currentTurn: 'X'
};

// Auth server connection
const authSocket = ioClient(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

authSocket.on('connect', () => {
    console.log('Connected to auth server');
});

// Game server logic
io.on('connection', (socket) => {
    console.log('New client connected');
    
    if (gameState.usersConnected >= 2) {
        socket.emit('roomFull');
        return;
    }

    gameState.usersConnected++;
    
    // Randomly assign X or O to players
    let existingMark = null;
    if (gameState.usersConnected === 2) {
        // For second player, assign the opposite of the first player's mark
        const existingPlayer = Object.values(gameState.players)[0];
        existingMark = existingPlayer.mark;
    }
    
    const mark = existingMark ? (existingMark === 'X' ? 'O' : 'X') : (Math.random() < 0.5 ? 'X' : 'O');
    gameState.players[socket.id] = {
        mark: mark,
        ready: false
    };
    
    socket.emit('playerAssigned', {
        mark: gameState.players[socket.id].mark,
        gameInProgress: gameState.isGameStarted
    });
    
    if (gameState.usersConnected === 1) {
        io.emit('waitingForOpponent');
    } else if (gameState.usersConnected === 2) {
        io.emit('opponentJoined');
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            gameState.usersConnected--;
            gameState.readyPlayers = 0;
            gameState.isGameStarted = false;
            gameState.board = Array(9).fill('');
            gameState.currentTurn = 'X';
            io.emit('opponentLeft');
        }
    });

    socket.on('playerReady', () => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].ready = true;
            gameState.readyPlayers++;
            
            if (gameState.readyPlayers === 2) {
                gameState.isGameStarted = true;
                gameState.board = Array(9).fill('');
                gameState.currentTurn = 'X';
                io.emit('startGame', {
                    currentTurn: gameState.currentTurn,
                    board: gameState.board
                });
            }
        }
    });

    socket.on('makeMove', (data) => {
        if (!gameState.isGameStarted) return;
        
        const playerMark = gameState.players[socket.id]?.mark;
        if (playerMark === gameState.currentTurn && gameState.board[data.position] === '') {
            gameState.board[data.position] = gameState.currentTurn;
            gameState.currentTurn = gameState.currentTurn === 'X' ? 'O' : 'X';
            
            const gameStatus = checkWinner(gameState.board);
            io.emit('gameUpdate', {
                board: gameState.board,
                currentTurn: gameState.currentTurn,
                gameStatus: gameStatus
            });

            if (gameStatus.isGameOver) {
                gameState.isGameStarted = false;
                gameState.readyPlayers = 0;
                Object.keys(gameState.players).forEach(id => {
                    gameState.players[id].ready = false;
                });
            }
        }
    });

    socket.on('playAgain', () => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].ready = true;
            gameState.readyPlayers++;
            
            if (gameState.readyPlayers === 2) {
                gameState.isGameStarted = true;
                gameState.board = Array(9).fill('');
                gameState.currentTurn = 'X';
                io.emit('startGame', {
                    currentTurn: gameState.currentTurn,
                    board: gameState.board
                });
            } else {
                io.emit('waitingForPlayAgain');
            }
        }
    });
});

function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { isGameOver: true, winner: board[a], winningPattern: pattern };
        }
    }

    // Check for draw
    if (board.every(cell => cell !== '')) {
        return { isGameOver: true, winner: 'draw' };
    }

    return { isGameOver: false, winner: null };
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
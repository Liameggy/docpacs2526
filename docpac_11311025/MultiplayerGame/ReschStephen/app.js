// Imports
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const players = {
    avatar: { x: 314, y: 366 },
    avatar2: { x: 720, y: 366 }
};

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

//Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://172.16.3.253:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://172.16.3.253:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));


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

        // Save user to database if not exists
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function z(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });

        res.redirect('/');

    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 106,
        to: 111,
        amount: 200,
        pin: 1234,
        reason: 'Test pog transfer'
    };

    socket.emit('transferDigipogs', data)

    res.send('Pogs Sent!');
});


const gameState = {
    avatar: null, // Will store socket.id when someone joins
    avatar2: null,
    positions: {
        avatar: { x: 314, y: 366 },
        avatar2: { x: 720, y: 366 }
    }
};

function checkCollision(player1, player2) {
    return (
        player1.x < player2.x + 50 &&  // Using 50 as width/height
        player1.x + 50 > player2.x &&
        player1.y < player2.y + 50 &&
        player1.y + 50 > player2.y
    );
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send initial player positions to the new client
    socket.emit('initialize', players);

    if (!gameState.avatar) {
        gameState.avatar = socket.id;
        socket.emit('assignPlayer', { player: 'avatar', positions: gameState.positions });
        console.log(`${socket.id} assigned as avatar`);
    } else if (!gameState.avatar2) {
        gameState.avatar2 = socket.id;
        socket.emit('assignPlayer', { player: 'avatar2', positions: gameState.positions });
        console.log(`${socket.id} assigned as avatar2`);

        // Both players connected, start game
        io.emit('gameStart');
    } else {
        // Game full
        socket.emit('gameFull');
    }

    // Handle player movement
    socket.on('move', (data) => {
        if (data.player === 'avatar') {
            players.avatar.x += data.dx;
            players.avatar.y += data.dy;
            players.avatar.velocityX = data.velocityX || 0;
            players.avatar.velocityY = data.velocityY || 0;
        } else if (data.player === 'avatar2') {
            players.avatar2.x += data.dx;
            players.avatar2.y += data.dy;
            players.avatar2.velocityX = data.velocityX || 0;
            players.avatar2.velocityY = data.velocityY || 0;
        }

        if (checkCollision(players.avatar, players.avatar2)) {
            handleServerCollision();
        }

        io.emit('update', players);
    });

    function handleServerCollision() {
        const speed1 = Math.abs(players.avatar.velocityX || 0) + Math.abs(players.avatar.velocityY || 0);
        const speed2 = Math.abs(players.avatar2.velocityX || 0) + Math.abs(players.avatar2.velocityY || 0);

        let victim = speed1 > speed2 ? 'avatar2' : 'avatar';
        let aggressor = speed1 > speed2 ? 'avatar' : 'avatar2';

        const dx = (players.avatar.x + 25) - (players.avatar2.x + 25);
        const dy = (players.avatar.y + 25) - (players.avatar2.y + 25);
        const distance = Math.sqrt(dx * dx + dy * dy);

        const separationDistance = 55;
        const separateX = (dx / distance) * separationDistance;
        const separateY = (dy / distance) * separationDistance;

        if (victim === 'avatar') {
            players.avatar.x = players.avatar2.x + separateX;
            players.avatar.y = players.avatar2.y + separateY;
        } else {
            players.avatar2.x = players.avatar.x - separateX;
            players.avatar2.y = players.avatar.y - separateY;
        }


        io.emit('collisionResponse', {
            victim: victim,
            positions: {
                avatar: { x: players.avatar.x, y: players.avatar.y },
                avatar2: { x: players.avatar2.x, y: players.avatar2.y }
            }
        });
    }
    socket.on('playerDied', (data) => {
        console.log(`Player ${data.player} has died.`);
        if (data.player === 'avatar') {
            players.avatar.x = 314;
            players.avatar.y = 366;
        } else if (data.player === 'avatar2') {
            players.avatar2.x = 720;
            players.avatar2.y = 366;
        }
        console.log('Sending updated positions:', players);
        io.emit('update', players);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (socket.id === gameState.avatar) {
            gameState.avatar = null;
        } else if (socket.id === gameState.avatar2) {
            gameState.avatar2 = null;
        }
    });
});


server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

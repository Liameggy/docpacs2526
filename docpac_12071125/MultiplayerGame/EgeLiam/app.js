// import
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const { Server } = require('socket.io');
const { io: clientIo } = require('socket.io-client');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) console.error(err);
    else console.log('Connected to the database.');
});

// constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_session_secret_here';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/auth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// routes
app.get('/login', (req, res) => {
    if (req.query.token) {
        const tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) console.log(err.message);
            else console.log(`User ${tokenData.displayName} inserted or already exists.`);
        });

        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

// game state
let players = {};

// socket.io local (game)
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    players[socket.id] = { x: 0, y: 0, score: 0 };
    io.emit('updatePlayers', players);

    socket.on('move', (data) => {
        const player = players[socket.id];
        if (!player) return;

        // Proposed new position
        let newX = player.x + data.x;
        let newY = player.y + data.y;

        const canvasWidth = 800;
        const canvasHeight = 600;
        const playerSize = 20;

        newX = Math.max(0, Math.min(newX, canvasWidth - playerSize));
        newY = Math.max(0, Math.min(newY, canvasHeight - playerSize));


        // Check for overlap
        let overlap = false;
        for (const id in players) {
            if (id === socket.id) continue;
            const other = players[id];
            if (
                newX < other.x + 20 &&
                newX + 20 > other.x &&
                newY < other.y + 20 &&
                newY + 20 > other.y
            ) {
                overlap = true;
                break;
            }
        }

        // Update only if no overlap
        if (!overlap) {
            player.x = newX;
            player.y = newY;
        }

        io.emit('updatePlayers', players);
    });

    socket.on('aim', (angle) => {
        const player = players[socket.id];
        if (!player) return;
        player.angle = angle;
        io.emit('updatePlayers', players);
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

const TICK_RATE = 60;
setInterval(() => {
    const swordLength = 35; // same as client fillRect width
    const swordThickness = 10;
    const step = 5;
    const hitRadius = swordThickness;

    for (const id in players) {
        const player = players[id];
        if (!player.angle) continue;

        const angle = player.angle;
        const cx = player.x + 10;
        const cy = player.y + 10;


        for (let i = 0; i <= swordLength; i += step) {
            const px = cx + Math.cos(angle) * (20 + i);
            const py = cy + Math.sin(angle) * (20 + i);

            for (const otherId in players) {
                if (otherId === id) continue;
                const other = players[otherId];
                const dx = px - (other.x + 10);
                const dy = py - (other.y + 10);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < hitRadius) {
                    players[id].score++;
                    other.x = Math.floor(Math.random() * 79) * 10;
                    other.y = Math.floor(Math.random() * 59) * 10;


                    io.emit('playerKill', { killer: id, victim: otherId });
                }
            }
        }
    }

    io.emit('updatePlayers', players);
}, 1000 / TICK_RATE);



// external socket.io client (auth server)
const authSocket = clientIo(AUTH_URL, {
    extraHeaders: { api: API_KEY }
});

authSocket.on('connect', () => {
    console.log('Connected to auth server');
    authSocket.emit('getActiveClass');
});

authSocket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});

authSocket.on('setClass', (classData) => {
    console.log('Received class data:', classData);
    // optionally broadcast to players
    io.emit('classUpdate', classData);
});

// start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

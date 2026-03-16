// IMPORTS
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client'); // added
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');

const server = http.createServer(app);
const io = new Server(server); // server-side Socket.IO instance

// DATABASE SETUP
const db = new sqlite3.Database('./db/app.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to database');
    }
});

// CONSTANTS
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://172.16.3.228:420';
const THIS_URL = process.env.THIS_URL || `http://172.16.3.228:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// MIDDLEWARE
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login');
};

// ROUTES
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        // SAVE USER TO DATABSE IF NOT EXISTS
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
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


// SOCKET.IO CLIENT TO AUTH SERVER
const authSocket = ioClient(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

let userChoices = {}; // shared across connections for the current round
var usersConnected = 0;

io.on('connection', (socket) => {
    if (usersConnected === 1) {
        io.emit('startGame');
    } else if (usersConnected === 0) {
        io.emit('waitingForOpponent');
    } else {
        console.error('Unexpected number of users connected:', usersConnected);
    }
    console.log('New client connected');
    usersConnected++;
    console.log('Users connected:', usersConnected);

    socket.on('disconnect', () => {
        if (userChoices[socket.id]) {
            delete userChoices[socket.id];
        }
        usersConnected--;
        console.log('Client disconnected');
        console.log('Users connected:', usersConnected);
        io.emit('leave')
    });

    socket.on('choiceMade', (data) => {
        console.log('Choice received from', socket.id, data);
        userChoices[socket.id] = data;
        console.log('User choices so far:', userChoices);
        if (Object.keys(userChoices).length === 2) {
            io.emit('results', userChoices);
            userChoices = {};
        }
    });
});

server.listen(PORT, () => { 
    console.log(`Server is running at http://172.16.3.228:${PORT}`);
});
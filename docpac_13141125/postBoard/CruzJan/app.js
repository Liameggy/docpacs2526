
require('dotenv').config(); 
const express = require('express');
const app = express();
const session = require('express-session')
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const { Socket } = require('engine.io-client');

const server = http.createServer(app)
const io = new Server(server)

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});


//Constants
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key'

// Middleware 
app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({ db : "sessions.db", dir: `./db` }),
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index', { user: req.session.user });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/');

        // Save user to database if not exists

        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });
    } else { res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`) }

});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Socket.io client setup is to recieve sockets from formbar
const authSocket = ioClient(`${AUTH_URL}`, {
    extraHeaders: {
        api: API_KEY
    }
});

io.on('connection', (socket) => {
    console.log('It worky')

    socket.on('Hello', () => {
        console.log('Hi')
    }) 
    
})

server.listen(PORT, () => { 
    console.log(`Server is running at http://172.16.3.228:${PORT}`);
});



// imports
require('dotenv').config();
// constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_secret';
const AUTH_URL = process.env.AUTH_URL || 'http://formbeta.yorktechapps.com/oauth';
const THIS_URL = process.env.THIS_URL || 'http://localhost:3000/login';
const API_KEY = process.env.API_KEY || 'default_api_key';

// modules
const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const logger = require('./modules/logger');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(session);
// home route modules
const homeRoutes = require('./routes/home');
const loginRoutes = require('./routes/login');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/api/users');
const formbarAuthRoutes = require('./modules/auth/formbarAuth');
// const { io } = require('socket.io-client');
const http = require('http');
// setting up the database
const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) {
        logger.error('Could not connect to database', err);
    } else {
    logger.info('Connected to SQLite database'); 
} 
});   
// session database
const sessionStore = new connect_sqlite3({
    db: 'session.db',
    dir: './',
    table: 'sessions'
});
// newer imports
const InstanceManager = require('./modules/instanceManager');
const UserLayout = require('./modules/userLayout');
const FormbarClient = require('./modules/formbarClient');
const utilities = require('./shared/utilities');

// Initializing the new modules
const instanceManager = new InstanceManager(logger);
const userLayout = new UserLayout(logger);
const formbarClient = new FormbarClient(process.env.API_KEY, 'http://formbeta.yorktechapps.com/api', logger);

// middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

// Session middleware - only this one session configuration
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3.5 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production'
    }
}));


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect(`/login`);
    }
}

app.set('view engine', 'ejs');
app.set('views', './views');

// routes

// home route
app.use('/', homeRoutes);
// login route
app.use('/', loginRoutes);
//profileRoute app.use statement
app.use('/', profileRoutes);
// api routes
app.use('/api/users', userRoutes);
//formbarAuthRoutes
app.use('/', formbarAuthRoutes);
// sockets route
app.get('/sockets', (req, res) => {
    res.render('sockets', {
        session: req.session,
        title: 'Socket.IO Magic'
    })
})
// auth routes
// Import and use your OAuth routes
const nativeAuth = require('./modules/auth/native.js');
const { title } = require('process');
// const { AUTH } = require('sqlite3');
//using the oauth route
app.use('/', formbarAuthRoutes); // makes /auth/callback available
// local authentication route using native.js
app.post('/auth/local', (req, res) => {
    const { username, password } = req.body;

    // using authenticateUser
    nativeAuth.authenticateUser(username, password, (err, user) => {
        if (err) {
            console.error('Authentication error:', err)
            return res.status(500).send('Database error');
        }
        if (user) {
            // auth successful
            req.session.user = user;
            res.redirect('/');
        } else {
            // auth failed
            res.render('login', {
                session: req.session,
                AUTH_URL: process.env.AUTH_URL || 'http://formbeta.yorktechapps.com/oauth',
                loginError: true
            });
        }
    });
});

// Socket.IO Setup 
const SocketServer = require('./modules/socketServer');
const server = http.createServer(app);
const socketServer = new SocketServer(server, session, logger);
const socketIO = socketServer.initialize();

// Start server
server.listen(PORT, () => {
    console.log(`Server is running at http://192.168.1.165:${PORT}`);
});

// Exports
module.exports = app;
module.exports.db = db;
module.exports.sessionStore = sessionStore;

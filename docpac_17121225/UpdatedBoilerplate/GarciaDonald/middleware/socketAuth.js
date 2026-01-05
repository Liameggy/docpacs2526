// middleware/helper for socket.io that runs during the connection  handshake to attach session data to the socket request
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(session);
const logger = require('../modules/logger.js');
// setting up session store
const sessionStore = new connect_sqlite3({
    db: 'sessions.sqlite',  
    dir: './',
    table: 'sessions'
});
// creating session middleware
const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'default_secret',    
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3.5 * 60 * 60 * 1000, // 3.5 hours
        // secure is true for production (https) and false for development (http)
        secure: process.env.NODE_ENV === 'production'
    }
});
module.exports = sessionMiddleware;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const logger = require('../modules/logger');

const sessionMiddleware = session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',  // Separate file for sessions
        dir: path.resolve(__dirname, '../data')
        // Remove table: 'sessions' - let it use default
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
});

module.exports = sessionMiddleware;

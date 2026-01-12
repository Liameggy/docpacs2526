// middleware/session.js
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';

const sessionMiddleware = session({
    store: new SQLiteStore({ 
        db: 'sessions.db', 
        dir: './data'  // Changed from ./db to ./data to match requirements
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
});

module.exports = sessionMiddleware;

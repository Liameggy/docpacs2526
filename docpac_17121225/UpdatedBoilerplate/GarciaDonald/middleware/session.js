<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
<<<<<<< HEAD
// configure session store
db = require('sqlite3').verbose();
const session = require('express-session');
const connect_sqlite3 = require('connect-sqlite3')(session);
const sessionStore = new connect_sqlite3({
    db: 'session.db',
    dir: './',
    table: 'sessions'
});
// export middleware for express and socket.io
module.exports = function sessionMiddleware(options) {
    return session({
        store: sessionStore,
        ...options
    });
};
// configure session cookies

app.use(cookieParser());
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
// creating and exporting session middleware configured with express-session and connect-sqlite3
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(session);
const logger = require('../modules/logger.js');
// reading configuration from environment variables
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_secret';
// setting up session store
const sessionStore = new connect_sqlite3({
    db: 'sessions.sqlite',  
    dir: './',
    table: 'sessions'
});
// exporting session middleware
module.exports = session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3.5 * 60 * 60 * 1000, // 3.5 hours
        // secure is true for production (https) and false for development (http)
        secure: process.env.NODE_ENV === 'production'

    }
});
app.use(sessionMiddleware); 
// attaching the session middleware to socket.io handshake
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> 14a2061a109e03fc01c1edd69725c3f69d1cb31c
>>>>>>> Stashed changes
=======
>>>>>>> 14a2061a109e03fc01c1edd69725c3f69d1cb31c
>>>>>>> Stashed changes

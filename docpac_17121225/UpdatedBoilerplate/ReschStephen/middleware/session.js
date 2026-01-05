// Imports
import 'dotenv/config';
import { logging } from '../modules/logger.js';
import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
const SQLiteStore = connectSqlite3(session);
const app = express();

// Session setup
export const sessionMiddleware = session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data',
        table: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: false, // Set to true if using HTTPS
    },
});

export default sessionMiddleware;

app.use(sessionMiddleware);

app.use((req, res, next) => {
    logging('INFO', `Session ID: ${req.sessionID}`);
    next();
});

app.use((req, res, next) => {
    if (!req.session.views) {
        req.session.views = 0;
    }
    req.session.views++;
    logging('INFO', `Number of views: ${req.session.views}`);
    next();
});


// Imports
import 'dotenv/config';
import { logging } from './modules/logger.js';
import sessionMiddleware from './middleware/session.js';
import express from 'express';
const app = express();
import session from 'express-session';
import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();
import connectSqlite3 from 'connect-sqlite3';
const SQLiteStore = connectSqlite3(session);
import fs from 'fs';
import multer from 'multer';
import formbarRoutes from './modules/auth/formbarAuth.js';
import jwt from 'jsonwebtoken';
import { registerUser, validateUser } from './modules/auth/native.js';
import { UserInstanceTracker } from './modules/instanceManager.js';



app.use(sessionMiddleware);

// Database setup
const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        logging('INFO', 'Connected to SQLite database.');
    }
});

const userTracker = new UserInstanceTracker();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/uploads', express.static('./data/uploads'));
app.use(express.urlencoded({ extended: true }));
app.use('/', formbarRoutes);

// Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './data/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
// Routes
app.get('/', (req, res) => {
    res.render('home.ejs', {
        user: req.session.user || null,
        loggedIn: req.session.user ? true : false
    });
});

app.get('/login', (req, res) => {
    res.render('login.ejs', {
        user: req.session.user || null,
        loggedIn: req.session.user ? true : false,
        error: null
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // First try to validate the existing user
    validateUser(db, username, password, (err, isValid) => {
        if (err) {
            return res.render('login.ejs', {
                user: null,
                loggedIn: false,
                error: 'Error during authentication.'
            });
        }

        if (isValid) {
            // User exists and password is correct
            req.session.user = { username };
            res.redirect('/profile');
        } else {
            // User doesn't exist or password is wrong
            const checkUserQuery = `SELECT username FROM users WHERE username = ?`;
            db.get(checkUserQuery, [username], function (err, row) {
                if (err) {
                    return res.render('login.ejs', {
                        user: null,
                        loggedIn: false,
                        error: 'Error during authentication.'
                    });
                }

                if (!row) {
                    // User doesn't exist, so register them automatically
                    registerUser(db, username, password, (err) => {
                        if (err) {
                            return res.render('login.ejs', {
                                user: null,
                                loggedIn: false,
                                error: 'Error creating new user.'
                            });
                        }
                        // Registration successful, log them in
                        req.session.user = { username };
                        res.redirect('/profile');
                    });
                } else {
                    // User exists but password is wrong
                    res.render('login.ejs', {
                        user: null,
                        loggedIn: false,
                        error: 'Invalid password.'
                    });
                }
            });
        }
    });
});


app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Debug what's in the session
    logging('INFO', 'Session user:', req.session.user);

    // Read files from uploads directory
    const uploadsDir = './data/uploads';
    let files = [];
    try {
        files = fs.readdirSync(uploadsDir);
        logging('INFO', 'Files found:', files);
    } catch (err) {
        logging('ERROR', 'No uploads directory or error reading files:', err.message);
    }

    res.render('profile.ejs', {
        user: req.session.user,
        loggedIn: true,
        files: files
    });
});

app.post('/upload', upload.single('profilePic'), (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/profile?error=No file selected');
        }

        logging('INFO', 'File uploaded:', req.file.filename);
        res.redirect('/profile?success=File uploaded successfully');
    } catch (error) {
        logging('ERROR', 'Upload error:', error);
        res.redirect('/profile?error=Upload failed');
    }
});

app.get('/sockets', (req, res) => {
    res.render('sockets.ejs', {
        user: req.session.user || null,
        loggedIn: req.session.user ? true : false
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logging('INFO', `Server is running on http://localhost:${PORT}`);
});
// Socket.io setup
import { Server } from 'socket.io';
const io = new Server(server);
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
import onConnect from './sockets/onConnect.js';
import onJoinRoom from './sockets/onJoinRoom.js';
onConnect(io);
onJoinRoom(io);

import onChat from './sockets/onChat.js';
onChat(io);

export { app, server, io, db, userTracker };

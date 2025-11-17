//imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const { is } = require('express/lib/request');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

//database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

//constants
const PORT = process.env.PORT;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || "your_api_key";

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

//middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))

//routes

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 100,
        to: 112,
        amount: 5,
        pin: 69420,
        reason: 'Test pogs transfer'
    };

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        // Insert the user into the database
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`User ${tokenData.displayName} saved to database`);
            }
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

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('Connected to the server');
    socket.emit('getActiveClass')
});

socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

socket.on('setClass', (classData) => {
    console.log('Received class data:', classData);
    socket.emit('classUpdate');
});

socket.on('classUpdate', (classroomData) => {
    console.log(`Classroom id: ${classroomData.id}, Name: ${classroomData.className}, Active: ${classroomData.isActive}`);
    console.log(`Response: ${classroomData.poll.totalResponses} / ${classroomData.poll.totalResponders}`);
});



//start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
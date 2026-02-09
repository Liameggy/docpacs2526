require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
app.set('view engine', 'ejs');
const jwt = require('jsonwebtoken');
const io = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose(); 
const sqliteStore = require('connect-sqlite3')(session);

//Constants
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SESSION_SECRET;
const AUTH_URL = process.env.AUTH_URL;
const API_KEY = process.env.API_KEY;

//Database setup
const db = new sqlite3.Database("./db/app.db", (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});
//Session setup
const sessionOptions = {
    store: new sqliteStore({db: 'sessions.db', dir: './db'}),
    secret: "It's a secret",
    resave: false,
    saveUninitialized: false,
}
//Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}
app.use(session(sessionOptions));
app.set('view engine', 'ejs');
//Home page
app.get('/', isAuthenticated,(req, res) => {
    res.render('index', {user: req.session.user});
});
//Login page
app.get('/login', (req, res) => {
    if (req.session.user) { //If user is already logged in, redirect to chat
        res.redirect('/');
    } else if (req.query.token) { //If token is present in query, decode it and set session variables
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        req.session.uid = tokenData.id;
        console.log(`User ${tokenData.displayName} logged in with id ${tokenData.id}`);
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        res.redirect('/');
    } else { //If no token, redirect to auth server
        res.redirect(`${AUTH_URL}/oauth?redirectURL=http://${req.hostname}:3000/login`);
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

//Socket.io client to connect to auth server
const socket = io(AUTH_URL, {
    extraHeaders: {
        'API': API_KEY
    }
});
socket.on('connect', () => {
    console.log('Connected to auth server');
    socket.emit('getActiveClass');
});
socket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});
socket.on('setClass', (classData) => {
    console.log('Received class data:', classData);
});
socket.on("transferResponse", (response) => {
    console.log("Transfer Response:", response);
});
app.get('/sendPogs', isAuthenticated, (req, res) => {
    const data = {
        from: 1,
        to: 2,
        amount: 1,
        pin: 1234,
        reason: "test"
    };
    socket.emit('transferDigipogs', data);
    res.send('Transfer request sent');
});
app.listen(PORT, () =>
    console.log(`Example app listening at http://localhost:${PORT}`)
);

//impotr
require('dotenv').config();
const express = require('express');
const app = express();  
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
console.log(Server)
const io = new Server(server);
//constants 
const PORT=process.env.PORT || 3000;
const SESSION_SECRET=process.env.SESSION_SECRET || "massacre";
const AUTH_URL=process.env.AUTH_URL || "https://localhost:420/oauth";
const THIS_URL=process.env.THIS_URL || "http://localhost:${PORT}";
const API_KEY = process.env.API_KEY || "12345";
const sqlite3 = require('sqlite3').verbose();   
const SQLiteStore = require('connect-sqlite3')(session);
//database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});
//middlewar
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }))
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};
app.set('view engine', 'ejs');
//routes
app.get('/',isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user});
});
app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;
         //save user to data bas if no exist
         db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} added to database or already exists.`);});
         
              res.redirect('/');
        } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
io.on('connection', (socket) => {
    console.log('Connected to auth server via socket.io',socket.id);
    socket.emit('wlecom', 'howdy!');


socket.on('userUpdate', (data) => {
    console.log('User update received:', data);
   
    socket.broadcast.emit('serverUpdate', data);
});
socket.on('timeUpdate', (rotimer) => {
    console.log('Message received:', rotimer);
   let rtimer=JSON.parse(rotimer);
   rtimer++;
    io.emit('serverMessagetime', JSON.stringify(rtimer));
});
socket.on('disconnect', () => {
    console.log('Disconnected from auth server', socket.id);
});
});


//start server
server.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});
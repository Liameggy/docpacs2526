const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
const { createServer } = require('node:http')
const { join } = require("node:path")
const { Server } = require("socket.io")
//add encryption if necessary
const app = express();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'
const server = createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/templatedatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

const middleWare = session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false
})

app.use(middleWare);

io.use((socket, next) => {
    middleWare(socket.request, {}, next)
})

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.redirect('http://localhost:3000/chat')
    }
    catch (error) {
        res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        res.redirect('/')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
});

app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat.ejs', { user: req.session.user })
});

io.on('connection', (socket) => {
    var data = socket.request.session;
    const user = data.user
    var disconnect = true
    console.log("User Connected: ", user);
    io.emit('user connected', user)
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg, user) //add previous messages to new user
    })
    socket.on('chat refresh', (msg, userList) => {
        io.emit('chat refresh', msg, userList)
    })
    socket.on('disconnect', () => {
        console.log("User Disconnected: ", user)
        io.emit('clear user list', disconnect)
    })
    socket.on('user connected', () => {
        io.emit('user connected', user)
    })
})

server.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});
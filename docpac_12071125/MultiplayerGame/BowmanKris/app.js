const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const http = require('http');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', __dirname + '/views');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to initialize session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretFillerKey',
    resave: false,
    saveUninitialized: true,
}));

// Initialize custom modules
//const auth = require('./js/auth');
const socketIO = require('./js/socketIO');

// // Initialize authentication and socket.io
// auth(app, jwt, port, () => {
//     console.log('Authentication confirmed. Initializing Socket.IO...');
//     socketIO(server, Server);
// });

// // Use the auth routes
// app.use('/', auth);

socketIO(server);

app.use('/', (req, res) => {
    res.render('index')
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
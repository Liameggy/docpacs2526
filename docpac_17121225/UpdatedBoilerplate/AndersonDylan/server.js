// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const homeRoutes = require('./routes/home');
const loginRoutes = require('./routes/login');
const { initializeSocketServer } = require('./modules/socketServer');
const sqlite3 = require('sqlite3').verbose();
const logger = require('./modules/logger');
const sessionMiddleware = require('./middleware/session');
const isAuthenticated = require('./middleware/isAuthenticated');
const profileRoutes = require('./routes/profile')
const apiRoutes = require('./routes/api/users');
const socketsRoutes = require('./routes/sockets');

// Database setup
const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) {
        logger.error('Could not connect to database', { error: err.message });
    } else {
        logger.info('Connected to database');
    }
});

// Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Routes
app.use('/', homeRoutes);
app.use('/', loginRoutes);
app.use('/', profileRoutes);
app.use('/api', apiRoutes);
app.use('/sockets', socketsRoutes);

/*app.get('sendpogs'), isAuthenticated, (req, res) => {
    const data = {
        from: 1,
        to: 97,
        amount: 10,
        pin: 1234,
        reason: 'Test pogs transfer'
    }

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
};*/

// Start server
const server = require('http').createServer(app);
initializeSocketServer(server, sessionMiddleware);

server.listen(PORT, () => {
    logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
});
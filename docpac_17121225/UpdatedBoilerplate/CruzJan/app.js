require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const winston = require('winston');

// Constants
const PORT = process.env.PORT || 3000;
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key'
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';

// Database setup
const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware Imports
import './middleware/session.js';
import './middleware/socketAuth.js';

// Routes
import './routes/login.js';
import './routes/home.js';
import './routes/profile.js';


// Socket imports here
import './sockets/onConnect.js';
import './sockets/onChat.js';
import './sockets/onJoinRoom.js'

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})



const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const logger = require('../../modules/logger');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.resolve(__dirname, '../../data/database.sqlite');

// Function to get all users from SQLite database
async function getAllUsers() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT id, username FROM users`;
        
        db.all(query, [], (err, rows) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(rows || []);
        });
    });
}

// GET /users (will be mounted as /api/users in app.js)
router.get('/users', isAuthenticated, async (req, res) => {
    try {
        logger.info('API request for users list');
        
        const users = await getAllUsers();
        
        logger.info(`Returning ${users.length} users`);
        res.json({ 
            success: true,
            users: users 
        });
        
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
});

module.exports = router;

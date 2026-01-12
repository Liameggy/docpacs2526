// routes/api/users.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const isAuthenticated = require('../../middleware/isAuthenticated');
const logger = require('../../modules/logger');

const db = new sqlite3.Database('./data/database.sqlite');

// API endpoint to get all users (requires authentication)
router.get('/users', isAuthenticated, (req, res) => {
    db.all('SELECT id, username, createdAt FROM users', [], (err, rows) => {
        if (err) {
            logger.error('API: Error fetching users', { error: err.message });
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Could not fetch users'
            });
        }

        logger.info('API: Users data requested', { 
            requestedBy: req.session.user,
            userCount: rows.length 
        });

        res.json({
            users: rows,
            total: rows.length,
            requestedBy: req.session.user,
            timestamp: new Date().toISOString()
        });
    });
});

// API middleware for unauthenticated requests
router.use((req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required to access this API'
        });
    }
    next();
});

module.exports = router;

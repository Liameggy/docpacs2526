const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const logger = require('../../modules/logger');
const sqlite3 = require('sqlite3').verbose();
const sharedUtilitys = require('../../shared/utilities')
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        logger.error(err.message);
    }
});
//made user 'sted o' users to align with file name
router.get('/user', isAuthenticated, (req, res) => {
    
    db.all('SELECT id, username FROM users', (err, rows) => {
    if (err) {
        logger.error(err.message);
        res.status(500).json({ error: 'Database error' });
    } else {
        res.json({ users:rows});
    }
});
});

module.exports = router;

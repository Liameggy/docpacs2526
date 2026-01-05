// defining an API endpooint for user data
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
// endpoint to get user data by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT id, username, formbarId FROM users WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.json(row);
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    });
});
module.exports = router;

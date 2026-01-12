const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const db = require('../../modules/db');

router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, username, createdAt FROM users ORDER BY id LIMIT 100');
    res.json({ users: rows });
  } catch (err) {
    const logger = require('../../modules/logger');
    logger.error('Failed to fetch users: ' + err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;

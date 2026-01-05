// API endpoint for user data
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/isAuthenticated');
import { logging } from '../../modules/logger.js';

// Using GET method and will get response of JSON array of user objects, and uses isAuthenticated middleware
router.get('/', isAuthenticated, (req, res) => {
    const users = [
        { "id": 1, "userame": "Goober1" },
        { "id": 2, "username": "Goober2" },
    ];
    res.json(users);
});
module.exports = router;

// Use database to fetch real user data
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll(); // Assuming User is a Sequelize model
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Handle errors gracefully, logging them using the logger and returning a safe error message
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const users = await User.findAll(); // Assuming User is a Sequelize model
        res.json(users);
    } catch (error) {
        logging('ERROR', 'Error fetching users:', error);
        res.status(500).json({ error: 'An unexpected error occurred while fetching users' });
    }
});
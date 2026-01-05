// Routes for the login page
const express = require('express');
const router = express.Router();
const logging = require('../modules/logger.js');
const { isAuthenticated } = require('../middleware/isAuthenticated');
import { isValidUsername } from '../shared/utilities.js';
import { isValidPassword } from '../shared/utilities.js';

router.get('/', (req, res) => {
    logging('INFO', 'Login page accessed');
    res.render('login');
});

router.post('/', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!isValidUsername(username) || !isValidPassword(password)) {
        logging('WARN', `Invalid login attempt for username: ${username}`);
        return res.status(400).render('login', { error: 'Invalid username or password format.' });
    }
    else {
        req.session.user = { username };
        return res.redirect('/home');
    }
});
module.exports = router;

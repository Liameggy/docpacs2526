const express = require('express');
const router = express.Router();
const native = require('../modules/auth/native');
const logger = require('../modules/logger');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.resolve(__dirname, '../data/database.sqlite');

// Environment variables
const AUTH_URL = process.env.FORMBAR_REDIRECT_URI || 'http://localhost:420/oauth';  
const THIS_URL = process.env.THIS_URL || `http://localhost:3000`;

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

// Native login - username/password
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await native.loginUser(username, password);

        if (user) {
            req.session.user = user;
            logger.info(`User ${user.username} logged in successfully via native`);
            res.redirect('/');
        } else {
            res.render('login', { errorMessage: 'Invalid credentials. Please try again.' });
        }
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        res.render('login', { errorMessage: 'An error occurred during login. Please try again later.' });
    }
});

// Formbar login - redirect to Formbar
router.get('/login/formbar', (req, res) => {
    const redirectUri = `${AUTH_URL}/oauth?redirectURL=${THIS_URL}/login/formbar/callback`;
    logger.info(`Redirecting to Formbar login page: ${redirectUri}`);
    res.redirect(redirectUri);
});

// Formbar callback - handle return from Formbar
router.get('/login/formbar/callback', async (req, res) => {
    try {
        if (req.query.token) {
            // Decode the JWT token from Formbar
            let tokenData = jwt.decode(req.query.token);
            
            // Store token and user data in session
            req.session.token = tokenData;
            req.session.user = {
                id: tokenData.id,
                username: tokenData.displayName,
                email: tokenData.email,
                formbarId: tokenData.id,
                permissions: tokenData.permissions,
                activeClass: tokenData.activeClass
            };

            // Save user to database if not exists
            const db = new sqlite3.Database(dbPath);
            db.run(`INSERT OR IGNORE INTO users (username, formbarId, created_at) VALUES (?, ?, datetime('now'))`, 
                [tokenData.displayName, tokenData.id], 
                function(err) {
                    db.close();
                    if (err) {
                        logger.error(`Database error: ${err.message}`);
                    } else {
                        logger.info(`User ${tokenData.displayName} saved to database.`);
                    }
                }
            );

            logger.info(`User ${tokenData.displayName} logged in successfully via Formbar`);
            res.redirect('/');

        } else {
            // No token received, redirect back to Formbar
            logger.warn('No token received from Formbar, redirecting back');
            res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}/login/formbar/callback`);
        }
    } catch (error) {
        logger.error(`Formbar callback failed: ${error.message}`);
        res.render('login', { errorMessage: 'Formbar authentication failed. Please try again.' });
    }
});

router.get('/logout', (req, res) => {
    if (req.session) {
        const username = req.session.user ? req.session.user.username : 'Guest';
        req.session.destroy(err => {
            if (err) {
                logger.error(`Logout error for user ${username}: ${err.message}`);
            } else {
                logger.info(`User ${username} logged out successfully`);
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

// Register route - show registration form
router.get('/register', (req, res) => {
    res.render('register', { errorMessage: null, successMessage: null });
});

// Register POST - handle user registration
router.post('/register', async (req, res) => {
    const { username, password, passwordConfirm } = req.body;

    try {
        // Validate input
        if (!username || !password || !passwordConfirm) {
            return res.render('register', { errorMessage: 'All fields are required', successMessage: null });
        }

        if (password !== passwordConfirm) {
            return res.render('register', { errorMessage: 'Passwords do not match', successMessage: null });
        }

        if (password.length < 6) {
            return res.render('register', { errorMessage: 'Password must be at least 6 characters', successMessage: null });
        }

        // Register user
        const user = await native.registerUser(username, password);
        
        if (user) {
            logger.info(`New user registered: ${user.username}`);
            return res.render('register', { errorMessage: null, successMessage: 'Registration successful! You can now login.' });
        }
    } catch (error) {
        logger.error(`Registration failed: ${error.message}`);
        const errorMsg = error.message.includes('already exists') ? 'Username already exists' : 'Registration failed. Please try again.';
        res.render('register', { errorMessage: errorMsg, successMessage: null });
    }
});

module.exports = router;

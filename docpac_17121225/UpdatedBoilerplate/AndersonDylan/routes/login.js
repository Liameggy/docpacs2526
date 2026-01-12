// routes/login.js - Final version
const express = require('express');
const router = express.Router();
const logger = require('../modules/logger');
const { loginUser } = require('../modules/auth/native');
const { getAuthorizationUrl, handleCallback } = require('../modules/auth/formbarAuth');

router.get('/login', async (req, res) => {
    // If user is already logged in, redirect to home
    if (req.session.user) {
        return res.redirect('/');
    }

    if (req.query.token) {
        // Handle Formbar OAuth callback
        try {
            const result = await handleCallback(req.query.token);
            req.session.token = result.tokenData;
            req.session.user = result.user.username;
            req.session.userId = result.user.id;
            
            res.redirect('/');
        } catch (error) {
            logger.error('Formbar login failed', { error: error.message });
            res.render('login', { error: 'Formbar login failed. Please try again.' });
        }
    } else {
        // Show login page
        res.render('login', { error: null });
    }
});

// Handle native login form submission
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.render('login', { error: 'Username and password are required' });
    }
    
    try {
        const user = await loginUser(username, password);
        if (user) {
            req.session.user = user.username;
            req.session.userId = user.id;
            logger.info('Native login successful', { username });
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        logger.error('Native login error', { error: error.message });
        res.render('login', { error: 'Login failed. Please try again.' });
    }
});

// Redirect to Formbar OAuth
router.get('/login/formbar', (req, res) => {
    res.redirect(getAuthorizationUrl());
});

router.get('/logout', (req, res) => {
    const username = req.session.user;
    req.session.destroy((err) => {
        if (err) {
            logger.error('Error destroying session', { error: err.message });
        } else {
            logger.info('User logged out', { username });
        }
        res.redirect('/login');
    });
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const { registerUser } = require('../modules/auth/native');
        const user = await registerUser(username, password);
        logger.info('User registered for testing', { username });
        res.redirect('/login');
    } catch (error) {
        res.render('login', { error: error.message });
    }
});

module.exports = router;

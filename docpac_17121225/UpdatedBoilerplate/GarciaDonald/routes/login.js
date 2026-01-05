const express = require('express');
const router = express.Router();
const nativeAuth = require('../modules/auth/native.js');

// Show login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        // Try redirectURL instead of redirect_uri
        const authUrl = `http://formbeta.yorktechapps.com/oauth?client_id=${process.env.CLIENT_ID}&redirectURL=${encodeURIComponent(process.env.REDIRECT_URL)}&response_type=code`;
        
        console.log('Raw AUTH_URL:', authUrl);
        
        res.render('login', {
            session: req.session,
            AUTH_URL: authUrl,
            loginError: false
        });
    }
});

// Handle local authentication
router.post('/auth/local', (req, res) => {
    const { username, password } = req.body;
    
    nativeAuth.authenticateUser(username, password, (err, user) => {
        if (err) {
            console.error('Authentication error:', err);
            return res.status(500).send('Database error');
        }
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('login', {
                session: req.session,
                AUTH_URL: process.env.AUTH_URL,
                loginError: true
            });
        }
    });
});

module.exports = router;

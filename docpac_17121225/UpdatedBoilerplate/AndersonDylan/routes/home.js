// routes/home.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
});

module.exports = router;

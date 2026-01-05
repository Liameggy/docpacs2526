// Routes for the home page
const express = require('express');
const router = express.Router();
const logging = require('../modules/logger.js');

router.get('/', (req, res) => {
    logging('INFO', 'Home page accessed');
    res.render('home', { user: req.user });
});
module.exports = router;
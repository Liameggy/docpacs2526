const express = require('express');
const router = express.Router();
const logger = require('../modules/logger');
const utilities = require('../shared/utilities');

router.get('/', (req, res) => {
    logger.info(`Rendering home page for user: ${req.session.user ? req.session.user.id : 'Guest'}`);
    const layoutData = {
        user: req.session.user || null,
        pageTitle: 'Home'
    };
    res.render('home', layoutData);
});
module.exports = router;

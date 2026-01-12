// middleware/isAuthenticated.js
const logger = require('../modules/logger');

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        logger.info('Unauthenticated access attempt', { 
            url: req.url, 
            ip: req.ip 
        });
        res.redirect('/login');
    }
};

module.exports = isAuthenticated;

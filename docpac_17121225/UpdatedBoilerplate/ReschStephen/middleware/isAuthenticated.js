// Express middleware that checks whether req.session contains a logged-in user
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.status(401).send('Unauthorized: You must be logged in to access this resource.');
    }
}
module.exports = isAuthenticated;
module.exports.isAuthenticated = isAuthenticated;

// If user not authenticated, for normal pages, redirect to login page
module.exports.redirectIfNotAuthenticated = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// If user is authenticated, for API endpoints, send appropriate unauthorized response
module.exports.apiAuthMiddleware = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Please log in to access this API.' });
    }
};


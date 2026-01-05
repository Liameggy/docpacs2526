// expressing middleware which check whether req.session contains a logged in user
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        // user isnt authenticated
        if (req.path.startsWith('/api/')) {
            //api request
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            // web request
            res.redirect('/login');
        }
    }
}

module.exports = {
    isAuthenticated
};

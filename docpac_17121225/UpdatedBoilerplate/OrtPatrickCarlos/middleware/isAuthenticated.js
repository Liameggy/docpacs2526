function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        // Check if this is an API request
        if (req.path.startsWith('/api/')) {
            res.status(401).json({ error: 'Authentication required' });
        } else {
            res.redirect('/login');
        }
    }
}

module.exports = isAuthenticated;

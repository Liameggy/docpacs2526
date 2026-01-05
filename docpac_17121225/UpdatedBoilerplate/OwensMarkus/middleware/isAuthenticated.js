function isAuthMiddleware(req, res, next) {
    if (req.session.user) { return next(); }
    const isApiRequest = req.path.startsWith('/api');
    
    if (isApiRequest) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Authentication required' 
        });
    }
    else { return res.redirect('/login');}
}
module.exports = isAuthMiddleware
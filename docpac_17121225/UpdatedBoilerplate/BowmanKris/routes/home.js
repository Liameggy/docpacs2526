// import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

function homeRoute(app) {
    app.get('/', (req, res) => {
        try {
            if (!req.session.user) {
                res.render('login');
            } else if (req.session.user && isAuthenticated) {
                res.render('home', {
                    displayName: req.session.displayName
                });
            };
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = homeRoute;
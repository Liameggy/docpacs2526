// import required modules
const jwt = require('jsonwebtoken');

//import custom modules
const databaseManager = require('../modules/databaseManager');

//retrieve environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const FORMBAR_AUTH_URL = process.env.FORMBAR_AUTH_URL;
const REDIRECT_URL = `${HOST}${PORT}/login/Formbar`;

function loginRoute(app) {
    app.get('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            res.render('login');
        }
    });

    app.get('/login/Formbar', (req, res) => {
        if (req.query.token) {
            let tokenData = jwt.decode(req.query.token)
            req.session.token = tokenData
            req.session.user = tokenData.email;
            req.session.displayName = tokenData.displayName;
            req.session.permission = tokenData.permissions;
            res.redirect('/');
        } else {
            res.redirect(`${FORMBAR_AUTH_URL}?redirectURL=${REDIRECT_URL}`);
        }
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body; // Retrieve username and password from form
        if (username && password) {
            databaseManager.authenticateUser(username, password, req, res);
        }
    });

    app.post('/login/createUser', (req, res) => {
        const { createUsername, createDisplayName, createPassword } = req.body; // Retrieve username and password from form
        if (createUsername && createDisplayName && createPassword) {
            try {
                databaseManager.saveUserData({ createUsername, createDisplayName, createPassword, permissions: 2 });
                req.session.user = createUsername;
                req.session.displayName = createDisplayName;
                res.redirect('/');
            } catch (error) {
                console.error('Error saving user data:', error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(400).send('Username and password are required');
        }
    });
};

module.exports = loginRoute;
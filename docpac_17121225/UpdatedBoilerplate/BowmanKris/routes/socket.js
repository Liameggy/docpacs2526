//import required modules
const path = require('path');
const fs = require('fs');

// import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

//retrive environment variables
const UPLOADS_DIR = process.env.UPLOADS_DIR;

function socketRoute(app) {
    app.get('/socket', (req, res) => {
        try {
            if (req.session.user && isAuthenticated) {
                const files = fs.readdirSync(UPLOADS_DIR); // Read all files in the uploads directory
                const userFile = files.find(file => path.parse(file).name === req.session.user); // Find file matching the user

                if (userFile) {
                    req.session.avatarPath = `/uploads/${userFile}`; // Set the avatar path with the correct file name
                }

                res.render('socket', {
                    user: req.session.user,
                    displayName: req.session.displayName,
                    avatarPath: req.session.avatarPath
                });
            } else {
                res.render('login');
            }
        }
        catch (error) {
            res.send(error.message)
        }
    });
};

module.exports = socketRoute;
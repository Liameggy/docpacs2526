//import required modules
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//import custom middleware
const isAuthenticated = require('../middleware/isAuthenticated');

//retrive environment variables
const UPLOADS_DIR = process.env.UPLOADS_DIR;

//configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR); // Uploads directory
    },
    filename: (req, file, cb) => {
        const user = req.session.user;
        const ext = path.extname(file.originalname); // Get the file extension
        cb(null, `${user}${ext}`); // Rename file to user's name with extension
    }
});
const upload = multer({ storage });

function profileRoute(app) {
    app.get('/profile', (req, res) => {
        try {
            if (req.session.user && isAuthenticated) {
                const files = fs.readdirSync(UPLOADS_DIR); // Read all files in the uploads directory
                const userFile = files.find(file => path.parse(file).name === req.session.user); // Find file matching the user
    
                if (userFile) {
                    req.session.avatarPath = `/uploads/${userFile}`; // Set the avatar path with the correct file name
                }

                res.render('profile', {
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

    // Endpoint to handle avatar upload
    app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
        try {
            // Save the file path in the session
            const filePath = `/uploads/${req.file.filename}`;
            req.session.avatarPath = filePath;

            res.json({ success: true, filePath });
        } catch (error) {
            console.error('Error uploading avatar:', error.message);
            res.status(500).json({ success: false, message: 'Failed to upload avatar' });
        }
    });
};

module.exports = profileRoute;
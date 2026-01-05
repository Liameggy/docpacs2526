// Users can upload files via a form, only authenticated users can use this, and this program uses multer
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const path = require('path');
const fs = require('fs');
const logging = require('../modules/logger.js');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/');
        // Ensure the upload directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Profile route
router.get('/', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});


// Restrict allowed file types to images only, and don't allow uploaded files to overwrite critical system files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        logging('WARN', `User ${req.user.id} attempted to upload a disallowed file type: ${file.originalname}`);
        cb(new Error('Only image files are allowed!'));
    }
};

const uploadWithFilter = multer({ storage: storage, fileFilter: fileFilter });
router.post('/upload', isAuthenticated, uploadWithFilter.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    logging('INFO', `Uploaded file: ${req.file.filename}`);
    res.send('File uploaded successfully.');
});
module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const { isAuthenticated } = require('../middleware/isAuthenticated');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Show profile page
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile');
});

// Handle file upload
router.post('/upload', isAuthenticated, upload.single('document'), (req, res) => {
    const user_id = req.session.user.id;
    const file_name = req.file.filename;
    const original_name = req.file.originalname;
    const uploaded_at = Date.now();
    
    const query = `INSERT INTO uploads (user_id, file_name, uploaded_at) VALUES (?, ?, ?)`;
    db.run(query, [user_id, file_name, uploaded_at], function(err) {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).json({
            message: 'File uploaded successfully',
            filename: original_name,
            uploaded_at: uploaded_at
        });
    });
});

module.exports = router;

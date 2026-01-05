const express = require('express');
const router = express.Router();
const logger = require('../modules/logger');
const isAuthenticated = require('../middleware/isAuthenticated');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/profile', isAuthenticated, (req, res) => {
    if (req.session && req.session.user) {
        // Add debug logging
        const profilePicture = getUserProfilePicture(req.session.user.id);
        
        console.log('=== PROFILE DEBUG ===');
        console.log('User ID:', req.session.user.id);
        console.log('Profile picture found:', profilePicture);
        console.log('====================');
        
        logger.info(`User ${req.session.user.username} accessed their profile.`);
        res.render('profile', { 
            user: req.session.user,
            profilePicture: profilePicture,
            successMessage: req.query.success ? 'Profile picture updated successfully!' : null,
            errorMessage: req.query.error ? decodeURIComponent(req.query.error) : null
        });
    } else {
        logger.info('Profile access attempt without a valid session.');
        res.redirect('/login');
    }
});


// Function to find user's profile picture in uploads folder
function getUserProfilePicture(userId) {
    const uploadsDir = path.resolve(__dirname, '../data/uploads');
    
    try {
        // Look for files that start with "profile_user{userId}_"
        const files = fs.readdirSync(uploadsDir);
        const profileFile = files.find(file => file.startsWith(`profile_user${userId}_`));
        
        return profileFile || null;
    } catch (error) {
        logger.error(`Error reading uploads directory: ${error.message}`);
        return null;
    }
}

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../data/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info('Created uploads directory.');
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'data/uploads/');
    },
    filename: (req, file, cb) => {
        const userId = req.session.user ? req.session.user.id : 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        // Create a clean filename for profile pictures
        cb(null, `profile_user${userId}_${timestamp}${ext}`);
    }
});

// Filter for image files only (for profile pictures)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        logger.info(`Image file accepted: ${file.originalname}`);
        return cb(null, true);
    }
    logger.warn(`File type rejected: ${file.originalname}`);
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed for profile pictures.'));
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
    }
});

// File upload route
router.post('/upload', isAuthenticated, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // ... existing error handling ...
        } else if (err) {
            // ... existing error handling ...
        }

        if (req.file) {
            console.log('📤 File Upload Success:');
            console.log('  👤 User ID:', req.session.user.id);
            console.log('  📁 Filename:', req.file.filename);
            
            logger.info(`Profile picture uploaded: ${req.file.filename} by user ${req.session.user.username}`);
            
            // Redirect back to profile with success message
            res.redirect('/profile?success=1');
            
        } else {
            console.log('❌ No file uploaded');
            logger.warn('No file uploaded.');
            res.redirect('/profile?error=' + encodeURIComponent('No file uploaded'));
        }
    });
});


module.exports = router;

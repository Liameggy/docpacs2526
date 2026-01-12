// routes/profile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isAuthenticated = require('../middleware/isAuthenticated');
const logger = require('../modules/logger');
const { 
    getUserUploads, 
    saveUpload, 
    deleteUpload, 
    setProfilePicture, 
    getProfilePicture,
    getFriendlyFileType
} = require('../shared/utilities');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './data/uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Add debugging
    console.log('DEBUG - File upload attempt:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    // Allow file extensions
    const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|txt|md|markdown|doc|docx)$/i;
    const extname = allowedExtensions.test(file.originalname);
    
    // Allow MIME types (be more permissive for text files)
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf',
        'text/plain', 'text/markdown', 'text/x-markdown',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const mimetype = allowedMimeTypes.includes(file.mimetype) || 
                    file.mimetype.startsWith('text/') ||
                    file.mimetype === 'application/octet-stream'; // Sometimes markdown files come as this

    if (extname && (mimetype || file.originalname.match(/\.(md|markdown)$/i))) {
        console.log('DEBUG - File accepted');
        return cb(null, true);
    } else {
        console.log('DEBUG - File rejected');
        cb(new Error(`File type not allowed. Got: ${file.mimetype} for ${file.originalname}`));
    }
};



const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Profile page - show user's uploads
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const uploads = await getUserUploads(req.session.userId);
        const profilePicture = await getProfilePicture(req.session.userId);
        
        const uploadsWithFriendlyTypes = uploads.map(upload => ({
            ...upload,
            friendlyType: getFriendlyFileType(upload.originalName, upload.fileType)
        }));
        
        res.render('profile', { 
            user: req.session.user,
            userId: req.session.userId,
            uploads: uploadsWithFriendlyTypes,
            profilePicture: profilePicture,
            uploadSuccess: req.query.uploaded ? `File "${req.query.uploaded}" uploaded successfully!` : null,
            uploadError: req.query.error ? decodeURIComponent(req.query.error) : null,
            successMessage: req.query['picture-set'] ? 'Profile picture updated!' : 
            req.query.deleted ? 'File deleted successfully!' : null
        });
    } catch (error) {
        logger.error('Error loading profile page', { error: error.message });
        res.render('profile', { 
            user: req.session.user,
            userId: req.session.userId,
            uploads: [],
            profilePicture: null,
            uploadSuccess: null,
            uploadError: 'Error loading your files',
            successMessage: null
        });
    }
});

// Handle file upload
router.post('/profile/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    if (!req.file) {
        const uploads = await getUserUploads(req.session.userId).catch(() => []);
        const profilePicture = await getProfilePicture(req.session.userId).catch(() => null);
        
        return res.render('profile', {
            user: req.session.user,
            userId: req.session.userId,
            uploads: uploads,
            profilePicture: profilePicture,
            uploadSuccess: null,
            uploadError: 'No file selected'
        });
    }

    try {
        // Save upload to database
        await saveUpload(
            req.session.userId,
            req.file.filename,
            req.file.originalname,
            req.file.size,
            req.file.mimetype
        );

        logger.info('File uploaded successfully', {
            user: req.session.user,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });

        // Redirect to prevent resubmission
        res.redirect('/profile?uploaded=' + encodeURIComponent(req.file.originalname));

    } catch (error) {
        logger.error('Error saving upload', { error: error.message });
        
        // Delete the uploaded file if database save failed
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) logger.error('Error deleting failed upload', { error: unlinkErr.message });
        });

        const uploads = await getUserUploads(req.session.userId).catch(() => []);
        const profilePicture = await getProfilePicture(req.session.userId).catch(() => null);
        
        res.render('profile', {
            user: req.session.user,
            userId: req.session.userId,
            uploads: uploads,
            profilePicture: profilePicture,
            uploadSuccess: null,
            uploadError: 'Failed to save file information'
        });
    }
});

// Set profile picture
router.post('/profile/set-picture', isAuthenticated, async (req, res) => {
    const { filename } = req.body;
    
    try {
        await setProfilePicture(req.session.userId, filename);
        logger.info('Profile picture set', { user: req.session.user, filename });
        res.redirect('/profile?picture-set=true');
    } catch (error) {
        logger.error('Error setting profile picture', { error: error.message });
        res.redirect('/profile?error=picture-failed');
    }
});

// Delete upload
router.post('/profile/delete', isAuthenticated, async (req, res) => {
    const { uploadId, filename } = req.body;
    
    try {
        // Check if this file is currently the profile picture
        const currentProfilePicture = await getProfilePicture(req.session.userId);
        if (currentProfilePicture === filename) {
            logger.warn('Attempt to delete current profile picture', { user: req.session.user, filename });
            return res.redirect('/profile?error=Cannot delete file that is currently your profile picture');
        }
        
        const deleted = await deleteUpload(uploadId, req.session.userId);
        
        if (deleted) {
            // Delete the actual file
            const filePath = path.join('./data/uploads/', filename);
            fs.unlink(filePath, (err) => {
                if (err) logger.error('Error deleting file from disk', { error: err.message });
            });
            
            logger.info('File deleted', { user: req.session.user, filename });
            res.redirect('/profile?deleted=true');
        } else {
            res.redirect('/profile?error=delete-failed');
        }
    } catch (error) {
        logger.error('Error deleting upload', { error: error.message });
        res.redirect('/profile?error=delete-failed');
    }
});


// Serve uploaded files (with authentication)
router.get('/uploads/:filename', isAuthenticated, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'data', 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(404).send('File not found');
    }
});

// Handle upload errors
router.use('/profile/upload', (error, req, res, next) => {
    logger.error('File upload error', { error: error.message, user: req.session.user });
    res.redirect('/profile?error=' + encodeURIComponent(error.message));
});

module.exports = router;

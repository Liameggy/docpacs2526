// shared/utilities.js
const sqlite3 = require('sqlite3').verbose();
const logger = require('../modules/logger');

const db = new sqlite3.Database('./data/database.sqlite');

// Get user's uploads
const getUserUploads = (userId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM uploads WHERE userId = ? ORDER BY uploadedAt DESC', 
            [userId], (err, rows) => {
            if (err) {
                logger.error('Error fetching user uploads', { error: err.message });
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Save upload to database
const saveUpload = (userId, filename, originalName, fileSize, fileType) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO uploads (userId, filename, originalName, fileSize, fileType) VALUES (?, ?, ?, ?, ?)',
            [userId, filename, originalName, fileSize, fileType], function(err) {
            if (err) {
                logger.error('Error saving upload to database', { error: err.message });
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Delete upload
const deleteUpload = (uploadId, userId) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM uploads WHERE id = ? AND userId = ?', 
            [uploadId, userId], function(err) {
            if (err) {
                logger.error('Error deleting upload', { error: err.message });
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
};

// Set profile picture
const setProfilePicture = (userId, filename) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET profilePicture = ? WHERE id = ?', 
            [filename, userId], function(err) {
            if (err) {
                logger.error('Error setting profile picture', { error: err.message });
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
};

// Get user profile picture
const getProfilePicture = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT profilePicture FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                logger.error('Error getting profile picture', { error: err.message });
                reject(err);
            } else {
                resolve(row?.profilePicture || null);
            }
        });
    });
};

module.exports = {
    getUserUploads,
    saveUpload,
    deleteUpload,
    setProfilePicture,
    getProfilePicture
};

// Add this function to shared/utilities.js
const getFriendlyFileType = (originalName, mimeType) => {
    const ext = originalName.split('.').pop().toLowerCase();
    
    if (mimeType.startsWith('image/')) {
        return 'Image';
    } else if (mimeType === 'application/pdf') {
        return 'PDF Document';
    } else if (mimeType.includes('word') || ext === 'doc' || ext === 'docx') {
        return 'Word Document';
    } else if (mimeType.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') {
        return 'PowerPoint';
    } else if (mimeType.includes('excel') || ext === 'xls' || ext === 'xlsx') {
        return 'Excel Spreadsheet';
    } else if (mimeType.startsWith('text/') || ext === 'txt') {
        return 'Text File';
    } else if (ext === 'md' || ext === 'markdown') {
        return 'Markdown File';
    } else if (ext === 'json') {
        return 'JSON File';
    } else if (ext === 'csv') {
        return 'CSV File';
    } else {
        return ext.toUpperCase() + ' File';
    }
};

module.exports = {
    getUserUploads,
    saveUpload,
    deleteUpload,
    setProfilePicture,
    getProfilePicture,
    getFriendlyFileType
};


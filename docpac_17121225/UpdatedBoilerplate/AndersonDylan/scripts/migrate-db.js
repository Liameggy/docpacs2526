// scripts/migrate-db.js
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const logger = require('../modules/logger');

const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) {
        logger.error('Could not connect to database for migration', { error: err.message });
        process.exit(1);
    } else {
        logger.info('Connected to database for migration');
    }
});

// Add profilePicture column to users table
db.run(`ALTER TABLE users ADD COLUMN profilePicture TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        logger.error('Error adding profilePicture column', { error: err.message });
    } else {
        logger.info('ProfilePicture column added or already exists');
    }
});

// Create uploads table
db.run(`CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    filename TEXT NOT NULL,
    originalName TEXT NOT NULL,
    fileSize INTEGER NOT NULL,
    fileType TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
)`, (err) => {
    if (err) {
        logger.error('Error creating uploads table', { error: err.message });
    } else {
        logger.info('Uploads table created or already exists');
    }
});

// Close database
setTimeout(() => {
    db.close((err) => {
        if (err) {
            logger.error('Error closing database', { error: err.message });
        } else {
            logger.info('Database migration complete');
        }
    });
}, 1000);
 
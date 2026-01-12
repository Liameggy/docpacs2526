// Add this to your createTables function in scripts/init-db.js
const createTables = () => {
    // Existing users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT,
        formbarId TEXT,
        profilePicture TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            logger.error('Error creating users table', { error: err.message });
        } else {
            logger.info('Users table created or already exists');
        }
    });

    // New uploads table
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
};

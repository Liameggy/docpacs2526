const sqlite3 = require('sqlite3').verbose(); // Import sqlite3
const path = require('path');
const logger = require('../modules/logger');
const fs = require('fs');

// Ensure the data folder exists
const dataFolderPath = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
}

// Correct paths
const dbPath = path.resolve(dataFolderPath, 'database.sqlite'); // Ensure database.sqlite is in the data folder
const initSqlPath = path.resolve(dataFolderPath, 'database.sql'); // Ensure database.sql is in the data folder

// Create the database.sql file with the necessary SQL commands
const sqlCommands = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    formbarId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);`

fs.writeFileSync(initSqlPath, sqlCommands.trim(), 'utf8');

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Check if the database file already exists
        const dbExists = fs.existsSync(dbPath);

        // Open the database connection
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                logger.error(`Failed to connect to database: ${err.message}`);
                return reject(err);
            }
            logger.info('Connected to the SQLite database.');

            // If the database file does not exist, initialize it
            if (!dbExists) {
                // Create an empty database file
                fs.writeFileSync(dbPath, '');

                fs.readFile(initSqlPath, 'utf8', (err, data) => {
                    if (err) {
                        logger.error(`Failed to read database.sql: ${err.message}`);
                        return reject(err);
                    }
                
                    console.log('SQL commands from database.sql:', data); // Log the SQL commands
                
                    // Execute the SQL commands from the database.sql file
                    db.exec(data, (err) => {
                        if (err) {
                            logger.error(`Failed to initialize database schema: ${err.message}`);
                            console.error('SQL execution error:', err.message); // Log the error to the console
                            return reject(new Error(`Database initialization failed: ${err.message}`));
                        }
                        logger.info('Database schema initialized successfully.');
                        resolve(db);
                    });
                });
            } else {
                logger.info('Database already exists. Skipping initialization.');
                resolve(db);
            }
        });
    });
}

// Call the function and log errors if any
initializeDatabase().catch((err) => {
    console.error('Error initializing database:', err);
});

module.exports = initializeDatabase;

//create SQL database and tables if they do not exist
const sqlite3 = require('sqlite3').verbose();

// retrieve environment variables
require('dotenv').config();
const DATABASE_DIR = process.env.DATABASE_DIR;

const db = new sqlite3.Database(`${DATABASE_DIR}`, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        // Create uploads table
        db.run(`CREATE TABLE IF NOT EXISTS uploads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating uploads table:', err.message);
            }
        });

        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            permissions INTEGER,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            }
        });
    }
});
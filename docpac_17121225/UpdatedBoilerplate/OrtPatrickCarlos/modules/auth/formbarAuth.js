const logger = require('./logger');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define dbPath
const dbPath = path.resolve(__dirname, '../data/database.sqlite');

// Simple function to find user by Formbar ID
async function findUserByFormbarId(formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT * FROM users WHERE formbarId = ?`;
        
        db.get(query, [formbarId], (err, row) => {
            db.close();
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

// Simple function to create user with Formbar ID
async function createUserWithFormbarId(username, formbarId) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `INSERT INTO users (username, formbarId, created_at) VALUES (?, ?, datetime('now'))`;
        
        db.run(query, [username, formbarId], function(err) {
            if (err) {
                db.close();
                return reject(err);
            }
            
            const selectQuery = `SELECT * FROM users WHERE id = ?`;
            db.get(selectQuery, [this.lastID], (err, row) => {
                db.close();
                if (err) return reject(err);
                resolve(row);
            });
        });
    });
}

module.exports = {
    findUserByFormbarId,
    createUserWithFormbarId
};

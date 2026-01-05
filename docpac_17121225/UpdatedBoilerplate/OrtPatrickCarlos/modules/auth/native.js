const passwordHashing = require('./passwordHashing')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../../data/database.sqlite');

async function findUserInDatabase(username) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `SELECT id, username, passwordHash, formbarId, createdAt FROM users WHERE username = ?`;
        db.get(query, [username], (err, row) => {
            db.close();
            if (err) {
                return reject(err);
            }
            resolve(row || null);
        });
    });
}

async function createUserInDatabase(username, passwordHash) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        const query = `INSERT INTO users (username, passwordHash) VALUES (?, ?)`;
        db.run(query, [username, passwordHash], function(err) {
            if (err) {
                db.close();
                return reject(err);
            }
            const newUserId = this.lastID;
            const selectQuery = `SELECT id, username, formbarId, createdAt FROM users WHERE id = ?`;
            db.get(selectQuery, [newUserId], (err, row) => {
                db.close();
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    });
}

async function loginUser(username, password) {
    try {
        const user = await findUserInDatabase(username);
        if (!user) {
            return null;
        }
        const isPasswordValid = await passwordHashing.comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            formbarId: user.formbarId,
            createdAt: user.createdAt
        };
    } catch (error) {
        return null;
    }
}

async function registerUser(username, password) {
    try {
        const existingUser = await findUserInDatabase(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const passwordHash = await passwordHashing.hashPassword(password);
        const newUser = await createUserInDatabase(username, passwordHash);
        return newUser;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    loginUser,
    registerUser
};

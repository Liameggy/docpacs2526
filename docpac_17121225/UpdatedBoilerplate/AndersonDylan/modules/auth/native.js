// modules/auth/native.js
const sqlite3 = require('sqlite3').verbose();
const { hashPassword, comparePassword } = require('./passwordHashing');
const logger = require('../logger');

const db = new sqlite3.Database('./data/database.sqlite');

const registerUser = async (username, password) => {
    try {
        const hashedPassword = await hashPassword(password);
        
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (username, passwordHash) VALUES (?, ?)', 
                [username, hashedPassword], 
                function(err) {
                    if (err) {
                        if (err.code === 'SQLITE_CONSTRAINT') {
                            logger.warn('Registration attempt with existing username', { username });
                            reject(new Error('Username already exists'));
                        } else {
                            logger.error('Database error during registration', { error: err.message });
                            reject(new Error('Registration failed'));
                        }
                    } else {
                        logger.info('User registered successfully', { username, userId: this.lastID });
                        resolve({ id: this.lastID, username });
                    }
                });
        });
    } catch (error) {
        logger.error('Registration error', { error: error.message });
        throw error;
    }
};

const loginUser = async (username, password) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                logger.error('Database error during login', { error: err.message });
                reject(new Error('Login failed'));
                return;
            }

            if (!user || !user.passwordHash) {
                logger.warn('Login attempt with invalid username', { username });
                resolve(null);
                return;
            }

            try {
                const isValidPassword = await comparePassword(password, user.passwordHash);
                if (isValidPassword) {
                    logger.info('Successful login', { username });
                    resolve({ id: user.id, username: user.username });
                } else {
                    logger.warn('Login attempt with invalid password', { username });
                    resolve(null);
                }
            } catch (error) {
                logger.error('Password comparison error', { error: error.message });
                reject(new Error('Login failed'));
            }
        });
    });
};

module.exports = {
    registerUser,
    loginUser
};

// Handle native user registration 
import bcrypt from 'bcryptjs';
import { logging } from '../logger.js';
import express from 'express';
const app = express();
const SALT_ROUNDS = 10;

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    registerUser(db, username, password, (err) => {
        if (err) {
            return res.status(500).send('Error registering user.');
        }
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    validateUser(db, username, password, (err, isValid) => {
        if (err) {
            return res.status(500).send('Error during authentication.');
        }
        if (isValid) {
            req.session.username = username;
            res.redirect('home.ejs');
        } else {
            res.status(401).send('Invalid username or password.');
        }
    });
});

export function registerUser(db, username, password, callback) {
    bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
        if (err) {
            logging('ERROR', `Error generating salt: ${err}`);
            return callback(err);
        }
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                logging('ERROR', `Error hashing password: ${err}`);
                return callback(err);
            }
            const query = `INSERT INTO users (username, passwordHash) VALUES (?, ?)`;
            db.run(query, [username, hash], function (err) {
                if (err) {
                    logging('ERROR', `Error registering user: ${err}`);
                    return callback(err);
                }
                logging('INFO', `User ${username} registered successfully.`);
                callback(null);
            });
        });
    });
}

// Validate username and password on login
export function validateUser(db, username, password, callback) {
    const query = `SELECT passwordHash FROM users WHERE username = ?`;
    db.get(query, [username], function (err, row) {
        if (err) {
            logging('ERROR', `Error fetching user: ${err}`);
            return callback(err);
        }
        if (!row) {
            logging('WARN', `User ${username} not found.`);
            return callback(null, false);
        }
        const storedHash = row.passwordHash;
        bcrypt.compare(password, storedHash, function (err, res) {
            if (err) {
                logging('ERROR', `Error comparing passwords: ${err}`);
                return callback(err);
            }
            if (res) {
                logging('INFO', `User ${username} authenticated successfully.`);
                return callback(null, true);
            } else {
                logging('WARN', `Invalid password for user ${username}.`);
                return callback(null, false);
            }
        });
    });
}


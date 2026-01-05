// imports
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const { comparePassword } = require('./passwordHashing');

function authenticateUser(username, password, callback) {
    // Getting the user by username only
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
        if (err) {
            return callback(err);
        }
        if (!row) {
            return callback(null, null); // User not found
        }
        
        // Comparing the provided password with the stored hash
        comparePassword(password, row.passwordHash, (err, isMatch) => {
            if (err) {
                return callback(err);
            }
            if (isMatch) {
                return callback(null, row);
            } else {
                return callback(null, null); // If the password doesn't match
            }
        });
    });
}

module.exports = {
    authenticateUser
};


// passwordHashing.js
const bcrypt = require('bcrypt');

// Number of salt rounds (amount of times the hashing algorithm is applied)
const saltRounds = 10;

// Function to hash a password
function hashPassword(plainTextPassword, callback) {
    bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
        if (err) {
            return callback(err);
        }
        callback(null, hash);
    });
}

// Function to compare a password with its hash
function comparePassword(plainTextPassword, hashedPassword, callback) {
    bcrypt.compare(plainTextPassword, hashedPassword, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
}

module.exports = {
    hashPassword,
    comparePassword
};
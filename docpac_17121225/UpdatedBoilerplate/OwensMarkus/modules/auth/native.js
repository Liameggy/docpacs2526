const sqlite3 = require('sqlite3').verbose();
const hash = require('./passwordHashing');
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('Connected to the database.');
});
function validateLogin(db, username, password, callback) {
    // Step 1: Find user by username only
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.log(err.message);
            return callback(err, null);}
        
        if (!row) {
            // User not found
            return callback(null, null);}
        hash.comparePassword(password, row.passwordHash)
            .then(isValid => {
                if (isValid) {
                    callback(null, row);
                } else {
                    callback(null, null);}})
            .catch(err => {
                callback(err, null);});
    });
}
module.exports = {
    validateLogin
};

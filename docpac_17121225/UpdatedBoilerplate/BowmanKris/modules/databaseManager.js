//import required modules
const sqlite3 = require('sqlite3').verbose();

//import custom modules
const { hashPassword, verifyPassword } = require('./passwordHashing');

//retrive environment variables
const DATABASE_DIR = process.env.DATABASE_DIR;

if (!DATABASE_DIR) {
    console.error('DATABASE_DIR environment variable is not set.');
    process.exit(1);
}

const db = new sqlite3.Database(DATABASE_DIR, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    }
});

function authenticateUser(username, password, req, res) {
    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, row) => {
            if (err) {
                console.error('Error querying database:', err.message);
            }
            const hashedPassword = row.password;;

            //compare hashed passwords
            if (verifyPassword(password, hashedPassword)) {
                req.session.user = row.username;
                req.session.displayName = row.display_name;
                req.session.permissions = row.permissions;
                res.redirect('/');
            }
        }
    );
};

//save user data to database
function saveUserData({ createUsername, createDisplayName, permissions, createPassword }) {
    if (!createPassword) {
        console.error('Password is required for hashing.');
        return;
    }

    //hash the password before saving
    const hashedPassword = hashPassword(createPassword)

    db.run(
        `INSERT INTO users (username, display_name, permissions, password) VALUES (?, ?, ?, ?)`,
        [createUsername, createDisplayName, permissions, hashedPassword],
        (err) => {
            if (err) {
                console.error('Error saving user to database:', err.message);
            }
        }
    );
};

module.exports = {
    authenticateUser,
    saveUserData,
};
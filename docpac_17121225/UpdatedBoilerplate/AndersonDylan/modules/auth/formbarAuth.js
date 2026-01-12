// modules/auth/formbarAuth.js
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../logger');

const db = new sqlite3.Database('./data/database.sqlite');

const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${process.env.PORT || 3000}`;

const getAuthorizationUrl = () => {
    return `${AUTH_URL}/oauth?redirectURL=${THIS_URL}`;
};

const handleCallback = (token) => {
    return new Promise((resolve, reject) => {
        try {
            const tokenData = jwt.decode(token);
            
            if (!tokenData || !tokenData.displayName) {
                logger.error('Invalid token data received');
                reject(new Error('Invalid token'));
                return;
            }

            // Save or update user in database
            db.run('INSERT OR IGNORE INTO users (username, formbarId) VALUES (?, ?)', 
                [tokenData.displayName, tokenData.id], 
                function(err) {
                    if (err) {
                        logger.error('Error saving Formbar user to database', { error: err.message });
                        reject(new Error('Database error'));
                        return;
                    }
                    
                    // Get the user data
                    db.get('SELECT * FROM users WHERE username = ?', [tokenData.displayName], (err, user) => {
                        if (err) {
                            logger.error('Error retrieving user after Formbar login', { error: err.message });
                            reject(new Error('Database error'));
                            return;
                        }
                        
                        logger.info('Formbar user authenticated', { username: tokenData.displayName });
                        resolve({
                            user: user,
                            tokenData: tokenData
                        });
                    });
                });
                
        } catch (error) {
            logger.error('Error processing Formbar callback', { error: error.message });
            reject(new Error('Authentication failed'));
        }
    });
};

module.exports = {
    getAuthorizationUrl,
    handleCallback
};

const bcrypt = require('bcrypt');

// Configuration
const SALT_ROUNDS = 12;

// Function to hash a plaintext password
async function passwordHash(plaintext) {
    // Input validation
    if (!plaintext || typeof plaintext !== 'string' || plaintext.trim().length === 0) {
        throw new Error('Password cannot be empty');
    }
    
    return await bcrypt.hash(plaintext, SALT_ROUNDS);
}

async function comparePassword(plaintext, hash) {
    // Input validation
    if (!plaintext || typeof plaintext !== 'string' || plaintext.trim().length === 0) {
        throw new Error('Password cannot be empty');
    }
    if (!hash || typeof hash !== 'string') {
        throw new Error('Hash cannot be empty');
    }
    
    return await bcrypt.compare(plaintext, hash);
}


module.exports = {
    hashPassword: passwordHash,
    comparePassword
};

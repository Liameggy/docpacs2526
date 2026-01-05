const crypto = require('crypto');

// String sanitization utility
function sanitizeString(input) {
    return input.replace(/[<>&'"]/g, function (char) {
        const charMap = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charMap[char] || char;
    });
}

// Room ID or Token generator
function generateToken(length = 16) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// Get current timestamp
function getCurrentTimestamp() {
    return Date.now();
}

// Validation Helper
function isValidPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Alphanumeric and underscores, 3-20 characters
    return usernameRegex.test(username);
}

module.exports = {
    sanitizeString,
    generateToken,
    getCurrentTimestamp,
    isValidPassword,
    isValidUsername
};
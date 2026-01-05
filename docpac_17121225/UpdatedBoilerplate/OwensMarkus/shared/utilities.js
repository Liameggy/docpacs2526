function sanitizeString(input) {
    return input.replace(/[<>\"']/g, '').trim();
}

function sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

function generateSessionToken() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidUsername(username) {
    // 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

function formatTimestamp(date = new Date()) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
}

module.exports = {
    sanitizeString,
    sanitizeFilename,
    generateRoomId,
    generateSessionToken,
    isValidEmail,
    isValidUsername,
    formatTimestamp,
    getTimeAgo
};

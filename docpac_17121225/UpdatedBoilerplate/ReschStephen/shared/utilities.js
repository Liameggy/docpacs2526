// Export string sanitation functions, room ID generators, and common validation helpers
export function sanitizeString(str) {
    return str.replace(/[<>\/\\'"]/g, '');
}
export function generateRoomID() {
    return 'room-' + Math.random().toString(36).substr(2, 9);
}

export function isValidUsername(username) {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
}
export function isValidPassword(password) {
    return password.length >= 8;
}

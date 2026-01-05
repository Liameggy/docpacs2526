// shared/utilities.js - General-purpose utility functions
const crypto = require('crypto');

class Utilities {
    
    // String sanitization functions
    static sanitizeString(str, options = {}) {
        if (typeof str !== 'string') return '';
        
        let sanitized = str.trim();
        
        // Remove HTML tags if specified
        if (options.removeHtml) {
            sanitized = sanitized.replace(/<[^>]*>/g, '');
        }
        
        // Remove special characters if specified
        if (options.removeSpecialChars) {
            sanitized = sanitized.replace(/[^\w\s-_.]/g, '');
        }
        
        // Limit length if specified
        if (options.maxLength) {
            sanitized = sanitized.substring(0, options.maxLength);
        }
        
        return sanitized;
    }

    static sanitizeUsername(username) {
        if (!username) return '';
        return this.sanitizeString(username, {
            removeHtml: true,
            removeSpecialChars: true,
            maxLength: 50
        }).toLowerCase();
    }

    static sanitizeRoomName(roomName) {
        if (!roomName) return '';
        return this.sanitizeString(roomName, {
            removeHtml: true,
            maxLength: 100
        }).replace(/[^\w\s-]/g, '');
    }

    static sanitizeChatMessage(message) {
        if (!message) return '';
        return this.sanitizeString(message, {
            removeHtml: true,
            maxLength: 1000
        });
    }

    // Room ID generators
    static generateRoomId(prefix = 'room') {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `${prefix}_${timestamp}_${randomPart}`;
    }

    static generateUniqueRoomId(existingRooms = []) {
        let roomId;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            roomId = this.generateRoomId();
            attempts++;
        } while (existingRooms.includes(roomId) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            // Fallback with UUID-like structure
            roomId = this.generateRoomId() + '_' + crypto.randomUUID().substring(0, 8);
        }

        return roomId;
    }

    // Token generators
    static generateSessionToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    static generateApiToken(length = 64) {
        return crypto.randomBytes(length).toString('base64url');
    }

    static generateRoomPassword(length = 8) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Validation helpers
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        return usernameRegex.test(username);
    }

    static isValidRoomName(roomName) {
        if (!roomName || typeof roomName !== 'string') return false;
        const roomNameRegex = /^[a-zA-Z0-9\s_-]{1,50}$/;
        return roomNameRegex.test(roomName.trim());
    }

    static isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        // At least 6 characters, contains letter and number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return passwordRegex.test(password);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Data validation
    static validateUserData(userData) {
        const errors = [];
        
        if (!userData.username || !this.isValidUsername(userData.username)) {
            errors.push('Invalid username. Must be 3-30 characters, letters, numbers, underscore, or dash only.');
        }
        
        if (userData.email && !this.isValidEmail(userData.email)) {
            errors.push('Invalid email format.');
        }
        
        if (userData.password && !this.isValidPassword(userData.password)) {
            errors.push('Password must be at least 6 characters with letters and numbers.');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static validateRoomData(roomData) {
        const errors = [];
        
        if (!roomData.name || !this.isValidRoomName(roomData.name)) {
            errors.push('Invalid room name. Must be 1-50 characters, letters, numbers, spaces, underscore, or dash only.');
        }
        
        if (roomData.maxUsers && (roomData.maxUsers < 1 || roomData.maxUsers > 1000)) {
            errors.push('Max users must be between 1 and 1000.');
        }
        
        if (roomData.password && roomData.password.length < 4) {
            errors.push('Room password must be at least 4 characters.');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Utility formatters
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Hash and crypto utilities
    static hashString(str, algorithm = 'sha256') {
        return crypto.createHash(algorithm).update(str).digest('hex');
    }

    static generateHash(data, salt = null) {
        const saltToUse = salt || crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(data, saltToUse, 10000, 64, 'sha512').toString('hex');
        return { hash, salt: saltToUse };
    }

    static verifyHash(data, hash, salt) {
        const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
        return hash === verifyHash;
    }

    // Array and object utilities
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Rate limiting helpers
    static createRateLimiter(maxRequests = 10, windowMs = 60000) {
        const requests = new Map();
        
        return {
            isAllowed: (identifier) => {
                const now = Date.now();
                const windowStart = now - windowMs;
                
                if (!requests.has(identifier)) {
                    requests.set(identifier, []);
                }
                
                const userRequests = requests.get(identifier);
                
                // Remove old requests outside the window
                const recentRequests = userRequests.filter(time => time > windowStart);
                requests.set(identifier, recentRequests);
                
                if (recentRequests.length >= maxRequests) {
                    return false;
                }
                
                recentRequests.push(now);
                return true;
            },
            
                        getRemainingRequests: (identifier) => {
                const userRequests = requests.get(identifier) || [];
                const now = Date.now();
                const windowStart = now - windowMs;
                const recentRequests = userRequests.filter(time => time > windowStart);
                return Math.max(0, maxRequests - recentRequests.length);
            }
        };
    }

    // Error handling utilities
    static createError(message, code = 'GENERIC_ERROR', statusCode = 500) {
        const error = new Error(message);
        error.code = code;
        error.statusCode = statusCode;
        return error;
    }

    static isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    static isDevelopment() {
        return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    }
}

module.exports = Utilities;

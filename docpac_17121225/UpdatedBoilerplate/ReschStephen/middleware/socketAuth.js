// Middleware for socket.io that runs during connection
const jwt = require('jsonwebtoken');

module.exports = function (socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token not provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.user = {
            id: decoded.id,
            name: decoded.name
        };
        next();
    });
}

// Reads session from handshake and determines which user is connected
module.exports = function (socket, next) {
    const session = socket.handshake.session;
    if (session && session.userId) {
        socket.user = {
            id: session.userId,
            name: session.userName
        };
        return next();
    } else {
        return next(new Error('Authentication error: User not logged in'));
    }
}

// Rejects or disconnects unauthenticated users from protected rooms or namespaces if required
module.exports = function (socket, next) {
    const isProtectedNamespace = socket.nsp.name.startsWith('/protected');
    if (isProtectedNamespace && !socket.user) {
        return next(new Error('Authentication error: Access to protected namespace denied'));
    }
    next();
}

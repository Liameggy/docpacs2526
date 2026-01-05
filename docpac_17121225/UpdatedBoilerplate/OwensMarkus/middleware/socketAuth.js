function socketAuth(socket, next) {
    const session = socket.request.session;
    
    if (session && session.user) {
        socket.userId = session.user;
        next();
    } else {
        next(new Error('Authentication required'));
    }
}

module.exports = socketAuth;

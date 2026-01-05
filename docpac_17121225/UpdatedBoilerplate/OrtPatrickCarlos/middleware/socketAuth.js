function socketAuth(socket, next) {
    const session = socket.request.session;
    if (session && session.user) {
        next();
    } else {
        next(new Error('Unauthorized'));
    }
}
module.exports = socketAuth;
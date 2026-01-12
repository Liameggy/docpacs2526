module.exports = function socketAuth(socket, next) {
    const session = socket.request.session;

    if (!session || !session.user) {
        return next(new Error("Unauthorized"));
    }

    socket.user = {
        id: session.userId,
        username: session.user
    };

    next();
};

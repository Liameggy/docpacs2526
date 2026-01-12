module.exports = function(socket, next) {
  try {
    const session = socket.request && socket.request.session;
    if (session && session.user) {
      socket.user = session.user;
      return next();
    } else {
      return next(new Error('Unauthorized'));
    }
  } catch (err) {
    return next(err);
  }
};
// middleware to authenticate socket connections based on session data
const io = require('socket.io-client');
const logger = require('../modules/logger');
const utilities = require('../shared/utilities');
const sessionMiddleware = require('../middleware/session');
const socketAuth = require('../middleware/socketAuth');

function onConnect(socket) {
    socketAuth(socket, (err) => {
        if (err) {
            logger.warn('Socket authentication failed: ', err);
            socket.disconnect();
            return;
        }

        const session = socket.request.session;
        logger.info(`Socket connected for user: ${session.user.id}`);

        socket.on('message', (data) => {
            logger.info(`Received message from user ${session.user.id}: ${data}`);
            // Handle incoming messages
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected for user: ${session.user.id}`);
        });
    });
}
module.exports = onConnect;
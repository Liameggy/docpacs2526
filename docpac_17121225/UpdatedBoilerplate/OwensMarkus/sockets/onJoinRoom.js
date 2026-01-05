const sharedUtilitys = require('../shared/utilities')
const logger = require('../modules/logger');

function onJoinRoom(socket, io) {
    socket.on('connect_auth', () => {
        logger.info('Connected to auth server');
    });
}

module.exports = onJoinRoom;
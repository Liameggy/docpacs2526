const sharedUtilitys = require('../shared/utilities') 
const logger = require('../modules/logger');

function onChat(socket, io) {
    socket.on('update', (data) => {
        logger.info('Update received:', data);
        io.emit('update', data);
    });
}

module.exports = onChat;
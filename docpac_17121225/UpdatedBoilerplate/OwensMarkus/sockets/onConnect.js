const sharedUtilitys = require('../shared/utilities') 
const logger = require('../modules/logger');

function onConnect(socket, io) {
    logger.info('a user connected');
}

module.exports = onConnect;
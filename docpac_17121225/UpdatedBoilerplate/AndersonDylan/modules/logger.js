// modules/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }
            return log;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;

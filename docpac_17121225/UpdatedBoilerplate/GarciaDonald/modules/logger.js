const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
    ),
    transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;

// Timestamped logs with date, time and level
logger.format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    })
);

// info, warn, error levels
logger.levels = {
    error: 0,
    warn: 1,
    info: 2
};

// a shared instance to be used across the application
module.exports = logger;
// SERVER STARTUP AND SHUTDOWN MESSAGES
logger.info('Logger initialized');
logger.on('error', (err) => {
    console.error('Logger error:', err);
});
// Example usage
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
// database connection and errors
logger.info('Database connected');
logger.error('Database connection failed');
// login attempts and failures
logger.info('User login successful');
logger.warn('User login attempt failed');
// socket connections and disconnections
logger.info('Socket connection established');
logger.error('Socket connection failed');

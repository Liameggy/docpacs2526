const winston=require('winston');
console.log('Winston version:', winston.version);
const isDebugMode = process.env.DEBUG || process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: isDebugMode ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});
logger.info('Test message');
logger.warn('Test warning');
logger.error('Test error');
if (isDebugMode) {
    logger.debug('=== DEBUG MODE ENABLED ===');
    logger.debug('Environment variables loaded');
    logger.debug(`Node environment: ${process.env.NODE_ENV || 'development'}`);
    logger.debug(`Debug flag: ${process.env.DEBUG || 'not set'}`);
}
module.exports=logger;

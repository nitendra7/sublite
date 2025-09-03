const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusMessage = res.statusMessage || '';

    if (statusCode >= 400) {
      logger.warn(`Response: ${statusCode} ${statusMessage} - ${req.method} ${req.originalUrl} - Duration: ${duration}ms`);
    } else {
      logger.info(`Response: ${statusCode} ${statusMessage} - ${req.method} ${req.originalUrl} - Duration: ${duration}ms`);
    }
  });

  next();
};

module.exports = httpLogger;

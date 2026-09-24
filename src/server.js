const { createApp } = require('./app');
const config = require('./config');
const logger = require('./logger');

const app = createApp();
const server = app.listen(config.port, () => {
  logger.info(`Tech Battle Royale server listening on port ${config.port}`, {
    nodeEnv: config.nodeEnv,
    useLocalMock: config.useLocalMock,
    gcpProjectId: config.gcpProjectId || 'none'
  });
});

// Encerramento gracioso para Cloud Run
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Força encerramento se passar de 10 segundos
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

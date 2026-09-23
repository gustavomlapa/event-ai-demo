/**
 * Server Entrypoint for Google Cloud Run
 */
const { createApp } = require('./app');
const config = require('./config/env');

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Tech Battle Royale running on port ${config.PORT}`);
  console.log(`📱 Mobile Player:  http://localhost:${config.PORT}`);
  console.log(`🖥️ Stage Screen:   http://localhost:${config.PORT}/screen.html`);
  console.log(`🎛️ Presenter Admin: http://localhost:${config.PORT}/admin.html`);
  console.log(`==================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;


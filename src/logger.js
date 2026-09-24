/**
 * Logger estruturado para Cloud Run / Console
 */
const logger = {
  info: (msg, meta = {}) => {
    process.stdout.write(JSON.stringify({ severity: 'INFO', message: msg, ...meta, time: new Date().toISOString() }) + '\n');
  },
  warn: (msg, meta = {}) => {
    process.stdout.write(JSON.stringify({ severity: 'WARNING', message: msg, ...meta, time: new Date().toISOString() }) + '\n');
  },
  error: (msg, meta = {}) => {
    process.stderr.write(JSON.stringify({ severity: 'ERROR', message: msg, ...meta, time: new Date().toISOString() }) + '\n');
  }
};

module.exports = logger;

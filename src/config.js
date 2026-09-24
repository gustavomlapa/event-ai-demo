const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  gcpProjectId: process.env.GCP_PROJECT_ID || '',
  gcpRegion: process.env.GCP_REGION || 'us-central1',
  serviceName: process.env.SERVICE_NAME || 'tech-battle-royale',
  firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  useLocalMock: process.env.USE_LOCAL_MOCK === 'true' || !process.env.GCP_PROJECT_ID || process.env.GCP_PROJECT_ID === 'your-gcp-project-id',
};

module.exports = config;

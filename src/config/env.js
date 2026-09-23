/**
 * Environment configuration loader
 */
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || '',
  GCP_REGION: process.env.GCP_REGION || 'us-central1',
  SERVICE_NAME: process.env.SERVICE_NAME || 'tech-battle-royale',
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || '(default)',
  FIRESTORE_COLLECTION_PREFIX: process.env.FIRESTORE_COLLECTION_PREFIX || 'tbr_',
  USE_LOCAL_MOCK: process.env.USE_LOCAL_MOCK === 'true',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'tech-clash-live-2026',
};


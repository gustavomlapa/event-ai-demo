const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRouter = require('./routes/api');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Servir assets estáticos da pasta public
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  // Rotas da API
  app.use('/api', apiRouter);

  // Fallback para rota raiz
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  return app;
}

module.exports = { createApp };

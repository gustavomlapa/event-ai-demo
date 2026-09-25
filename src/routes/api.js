const express = require('express');
const QRCode = require('qrcode');
const { gameService } = require('../services/gameService');
const { calculateTrophies } = require('../services/trophyService');
const db = require('../services/db');

const router = express.Router();

// Healthcheck para Cloud Run
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    mockMode: db.isMockMode(),
    timestamp: new Date().toISOString()
  });
});

// Estado do jogo (polling de clientes)
router.get('/state', (req, res) => {
  res.json(gameService.getState());
});

// Participante entra informando apelido
router.post('/join', (req, res) => {
  const { nickname } = req.body || {};
  const cleaned = (nickname || '').toString().trim().substring(0, 30) || 'Dev Anônimo';
  const participantId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  gameService.recordHeartbeat(participantId);

  res.json({
    participantId,
    nickname: cleaned
  });
});

// Batimento de presença online
router.post('/heartbeat', (req, res) => {
  const { participantId } = req.body || {};
  if (participantId) {
    gameService.recordHeartbeat(participantId);
  }
  res.json({
    success: true,
    connectedCount: gameService.getConnectedCount()
  });
});

// Voto 1-tap do participante
router.post('/vote', async (req, res) => {
  const { participantId, nickname, roundId, choice, responseTimeMs } = req.body || {};

  if (!participantId || !roundId || !choice) {
    return res.status(400).json({ error: 'Parâmetros incompletos para registro do voto' });
  }

  try {
    const result = await gameService.registerVote({
      participantId,
      nickname,
      roundId,
      choice,
      responseTimeMs
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Gerador de QR Code dinâmico
router.get('/qr', async (req, res) => {
  const targetUrl = req.query.url || `${req.protocol}://${req.get('host')}/`;
  try {
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    res.json({ url: targetUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// Rota pública de troféus (para o telão e participantes consultarem no fim do jogo)
router.get('/trophies', (req, res) => {
  const votes = gameService.getAllVotesForSession();
  const trophies = calculateTrophies(votes, gameService.rounds);
  res.json(trophies);
});

// --- Autenticação Administrativa ---

const config = require('../config');

// Endpoint de validação de senha do painel de admin
router.post('/admin/auth', (req, res) => {
  const { password } = req.body || {};
  if (password === config.adminPassword) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ error: 'Senha incorreta' });
});

// Middleware de proteção para todas as rotas administrativas seguintes
function requireAdminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.key || (req.body && req.body.adminPassword);
  if (!password || password !== config.adminPassword) {
    return res.status(401).json({ error: 'Senha de admin inválida ou não fornecida' });
  }
  next();
}

router.use('/admin', requireAdminAuth);

// --- Rotas Administrativas Protegidas ---

router.get('/admin/rounds', (req, res) => {
  res.json({ rounds: gameService.rounds });
});

router.post('/admin/start-round', (req, res) => {
  const { roundId } = req.body || {};
  const state = gameService.startRound(roundId);
  res.json(state);
});

router.post('/admin/close-round', (req, res) => {
  const state = gameService.closeRound();
  res.json(state);
});

router.post('/admin/next-round', (req, res) => {
  const state = gameService.nextRound();
  res.json(state);
});

router.post('/admin/reset', (req, res) => {
  const state = gameService.resetGame();
  res.json(state);
});

router.get('/admin/trophies', (req, res) => {
  const votes = gameService.getAllVotesForSession();
  const trophies = calculateTrophies(votes, gameService.rounds);
  res.json(trophies);
});

module.exports = router;

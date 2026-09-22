/**
 * Express Application Configuration & Routes
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GameService } = require('./services/gameService');
const { calculateTrophies } = require('./services/trophyService');
const { initFirestore } = require('./config/firestore');

function createApp(options = {}) {
  const app = express();
  const firestoreAdapter = options.firestoreAdapter || initFirestore();
  const gameService = options.gameService || new GameService(firestoreAdapter);

  app.use(cors());
  app.use(express.json());

  // Static Assets
  app.use(express.static(path.join(__dirname, 'public')));

  // --- API Routes ---

  // Current Game State
  app.get('/api/state', (req, res) => {
    res.json(gameService.getState());
  });

  // Participant Join
  app.post('/api/join', (req, res) => {
    try {
      const { nickname } = req.body;
      const result = gameService.registerParticipant(nickname);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Submit Vote
  app.post('/api/vote', (req, res) => {
    try {
      const { nickname, roundIndex, choice, responseTimeMs } = req.body;
      const result = gameService.submitVote({
        nickname,
        roundIndex,
        choice,
        responseTimeMs,
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Round Results
  app.get('/api/results', (req, res) => {
    const roundIndex = req.query.round !== undefined ? req.query.round : gameService.getState().roundIndex;
    res.json(gameService.getRoundResults(roundIndex));
  });

  // Trophies / Superlatives
  app.get('/api/trophies', (req, res) => {
    const votes = gameService.getAllVotes();
    const trophies = calculateTrophies(votes);
    res.json(trophies);
  });

  // --- Admin Controls ---

  // Advance Phase (Lobby -> Active -> Reveal -> Next Round -> Finished)
  app.post('/api/admin/next', (req, res) => {
    const newState = gameService.nextPhase();
    res.json(newState);
  });

  // Reset Game
  app.post('/api/admin/reset', (req, res) => {
    const newState = gameService.resetGame();
    res.json(newState);
  });

  return app;
}

module.exports = { createApp };

const { ROUNDS } = require('../data/rounds');
const db = require('./db');

class GameService {
  constructor() {
    this.rounds = ROUNDS;
    this.connectedParticipants = new Map(); // participantId -> timestamp
    this.resetGame();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  resetGame() {
    this.sessionId = this.generateSessionId();
    this.status = 'LOBBY'; // LOBBY, ACTIVE, REVEAL, FINISHED
    this.currentRoundIndex = 0;
    this.votesByRound = new Map(); // roundId -> Map(participantId -> vote)
    this.talliesByRound = new Map(); // roundId -> { countA: 0, countB: 0 }
    this.roundStartTime = null;

    // Inicializa tallies para cada rodada
    this.rounds.forEach(r => {
      this.votesByRound.set(r.id, new Map());
      this.talliesByRound.set(r.id, { countA: 0, countB: 0 });
    });

    db.saveGameState(this.sessionId, this.getState());
    return this.getState();
  }

  calculatePercentages(countA, countB) {
    const total = countA + countB;
    if (total === 0) {
      return {
        countA: 0,
        countB: 0,
        total: 0,
        percentA: 0,
        percentB: 0
      };
    }

    const percentA = Math.round((countA / total) * 100);
    const percentB = 100 - percentA;

    return {
      countA,
      countB,
      total,
      percentA,
      percentB
    };
  }

  getCurrentRound() {
    if (this.currentRoundIndex >= 0 && this.currentRoundIndex < this.rounds.length) {
      return this.rounds[this.currentRoundIndex];
    }
    return null;
  }

  startRound(roundNumber) {
    let index = 0;
    if (roundNumber !== undefined) {
      index = this.rounds.findIndex(r => r.id === Number(roundNumber));
      if (index === -1) index = 0;
    } else {
      index = this.currentRoundIndex;
    }

    this.currentRoundIndex = index;
    this.status = 'ACTIVE';
    this.roundStartTime = Date.now();

    const round = this.getCurrentRound();
    if (!this.votesByRound.has(round.id)) {
      this.votesByRound.set(round.id, new Map());
      this.talliesByRound.set(round.id, { countA: 0, countB: 0 });
    }

    db.saveGameState(this.sessionId, this.getState());
    return this.getState();
  }

  closeRound() {
    this.status = 'REVEAL';
    db.saveGameState(this.sessionId, this.getState());
    return this.getState();
  }

  nextRound() {
    if (this.currentRoundIndex + 1 < this.rounds.length) {
      this.currentRoundIndex += 1;
      this.status = 'ACTIVE';
      this.roundStartTime = Date.now();

      const round = this.getCurrentRound();
      if (!this.votesByRound.has(round.id)) {
        this.votesByRound.set(round.id, new Map());
        this.talliesByRound.set(round.id, { countA: 0, countB: 0 });
      }
    } else {
      this.status = 'FINISHED';
    }
    db.saveGameState(this.sessionId, this.getState());
    return this.getState();
  }

  setFinished() {
    this.status = 'FINISHED';
    db.saveGameState(this.sessionId, this.getState());
    return this.getState();
  }

  async registerVote({ participantId, nickname, roundId, choice, responseTimeMs }) {
    if (this.status !== 'ACTIVE') {
      throw new Error('A rodada não está aberta para votação');
    }

    const currentRound = this.getCurrentRound();
    if (!currentRound || currentRound.id !== Number(roundId)) {
      throw new Error('Voto enviado para rodada incorreta');
    }

    if (choice !== 'A' && choice !== 'B') {
      throw new Error('Escolha inválida. Opções aceitas: A ou B');
    }

    const roundVotes = this.votesByRound.get(currentRound.id);
    if (roundVotes.has(participantId)) {
      throw new Error('Você já votou nesta rodada');
    }

    // Registra em memória
    const voteData = {
      participantId,
      nickname: nickname || 'Dev Anônimo',
      choice,
      responseTimeMs: Math.max(10, parseInt(responseTimeMs || '300', 10)),
      timestamp: Date.now()
    };
    roundVotes.set(participantId, voteData);

    // Atualiza tally
    const tallies = this.talliesByRound.get(currentRound.id);
    if (choice === 'A') tallies.countA += 1;
    else tallies.countB += 1;

    // Grava de forma assíncrona no Firestore / Mock (sem travar a resposta)
    db.saveVote(this.sessionId, currentRound.id, participantId, voteData);

    const calc = this.calculatePercentages(tallies.countA, tallies.countB);

    return {
      success: true,
      ...calc,
      participantId,
      choice
    };
  }

  recordHeartbeat(participantId) {
    if (participantId) {
      this.connectedParticipants.set(participantId, Date.now());
    }
  }

  getConnectedCount() {
    const now = Date.now();
    const threshold = 30000; // 30s
    let count = 0;
    for (const [id, lastSeen] of this.connectedParticipants.entries()) {
      if (now - lastSeen < threshold) {
        count++;
      } else {
        this.connectedParticipants.delete(id);
      }
    }
    return count;
  }

  getState() {
    const round = this.getCurrentRound();
    let countA = 0;
    let countB = 0;

    if (round && this.talliesByRound.has(round.id)) {
      const t = this.talliesByRound.get(round.id);
      countA = t.countA;
      countB = t.countB;
    }

    const percentages = this.calculatePercentages(countA, countB);

    return {
      sessionId: this.sessionId,
      status: this.status,
      currentRoundIndex: this.currentRoundIndex,
      currentRound: round,
      totalRounds: this.rounds.length,
      roundStartTime: this.roundStartTime,
      connectedCount: this.getConnectedCount(),
      countA: percentages.countA,
      countB: percentages.countB,
      totalVotes: percentages.total,
      percentA: percentages.percentA,
      percentB: percentages.percentB
    };
  }

  getAllVotesForSession() {
    const all = [];
    for (const [roundId, votesMap] of this.votesByRound.entries()) {
      for (const [participantId, vote] of votesMap.entries()) {
        all.push({ ...vote, roundId });
      }
    }
    return all;
  }
}

const gameService = new GameService();

module.exports = {
  GameService,
  gameService
};

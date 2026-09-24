const { Firestore } = require('@google-cloud/firestore');
const config = require('../config');

class DatabaseService {
  constructor() {
    this.useMock = config.useLocalMock;
    this.mockStore = {
      states: new Map(),
      votes: new Map() // key: `${sessionId}_${roundId}_${participantId}`
    };
    this.firestore = null;

    if (!this.useMock) {
      try {
        const firestoreOptions = {
          projectId: config.gcpProjectId || undefined,
        };
        if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
          firestoreOptions.databaseId = config.firestoreDatabaseId;
        }
        this.firestore = new Firestore(firestoreOptions);
      } catch (err) {
        // Fallback para mock caso falhe ao instanciar credenciais
        this.useMock = true;
      }
    }
  }

  isMockMode() {
    return this.useMock;
  }

  async saveGameState(sessionId, state) {
    if (this.useMock) {
      this.mockStore.states.set(sessionId, { ...state, updatedAt: Date.now() });
      return;
    }

    try {
      await this.firestore
        .collection('games')
        .doc(sessionId)
        .set({ ...state, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      // Fallback em caso de falha de conexão transitória
      this.mockStore.states.set(sessionId, { ...state, updatedAt: Date.now() });
    }
  }

  async getGameState(sessionId) {
    if (this.useMock) {
      return this.mockStore.states.get(sessionId) || null;
    }

    try {
      const doc = await this.firestore.collection('games').doc(sessionId).get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (err) {
      return this.mockStore.states.get(sessionId) || null;
    }
  }

  async saveVote(sessionId, roundId, participantId, voteData) {
    const key = `${sessionId}_${roundId}_${participantId}`;
    const payload = {
      participantId,
      roundId,
      choice: voteData.choice,
      responseTimeMs: voteData.responseTimeMs,
      nickname: voteData.nickname,
      createdAt: Date.now()
    };

    if (this.useMock) {
      this.mockStore.votes.set(key, payload);
      return;
    }

    try {
      // Salva em subcoleção com o ID do participante para evitar colisão e suportar 300+ votos simultâneos
      await this.firestore
        .collection('games')
        .doc(sessionId)
        .collection(`rounds_${roundId}`)
        .doc(participantId)
        .set(payload);
    } catch (err) {
      // Garante que o voto fique salvo no mock mesmo se Firestore falhar
      this.mockStore.votes.set(key, payload);
    }
  }

  async getVotes(sessionId, roundId) {
    if (this.useMock) {
      const results = [];
      const prefix = `${sessionId}_${roundId}_`;
      for (const [key, value] of this.mockStore.votes.entries()) {
        if (key.startsWith(prefix)) {
          results.push(value);
        }
      }
      return results;
    }

    try {
      const snapshot = await this.firestore
        .collection('games')
        .doc(sessionId)
        .collection(`rounds_${roundId}`)
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (err) {
      return [];
    }
  }

  async getAllSessionVotes(sessionId) {
    if (this.useMock) {
      const results = [];
      const prefix = `${sessionId}_`;
      for (const [key, value] of this.mockStore.votes.entries()) {
        if (key.startsWith(prefix)) {
          results.push(value);
        }
      }
      return results;
    }

    try {
      const results = [];
      for (let r = 1; r <= 10; r++) {
        const snapshot = await this.firestore
          .collection('games')
          .doc(sessionId)
          .collection(`rounds_${r}`)
          .get();
        snapshot.forEach(doc => results.push(doc.data()));
      }
      return results;
    } catch (err) {
      return [];
    }
  }

  resetMock() {
    this.mockStore.states.clear();
    this.mockStore.votes.clear();
  }
}

const db = new DatabaseService();
module.exports = db;

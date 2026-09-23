/**
 * Firestore Client Initialization & Data Adapter
 */
const { Firestore } = require('@google-cloud/firestore');
const config = require('./env');

class MockFirestoreAdapter {
  constructor() {
    this.participants = [];
    this.votes = [];
  }

  async saveParticipant(nickname) {
    this.participants.push({ nickname, joinedAt: Date.now() });
    return true;
  }

  async saveVote(vote) {
    this.votes.push(vote);
    return true;
  }
}

class FirestoreAdapter {
  constructor(firestoreInstance, prefix = 'tbr_') {
    this.db = firestoreInstance;
    this.prefix = prefix;
  }

  async saveParticipant(nickname) {
    const docRef = this.db.collection(`${this.prefix}participants`).doc(nickname);
    await docRef.set({ nickname, joinedAt: Date.now() }, { merge: true });
  }

  async saveVote(vote) {
    const voteId = `${vote.roundIndex}_${vote.nickname}`;
    const docRef = this.db.collection(`${this.prefix}votes`).doc(voteId);
    await docRef.set(vote, { merge: true });
  }
}

function initFirestore() {
  if (config.USE_LOCAL_MOCK || process.env.NODE_ENV === 'test' || !config.GCP_PROJECT_ID) {
    return new MockFirestoreAdapter();
  }

  try {
    const firestore = new Firestore({
      projectId: config.GCP_PROJECT_ID,
      databaseId: config.FIRESTORE_DATABASE_ID,
    });
    return new FirestoreAdapter(firestore, config.FIRESTORE_COLLECTION_PREFIX);
  } catch (err) {
    // Fallback to mock if Firestore initialization throws
    return new MockFirestoreAdapter();
  }
}

module.exports = {
  initFirestore,
  FirestoreAdapter,
  MockFirestoreAdapter,
};


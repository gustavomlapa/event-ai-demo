const request = require('supertest');
const { createApp } = require('../src/app');
const { GameService } = require('../src/services/gameService');

describe('REST API Endpoints Integration', () => {
  let app;
  let gameService;

  beforeEach(() => {
    gameService = new GameService();
    app = createApp({ gameService });
  });

  test('GET /api/state returns current game status', async () => {
    const res = await request(app).get('/api/state');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('LOBBY');
    expect(res.body.roundIndex).toBe(0);
    expect(res.body.totalQuestions).toBe(10);
  });

  test('POST /api/join registers a participant', async () => {
    const res = await request(app)
      .post('/api/join')
      .send({ nickname: 'dev_alana' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.nickname).toBe('dev_alana');

    const stateRes = await request(app).get('/api/state');
    expect(stateRes.body.participantsCount).toBe(1);
  });

  test('full voting and trophy flow through API', async () => {
    // 1. Join participants
    await request(app).post('/api/join').send({ nickname: 'fast_dev' });
    await request(app).post('/api/join').send({ nickname: 'slow_dev' });

    // 2. Admin opens round 0
    const nextRes = await request(app).post('/api/admin/next');
    expect(nextRes.status).toBe(200);
    expect(nextRes.body.status).toBe('ACTIVE');
    expect(nextRes.body.roundIndex).toBe(0);

    // 3. Fast dev votes A in 200ms
    const vote1 = await request(app).post('/api/vote').send({
      nickname: 'fast_dev',
      roundIndex: 0,
      choice: 'A',
      responseTimeMs: 200,
    });
    expect(vote1.status).toBe(200);
    expect(vote1.body.success).toBe(true);

    // 4. Slow dev votes B in 9000ms
    const vote2 = await request(app).post('/api/vote').send({
      nickname: 'slow_dev',
      roundIndex: 0,
      choice: 'B',
      responseTimeMs: 9000,
    });
    expect(vote2.status).toBe(200);
    expect(vote2.body.success).toBe(true);

    // 5. Check round results
    const resultsRes = await request(app).get('/api/results');
    expect(resultsRes.status).toBe(200);
    expect(resultsRes.body.totalVotes).toBe(2);
    expect(resultsRes.body.countA).toBe(1);
    expect(resultsRes.body.countB).toBe(1);

    // 6. Check trophies
    const trophiesRes = await request(app).get('/api/trophies');
    expect(trophiesRes.status).toBe(200);
    expect(trophiesRes.body.theFlash.nickname).toBe('fast_dev');
    expect(trophiesRes.body.thePhilosopher.nickname).toBe('slow_dev');

    // 7. Reset game
    const resetRes = await request(app).post('/api/admin/reset');
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.status).toBe('LOBBY');
  });
});


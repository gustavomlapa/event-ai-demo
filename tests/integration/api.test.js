const request = require('supertest');
const { createApp } = require('../../src/app');

describe('API Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /api/health deve responder 200 com status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('mockMode');
  });

  test('GET /api/state deve retornar o estado inicial com 0 votos e percentA/B zerados', async () => {
    const res = await request(app).get('/api/state');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('LOBBY');
    expect(res.body.totalVotes).toBe(0);
    expect(res.body.percentA).toBe(0);
    expect(res.body.percentB).toBe(0);
    expect(res.body).toHaveProperty('sessionId');
  });

  test('POST /api/join deve criar participante com apelido', async () => {
    const res = await request(app)
      .post('/api/join')
      .send({ nickname: 'DevGus' });

    expect(res.status).toBe(200);
    expect(res.body.nickname).toBe('DevGus');
    expect(res.body).toHaveProperty('participantId');
  });

  test('Fluxo completo da rodada: Iniciar -> Votar -> Fechar -> Troféus -> Reset', async () => {
    // 1. Iniciar rodada 1
    const startRes = await request(app)
      .post('/api/admin/start-round')
      .send({ roundId: 1 });
    expect(startRes.status).toBe(200);
    expect(startRes.body.status).toBe('ACTIVE');
    expect(startRes.body.currentRound.id).toBe(1);

    // 2. Criar participantes
    const p1 = (await request(app).post('/api/join').send({ nickname: 'Alice' })).body;
    const p2 = (await request(app).post('/api/join').send({ nickname: 'Bob' })).body;

    // 3. Votar (Alice em A, Bob em B)
    const vote1 = await request(app)
      .post('/api/vote')
      .send({
        participantId: p1.participantId,
        nickname: p1.nickname,
        roundId: 1,
        choice: 'A',
        responseTimeMs: 250
      });
    expect(vote1.status).toBe(200);
    expect(vote1.body.success).toBe(true);

    const vote2 = await request(app)
      .post('/api/vote')
      .send({
        participantId: p2.participantId,
        nickname: p2.nickname,
        roundId: 1,
        choice: 'B',
        responseTimeMs: 450
      });
    expect(vote2.status).toBe(200);
    expect(vote2.body.total).toBe(2);
    expect(vote2.body.percentA).toBe(50);
    expect(vote2.body.percentB).toBe(50);

    // 4. Bloqueio de voto duplo
    const voteDuplicate = await request(app)
      .post('/api/vote')
      .send({
        participantId: p1.participantId,
        nickname: p1.nickname,
        roundId: 1,
        choice: 'B',
        responseTimeMs: 300
      });
    expect(voteDuplicate.status).toBe(400);

    // 5. Fechar rodada
    const closeRes = await request(app).post('/api/admin/close-round');
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.status).toBe('REVEAL');

    // 6. Consultar troféus
    const trophyRes = await request(app).get('/api/admin/trophies');
    expect(trophyRes.status).toBe(200);
    expect(trophyRes.body.theFlash.nickname).toBe('Alice'); // 250ms < 450ms
    expect(trophyRes.body.thePhilosopher.nickname).toBe('Bob'); // 450ms > 250ms

    // 7. Reset da partida
    const resetRes = await request(app).post('/api/admin/reset');
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.status).toBe('LOBBY');
  });
});

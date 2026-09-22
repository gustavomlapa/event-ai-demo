const { GameService, QUESTIONS } = require('../src/services/gameService');

describe('gameService - Session & Voting Management', () => {
  let game;

  beforeEach(() => {
    game = new GameService();
  });

  test('predefines exactly 10 technical clash questions', () => {
    expect(QUESTIONS).toBeDefined();
    expect(QUESTIONS.length).toBe(10);
    expect(QUESTIONS[0].optionA.text).toContain('Monolito');
    expect(QUESTIONS[1].optionB.text).toContain('Cloud Run');
    expect(QUESTIONS[9].optionB.text).toContain('Generalista');
  });

  test('initial state starts in LOBBY with roundIndex 0', () => {
    const state = game.getState();
    expect(state.status).toBe('LOBBY');
    expect(state.roundIndex).toBe(0);
    expect(state.totalQuestions).toBe(10);
    expect(state.participantsCount).toBe(0);
  });

  test('registers participants with sanitized nicknames', () => {
    const p1 = game.registerParticipant('  dev_gustavo  ');
    expect(p1.success).toBe(true);
    expect(p1.nickname).toBe('dev_gustavo');

    const state = game.getState();
    expect(state.participantsCount).toBe(1);

    // Reject empty
    expect(() => game.registerParticipant('')).toThrow('Nickname inválido');
  });

  test('advances phases: LOBBY -> ACTIVE -> REVEAL -> ACTIVE (next round)', () => {
    // 1. LOBBY -> ACTIVE round 0
    let state = game.nextPhase();
    expect(state.status).toBe('ACTIVE');
    expect(state.roundIndex).toBe(0);

    // 2. ACTIVE -> REVEAL round 0
    state = game.nextPhase();
    expect(state.status).toBe('REVEAL');
    expect(state.roundIndex).toBe(0);

    // 3. REVEAL -> ACTIVE round 1
    state = game.nextPhase();
    expect(state.status).toBe('ACTIVE');
    expect(state.roundIndex).toBe(1);
  });

  test('records votes when round is ACTIVE and prevents duplicates in same round', () => {
    game.registerParticipant('alice');
    game.registerParticipant('bob');

    // Cannot vote in LOBBY
    expect(() => {
      game.submitVote({ nickname: 'alice', roundIndex: 0, choice: 'A', responseTimeMs: 400 });
    }).toThrow('Votação fechada');

    // Open round 0
    game.nextPhase();

    // Alice votes A
    const vote1 = game.submitVote({ nickname: 'alice', roundIndex: 0, choice: 'A', responseTimeMs: 400 });
    expect(vote1.success).toBe(true);

    // Bob votes B
    const vote2 = game.submitVote({ nickname: 'bob', roundIndex: 0, choice: 'B', responseTimeMs: 600 });
    expect(vote2.success).toBe(true);

    // Alice tries to vote again in round 0
    expect(() => {
      game.submitVote({ nickname: 'alice', roundIndex: 0, choice: 'B', responseTimeMs: 700 });
    }).toThrow('Voto já registrado');

    // Results
    const results = game.getRoundResults(0);
    expect(results.countA).toBe(1);
    expect(results.countB).toBe(1);
    expect(results.totalVotes).toBe(2);
    expect(results.percentA).toBe(50);
    expect(results.percentB).toBe(50);
  });

  test('resetGame returns to initial LOBBY and clears votes', () => {
    game.registerParticipant('alice');
    game.nextPhase();
    game.submitVote({ nickname: 'alice', roundIndex: 0, choice: 'A', responseTimeMs: 300 });

    game.resetGame();
    const state = game.getState();
    expect(state.status).toBe('LOBBY');
    expect(state.roundIndex).toBe(0);
    expect(state.participantsCount).toBe(0);
    expect(game.getAllVotes()).toHaveLength(0);
  });
});

const { GameService } = require('../../src/services/gameService');
const db = require('../../src/services/db');

describe('GameService Unit Tests', () => {
  let gameService;

  beforeEach(() => {
    db.resetMock();
    gameService = new GameService();
  });

  test('deve inicializar com estado LOBBY, sem votos e com sessionId gerado', () => {
    const state = gameService.getState();
    expect(state.status).toBe('LOBBY');
    expect(state.currentRoundIndex).toBe(0);
    expect(state.totalVotes).toBe(0);
    expect(state.percentA).toBe(0);
    expect(state.percentB).toBe(0);
    expect(typeof state.sessionId).toBe('string');
    expect(state.sessionId.length).toBeGreaterThan(0);
  });

  test('com 0 votos, o cálculo deve retornar exatamente 0% para A e 0% para B', () => {
    const calculation = gameService.calculatePercentages(0, 0);
    expect(calculation).toEqual({
      countA: 0,
      countB: 0,
      total: 0,
      percentA: 0,
      percentB: 0
    });
  });

  test('com votos computados, a soma de percentA e percentB deve ser estritamente 100%', () => {
    // 2 votos para A, 1 voto para B -> total 3 (66.66% arredonda para 67%, B fica 33%)
    const calc = gameService.calculatePercentages(2, 1);
    expect(calc.total).toBe(3);
    expect(calc.percentA).toBe(67);
    expect(calc.percentB).toBe(33);
    expect(calc.percentA + calc.percentB).toBe(100);

    // 1 voto para A, 2 votos para B -> total 3
    const calc2 = gameService.calculatePercentages(1, 2);
    expect(calc2.percentA).toBe(33);
    expect(calc2.percentB).toBe(67);
    expect(calc2.percentA + calc2.percentB).toBe(100);
  });

  test('não deve permitir votação se a rodada não estiver ACTIVE', async () => {
    // Estado ainda é LOBBY
    await expect(
      gameService.registerVote({
        participantId: 'dev-1',
        nickname: 'Alice',
        roundId: 1,
        choice: 'A',
        responseTimeMs: 350
      })
    ).rejects.toThrow('A rodada não está aberta para votação');
  });

  test('deve registrar voto com sucesso quando a rodada estiver ACTIVE', async () => {
    gameService.startRound(1);
    const voteResult = await gameService.registerVote({
      participantId: 'dev-1',
      nickname: 'Alice',
      roundId: 1,
      choice: 'A',
      responseTimeMs: 320
    });

    expect(voteResult.success).toBe(true);
    expect(voteResult.countA).toBe(1);
    expect(voteResult.countB).toBe(0);
    expect(voteResult.percentA).toBe(100);
    expect(voteResult.percentB).toBe(0);
  });

  test('deve bloquear tentativa de voto duplo do mesmo participante na mesma rodada', async () => {
    gameService.startRound(1);
    await gameService.registerVote({
      participantId: 'dev-1',
      nickname: 'Alice',
      roundId: 1,
      choice: 'A',
      responseTimeMs: 320
    });

    await expect(
      gameService.registerVote({
        participantId: 'dev-1',
        nickname: 'Alice',
        roundId: 1,
        choice: 'B',
        responseTimeMs: 400
      })
    ).rejects.toThrow('Você já votou nesta rodada');
  });

  test('deve gerenciar transição de estados: LOBBY -> ACTIVE -> REVEAL -> NEXT (vai direto para ACTIVE com votação aberta)', async () => {
    gameService.startRound(1);
    expect(gameService.getState().status).toBe('ACTIVE');
    expect(gameService.getState().currentRound.id).toBe(1);

    gameService.closeRound();
    expect(gameService.getState().status).toBe('REVEAL');

    // Ao avançar, a rodada 2 deve iniciar de uma só vez em ACTIVE e com votação aberta
    gameService.nextRound();
    const state = gameService.getState();
    expect(state.currentRound.id).toBe(2);
    expect(state.status).toBe('ACTIVE');
    expect(typeof state.roundStartTime).toBe('number');
    expect(Date.now() - state.roundStartTime).toBeLessThan(1000);

    // Deve permitir voto imediatamente na rodada 2
    const voteResult = await gameService.registerVote({
      participantId: 'dev-1',
      nickname: 'Alice',
      roundId: 2,
      choice: 'A',
      responseTimeMs: 200
    });
    expect(voteResult.success).toBe(true);
    expect(voteResult.countA).toBe(1);
  });

  test('resetGame deve gerar um novo sessionId e limpar contagens', () => {
    const oldSessionId = gameService.getState().sessionId;
    gameService.startRound(1);
    const newSession = gameService.resetGame();

    expect(newSession.sessionId).not.toBe(oldSessionId);
    expect(newSession.status).toBe('LOBBY');
    expect(newSession.currentRoundIndex).toBe(0);
  });

  test('deve rastrear participantes conectados via heartbeat', () => {
    gameService.recordHeartbeat('dev-1');
    gameService.recordHeartbeat('dev-2');
    gameService.recordHeartbeat('dev-3');

    expect(gameService.getConnectedCount()).toBe(3);
  });
});

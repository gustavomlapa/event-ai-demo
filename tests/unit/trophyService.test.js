const { calculateTrophies } = require('../../src/services/trophyService');

describe('TrophyService Unit Tests - O Oscar dos Devs', () => {
  const mockRounds = [
    { id: 1, optionA: 'Monolito', optionB: 'Microsserviços' },
    { id: 2, optionA: 'Kubernetes', optionB: 'Cloud Run' },
    { id: 3, optionA: 'SQL', optionB: 'NoSQL' }
  ];

  test('deve retornar valores padrão graciosamente se não houver votos', () => {
    const result = calculateTrophies([], mockRounds);
    expect(result.theFlash).toBeDefined();
    expect(result.thePhilosopher).toBeDefined();
    expect(result.loneWolf).toBeDefined();
    expect(result.voiceOfThePeople).toBeDefined();
    expect(result.stackOfAuditorium).toEqual([]);
  });

  test('deve calcular corretamente The Flash (menor tempo médio) e O Filósofo (maior tempo médio)', () => {
    const votes = [
      // Alice: tempos 100ms e 200ms -> média 150ms
      { participantId: 'p1', nickname: 'Alice', roundId: 1, choice: 'A', responseTimeMs: 100 },
      { participantId: 'p1', nickname: 'Alice', roundId: 2, choice: 'A', responseTimeMs: 200 },
      // Bob: tempos 500ms e 700ms -> média 600ms
      { participantId: 'p2', nickname: 'Bob', roundId: 1, choice: 'B', responseTimeMs: 500 },
      { participantId: 'p2', nickname: 'Bob', roundId: 2, choice: 'B', responseTimeMs: 700 },
      // Carol: tempos 300ms e 300ms -> média 300ms
      { participantId: 'p3', nickname: 'Carol', roundId: 1, choice: 'A', responseTimeMs: 300 },
      { participantId: 'p3', nickname: 'Carol', roundId: 2, choice: 'A', responseTimeMs: 300 }
    ];

    const result = calculateTrophies(votes, mockRounds);

    expect(result.theFlash.nickname).toBe('Alice');
    expect(result.theFlash.avgTimeMs).toBe(150);

    expect(result.thePhilosopher.nickname).toBe('Bob');
    expect(result.thePhilosopher.avgTimeMs).toBe(600);
  });

  test('deve calcular corretamente O Lobo Solitário (mais votos em opções minoritárias) e A Voz do Povo (mais alinhado com a maioria)', () => {
    // Rodada 1: Opção A vence (Alice + Carol votaram A, Bob votou B) -> Minoria = B
    // Rodada 2: Opção A vence (Alice + Carol votaram A, Bob votou B) -> Minoria = B
    const votes = [
      { participantId: 'p1', nickname: 'Alice', roundId: 1, choice: 'A', responseTimeMs: 200 },
      { participantId: 'p1', nickname: 'Alice', roundId: 2, choice: 'A', responseTimeMs: 200 },
      { participantId: 'p2', nickname: 'Bob', roundId: 1, choice: 'B', responseTimeMs: 400 },
      { participantId: 'p2', nickname: 'Bob', roundId: 2, choice: 'B', responseTimeMs: 400 },
      { participantId: 'p3', nickname: 'Carol', roundId: 1, choice: 'A', responseTimeMs: 300 },
      { participantId: 'p3', nickname: 'Carol', roundId: 2, choice: 'A', responseTimeMs: 300 }
    ];

    const result = calculateTrophies(votes, mockRounds);

    // Bob votou 2 vezes na minoria (B)
    expect(result.loneWolf.nickname).toBe('Bob');
    expect(result.loneWolf.minorityVotes).toBe(2);

    // Alice e Carol votaram 2 vezes na maioria (A)
    expect(['Alice', 'Carol']).toContain(result.voiceOfThePeople.nickname);
    expect(result.voiceOfThePeople.majorityVotes).toBe(2);
  });

  test('deve compilar a Stack Oficial do Auditório com as opções consagradas', () => {
    const votes = [
      { participantId: 'p1', nickname: 'Alice', roundId: 1, choice: 'A', responseTimeMs: 200 },
      { participantId: 'p2', nickname: 'Bob', roundId: 1, choice: 'A', responseTimeMs: 300 },
      { participantId: 'p3', nickname: 'Carol', roundId: 1, choice: 'B', responseTimeMs: 400 }
    ];

    const result = calculateTrophies(votes, mockRounds);

    expect(result.stackOfAuditorium.length).toBeGreaterThan(0);
    expect(result.stackOfAuditorium[0].winner).toBe('Monolito');
    expect(result.stackOfAuditorium[0].percentage).toBe(67);
  });
});

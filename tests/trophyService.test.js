const { calculateTrophies } = require('../src/services/trophyService');

describe('trophyService - Superlative Award Engine', () => {
  test('returns default empty trophies when votes list is empty', () => {
    const trophies = calculateTrophies([]);
    expect(trophies).toBeDefined();
    expect(trophies.theFlash).toBeNull();
    expect(trophies.thePhilosopher).toBeNull();
    expect(trophies.theLoneWolf).toBeNull();
    expect(trophies.theVoiceOfThePeople).toBeNull();
  });

  test('calculates The Flash and The Philosopher based on average response time', () => {
    const votes = [
      // Alice: average 250ms
      { nickname: 'alice', roundIndex: 0, choice: 'A', responseTimeMs: 200 },
      { nickname: 'alice', roundIndex: 1, choice: 'A', responseTimeMs: 300 },
      // Bob: average 8000ms
      { nickname: 'bob', roundIndex: 0, choice: 'A', responseTimeMs: 7500 },
      { nickname: 'bob', roundIndex: 1, choice: 'B', responseTimeMs: 8500 },
      // Charlie: average 1500ms
      { nickname: 'charlie', roundIndex: 0, choice: 'A', responseTimeMs: 1400 },
      { nickname: 'charlie', roundIndex: 1, choice: 'A', responseTimeMs: 1600 },
    ];

    const trophies = calculateTrophies(votes);

    expect(trophies.theFlash).toBeDefined();
    expect(trophies.theFlash.nickname).toBe('alice');
    expect(trophies.theFlash.avgResponseTimeMs).toBe(250);

    expect(trophies.thePhilosopher).toBeDefined();
    expect(trophies.thePhilosopher.nickname).toBe('bob');
    expect(trophies.thePhilosopher.avgResponseTimeMs).toBe(8000);
  });

  test('calculates The Lone Wolf and The Voice of the People based on majority/minority choices', () => {
    // Round 0: Majority chose A (Alice, Charlie, Dave = 3 vs Bob = 1) -> Majority: A, Minority: B
    // Round 1: Majority chose B (Alice, Charlie, Dave = 3 vs Bob = 1) -> Majority: B, Minority: A
    const votes = [
      { nickname: 'alice', roundIndex: 0, choice: 'A', responseTimeMs: 1000 },
      { nickname: 'alice', roundIndex: 1, choice: 'B', responseTimeMs: 1000 },

      { nickname: 'charlie', roundIndex: 0, choice: 'A', responseTimeMs: 1100 },
      { nickname: 'charlie', roundIndex: 1, choice: 'B', responseTimeMs: 1100 },

      { nickname: 'dave', roundIndex: 0, choice: 'A', responseTimeMs: 1200 },
      { nickname: 'dave', roundIndex: 1, choice: 'B', responseTimeMs: 1200 },

      // Bob always voted for the minority
      { nickname: 'bob', roundIndex: 0, choice: 'B', responseTimeMs: 1300 },
      { nickname: 'bob', roundIndex: 1, choice: 'A', responseTimeMs: 1300 },
    ];

    const trophies = calculateTrophies(votes);

    expect(trophies.theLoneWolf).toBeDefined();
    expect(trophies.theLoneWolf.nickname).toBe('bob');
    expect(trophies.theLoneWolf.minorityCount).toBe(2);

    expect(trophies.theVoiceOfThePeople).toBeDefined();
    // Alice, Charlie, and Dave are all 100% aligned with majority
    expect(['alice', 'charlie', 'dave']).toContain(trophies.theVoiceOfThePeople.nickname);
    expect(trophies.theVoiceOfThePeople.majorityCount).toBe(2);
  });
});


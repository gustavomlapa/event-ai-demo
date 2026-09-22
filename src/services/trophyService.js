/**
 * Superlative Award Engine ("O Oscar dos Devs")
 * Computes lighthearted titles based on participant votes and response times.
 */

function calculateTrophies(votes = []) {
  if (!votes || votes.length === 0) {
    return {
      theFlash: null,
      thePhilosopher: null,
      theLoneWolf: null,
      theVoiceOfThePeople: null,
    };
  }

  // 1. Group votes by round to determine majority and minority choice per round
  const roundCounts = {}; // roundIndex -> { A: count, B: count }
  for (const vote of votes) {
    const r = vote.roundIndex;
    if (!roundCounts[r]) {
      roundCounts[r] = { A: 0, B: 0 };
    }
    if (vote.choice === 'A' || vote.choice === 'B') {
      roundCounts[r][vote.choice] = (roundCounts[r][vote.choice] || 0) + 1;
    }
  }

  const roundOutcome = {}; // roundIndex -> { majority: 'A'|'B', minority: 'A'|'B' }
  for (const [r, counts] of Object.entries(roundCounts)) {
    if (counts.A > counts.B) {
      roundOutcome[r] = { majority: 'A', minority: 'B' };
    } else if (counts.B > counts.A) {
      roundOutcome[r] = { majority: 'B', minority: 'A' };
    } else {
      roundOutcome[r] = { majority: null, minority: null }; // tie
    }
  }

  // 2. Aggregate stats per nickname
  const userStats = {}; // nickname -> { totalTime, voteCount, majorityCount, minorityCount }
  for (const vote of votes) {
    const nick = vote.nickname;
    if (!nick) continue;

    if (!userStats[nick]) {
      userStats[nick] = {
        nickname: nick,
        totalTime: 0,
        voteCount: 0,
        majorityCount: 0,
        minorityCount: 0,
      };
    }

    const time = typeof vote.responseTimeMs === 'number' && vote.responseTimeMs >= 0
      ? vote.responseTimeMs
      : 0;

    userStats[nick].totalTime += time;
    userStats[nick].voteCount += 1;

    const outcome = roundOutcome[vote.roundIndex];
    if (outcome && outcome.majority) {
      if (vote.choice === outcome.majority) {
        userStats[nick].majorityCount += 1;
      } else if (vote.choice === outcome.minority) {
        userStats[nick].minorityCount += 1;
      }
    }
  }

  const users = Object.values(userStats);
  if (users.length === 0) {
    return {
      theFlash: null,
      thePhilosopher: null,
      theLoneWolf: null,
      theVoiceOfThePeople: null,
    };
  }

  // Calculate averages
  for (const u of users) {
    u.avgResponseTimeMs = Math.round(u.totalTime / Math.max(u.voteCount, 1));
  }

  // Find The Flash (lowest average response time)
  const sortedBySpeed = [...users].sort((a, b) => a.avgResponseTimeMs - b.avgResponseTimeMs);
  const theFlashUser = sortedBySpeed[0];
  const theFlash = {
    nickname: theFlashUser.nickname,
    avgResponseTimeMs: theFlashUser.avgResponseTimeMs,
    title: 'The Flash (Dev de Gatilho Rápido)',
    description: 'Nem pensou, só clicou! Agilidade pura em produção.',
  };

  // Find The Philosopher (highest average response time)
  const sortedByPatience = [...users].sort((a, b) => b.avgResponseTimeMs - a.avgResponseTimeMs);
  const thePhilosopherUser = sortedByPatience[0];
  const thePhilosopher = {
    nickname: thePhilosopherUser.nickname,
    avgResponseTimeMs: thePhilosopherUser.avgResponseTimeMs,
    title: 'O Filósofo da Arquitetura',
    description: 'Pensou com carinho até o último segundo antes de decidir.',
  };

  // Find The Lone Wolf (most minority votes)
  const sortedByMinority = [...users].sort((a, b) => b.minorityCount - a.minorityCount);
  const theLoneWolfUser = sortedByMinority[0];
  const theLoneWolf = {
    nickname: theLoneWolfUser.nickname,
    minorityCount: theLoneWolfUser.minorityCount,
    title: 'O Lobo Solitário (Diferentão)',
    description: 'Nunca segue a manada! Nada contra a corrente com orgulho.',
  };

  // Find The Voice of the People (most majority votes)
  const sortedByMajority = [...users].sort((a, b) => b.majorityCount - a.majorityCount);
  const theVoiceUser = sortedByMajority[0];
  const theVoiceOfThePeople = {
    nickname: theVoiceUser.nickname,
    majorityCount: theVoiceUser.majorityCount,
    title: 'A Voz do Povo (O Diplomata)',
    description: 'Em total sintonia com o sentimento coletivo do auditório.',
  };

  return {
    theFlash,
    thePhilosopher,
    theLoneWolf,
    theVoiceOfThePeople,
  };
}

module.exports = {
  calculateTrophies,
};

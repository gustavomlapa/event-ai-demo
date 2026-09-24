/**
 * Algoritmo dos Troféus ("O Oscar dos Devs")
 */
function calculateTrophies(votes = [], rounds = []) {
  if (!votes || votes.length === 0) {
    return {
      theFlash: { nickname: 'Nenhum', avgTimeMs: 0, description: 'Menor tempo médio de resposta' },
      thePhilosopher: { nickname: 'Nenhum', avgTimeMs: 0, description: 'Maior tempo médio de resposta' },
      loneWolf: { nickname: 'Nenhum', minorityVotes: 0, description: 'Mais votos em opções minoritárias' },
      voiceOfThePeople: { nickname: 'Nenhum', majorityVotes: 0, description: 'Mais votos alinhados com a maioria' },
      stackOfAuditorium: []
    };
  }

  // 1. Mapeia o resultado majoritário e minoritário por rodada
  const roundCounts = new Map();
  rounds.forEach(r => {
    roundCounts.set(r.id, { countA: 0, countB: 0, round: r });
  });

  votes.forEach(v => {
    if (roundCounts.has(v.roundId)) {
      const data = roundCounts.get(v.roundId);
      if (v.choice === 'A') data.countA += 1;
      else if (v.choice === 'B') data.countB += 1;
    }
  });

  const roundResults = new Map();
  const stackOfAuditorium = [];

  roundCounts.forEach((data, roundId) => {
    const total = data.countA + data.countB;
    if (total === 0) return;

    let majority = 'TIE';
    let minority = null;
    let winner = 'Empate Técnico 🤝';
    let percentage = 50;

    if (data.countA > data.countB) {
      majority = 'A';
      minority = 'B';
      winner = data.round.optionA;
      percentage = Math.round((data.countA / total) * 100);
    } else if (data.countB > data.countA) {
      majority = 'B';
      minority = 'A';
      winner = data.round.optionB;
      percentage = Math.round((data.countB / total) * 100);
    }

    roundResults.set(roundId, { majority, minority });
    stackOfAuditorium.push({
      roundId,
      title: data.round.title,
      winner,
      percentage,
      totalVotes: total
    });
  });

  // 2. Agrega métricas por participante
  const participants = new Map();

  votes.forEach(v => {
    if (!participants.has(v.participantId)) {
      participants.set(v.participantId, {
        participantId: v.participantId,
        nickname: v.nickname || 'Dev Anônimo',
        totalResponseTime: 0,
        voteCount: 0,
        minorityVotes: 0,
        majorityVotes: 0
      });
    }

    const p = participants.get(v.participantId);
    p.totalResponseTime += Number(v.responseTimeMs || 0);
    p.voteCount += 1;

    const roundRes = roundResults.get(v.roundId);
    if (roundRes) {
      if (roundRes.minority && v.choice === roundRes.minority) {
        p.minorityVotes += 1;
      }
      if (roundRes.majority && v.choice === roundRes.majority) {
        p.majorityVotes += 1;
      }
    }
  });

  const participantList = Array.from(participants.values()).map(p => ({
    ...p,
    avgTimeMs: Math.round(p.totalResponseTime / p.voteCount)
  }));

  if (participantList.length === 0) {
    return {
      theFlash: { nickname: 'Nenhum', avgTimeMs: 0 },
      thePhilosopher: { nickname: 'Nenhum', avgTimeMs: 0 },
      loneWolf: { nickname: 'Nenhum', minorityVotes: 0 },
      voiceOfThePeople: { nickname: 'Nenhum', majorityVotes: 0 },
      stackOfAuditorium
    };
  }

  // ⚡ The Flash: Menor tempo médio geral
  const sortedByFast = [...participantList].sort((a, b) => a.avgTimeMs - b.avgTimeMs);
  const theFlash = sortedByFast[0];

  // 🧘 O Filósofo da Arquitetura: Maior tempo médio geral
  const sortedBySlow = [...participantList].sort((a, b) => b.avgTimeMs - a.avgTimeMs);
  const thePhilosopher = sortedBySlow[0];

  // 🐺 O Lobo Solitário: Mais votos em opções minoritárias
  const sortedByMinority = [...participantList].sort((a, b) => b.minorityVotes - a.minorityVotes);
  const loneWolf = sortedByMinority[0];

  // 🤝 A Voz do Povo: Mais votos alinhados com a maioria
  const sortedByMajority = [...participantList].sort((a, b) => b.majorityVotes - a.majorityVotes);
  const voiceOfThePeople = sortedByMajority[0];

  return {
    theFlash: {
      title: "⚡ The Flash (Gatilho Rápido)",
      nickname: theFlash.nickname,
      avgTimeMs: theFlash.avgTimeMs,
      description: "Menor tempo médio de resposta geral da sala"
    },
    thePhilosopher: {
      title: "🧘 O Filósofo da Arquitetura",
      nickname: thePhilosopher.nickname,
      avgTimeMs: thePhilosopher.avgTimeMs,
      description: "Maior tempo médio de resposta geral da sala"
    },
    loneWolf: {
      title: "🐺 O Lobo Solitário",
      nickname: loneWolf.nickname,
      minorityVotes: loneWolf.minorityVotes,
      description: "Votou mais vezes contra o senso comum da plateia"
    },
    voiceOfThePeople: {
      title: "🤝 A Voz do Povo",
      nickname: voiceOfThePeople.nickname,
      majorityVotes: voiceOfThePeople.majorityVotes,
      description: "Votou com a esmagadora maioria em quase todas as rodadas"
    },
    stackOfAuditorium
  };
}

module.exports = { calculateTrophies };

/**
 * Stage Screen Logic: Real-time Tug of War & Trophy Ceremony
 */

(function () {
  let qrcodeInstance = null;
  let currentState = null;
  let confettiFired = false;

  // DOM Elements
  const screenLobby = document.getElementById('screenLobby');
  const screenBattle = document.getElementById('screenBattle');
  const screenReveal = document.getElementById('screenReveal');
  const screenTrophies = document.getElementById('screenTrophies');

  const screenDevsCount = document.getElementById('screenDevsCount');
  const roundIndicatorBadge = document.getElementById('roundIndicatorBadge');
  const currentRoundNum = document.getElementById('currentRoundNum');
  const screenDirectUrl = document.getElementById('screenDirectUrl');

  const battleCategory = document.getElementById('battleCategory');
  const battleQuestionTitle = document.getElementById('battleQuestionTitle');
  const battleTitleA = document.getElementById('battleTitleA');
  const battleDescA = document.getElementById('battleDescA');
  const battleTitleB = document.getElementById('battleTitleB');
  const battleDescB = document.getElementById('battleDescB');

  const battlePercentA = document.getElementById('battlePercentA');
  const battlePercentB = document.getElementById('battlePercentB');
  const battleVotesA = document.getElementById('battleVotesA');
  const battleVotesB = document.getElementById('battleVotesB');
  const battleTotalVotesText = document.getElementById('battleTotalVotesText');
  const tugBarA = document.getElementById('tugBarA');
  const tugBarB = document.getElementById('tugBarB');

  const winnerTitle = document.getElementById('winnerTitle');
  const winnerStatsText = document.getElementById('winnerStatsText');

  const trophyFlashNick = document.getElementById('trophyFlashNick');
  const trophyFlashTime = document.getElementById('trophyFlashTime');
  const trophyPhilNick = document.getElementById('trophyPhilNick');
  const trophyPhilTime = document.getElementById('trophyPhilTime');
  const trophyWolfNick = document.getElementById('trophyWolfNick');
  const trophyWolfCount = document.getElementById('trophyWolfCount');
  const trophyVoiceNick = document.getElementById('trophyVoiceNick');
  const trophyVoiceCount = document.getElementById('trophyVoiceCount');

  // Initialize QR Code with dynamic origin
  function initQrCode() {
    const origin = window.location.origin;
    screenDirectUrl.textContent = origin;

    const qrContainer = document.getElementById('qrcodeCanvas');
    qrContainer.innerHTML = '';
    qrcodeInstance = new QRCode(qrContainer, {
      text: origin,
      width: 240,
      height: 240,
      colorDark: '#090d16',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }

  function showScreen(element) {
    [screenLobby, screenBattle, screenReveal, screenTrophies].forEach((s) => {
      s.classList.add('hidden');
    });
    element.classList.remove('hidden');
  }

  async function updateBattleResults(roundIndex) {
    try {
      const res = await fetch(`/api/results?round=${roundIndex}`);
      const data = await res.json();

      const pA = data.percentA || 50;
      const pB = data.percentB || 50;

      battlePercentA.textContent = `${pA}%`;
      battlePercentB.textContent = `${pB}%`;
      battleVotesA.textContent = `(${data.countA || 0} votos)`;
      battleVotesB.textContent = `(${data.countB || 0} votos)`;
      battleTotalVotesText.textContent = `${data.totalVotes || 0} Votos Computados`;

      tugBarA.style.width = `${pA}%`;
      tugBarB.style.width = `${pB}%`;

      if (data.winner === 'A') {
        winnerTitle.textContent = data.question ? data.question.optionA.text : 'Opção A';
        winnerStatsText.textContent = `${pA}% dos votos (${data.countA} votos)`;
      } else if (data.winner === 'B') {
        winnerTitle.textContent = data.question ? data.question.optionB.text : 'Opção B';
        winnerStatsText.textContent = `${pB}% dos votos (${data.countB} votos)`;
      } else {
        winnerTitle.textContent = 'Empate Técnico! ⚖️';
        winnerStatsText.textContent = 'Ambas opções empataram na sala!';
      }
    } catch (err) {
      console.warn('Erro ao atualizar resultados:', err);
    }
  }

  async function updateTrophies() {
    try {
      const res = await fetch('/api/trophies');
      const trophies = await res.json();

      if (trophies.theFlash) {
        trophyFlashNick.textContent = trophies.theFlash.nickname;
        trophyFlashTime.textContent = `${trophies.theFlash.avgResponseTimeMs}ms de média`;
      }
      if (trophies.thePhilosopher) {
        trophyPhilNick.textContent = trophies.thePhilosopher.nickname;
        trophyPhilTime.textContent = `${trophies.thePhilosopher.avgResponseTimeMs}ms de média`;
      }
      if (trophies.theLoneWolf) {
        trophyWolfNick.textContent = trophies.theLoneWolf.nickname;
        trophyWolfCount.textContent = `${trophies.theLoneWolf.minorityCount} votos na minoria`;
      }
      if (trophies.theVoiceOfThePeople) {
        trophyVoiceNick.textContent = trophies.theVoiceOfThePeople.nickname;
        trophyVoiceCount.textContent = `${trophies.theVoiceOfThePeople.majorityCount} votos com a maioria`;
      }

      // Fire confetti once
      if (!confettiFired && window.confetti) {
        confettiFired = true;
        window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.warn('Erro ao atualizar troféus:', err);
    }
  }

  async function syncState() {
    try {
      const res = await fetch('/api/state');
      const state = await res.json();
      currentState = state;

      screenDevsCount.textContent = state.participantsCount || 0;

      if (state.status === 'LOBBY') {
        roundIndicatorBadge.classList.add('hidden');
        confettiFired = false;
        showScreen(screenLobby);
      } else if (state.status === 'ACTIVE') {
        roundIndicatorBadge.classList.remove('hidden');
        currentRoundNum.textContent = `${state.roundIndex + 1}/${state.totalQuestions}`;

        const q = state.currentQuestion;
        if (q) {
          battleCategory.textContent = `Rodada ${state.roundIndex + 1}/${state.totalQuestions} • ${q.category}`;
          battleQuestionTitle.textContent = q.title;
          battleTitleA.textContent = q.optionA.text;
          battleDescA.textContent = q.optionA.description;
          battleTitleB.textContent = q.optionB.text;
          battleDescB.textContent = q.optionB.description;
        }

        updateBattleResults(state.roundIndex);
        showScreen(screenBattle);
      } else if (state.status === 'REVEAL') {
        roundIndicatorBadge.classList.remove('hidden');
        currentRoundNum.textContent = `${state.roundIndex + 1}/${state.totalQuestions}`;
        updateBattleResults(state.roundIndex);
        showScreen(screenReveal);
      } else if (state.status === 'FINISHED') {
        roundIndicatorBadge.classList.add('hidden');
        updateTrophies();
        showScreen(screenTrophies);
      }
    } catch (err) {
      console.warn('Erro na sincronização do telão:', err);
    }
  }

  initQrCode();
  syncState();
  setInterval(syncState, 800);
})();

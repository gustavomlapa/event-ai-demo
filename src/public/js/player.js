/**
 * Player Client Logic - 1-Tap Mobile Experience
 */

(function () {
  let nickname = localStorage.getItem('tbr_nickname') || '';
  let currentState = null;
  let currentRoundRendered = null;
  let roundOpenedLocalTime = null;
  let hasVotedInCurrentRound = false;

  // DOM Elements
  const viewJoin = document.getElementById('viewJoin');
  const viewLobby = document.getElementById('viewLobby');
  const viewActive = document.getElementById('viewActive');
  const viewVoted = document.getElementById('viewVoted');
  const viewReveal = document.getElementById('viewReveal');
  const viewFinished = document.getElementById('viewFinished');

  const joinForm = document.getElementById('joinForm');
  const nicknameInput = document.getElementById('nicknameInput');
  const playerBadge = document.getElementById('playerBadge');
  const playerNameDisplay = document.getElementById('playerNameDisplay');

  const roundCategory = document.getElementById('roundCategory');
  const roundTitle = document.getElementById('roundTitle');
  const btnOptionA = document.getElementById('btnOptionA');
  const btnOptionB = document.getElementById('btnOptionB');
  const textOptionA = document.getElementById('textOptionA');
  const textOptionB = document.getElementById('textOptionB');
  const descOptionA = document.getElementById('descOptionA');
  const descOptionB = document.getElementById('descOptionB');

  const votedChoiceText = document.getElementById('votedChoiceText');
  const votedTimeMs = document.getElementById('votedTimeMs');

  const revealWinnerText = document.getElementById('revealWinnerText');
  const revealPercentA = document.getElementById('revealPercentA');
  const revealPercentB = document.getElementById('revealPercentB');

  const btnLogout = document.getElementById('btnLogout');
  const btnLobbyLogout = document.getElementById('btnLobbyLogout');

  function showView(viewElement) {
    [viewJoin, viewLobby, viewActive, viewVoted, viewReveal, viewFinished].forEach((v) => {
      v.classList.add('hidden');
    });
    viewElement.classList.remove('hidden');
  }

  function updatePlayerBadge() {
    if (nickname) {
      playerBadge.classList.remove('hidden');
      playerBadge.classList.add('inline-flex');
      playerNameDisplay.textContent = nickname;
    } else {
      playerBadge.classList.add('hidden');
      playerBadge.classList.remove('inline-flex');
    }
  }

  function logoutPlayer() {
    nickname = '';
    localStorage.removeItem('tbr_nickname');
    localStorage.removeItem('tbr_session_id');
    hasVotedInCurrentRound = false;
    currentRoundRendered = null;
    updatePlayerBadge();
    nicknameInput.value = '';
    showView(viewJoin);
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logoutPlayer();
    });
  }

  if (btnLobbyLogout) {
    btnLobbyLogout.addEventListener('click', (e) => {
      e.preventDefault();
      logoutPlayer();
    });
  }

  // 1. Join Handler
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const raw = nicknameInput.value.trim();
    if (!raw) return;

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: raw }),
      });
      const data = await res.json();
      if (data.success) {
        nickname = data.nickname;
        localStorage.setItem('tbr_nickname', nickname);
        if (data.sessionId) {
          localStorage.setItem('tbr_session_id', data.sessionId);
        }
        updatePlayerBadge();
        syncState();
      } else {
        alert(data.error || 'Erro ao entrar');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão. Verifique a rede.');
    }
  });

  // 2. Voting Action (1-Tap)
  async function vote(choice) {
    if (hasVotedInCurrentRound || !currentState || currentState.status !== 'ACTIVE') return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    hasVotedInCurrentRound = true;
    btnOptionA.disabled = true;
    btnOptionB.disabled = true;

    const responseTime = roundOpenedLocalTime ? Math.max(50, Date.now() - roundOpenedLocalTime) : 500;
    const q = currentState.currentQuestion;
    const choiceName = choice === 'A' ? q.optionA.text : q.optionB.text;

    votedChoiceText.textContent = choiceName;
    votedTimeMs.textContent = responseTime;
    showView(viewVoted);

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          roundIndex: currentState.roundIndex,
          choice,
          responseTimeMs: responseTime,
        }),
      });
    } catch (err) {
      console.error('Falha ao enviar voto:', err);
    }
  }

  btnOptionA.addEventListener('click', () => vote('A'));
  btnOptionB.addEventListener('click', () => vote('B'));

  // 3. State Synchronization
  async function syncState() {
    if (!nickname) {
      showView(viewJoin);
      return;
    }

    updatePlayerBadge();

    try {
      const res = await fetch('/api/state');
      const state = await res.json();
      currentState = state;

      // Se o apresentador resetou o jogo no admin, o sessionId mudou -> desloga automaticamente
      const currentStoredSession = localStorage.getItem('tbr_session_id');
      if (state.sessionId) {
        if (!currentStoredSession) {
          localStorage.setItem('tbr_session_id', state.sessionId);
        } else if (currentStoredSession !== state.sessionId) {
          logoutPlayer();
          return;
        }
      }

      // Oculta o botão de sair durante a rodada ACTIVE para evitar toques acidentais
      if (btnLogout) {
        if (state.status === 'ACTIVE') {
          btnLogout.classList.add('hidden');
        } else {
          btnLogout.classList.remove('hidden');
        }
      }

      // Handle round transitions
      if (state.roundIndex !== currentRoundRendered) {
        currentRoundRendered = state.roundIndex;
        hasVotedInCurrentRound = false;
        roundOpenedLocalTime = Date.now();
      }

      if (state.status === 'LOBBY') {
        showView(viewLobby);
      } else if (state.status === 'ACTIVE') {
        if (hasVotedInCurrentRound) {
          showView(viewVoted);
        } else {
          // Render Question
          const q = state.currentQuestion;
          if (q) {
            roundCategory.textContent = `Rodada ${state.roundIndex + 1}/${state.totalQuestions} • ${q.category}`;
            roundTitle.textContent = q.title;
            textOptionA.textContent = q.optionA.text;
            descOptionA.textContent = q.optionA.description;
            textOptionB.textContent = q.optionB.text;
            descOptionB.textContent = q.optionB.description;

            btnOptionA.disabled = false;
            btnOptionB.disabled = false;
            showView(viewActive);
          }
        }
      } else if (state.status === 'REVEAL') {
        fetchResults(state.roundIndex);
        showView(viewReveal);
      } else if (state.status === 'FINISHED') {
        showView(viewFinished);
      }
    } catch (err) {
      console.warn('Erro na sincronização de estado:', err);
    }
  }

  async function fetchResults(roundIdx) {
    try {
      const res = await fetch(`/api/results?round=${roundIdx}`);
      const data = await res.json();
      const totalVotes = Number(data.totalVotes) || 0;
      const pA = data.percentA !== undefined ? Number(data.percentA) : 0;
      const pB = data.percentB !== undefined ? Number(data.percentB) : 0;

      revealPercentA.textContent = pA;
      revealPercentB.textContent = pB;

      if (totalVotes === 0) {
        revealWinnerText.textContent = 'Sem votos nesta rodada';
      } else if (data.winner === 'A') {
        revealWinnerText.textContent = data.question ? data.question.optionA.text : 'Opção A';
      } else if (data.winner === 'B') {
        revealWinnerText.textContent = data.question ? data.question.optionB.text : 'Opção B';
      } else {
        revealWinnerText.textContent = 'Empate Técnico! ⚖️';
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Initial Boot
  if (nickname) {
    updatePlayerBadge();
  }
  syncState();
  setInterval(syncState, 1000);
})();


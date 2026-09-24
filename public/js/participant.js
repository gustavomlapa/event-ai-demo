/**
 * Tech Battle Royale — Lógica do Participante Mobile (1-Tap)
 */
class ParticipantApp {
  constructor() {
    this.participantId = localStorage.getItem('tbr_participant_id') || null;
    this.nickname = localStorage.getItem('tbr_nickname') || null;
    this.currentSessionId = localStorage.getItem('tbr_session_id') || null;
    this.votedRounds = new Set(JSON.parse(localStorage.getItem('tbr_voted_rounds') || '[]'));
    
    this.currentRoundId = null;
    this.roundStartTime = null;
    this.isVotingInProgress = false;
    this.pollInterval = null;
    this.heartbeatInterval = null;

    this.initElements();
    this.bindEvents();
    this.checkSessionState();
  }

  initElements() {
    this.screenJoin = document.getElementById('screenJoin');
    this.screenLobby = document.getElementById('screenLobby');
    this.screenBattle = document.getElementById('screenBattle');
    this.screenReveal = document.getElementById('screenReveal');
    this.screenFinished = document.getElementById('screenFinished');

    this.inputNickname = document.getElementById('inputNickname');
    this.headerNicknamePill = document.getElementById('headerNicknamePill');
    this.btnHeaderLogout = document.getElementById('btnHeaderLogout');
    this.lobbyNickDisplay = document.getElementById('lobbyNickDisplay');

    this.battleRoundNumber = document.getElementById('battleRoundNumber');
    this.battleRoundTitle = document.getElementById('battleRoundTitle');
    this.textOptionA = document.getElementById('textOptionA');
    this.textOptionB = document.getElementById('textOptionB');
    this.btnVoteA = document.getElementById('btnVoteA');
    this.btnVoteB = document.getElementById('btnVoteB');

    this.votingButtonsContainer = document.getElementById('votingButtonsContainer');
    this.voteConfirmedBadge = document.getElementById('voteConfirmedBadge');
    this.voteResponseTimeText = document.getElementById('voteResponseTimeText');
    this.revealMyChoiceInfo = document.getElementById('revealMyChoiceInfo');
  }

  bindEvents() {
    // Tratamento de perda de foco / visibilidade para economia de bateria
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.participantId) {
        this.fetchState();
      }
    });
  }

  checkSessionState() {
    if (this.participantId && this.nickname) {
      this.updateHeaderUserInfo();
      this.startPolling();
      this.startHeartbeat();
      this.fetchState();
    } else {
      this.showScreen('join');
    }
  }

  updateHeaderUserInfo() {
    this.headerNicknamePill.textContent = `👤 ${this.nickname}`;
    this.headerNicknamePill.classList.remove('hidden');
    this.btnHeaderLogout.classList.remove('hidden');
    this.lobbyNickDisplay.textContent = this.nickname;
  }

  async handleJoin(e) {
    e.preventDefault();
    const nickname = this.inputNickname.value.trim();
    if (!nickname) return;

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });

      if (!res.ok) throw new Error('Falha ao conectar');

      const data = await res.json();
      this.participantId = data.participantId;
      this.nickname = data.nickname;

      localStorage.setItem('tbr_participant_id', this.participantId);
      localStorage.setItem('tbr_nickname', this.nickname);

      this.updateHeaderUserInfo();
      this.startPolling();
      this.startHeartbeat();
      this.fetchState();
    } catch (err) {
      alert('Erro ao conectar: ' + err.message);
    }
  }

  startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.fetchState(), 1200);
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    const sendBeat = () => {
      if (this.participantId) {
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: this.participantId })
        }).catch(() => {});
      }
    };
    sendBeat();
    this.heartbeatInterval = setInterval(sendBeat, 15000);
  }

  async fetchState() {
    if (!this.participantId) return;

    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const state = await res.json();
      this.handleStateUpdate(state);
    } catch (err) {
      // Falha de rede temporária ignorada silenciosamente
    }
  }

  handleStateUpdate(state) {
    // Auto-Logout ao Reiniciar Jogo:
    if (!this.currentSessionId) {
      this.currentSessionId = state.sessionId;
      localStorage.setItem('tbr_session_id', this.currentSessionId);
    } else if (this.currentSessionId !== state.sessionId) {
      // O apresentador resetou a partida
      this.logout(true);
      return;
    }

    // Regra: Durante ACTIVE, ocultar botão de sair para evitar toque acidental
    if (state.status === 'ACTIVE') {
      this.btnHeaderLogout.classList.add('hidden');
    } else {
      this.btnHeaderLogout.classList.remove('hidden');
    }

    // Roteamento de telas conforme status do backend
    switch (state.status) {
      case 'LOBBY':
        this.showScreen('lobby');
        break;

      case 'ACTIVE':
        this.renderActiveBattle(state);
        break;

      case 'REVEAL':
        this.renderReveal(state);
        break;

      case 'FINISHED':
        this.showScreen('finished');
        break;
    }
  }

  renderActiveBattle(state) {
    const round = state.currentRound;
    if (!round) return;

    // Se mudou de rodada, reseta medição de tempo
    if (this.currentRoundId !== round.id) {
      this.currentRoundId = round.id;
      this.roundStartTime = performance.now();
      this.isVotingInProgress = false;
    }

    this.battleRoundNumber.textContent = `Rodada ${round.id} de ${state.totalRounds}`;
    this.battleRoundTitle.textContent = `${round.title}`;
    this.textOptionA.textContent = round.optionA;
    this.textOptionB.textContent = round.optionB;

    const hasVoted = this.votedRounds.has(round.id);

    if (hasVoted) {
      // Já votou nesta rodada
      this.btnVoteA.disabled = true;
      this.btnVoteB.disabled = true;
      this.votingButtonsContainer.classList.add('hidden');
      this.voteConfirmedBadge.classList.remove('hidden');
    } else {
      // Liberado para votar em 1 toque
      this.btnVoteA.disabled = false;
      this.btnVoteB.disabled = false;
      this.votingButtonsContainer.classList.remove('hidden');
      this.voteConfirmedBadge.classList.add('hidden');
    }

    this.showScreen('battle');
  }

  async castVote(choice) {
    if (this.isVotingInProgress || !this.currentRoundId) return;

    // Trava de voto imediata no cliente
    this.isVotingInProgress = true;
    this.btnVoteA.disabled = true;
    this.btnVoteB.disabled = true;

    // Haptic feedback (vibração de 40ms)
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }

    // Medição em milissegundos
    const elapsed = Math.round(performance.now() - (this.roundStartTime || performance.now()));
    const responseTimeMs = Math.max(15, elapsed);

    // Feedback visual instantâneo
    this.votingButtonsContainer.classList.add('hidden');
    this.voteResponseTimeText.textContent = `⚡ Resposta em ${responseTimeMs}ms!`;
    this.voteConfirmedBadge.classList.remove('hidden');

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: this.participantId,
          nickname: this.nickname,
          roundId: this.currentRoundId,
          choice,
          responseTimeMs
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao registrar voto');
      }

      // Salva rodada votada
      this.votedRounds.add(this.currentRoundId);
      localStorage.setItem('tbr_voted_rounds', JSON.stringify(Array.from(this.votedRounds)));
      localStorage.setItem(`tbr_choice_${this.currentRoundId}`, choice);
    } catch (err) {
      // Se já tinha votado, mantém bloqueado
      this.votedRounds.add(this.currentRoundId);
      localStorage.setItem('tbr_voted_rounds', JSON.stringify(Array.from(this.votedRounds)));
    } finally {
      this.isVotingInProgress = false;
    }
  }

  renderReveal(state) {
    if (this.currentRoundId) {
      const myChoice = localStorage.getItem(`tbr_choice_${this.currentRoundId}`);
      if (myChoice) {
        this.revealMyChoiceInfo.textContent = `Você votou na Opção ${myChoice}`;
      } else {
        this.revealMyChoiceInfo.textContent = `Você não votou nesta rodada`;
      }
    }
    this.showScreen('reveal');
  }

  showScreen(screenName) {
    const screens = {
      join: this.screenJoin,
      lobby: this.screenLobby,
      battle: this.screenBattle,
      reveal: this.screenReveal,
      finished: this.screenFinished
    };

    Object.keys(screens).forEach(key => {
      if (key === screenName) {
        screens[key].classList.remove('hidden');
      } else {
        screens[key].classList.add('hidden');
      }
    });
  }

  logout(isAutoLogout = false) {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    localStorage.removeItem('tbr_participant_id');
    localStorage.removeItem('tbr_nickname');
    localStorage.removeItem('tbr_session_id');
    localStorage.removeItem('tbr_voted_rounds');

    this.participantId = null;
    this.nickname = null;
    this.currentSessionId = null;
    this.votedRounds = new Set();

    this.headerNicknamePill.classList.add('hidden');
    this.btnHeaderLogout.classList.add('hidden');
    this.showScreen('join');

    if (isAutoLogout) {
      alert('O apresentador reiniciou a partida! Por favor, entre novamente.');
    }
  }
}

// Inicializa a aplicação mobile
const participantApp = new ParticipantApp();

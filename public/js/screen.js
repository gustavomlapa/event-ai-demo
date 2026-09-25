/**
 * Tech Battle Royale — Lógica do Telão Principal (Stage Screen)
 */
class StageScreen {
  constructor() {
    this.pollInterval = null;
    this.timerInterval = null;
    this.currentStatus = null;
    this.currentRoundId = null;
    this.lastRevealedRoundId = null;
    this.hasTriggeredConfetti = false;

    this.initElements();
    this.loadQrCode();
    this.startPolling();
  }

  initElements() {
    this.stageLobby = document.getElementById('stageLobby');
    this.stageBattle = document.getElementById('stageBattle');
    this.stageFinished = document.getElementById('stageFinished');

    this.screenLiveCounter = document.getElementById('screenLiveCounter');
    this.onlineCountText = document.getElementById('onlineCountText');
    this.screenRoundBadge = document.getElementById('screenRoundBadge');
    this.lobbyConnectedNum = document.getElementById('lobbyConnectedNum');

    this.qrCodeImage = document.getElementById('qrCodeImage');
    this.qrCodeUrlText = document.getElementById('qrCodeUrlText');

    this.stageRoundCategory = document.getElementById('stageRoundCategory');
    this.stageRoundTitle = document.getElementById('stageRoundTitle');
    this.stageRoundContext = document.getElementById('stageRoundContext');
    this.stageTimerBox = document.getElementById('stageTimerBox');
    this.stageTimerSeconds = document.getElementById('stageTimerSeconds');

    this.stageCardA = document.getElementById('stageCardA');
    this.stageCardB = document.getElementById('stageCardB');
    this.stageWinnerCrownA = document.getElementById('stageWinnerCrownA');
    this.stageWinnerCrownB = document.getElementById('stageWinnerCrownB');

    this.stageOptionAName = document.getElementById('stageOptionAName');
    this.stageOptionAPercent = document.getElementById('stageOptionAPercent');
    this.stageOptionAVotes = document.getElementById('stageOptionAVotes');

    this.stageOptionBName = document.getElementById('stageOptionBName');
    this.stageOptionBPercent = document.getElementById('stageOptionBPercent');
    this.stageOptionBVotes = document.getElementById('stageOptionBVotes');

    this.tugBarA = document.getElementById('tugBarA');
    this.tugBarB = document.getElementById('tugBarB');

    // Troféus
    this.trophyFlashWinner = document.getElementById('trophyFlashWinner');
    this.trophyFlashDesc = document.getElementById('trophyFlashDesc');
    this.trophyPhilWinner = document.getElementById('trophyPhilWinner');
    this.trophyPhilDesc = document.getElementById('trophyPhilDesc');
    this.trophyWolfWinner = document.getElementById('trophyWolfWinner');
    this.trophyWolfDesc = document.getElementById('trophyWolfDesc');
    this.trophyVoiceWinner = document.getElementById('trophyVoiceWinner');
    this.trophyVoiceDesc = document.getElementById('trophyVoiceDesc');
    this.stageStackList = document.getElementById('stageStackList');
  }

  async loadQrCode() {
    try {
      const currentHost = window.location.origin;
      const res = await fetch(`/api/qr?url=${encodeURIComponent(currentHost)}`);
      if (res.ok) {
        const data = await res.json();
        this.qrCodeImage.src = data.qrDataUrl;
        this.qrCodeUrlText.textContent = currentHost;
      }
    } catch (err) {
      this.qrCodeUrlText.textContent = window.location.origin;
    }
  }

  startPolling() {
    this.fetchState();
    this.pollInterval = setInterval(() => this.fetchState(), 1000);
  }

  async fetchState() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const state = await res.json();
      this.renderState(state);
    } catch (err) {
      // Ignora erro temporário
    }
  }

  renderState(state) {
    // 1. Atualiza contadores de conexão
    const devsCount = state.connectedCount || 0;
    this.onlineCountText.textContent = devsCount;
    this.lobbyConnectedNum.textContent = devsCount;

    // 2. Transições de layout por status
    if (this.currentStatus !== state.status) {
      this.currentStatus = state.status;
      this.updateScreenMode(state.status, state);
    }

    if (state.status === 'LOBBY') {
      this.screenRoundBadge.textContent = state.currentRound 
        ? `Aguardando Início: Rodada ${state.currentRound.id}` 
        : 'Lobby Aberto';
    } else if (state.status === 'ACTIVE') {
      this.screenRoundBadge.textContent = `Rodada ${state.currentRound.id} de ${state.totalRounds} (Votação Aberta)`;
      this.renderBattle(state);
    } else if (state.status === 'REVEAL') {
      this.screenRoundBadge.textContent = `Rodada ${state.currentRound.id} de ${state.totalRounds} (Resultado Final)`;
      this.renderBattle(state);
    } else if (state.status === 'FINISHED') {
      this.screenRoundBadge.textContent = 'Oscar dos Devs';
      this.renderFinishedCeremony();
    }
  }

  updateScreenMode(status, state) {
    if (status === 'FINISHED') {
      this.stageLobby.classList.add('hidden');
      this.stageBattle.classList.add('hidden');
      this.stageFinished.classList.remove('hidden');
    } else if (status === 'ACTIVE' || status === 'REVEAL') {
      // Mantém a tela da rodada e cabo de guerra visíveis durante a votação e resultado final
      this.stageLobby.classList.add('hidden');
      this.stageBattle.classList.remove('hidden');
      this.stageFinished.classList.add('hidden');
    } else if (status === 'LOBBY') {
      // Só volta ao Lobby quando o admin clicar em "Próxima Rodada" ou no início
      this.stageLobby.classList.remove('hidden');
      this.stageBattle.classList.add('hidden');
      this.stageFinished.classList.add('hidden');
    }
  }

  renderBattle(state) {
    const round = state.currentRound;
    if (!round) return;

    this.currentRoundId = round.id;
    this.stageRoundTitle.textContent = `${round.optionA} vs ${round.optionB}`;
    this.stageRoundCategory.textContent = round.title;
    this.stageRoundContext.textContent = round.context || '';

    this.stageOptionAName.textContent = round.optionA;
    this.stageOptionBName.textContent = round.optionB;

    // Regra Estrita de Porcentagem (Prevenção ao Bug Falsy de JS)
    // NUNCA usar 'percentA || 50'! Usar nullish check estrito:
    const totalVotes = Number(state.totalVotes || 0);
    const countA = Number(state.countA || 0);
    const countB = Number(state.countB || 0);

    const percentA = state.percentA !== undefined ? Number(state.percentA) : 0;
    const percentB = state.percentB !== undefined ? Number(state.percentB) : 0;

    this.stageOptionAVotes.textContent = `${countA} ${countA === 1 ? 'voto' : 'votos'}`;
    this.stageOptionBVotes.textContent = `${countB} ${countB === 1 ? 'voto' : 'votos'}`;

    if (totalVotes === 0) {
      // Com 0 votos: exibe 0% para ambos e mantém a barra no centro neutro (50% / 50%)
      this.stageOptionAPercent.textContent = '0%';
      this.stageOptionBPercent.textContent = '0%';
      this.tugBarA.style.width = '50%';
      this.tugBarB.style.width = '50%';
    } else {
      // Com votos: atualiza estritamente as porcentagens reais
      this.stageOptionAPercent.textContent = `${percentA}%`;
      this.stageOptionBPercent.textContent = `${percentB}%`;
      this.tugBarA.style.width = `${percentA}%`;
      this.tugBarB.style.width = `${percentB}%`;
    }

    // Gerenciamento do Timer de 30s & Efeitos Visuais
    if (state.status === 'ACTIVE') {
      // Limpa destaques da rodada anterior
      this.stageCardA.classList.remove('stage-card-winner', 'stage-card-loser');
      this.stageCardB.classList.remove('stage-card-winner', 'stage-card-loser');
      this.stageWinnerCrownA.classList.add('hidden');
      this.stageWinnerCrownB.classList.add('hidden');

      const now = Date.now();
      const startTime = state.roundStartTime || now;
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remainingSeconds = Math.max(0, 30 - elapsedSeconds);
      this.savedPausedSeconds = remainingSeconds;

      if (remainingSeconds > 0) {
        this.stageTimerSeconds.textContent = `${remainingSeconds}s`;
        if (remainingSeconds <= 5) {
          // Timer Urgente: Pulso crítico em vermelho néon
          this.stageTimerBox.classList.add('timer-urgent');
          this.stageTimerSeconds.style.color = '#ff9999';
        } else {
          this.stageTimerBox.classList.remove('timer-urgent');
          this.stageTimerSeconds.style.color = '#fff';
        }
      } else {
        // Ao terminar o timer não faz nada e espera a votação ser fechada pelo admin
        this.stageTimerBox.classList.remove('timer-urgent');
        this.stageTimerSeconds.textContent = '0s (Aguardando Encerramento)';
        this.stageTimerSeconds.style.color = '#ef4444';
      }
    } else if (state.status === 'REVEAL') {
      // Se for fechada antes (ou ao fechar), para o timer imediatamente
      this.stageTimerBox.classList.remove('timer-urgent');
      const pausedSec = this.savedPausedSeconds !== undefined ? this.savedPausedSeconds : 0;
      this.stageTimerSeconds.textContent = `Votação Fechada (Pausado em ${pausedSec}s)`;
      this.stageTimerSeconds.style.color = '#34A853';

      const isFirstReveal = this.lastRevealedRoundId !== round.id;
      if (isFirstReveal) {
        this.lastRevealedRoundId = round.id;
      }

      // Destaque cênico da opção vencedora e canhão lateral de confetes
      if (percentA > percentB) {
        this.stageOptionAPercent.textContent = `👑 ${percentA}%`;
        this.stageCardA.classList.add('stage-card-winner');
        this.stageCardA.classList.remove('stage-card-loser');
        this.stageWinnerCrownA.classList.remove('hidden');

        this.stageCardB.classList.add('stage-card-loser');
        this.stageCardB.classList.remove('stage-card-winner');
        this.stageWinnerCrownB.classList.add('hidden');

        // Canhão direcional disparando da esquerda em Google Blue
        if (isFirstReveal && window.confetti) {
          window.confetti({
            particleCount: 100,
            angle: 60,
            spread: 70,
            origin: { x: 0.15, y: 0.65 },
            colors: ['#4285F4', '#8ab4f8', '#ffffff', '#FBBC04']
          });
        }
      } else if (percentB > percentA) {
        this.stageOptionBPercent.textContent = `👑 ${percentB}%`;
        this.stageCardB.classList.add('stage-card-winner');
        this.stageCardB.classList.remove('stage-card-loser');
        this.stageWinnerCrownB.classList.remove('hidden');

        this.stageCardA.classList.add('stage-card-loser');
        this.stageCardA.classList.remove('stage-card-winner');
        this.stageWinnerCrownA.classList.add('hidden');

        // Canhão direcional disparando da direita em Google Red
        if (isFirstReveal && window.confetti) {
          window.confetti({
            particleCount: 100,
            angle: 120,
            spread: 70,
            origin: { x: 0.85, y: 0.65 },
            colors: ['#EA4335', '#f28b82', '#ffffff', '#FBBC04']
          });
        }
      } else if (totalVotes > 0) {
        this.stageOptionAPercent.textContent = `🤝 ${percentA}%`;
        this.stageOptionBPercent.textContent = `🤝 ${percentB}%`;
        this.stageCardA.classList.remove('stage-card-winner', 'stage-card-loser');
        this.stageCardB.classList.remove('stage-card-winner', 'stage-card-loser');
        this.stageWinnerCrownA.classList.add('hidden');
        this.stageWinnerCrownB.classList.add('hidden');
      }
    }
  }

  async renderFinishedCeremony() {
    if (this.hasTriggeredConfetti) return;
    this.hasTriggeredConfetti = true;

    // Grande Salva de Confetes em Cascata (Efeito Fogos de Artifício nas 4 Cores do Google)
    if (window.confetti) {
      const duration = 4.5 * 1000;
      const animationEnd = Date.now() + duration;
      const googleColors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];

      const frame = () => {
        window.confetti({
          particleCount: 6,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: googleColors
        });
        window.confetti({
          particleCount: 6,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: googleColors
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Explosão central
      window.confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
        colors: googleColors
      });
    }

    try {
      const res = await fetch('/api/trophies');
      if (!res.ok) return;
      const data = await res.json();

      // Troféus
      if (data.theFlash) {
        this.trophyFlashWinner.textContent = `${data.theFlash.nickname} (${data.theFlash.avgTimeMs}ms)`;
      }
      if (data.thePhilosopher) {
        this.trophyPhilWinner.textContent = `${data.thePhilosopher.nickname} (${data.thePhilosopher.avgTimeMs}ms)`;
      }
      if (data.loneWolf) {
        this.trophyWolfWinner.textContent = `${data.loneWolf.nickname} (${data.loneWolf.minorityVotes} votos)`;
      }
      if (data.voiceOfThePeople) {
        this.trophyVoiceWinner.textContent = `${data.voiceOfThePeople.nickname} (${data.voiceOfThePeople.majorityVotes} votos)`;
      }

      // Stack oficial
      if (data.stackOfAuditorium && Array.isArray(data.stackOfAuditorium)) {
        this.stageStackList.innerHTML = '';
        data.stackOfAuditorium.forEach(item => {
          const div = document.createElement('div');
          div.className = 'stack-item';
          div.innerHTML = `<strong>R${item.roundId}:</strong> ${item.winner} <span style="color: #38bdf8;">(${item.percentage}%)</span>`;
          this.stageStackList.appendChild(div);
        });
      }
    } catch (err) {
      // Ignora erro
    }
  }
}

// Inicializa o Telão
const stageScreen = new StageScreen();

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

    // Física e Animação Fluida do Cabo de Guerra
    this.currentPercentA = 50;
    this.targetPercentA = 50;
    this.lastCountA = 0;
    this.lastCountB = 0;
    this.momentumTimeout = null;
    this.isConcluded = false;

    this.initElements();
    this.loadQrCode();
    this.startAnimationLoop();
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

    // Cabo de Guerra Vivo & Efeitos Cênicos
    this.tugBarTrack = document.getElementById('tugBarTrack');
    this.tugBarA = document.getElementById('tugBarA');
    this.tugBarB = document.getElementById('tugBarB');
    this.tugClashMarker = document.getElementById('tugClashMarker');
    this.tugShockwave = document.getElementById('tugShockwave');

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

  /**
   * Loop de Física Contínua (Lerp com Inércia via requestAnimationFrame)
   * Garante que mesmo com dezenas de votos por segundo, a barra deslize suavemente
   */
  startAnimationLoop() {
    const updatePhysics = () => {
      if (this.currentStatus === 'ACTIVE' || this.currentStatus === 'REVEAL') {
        const diff = this.targetPercentA - this.currentPercentA;
        if (Math.abs(diff) > 0.04) {
          // Deslocamento suave e contínuo com sensação orgânica (lerp 0.10)
          this.currentPercentA += diff * 0.10;
          this.applyBarPositions(this.currentPercentA);
        } else if (this.currentPercentA !== this.targetPercentA) {
          this.currentPercentA = this.targetPercentA;
          this.applyBarPositions(this.currentPercentA);
        }
      }
      requestAnimationFrame(updatePhysics);
    };
    requestAnimationFrame(updatePhysics);
  }

  applyBarPositions(percentA) {
    const clampedA = Math.max(0, Math.min(100, percentA));
    const clampedB = 100 - clampedA;

    if (this.tugBarA) this.tugBarA.style.width = `${clampedA.toFixed(2)}%`;
    if (this.tugBarB) this.tugBarB.style.width = `${clampedB.toFixed(2)}%`;
    if (this.tugClashMarker) this.tugClashMarker.style.left = `${clampedA.toFixed(2)}%`;
  }

  /**
   * Dispara o feedback dinâmico de ímpeto (Momentum) acelerando o fluxo luminoso da opção em ascensão
   */
  triggerMomentum(className) {
    if (!this.tugBarTrack) return;
    this.tugBarTrack.classList.remove('pushing-a', 'pushing-b');
    this.tugBarTrack.classList.add(className);

    clearTimeout(this.momentumTimeout);
    this.momentumTimeout = setTimeout(() => {
      if (this.tugBarTrack) {
        this.tugBarTrack.classList.remove('pushing-a', 'pushing-b');
      }
    }, 1200);
  }

  /**
   * Animação de contagem suave para os percentuais na conclusão
   */
  animateNumberCounter(element, targetVal, prefix = '', suffix = '%', duration = 650) {
    const startVal = parseInt(element.textContent.replace(/\D/g, ''), 10) || 0;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * eased);
      element.textContent = `${prefix}${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${targetVal}${suffix}`;
      }
    };
    requestAnimationFrame(step);
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

    if (this.currentRoundId !== round.id) {
      this.currentRoundId = round.id;
      this.lastRevealedRoundId = null;
      this.isConcluded = false;
      this.currentPercentA = 50;
      this.targetPercentA = 50;
      this.lastCountA = 0;
      this.lastCountB = 0;
      this.applyBarPositions(50);
      if (this.tugBarTrack) {
        this.tugBarTrack.classList.remove('tug-concluded', 'winner-a', 'winner-b', 'pushing-a', 'pushing-b');
      }
      if (this.tugShockwave) {
        this.tugShockwave.classList.remove('active');
      }
    }

    this.stageRoundTitle.textContent = `${round.optionA} vs ${round.optionB}`;
    this.stageRoundCategory.textContent = round.title;
    this.stageRoundContext.textContent = round.context || '';

    this.stageOptionAName.textContent = round.optionA;
    this.stageOptionBName.textContent = round.optionB;

    // Regra Estrita de Porcentagem (Prevenção ao Bug Falsy de JS)
    const totalVotes = Number(state.totalVotes || 0);
    const countA = Number(state.countA || 0);
    const countB = Number(state.countB || 0);

    const percentA = state.percentA !== undefined ? Number(state.percentA) : 0;
    const percentB = state.percentB !== undefined ? Number(state.percentB) : 0;

    this.stageOptionAVotes.textContent = `${countA} ${countA === 1 ? 'voto' : 'votos'}`;
    this.stageOptionBVotes.textContent = `${countB} ${countB === 1 ? 'voto' : 'votos'}`;

    // Gerenciamento do Cabo de Guerra, Timer de 30s & Efeitos Visuais
    if (state.status === 'ACTIVE') {
      // Limpa destaques e estados de conclusão
      this.stageCardA.classList.remove('stage-card-winner', 'stage-card-loser');
      this.stageCardB.classList.remove('stage-card-winner', 'stage-card-loser');
      this.stageWinnerCrownA.classList.add('hidden');
      this.stageWinnerCrownB.classList.add('hidden');

      if (this.tugBarTrack) {
        this.tugBarTrack.classList.remove('tug-concluded', 'winner-a', 'winner-b');
      }
      if (this.tugShockwave) {
        this.tugShockwave.classList.remove('active');
      }

      if (totalVotes === 0) {
        // Com 0 votos: exibe 0% e mantém o alvo físico no centro (50%)
        this.targetPercentA = 50;
        this.stageOptionAPercent.textContent = '0%';
        this.stageOptionBPercent.textContent = '0%';
      } else {
        // Atualiza o alvo de interpolação física contínua
        this.targetPercentA = percentA;
        this.stageOptionAPercent.textContent = `${percentA}%`;
        this.stageOptionBPercent.textContent = `${percentB}%`;

        // Detecção de Ímpeto Dinâmico (Momentum ao vivo)
        const deltaA = countA - this.lastCountA;
        const deltaB = countB - this.lastCountB;

        if (deltaA > deltaB && deltaA > 0) {
          this.triggerMomentum('pushing-a');
        } else if (deltaB > deltaA && deltaB > 0) {
          this.triggerMomentum('pushing-b');
        }
      }

      this.lastCountA = countA;
      this.lastCountB = countB;

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

      // Trava alvo da física na posição definitiva
      this.targetPercentA = totalVotes === 0 ? 50 : percentA;

      const isFirstReveal = this.lastRevealedRoundId !== round.id;
      if (isFirstReveal) {
        this.lastRevealedRoundId = round.id;

        // Conclusão Cênica da Barra: Disparo de Onda de Choque Luminosa
        if (this.tugBarTrack) {
          this.tugBarTrack.classList.remove('pushing-a', 'pushing-b');
          this.tugBarTrack.classList.add('tug-concluded');
        }

        if (this.tugShockwave) {
          this.tugShockwave.classList.remove('active');
          void this.tugShockwave.offsetWidth; // Trigger reflow para reiniciar animação
          this.tugShockwave.classList.add('active');
        }

        // Rolagem de contagem suave dos percentuais finais
        this.animateNumberCounter(this.stageOptionAPercent, percentA, percentA > percentB ? '👑 ' : (totalVotes > 0 && percentA === percentB ? '🤝 ' : ''));
        this.animateNumberCounter(this.stageOptionBPercent, percentB, percentB > percentA ? '👑 ' : (totalVotes > 0 && percentA === percentB ? '🤝 ' : ''));
      }

      // Destaque cênico da opção vencedora e canhão lateral de confetes
      if (percentA > percentB) {
        if (!isFirstReveal) this.stageOptionAPercent.textContent = `👑 ${percentA}%`;
        this.stageCardA.classList.add('stage-card-winner');
        this.stageCardA.classList.remove('stage-card-loser');
        this.stageWinnerCrownA.classList.remove('hidden');

        this.stageCardB.classList.add('stage-card-loser');
        this.stageCardB.classList.remove('stage-card-winner');
        this.stageWinnerCrownB.classList.add('hidden');

        if (this.tugBarTrack) {
          this.tugBarTrack.classList.add('winner-a');
          this.tugBarTrack.classList.remove('winner-b');
        }

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
        if (!isFirstReveal) this.stageOptionBPercent.textContent = `👑 ${percentB}%`;
        this.stageCardB.classList.add('stage-card-winner');
        this.stageCardB.classList.remove('stage-card-loser');
        this.stageWinnerCrownB.classList.remove('hidden');

        this.stageCardA.classList.add('stage-card-loser');
        this.stageCardA.classList.remove('stage-card-winner');
        this.stageWinnerCrownA.classList.add('hidden');

        if (this.tugBarTrack) {
          this.tugBarTrack.classList.add('winner-b');
          this.tugBarTrack.classList.remove('winner-a');
        }

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
        if (!isFirstReveal) {
          this.stageOptionAPercent.textContent = `🤝 ${percentA}%`;
          this.stageOptionBPercent.textContent = `🤝 ${percentB}%`;
        }
        this.stageCardA.classList.remove('stage-card-winner', 'stage-card-loser');
        this.stageCardB.classList.remove('stage-card-winner', 'stage-card-loser');
        this.stageWinnerCrownA.classList.add('hidden');
        this.stageWinnerCrownB.classList.add('hidden');
        if (this.tugBarTrack) {
          this.tugBarTrack.classList.remove('winner-a', 'winner-b');
        }
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

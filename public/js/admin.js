/**
 * Tech Battle Royale — Lógica do Painel de Admin
 */
class AdminApp {
  constructor() {
    this.pollInterval = null;
    this.currentState = null;

    this.initElements();
    this.startPolling();
  }

  initElements() {
    this.adminDevsCount = document.getElementById('adminDevsCount');
    this.adminStatusBadge = document.getElementById('adminStatusBadge');
    this.adminRoundTitle = document.getElementById('adminRoundTitle');
    this.adminCountA = document.getElementById('adminCountA');
    this.adminCountB = document.getElementById('adminCountB');
    this.adminTotalVotes = document.getElementById('adminTotalVotes');

    this.btnStartRound = document.getElementById('btnStartRound');
    this.btnCloseRound = document.getElementById('btnCloseRound');
    this.btnNextRound = document.getElementById('btnNextRound');
    this.btnTrophies = document.getElementById('btnTrophies');
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
      this.currentState = state;
      this.renderState(state);
    } catch (err) {
      // Ignora erro temporário de polling
    }
  }

  renderState(state) {
    this.adminDevsCount.textContent = `🔥 ${state.connectedCount || 0} Devs Conectados`;
    this.adminStatusBadge.textContent = state.status;

    const round = state.currentRound;
    if (round) {
      this.adminRoundTitle.textContent = `[R${round.id}/${state.totalRounds}] ${round.optionA} vs ${round.optionB}`;
    } else {
      this.adminRoundTitle.textContent = 'Nenhuma rodada ativa';
    }

    const countA = state.countA || 0;
    const countB = state.countB || 0;
    const percentA = state.percentA !== undefined ? Number(state.percentA) : 0;
    const percentB = state.percentB !== undefined ? Number(state.percentB) : 0;

    this.adminCountA.textContent = `${countA} (${percentA}%)`;
    this.adminCountB.textContent = `${countB} (${percentB}%)`;
    this.adminTotalVotes.textContent = state.totalVotes || 0;

    // Gerenciamento de botões de controle
    switch (state.status) {
      case 'LOBBY':
        this.btnStartRound.disabled = false;
        this.btnCloseRound.disabled = true;
        this.btnNextRound.disabled = true;
        this.adminStatusBadge.style.color = '#60a5fa';
        break;

      case 'ACTIVE':
        this.btnStartRound.disabled = true;
        this.btnCloseRound.disabled = false;
        this.btnNextRound.disabled = true;
        this.adminStatusBadge.style.color = '#34d399';
        break;

      case 'REVEAL':
        this.btnStartRound.disabled = true;
        this.btnCloseRound.disabled = true;
        this.btnNextRound.disabled = false;
        this.adminStatusBadge.style.color = '#fbbf24';
        break;

      case 'FINISHED':
        this.btnStartRound.disabled = true;
        this.btnCloseRound.disabled = true;
        this.btnNextRound.disabled = true;
        this.adminStatusBadge.style.color = '#a855f7';
        break;
    }
  }

  async startRound() {
    this.btnStartRound.disabled = true;
    try {
      await fetch('/api/admin/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      this.fetchState();
    } catch (err) {
      alert('Erro ao iniciar rodada: ' + err.message);
    }
  }

  async closeRound() {
    this.btnCloseRound.disabled = true;
    try {
      await fetch('/api/admin/close-round', { method: 'POST' });
      this.fetchState();
    } catch (err) {
      alert('Erro ao fechar rodada: ' + err.message);
    }
  }

  async nextRound() {
    this.btnNextRound.disabled = true;
    try {
      await fetch('/api/admin/next-round', { method: 'POST' });
      this.fetchState();
    } catch (err) {
      alert('Erro ao avançar rodada: ' + err.message);
    }
  }

  async revealTrophies() {
    if (!confirm('Deseja encerrar as batalhas e exibir os Troféus no Telão?')) return;
    try {
      // Avança direto para status FINISHED
      await fetch('/api/admin/close-round', { method: 'POST' });
      for (let i = 0; i < 11; i++) {
        await fetch('/api/admin/next-round', { method: 'POST' });
      }
      this.fetchState();
    } catch (err) {
      alert('Erro ao revelar troféus: ' + err.message);
    }
  }

  async resetGame() {
    if (!confirm('ATENÇÃO: Deseja resetar a partida inteira? Todos os participantes serão desconectados e os votos zerados.')) {
      return;
    }

    try {
      await fetch('/api/admin/reset', { method: 'POST' });
      alert('Jogo reiniciado com sucesso! Novo SessionId gerado.');
      this.fetchState();
    } catch (err) {
      alert('Erro ao resetar jogo: ' + err.message);
    }
  }
}

// Inicializa o Painel Admin
const adminApp = new AdminApp();

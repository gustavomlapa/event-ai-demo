/**
 * Tech Battle Royale — Lógica do Painel de Admin
 */
class AdminApp {
  constructor() {
    this.pollInterval = null;
    this.currentState = null;
    this.adminPassword = sessionStorage.getItem('tech_battle_admin_pass') || '';

    this.initElements();
    this.checkAuth();
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

    // Elementos de Login
    this.adminLoginModal = document.getElementById('adminLoginModal');
    this.adminLoginForm = document.getElementById('adminLoginForm');
    this.adminPasswordInput = document.getElementById('adminPasswordInput');
    this.adminLoginError = document.getElementById('adminLoginError');
  }

  async checkAuth() {
    if (!this.adminPassword) {
      this.showLoginModal();
      return;
    }

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: this.adminPassword })
      });

      if (res.ok) {
        this.hideLoginModal();
      } else {
        this.logout();
      }
    } catch (err) {
      this.showLoginModal();
    }
  }

  showLoginModal() {
    this.adminLoginModal.classList.remove('hidden');
    if (this.adminPasswordInput) {
      setTimeout(() => this.adminPasswordInput.focus(), 100);
    }
  }

  hideLoginModal() {
    this.adminLoginModal.classList.add('hidden');
    if (this.adminLoginError) {
      this.adminLoginError.style.display = 'none';
      this.adminLoginError.textContent = '';
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const pass = (this.adminPasswordInput.value || '').trim();
    if (!pass) return;

    this.adminLoginError.style.display = 'none';

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });

      if (res.ok) {
        this.adminPassword = pass;
        sessionStorage.setItem('tech_battle_admin_pass', pass);
        this.hideLoginModal();
        this.fetchState();
      } else {
        this.adminLoginError.textContent = 'Senha incorreta! Tente novamente.';
        this.adminLoginError.style.display = 'block';
      }
    } catch (err) {
      this.adminLoginError.textContent = 'Erro ao verificar senha: ' + err.message;
      this.adminLoginError.style.display = 'block';
    }
  }

  logout() {
    sessionStorage.removeItem('tech_battle_admin_pass');
    this.adminPassword = '';
    if (this.adminPasswordInput) {
      this.adminPasswordInput.value = '';
    }
    this.showLoginModal();
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
    this.adminDevsCount.innerHTML = `<span class="live-indicator"></span> ${state.connectedCount || 0} Devs Conectados`;
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

  async adminFetch(url, options = {}) {
    if (!this.adminPassword) {
      this.showLoginModal();
      throw new Error('Autenticação necessária');
    }

    const headers = {
      ...(options.headers || {}),
      'x-admin-password': this.adminPassword
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      this.logout();
      throw new Error('Sessão expirada ou senha incorreta.');
    }
    return res;
  }

  async startRound() {
    this.btnStartRound.disabled = true;
    try {
      await this.adminFetch('/api/admin/start-round', {
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
      await this.adminFetch('/api/admin/close-round', { method: 'POST' });
      this.fetchState();
    } catch (err) {
      alert('Erro ao fechar rodada: ' + err.message);
    }
  }

  async nextRound() {
    this.btnNextRound.disabled = true;
    try {
      await this.adminFetch('/api/admin/next-round', { method: 'POST' });
      this.fetchState();
    } catch (err) {
      alert('Erro ao avançar rodada: ' + err.message);
    }
  }

  async revealTrophies() {
    if (!confirm('Deseja encerrar as batalhas e exibir os Troféus no Telão?')) return;
    try {
      // Avança direto para status FINISHED
      await this.adminFetch('/api/admin/close-round', { method: 'POST' });
      for (let i = 0; i < 11; i++) {
        await this.adminFetch('/api/admin/next-round', { method: 'POST' });
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
      await this.adminFetch('/api/admin/reset', { method: 'POST' });
      alert('Jogo reiniciado com sucesso! Novo SessionId gerado.');
      this.fetchState();
    } catch (err) {
      alert('Erro ao resetar jogo: ' + err.message);
    }
  }
}

// Inicializa o Painel Admin
const adminApp = new AdminApp();

/**
 * Presenter Remote Control Logic
 */

(function () {
  let currentState = null;

  const adminDevsCount = document.getElementById('adminDevsCount');
  const adminStatusBadge = document.getElementById('adminStatusBadge');
  const adminRoundTitle = document.getElementById('adminRoundTitle');
  const adminRoundDetails = document.getElementById('adminRoundDetails');
  const adminVotesSection = document.getElementById('adminVotesSection');
  const adminCountA = document.getElementById('adminCountA');
  const adminCountB = document.getElementById('adminCountB');
  const adminTotalVotes = document.getElementById('adminTotalVotes');

  const btnAdminNext = document.getElementById('btnAdminNext');
  const btnAdminNextText = document.getElementById('btnAdminNextText');
  const btnAdminReset = document.getElementById('btnAdminReset');

  function updateButtonLabel(state) {
    if (state.status === 'LOBBY') {
      btnAdminNextText.textContent = 'Abrir Rodada 1 🚀';
      btnAdminNext.className = 'w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all cursor-pointer';
    } else if (state.status === 'ACTIVE') {
      btnAdminNextText.textContent = `Encerrar Votação & Revelar (Rodada ${state.roundIndex + 1}) ⏱️`;
      btnAdminNext.className = 'w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all cursor-pointer';
    } else if (state.status === 'REVEAL') {
      if (state.roundIndex + 1 < state.totalQuestions) {
        btnAdminNextText.textContent = `Iniciar Rodada ${state.roundIndex + 2} de ${state.totalQuestions} ➡️`;
        btnAdminNext.className = 'w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all cursor-pointer';
      } else {
        btnAdminNextText.textContent = 'Revelar Troféus Finais (Oscar dos Devs) 🏆';
        btnAdminNext.className = 'w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all cursor-pointer';
      }
    } else if (state.status === 'FINISHED') {
      btnAdminNextText.textContent = 'Duelo Finalizado 🎉 (Clique para Reiniciar)';
      btnAdminNext.className = 'w-full py-5 bg-slate-800 text-slate-400 font-bold text-lg rounded-2xl cursor-not-allowed';
    }
  }

  async function syncState() {
    try {
      const res = await fetch('/api/state');
      const state = await res.json();
      currentState = state;

      adminDevsCount.textContent = state.participantsCount || 0;
      adminStatusBadge.textContent = state.status;

      updateButtonLabel(state);

      if (state.status === 'LOBBY') {
        adminRoundTitle.textContent = 'Lobby de Entrada';
        adminRoundDetails.textContent = 'Aguardando participantes escanearem o QR code.';
        adminVotesSection.classList.add('hidden');
      } else if (state.status === 'ACTIVE' || state.status === 'REVEAL') {
        const q = state.currentQuestion;
        if (q) {
          adminRoundTitle.textContent = `Rodada ${state.roundIndex + 1}: ${q.title}`;
          adminRoundDetails.textContent = `A: ${q.optionA.text} | B: ${q.optionB.text}`;
        }
        adminVotesSection.classList.remove('hidden');

        // Fetch round votes
        const resultsRes = await fetch(`/api/results?round=${state.roundIndex}`);
        const rData = await resultsRes.json();
        adminCountA.textContent = rData.countA || 0;
        adminCountB.textContent = rData.countB || 0;
        adminTotalVotes.textContent = rData.totalVotes || 0;
      } else if (state.status === 'FINISHED') {
        adminRoundTitle.textContent = 'Cerimônia dos Troféus';
        adminRoundDetails.textContent = 'O pódio do Oscar dos Devs está sendo exibido no telão.';
        adminVotesSection.classList.add('hidden');
      }
    } catch (err) {
      console.warn('Erro na sincronização do admin:', err);
    }
  }

  btnAdminNext.addEventListener('click', async () => {
    if (currentState && currentState.status === 'FINISHED') {
      if (confirm('Deseja reiniciar a partida?')) {
        await fetch('/api/admin/reset', { method: 'POST' });
        syncState();
      }
      return;
    }

    try {
      btnAdminNext.disabled = true;
      await fetch('/api/admin/next', { method: 'POST' });
      await syncState();
    } finally {
      btnAdminNext.disabled = false;
    }
  });

  btnAdminReset.addEventListener('click', async () => {
    if (confirm('Tem certeza de que deseja reiniciar o jogo? Todos os votos serão zerados.')) {
      await fetch('/api/admin/reset', { method: 'POST' });
      syncState();
    }
  });

  syncState();
  setInterval(syncState, 1000);
})();

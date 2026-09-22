/**
 * Game Service: State Management, Predefined Questions & Voting Logic
 */

const QUESTIONS = [
  {
    id: 1,
    category: 'Arquitetura',
    title: 'Arquitetura de Sistemas',
    optionA: { id: 'A', text: 'Monolito Bem Feito 🏛️', description: 'Simples de debugar, testar e fazer deploy' },
    optionB: { id: 'B', text: 'Microsserviços Distribuídos 🧩', description: 'Escala independente e desacoplamento de times' },
  },
  {
    id: 2,
    category: 'Computação em Nuvem',
    title: 'Computação Serverless vs Orquestração',
    optionA: { id: 'A', text: 'Cluster Kubernetes ☸️', description: 'Controle total sobre rede, ingress e infraestrutura' },
    optionB: { id: 'B', text: 'Cloud Run (Serverless) 🚀', description: 'Zero infra pra gerenciar, escala a zero e foco no código' },
  },
  {
    id: 3,
    category: 'Banco de Dados',
    title: 'Modelagem de Dados',
    optionA: { id: 'A', text: 'SQL Relacional Estruturado 🗄️', description: 'Consistência ACID estrita, joins e integridade relacional' },
    optionB: { id: 'B', text: 'NoSQL / Documentos Ágeis ⚡', description: 'Esquema flexível, baixa latência e escala horizontal' },
  },
  {
    id: 4,
    category: 'Cultura & Deploy',
    title: 'Deploy em Produção',
    optionA: { id: 'A', text: 'Deploy Contínuo na Sexta 18h 💣', description: 'Se o pipeline e testes passaram, vai pra produção sem medo' },
    optionB: { id: 'B', text: 'Freeze de Código na Quinta 🧊', description: 'Prudência e fim de semana garantido sem incidentes' },
  },
  {
    id: 5,
    category: 'Engenharia de Software',
    title: 'Estratégia de Qualidade',
    optionA: { id: 'A', text: 'TDD Estrito (Teste Primeiro) 🧪', description: 'Design guiado por testes antes de escrever uma linha de código' },
    optionB: { id: 'B', text: 'Codar Rápido e Testar em Staging 🏃', description: 'Time-to-market agressivo e validação rápida' },
  },
  {
    id: 6,
    category: 'Segurança',
    title: 'Segurança e Acesso Corporativo',
    optionA: { id: 'A', text: 'VPN Corporativa + Bastion Host 🔒', description: 'Perímetro fechado tradicional e túnel criptografado' },
    optionB: { id: 'B', text: 'Zero Trust + Identity-Aware Proxy 🛡️', description: 'Autenticação por identidade sem túnel legado' },
  },
  {
    id: 7,
    category: 'Inteligência Artificial',
    title: 'Estratégia de Modelos de IA',
    optionA: { id: 'A', text: 'Modelos Especializados Pequenos (SLMs) 📱', description: 'Mais rápidos, baratos, privados e focados na tarefa' },
    optionB: { id: 'B', text: 'Modelos Gigantes de Fronteira (LLMs) 🧠', description: 'Máximo raciocínio, contexto longo e inteligência geral' },
  },
  {
    id: 8,
    category: 'Rotina do Dev',
    title: 'Tirando Dúvidas Técnicas',
    optionA: { id: 'A', text: 'Perguntar pro Dev Sênior 👴', description: 'Contexto histórico do sistema e mentoria humana' },
    optionB: { id: 'B', text: 'Perguntar pro Assistente de IA 🤖', description: 'Resposta imediata 24/7 sem interromper ninguém' },
  },
  {
    id: 9,
    category: 'Observabilidade',
    title: 'Diagnóstico de Falhas',
    optionA: { id: 'A', text: 'Logs Estruturados no Console 📜', description: 'Simples, direto ao ponto e auditável via stdout' },
    optionB: { id: 'B', text: 'Métricas e Tracing Distribuído 📊', description: 'OpenTelemetry, spans e correlação ponta a ponta' },
  },
  {
    id: 10,
    category: 'Futuro da Carreira',
    title: 'O Perfil do Engenheiro Moderno',
    optionA: { id: 'A', text: 'Dev Especialista Profundo 🔍', description: 'Domínio cirúrgico de um nicho/linguagem' },
    optionB: { id: 'B', text: 'Dev Generalista Orquestrador de IA 🌐', description: 'Conecta produtos, negócios e IA em alta velocidade' },
  },
];

class GameService {
  constructor(firestoreAdapter = null) {
    this.firestoreAdapter = firestoreAdapter;
    this.status = 'LOBBY'; // 'LOBBY' | 'ACTIVE' | 'REVEAL' | 'FINISHED'
    this.roundIndex = 0;
    this.participants = new Set();
    this.votes = []; // Array of { nickname, roundIndex, choice, responseTimeMs, timestamp }
    this.roundStartTime = null;
  }

  getState() {
    const currentQ = QUESTIONS[this.roundIndex] || null;
    return {
      status: this.status,
      roundIndex: this.roundIndex,
      totalQuestions: QUESTIONS.length,
      participantsCount: this.participants.size,
      currentQuestion: currentQ,
      roundStartTime: this.roundStartTime,
    };
  }

  registerParticipant(rawNickname) {
    if (!rawNickname || typeof rawNickname !== 'string') {
      throw new Error('Nickname inválido');
    }
    const nickname = rawNickname.trim().toLowerCase();
    if (nickname.length === 0 || nickname.length > 25) {
      throw new Error('Nickname inválido: deve ter entre 1 e 25 caracteres');
    }

    this.participants.add(nickname);

    if (this.firestoreAdapter) {
      this.firestoreAdapter.saveParticipant(nickname).catch(() => {});
    }

    return { success: true, nickname };
  }

  submitVote({ nickname, roundIndex, choice, responseTimeMs }) {
    if (this.status !== 'ACTIVE') {
      throw new Error('Votação fechada');
    }

    if (Number(roundIndex) !== this.roundIndex) {
      throw new Error('Rodada informada não corresponde à rodada ativa');
    }

    if (choice !== 'A' && choice !== 'B') {
      throw new Error("Opção inválida. Escolha 'A' ou 'B'");
    }

    const cleanNick = (nickname || '').trim().toLowerCase();
    if (!cleanNick) {
      throw new Error('Nickname obrigatório');
    }

    // Auto-register if not yet joined
    this.participants.add(cleanNick);

    // Guard against duplicate vote in the current round
    const existingVote = this.votes.find(
      (v) => v.roundIndex === this.roundIndex && v.nickname === cleanNick
    );
    if (existingVote) {
      throw new Error('Voto já registrado para esta rodada');
    }

    const validResponseTime = typeof responseTimeMs === 'number' && responseTimeMs >= 0
      ? responseTimeMs
      : (this.roundStartTime ? Math.max(0, Date.now() - this.roundStartTime) : 1000);

    const vote = {
      nickname: cleanNick,
      roundIndex: this.roundIndex,
      choice,
      responseTimeMs: validResponseTime,
      timestamp: Date.now(),
    };

    this.votes.push(vote);

    if (this.firestoreAdapter) {
      this.firestoreAdapter.saveVote(vote).catch(() => {});
    }

    return { success: true, vote };
  }

  getRoundResults(targetRoundIndex = this.roundIndex) {
    const roundIdx = Number(targetRoundIndex);
    const question = QUESTIONS[roundIdx] || null;
    const roundVotes = this.votes.filter((v) => v.roundIndex === roundIdx);

    let countA = 0;
    let countB = 0;

    for (const v of roundVotes) {
      if (v.choice === 'A') countA++;
      if (v.choice === 'B') countB++;
    }

    const totalVotes = countA + countB;
    const percentA = totalVotes > 0 ? Math.round((countA / totalVotes) * 100) : 50;
    const percentB = totalVotes > 0 ? 100 - percentA : 50;

    let winner = null;
    if (countA > countB) winner = 'A';
    else if (countB > countA) winner = 'B';
    else if (totalVotes > 0) winner = 'TIE';

    return {
      roundIndex: roundIdx,
      question,
      countA,
      countB,
      totalVotes,
      percentA,
      percentB,
      winner,
    };
  }

  nextPhase() {
    if (this.status === 'LOBBY') {
      this.status = 'ACTIVE';
      this.roundIndex = 0;
      this.roundStartTime = Date.now();
    } else if (this.status === 'ACTIVE') {
      this.status = 'REVEAL';
      this.roundStartTime = null;
    } else if (this.status === 'REVEAL') {
      if (this.roundIndex + 1 < QUESTIONS.length) {
        this.roundIndex += 1;
        this.status = 'ACTIVE';
        this.roundStartTime = Date.now();
      } else {
        this.status = 'FINISHED';
        this.roundStartTime = null;
      }
    }
    return this.getState();
  }

  resetGame() {
    this.status = 'LOBBY';
    this.roundIndex = 0;
    this.participants.clear();
    this.votes = [];
    this.roundStartTime = null;
    return this.getState();
  }

  getAllVotes() {
    return [...this.votes];
  }
}

module.exports = {
  GameService,
  QUESTIONS,
};

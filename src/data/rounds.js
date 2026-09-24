/**
 * As 10 rodadas técnicas oficiais para a Tech Battle Royale.
 */
const ROUNDS = [
  {
    id: 1,
    title: "Arquitetura de Aplicações",
    optionA: "Monolito Bem Feito 🏛️",
    optionB: "Microsserviços Distribuídos 🧩",
    context: "Simplicidade e coesão vs. escalabilidade independente"
  },
  {
    id: 2,
    title: "Infraestrutura & Computação",
    optionA: "Cluster Kubernetes ☸️",
    optionB: "Cloud Run (Serverless) 🚀",
    context: "Gestão de nós/infra vs. focar apenas no container e código"
  },
  {
    id: 3,
    title: "Persistência de Dados",
    optionA: "SQL Relacional Estruturado 🗄️",
    optionB: "NoSQL / Documentos Ágeis ⚡",
    context: "Consistência ACID vs. flexibilidade e escalabilidade horizontal"
  },
  {
    id: 4,
    title: "Cultura de Deploy",
    optionA: "Deploy Contínuo na Sexta 18h 💣",
    optionB: "Freeze de Código na Quinta 🧊",
    context: "Cultura de confiança em CI/CD vs. prudência de fim de semana"
  },
  {
    id: 5,
    title: "Metodologia de Testes",
    optionA: "TDD Estrito (Teste Primeiro) 🧪",
    optionB: "Codar Rápido e Testar em Staging 🏃",
    context: "Design guiado por testes vs. velocidade inicial de prototipação"
  },
  {
    id: 6,
    title: "Segurança de Acesso",
    optionA: "VPN Corporativa + Bastion Host 🔒",
    optionB: "Zero Trust + Identity-Aware Proxy 🛡️",
    context: "Perímetro clássico de rede vs. autenticação contextual moderna"
  },
  {
    id: 7,
    title: "Inteligência Artificial",
    optionA: "Modelos Especializados Pequenos (SLMs) 📱",
    optionB: "Modelos Gigantes de Fronteira (LLMs) 🧠",
    context: "Custo, latência e privacidade vs. raciocínio e capacidade ampla"
  },
  {
    id: 8,
    title: "Resolução de Dúvidas Técnicas",
    optionA: "Perguntar pro Dev Sênior 👴",
    optionB: "Perguntar pro Assistente de IA 🤖",
    context: "Experiência histórica do time vs. resposta imediata e pesquisa"
  },
  {
    id: 9,
    title: "Observabilidade",
    optionA: "Logs Estruturados no Console 📜",
    optionB: "Métricas e Tracing Distribuído 📊",
    context: "O bom e velho stdout formatado vs. telemetria moderna (OpenTelemetry)"
  },
  {
    id: 10,
    title: "Carreira & Perfil Profissional",
    optionA: "Dev Especialista Profundo 🔍",
    optionB: "Dev Generalista Orquestrador de IA 🌐",
    context: "O especialista de nicho vs. o profissional que conecta múltiplos sistemas com IA"
  }
];

module.exports = { ROUNDS };

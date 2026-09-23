# Tech Battle Royale — Live AI Demo Specification & Stage Prompt

Este documento foi elaborado para ser utilizado como **contexto e prompt mestre** para o **Antigravity** (ou assistente de IA) durante a apresentação ao vivo para 300 profissionais de TI.

---

## 🎤 Contexto da Apresentação & Narrativa de Palco

### 1. Os Três Pilares da Apresentação
1. **Motivar para Novas Possibilidades:** Demonstrar que o papel do desenvolvedor/engenheiro evoluiu de "digitador de código" para "arquiteto orquestrador de soluções de alto impacto".
2. **Engajar sobre os Ganhos Reais de Produtividade com IA:** Mostrar na prática como tarefas complexas (modelagem, persistência em tempo real, containerização e deploy em nuvem) são aceleradas de horas/dias para minutos.
3. **A IA como Intermediária entre a Necessidade do Cliente e a Solução:**
   - **O Cliente:** A organização do evento precisa de um jogo interativo em tempo real para 300 profissionais de TI, sem cadastro/login (zero fricção), sem travar com concorrência alta e com um encerramento divertido.
   - **A IA:** Recebe os requisitos de negócio, projeta a arquitetura correta (Cloud Run + Firestore), gera o código com boas práticas e prepara o deploy para produção.

---

## 🏛️ Arquitetura Técnica Recomendada (GCP Best Practices)

- **Compute:** **Google Cloud Run** (Serverless Container).
  - Escala de 0 a dezenas de instâncias automaticamente.
  - Concorrência ajustada para 80 requisições simultâneas por container.
  - `min-instances: 1` para garantir latência imediata sem cold starts.
  - Porta dinâmica lida via variável de ambiente `PORT` (padrão 8080).
- **Database:** **Google Cloud Firestore** (Native Mode).
  - Baixa latência, alta vazão de escrita para absorver os 300 votos simultâneos por rodada.
  - Suporte a modo local (mock em memória) para desenvolvimento e testes offline.
  - Inicialização automática via script de deploy se ainda não criado no projeto.
- **Segurança & IAM (Projetos Novos):**
  - APIs necessárias: `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`, `firestore.googleapis.com`, `storage.googleapis.com`.
  - Service Account do Compute Engine (`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`):
    - `roles/storage.admin` (leitura do zip de fontes gerado pelo Cloud Build)
    - `roles/logging.logWriter` (escrita de logs de build)
    - `roles/artifactregistry.writer` (publicação de containers no Artifact Registry)
    - `roles/datastore.user` (acesso do container Cloud Run para ler/escrever no Firestore)
- **Configuração:** Gerenciada via variáveis de ambiente carregadas do `.env` (`GCP_PROJECT_ID`, `GCP_REGION`, `SERVICE_NAME`, `PORT`).
- **Automação Self-Healing:** Script `deploy.sh` que resolve automaticamente o ID/número do projeto, habilita APIs, aplica as roles IAM e faz o deploy sem necessidade de configurações manuais no console.

---

## 🎮 Mecânica do Jogo: Tech Battle Royale

### 📱 1. Tela do Participante (Mobile - `/`)
- **Zero Fricção:** O usuário lê o QR Code no telão e digita apenas seu **Apelido** (sem login, sem senha).
- **Interação de 1 Toque (1-Tap):** A cada rodada aberta, o participante vê apenas **2 botões grandes e contrastantes** na tela do smartphone.
- **Feedback Tátil & Latência:** Ao tocar no botão, a interface trava o voto (evitando clique duplo), vibra (haptic feedback) e exibe o tempo de resposta em milissegundos (ex: *"Votado em 340ms! Olhe para o telão"*).

### 🖥️ 2. Tela do Telão (Projetor/Stage - `/screen.html`)
- **Modo Lobby:**
  - QR Code de alta resolução gerado automaticamente apontando para a URL da aplicação.
  - Contador ao vivo de participantes conectados (*"15... 84... 210... 300 Devs Conectados"*).
- **Modo Batalha (Durante a Rodada):**
  - Título da rodada e as duas opções técnicas em confronto.
  - Gráfico dinâmico estilo **Cabo de Guerra** balançando em tempo real conforme os votos chegam.
  - **Cálculo Coerente de Porcentagens:**
    * Com 0 votos: exibe `0% (0 votos)` para ambas opções, com a barra visual mantida no centro (50% / 50%) aguardando o primeiro voto.
    * Conforme os votos entram: calcula estritamente `percentA = Math.round((countA / total) * 100)` e `percentB = 100 - percentA` (sempre somando 100%).
    * **Atenção ao Bug Falsy em JS:** Nunca use `percentA || 50` no frontend, pois `0 || 50` vira `50`, gerando distorções como 50% vs 100%. Use sempre nullish check (`percentA !== undefined ? percentA : 0`).
  - Timer regressivo visual sincronizado (10 segundos).
- **Modo Revelação da Rodada:**
  - Percentual exato de cada opção e comemoração visual da opção vencedora (ou empate técnico).
- **Modo Cerimônia Final ("O Oscar dos Devs"):**
  - Revelação dos troféus divertidos calculados matematicamente sobre os votos reais:
    - ⚡ **The Flash (Gatilho Rápido):** Menor tempo médio de resposta geral da sala.
    - 🧘 **O Filósofo da Arquitetura:** Maior tempo médio de resposta geral (pensou até o último segundo).
    - 🐺 **O Lobo Solitário:** Participante que mais votou na opção minoritária da sala.
    - 🤝 **A Voz do Povo:** Participante que votou 100% alinhado com a maioria em todas as rodadas.
    - 🏆 **A Stack Oficial do Auditório:** Resumo leve das tecnologias consagradas pela plateia.

### 🎛️ 3. Painel do Apresentador (Controle Discreto - `/admin.html`)
- Botão "Abrir Rodada", "Fechar Rodada", "Próxima Rodada" e "Revelar Troféus".

---

## ⚔️ As 10 Rodadas Técnicas Oficiais

| Rodada | Opção A (Azul) | Opção B (Laranja/Vermelho) | Contexto de Discussão |
| :---: | :--- | :--- | :--- |
| **1** | **Monolito Bem Feito 🏛️** | **Microsserviços Distribuídos 🧩** | Simplicidade e coesão vs. escalabilidade independente |
| **2** | **Cluster Kubernetes ☸️** | **Cloud Run (Serverless) 🚀** | Gestão de nós/infra vs. focar apenas no container e código |
| **3** | **SQL Relacional Estruturado 🗄️** | **NoSQL / Documentos Ágeis ⚡** | Consistência ACID vs. flexibilidade e escalabilidade horizontal |
| **4** | **Deploy Contínuo na Sexta 18h 💣** | **Freeze de Código na Quinta 🧊** | Cultura de confiança em CI/CD vs. prudência de fim de semana |
| **5** | **TDD Estrito (Teste Primeiro) 🧪** | **Codar Rápido e Testar em Staging 🏃** | Design guiado por testes vs. velocidade inicial de prototipação |
| **6** | **VPN Corporativa + Bastion Host 🔒** | **Zero Trust + Identity-Aware Proxy 🛡️** | Perímetro clássico de rede vs. autenticação contextual moderna |
| **7** | **Modelos Especializados Pequenos (SLMs) 📱** | **Modelos Gigantes de Fronteira (LLMs) 🧠** | Custo, latência e privacidade vs. raciocínio e capacidade ampla |
| **8** | **Perguntar pro Dev Sênior 👴** | **Perguntar pro Assistente de IA 🤖** | Experiência histórica do time vs. resposta imediata e pesquisa |
| **9** | **Logs Estruturados no Console 📜** | **Métricas e Tracing Distribuído 📊** | O bom e velho stdout formatado vs. telemetria moderna (OpenTelemetry) |
| **10** | **Dev Especialista Profundo 🔍** | **Dev Generalista Orquestrador de IA 🌐** | O especialista de nicho vs. o profissional que conecta múltiplos sistemas com IA |

---

## 📋 PROMPT MESTRE PARA COLAR NO ANTIGRAVITY NO DIA DO EVENTO

Copie e cole o bloco delimitado abaixo diretamente no prompt do Antigravity quando estiver no palco:

```markdown
Você é o engenheiro e arquiteto de software encarregado de construir ao vivo a aplicação "Tech Battle Royale" para 300 profissionais de TI aqui presentes.

O cliente (coordenação do evento) solicitou uma aplicação web em tempo real que execute no Google Cloud Run integrado ao Firestore, permitindo que a plateia vote pelo celular via QR Code através de interação de 1 toque (sem login).

Construa a aplicação completa com a seguinte estrutura e boas práticas:

1. ARQUITETURA & STACK:
   - Backend: Node.js (Express), modular, servindo a API REST e os assets estáticos em um único container.
   - Banco de Dados: Firestore no modo nativo (com suporte a fallback mock local via USE_LOCAL_MOCK).
   - Configurações: Carregadas a partir do arquivo .env (GCP_PROJECT_ID, GCP_REGION, SERVICE_NAME, PORT, FIRESTORE_DATABASE_ID).
   - Deploy & Automação de IAM: Script deploy.sh auto-contido e resiliente para projetos novos no GCP:
     * Habilita APIs: run.googleapis.com, cloudbuild.googleapis.com, artifactregistry.googleapis.com, firestore.googleapis.com, storage.googleapis.com.
     * Concede roles à Service Account do Compute Engine ([PROJECT_NUMBER]-compute@developer.gserviceaccount.com): roles/storage.admin, roles/logging.logWriter, roles/artifactregistry.writer, roles/datastore.user.
     * Cria automaticamente a base Firestore no modo nativo caso ainda não exista.
     * Executa gcloud run deploy com concorrência para 80 conexões e min-instances 1.

2. AS 10 RODADAS TÉCNICAS:
   Implemente exatamente as 10 rodadas técnicas pré-configuradas:
   1. Monolito Bem Feito vs. Microsserviços Distribuídos
   2. Cluster Kubernetes vs. Cloud Run (Serverless)
   3. SQL Relacional Estruturado vs. NoSQL / Documentos Ágeis
   4. Deploy Contínuo na Sexta 18h vs. Freeze de Código na Quinta
   5. TDD Estrito (Teste Primeiro) vs. Codar Rápido e Testar em Staging
   6. VPN Corporativa + Bastion Host vs. Zero Trust + Identity-Aware Proxy
   7. Modelos Especializados Pequenos (SLMs) vs. Modelos Gigantes de Fronteira (LLMs)
   8. Perguntar pro Dev Sênior vs. Perguntar pro Assistente de IA
   9. Logs Estruturados no Console vs. Métricas e Tracing Distribuído
   10. Dev Especialista Profundo vs. Dev Generalista Orquestrador de IA

3. REQUISITOS DAS TELAS (FRONTEND MODERNO & RESPONSIVO):
   - Telão (/screen.html): Exibe QR Code gerado dinamicamente para a URL atual, contador de devs conectados, barra animada de "cabo de guerra" que oscila em tempo real com os votos, timer regressivo de 10s e o pódio final dos troféus com confetes.
     * Coerência de Votos em Tempo Real: Com 0 votos exiba 0% (0 votos) e mantenha a barra no centro (50%/50%). Conforme os votos chegam, calcule as porcentagens reais de modo que sempre somem 100%. Evite o bug do JavaScript '0 || 50' tratando explicitamente valores numéricos com nullish check.
   - Participante Mobile (/): Tela limpa para digitar apelido, 2 botões grandes coloridos por rodada, haptic feedback no clique, bloqueio de voto duplo e registro do tempo de resposta (ms).
   - Painel do Apresentador (/admin.html): Controle discreto para iniciar, fechar e avançar rodadas ou reiniciar a partida.

4. ALGORITMO DOS TROFÉUS (O OSCAR DOS DEVS):
   - "The Flash" (Gatilho Rápido): Menor tempo médio de resposta geral.
   - "O Filósofo da Arquitetura": Maior tempo médio de resposta geral.
   - "O Lobo Solitário": Mais votos em opções minoritárias.
   - "A Voz do Povo": Mais votos alinhados com a maioria da sala.

5. QUALIDADE & TESTES:
   - Escreva testes unitários para o serviço de jogo e para o algoritmo de troféus.
   - Escreva testes de integração para as rotas da API.
   - Crie o Dockerfile multi-stage otimizado para Cloud Run executando como usuário não-root.

Comece agora criando os arquivos de configuração, testes e implementação completa!
```

---

## ⏱️ Roteiro de Apresentação (Timing Sugerido: 20 a 25 min)

1. **Minuto 0 a 5 (Abertura & Conexão):**
   - Falar sobre a transição do mercado de tecnologia e a produtividade com IA.
   - Explicar a tese: *A IA como ponte entre a dor/necessidade do cliente e a solução em produção*.
2. **Minuto 5 a 10 (A Demanda do Cliente & O Prompt):**
   - Apresentar o desafio fictício/real: *"Precisamos engajar 300 pessoas agora, com alta concorrência e zero atrito"*.
   - Abrir o terminal/IDE com o Antigravity, colar o prompt mestre e mostrar a IA criando a aplicação, executando os testes e orquestrando o deploy no Cloud Run via `deploy.sh`.
3. **Minuto 10 a 20 (A Batalha ao Vivo):**
   - Projetar `/screen.html` no telão com o QR Code gigante.
   - Convidar a plateia a escanear com a câmera.
   - Rodar 3 a 5 rodadas rápidas (ou as 10) pelo `/admin.html`.
   - Comentar os debates técnicos conforme a barra oscila ao vivo.
4. **Minuto 20 a 23 (O Oscar dos Devs):**
   - Disparar o cálculo dos troféus e revelar os nomes de "The Flash" e "O Filósofo".
   - Aplausos e descontração no auditório.
5. **Minuto 23 a 25 (Fechamento Inspirador):**
   - Conclusão: *"O que vimos aqui não foi apenas um jogo. Foi um sistema em nuvem com banco de dados distribuído em tempo real, containerizado, testado e publicado em minutos. É esse superpoder que a IA coloca nas mãos de cada um de vocês."*


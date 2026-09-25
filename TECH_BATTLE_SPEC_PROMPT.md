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

## 🎨 Design System & UI Experience (Estilo Google Developer & Material You Dark)

Para garantir uma estética visual moderna, profissional e memorável no palco de um evento de tecnologia, a interface deve seguir rigorosamente a linguagem de design **Google Developer / Material Design 3 (Dark Theme)**:

### 1. Paleta de Cores Oficial do Google
- **Google Blue (`#4285F4` / `#1a73e8`):** Cor primária do sistema, botões principais, Opção A no confronto e glow de destaque esquerdo.
- **Google Red (`#EA4335` / `#d93025`):** Opção B no confronto, alertas de tempo crítico e glow de destaque direito.
- **Google Yellow (`#FBBC04` / `#f9ab00`):** Indicador de contagem regressiva, status `REVEAL` e troféu "The Flash".
- **Google Green (`#34A853` / `#1e8e3e`):** Indicador de presença de devs online (pulsante), confirmação de voto computado e status de sucesso.
- **Google 4-Color Gradient:** `linear-gradient(90deg, #4285F4 0%, #EA4335 33%, #FBBC04 66%, #34A853 100%)` aplicado em filetes sutis no topo do cabeçalho, barras de destaque e logotipo.

### 2. Superfícies & Glassmorphism (Material You Dark)
- **Background Principal:** `#0b0e14` (preto profundo azulado com iluminação ambiente radial suave em Google Blue e Google Red).
- **Cards e Containers:** `#161b26` com bordas translúcidas finas (`border: 1px solid rgba(255, 255, 255, 0.08)`), blur de vidro (`backdrop-filter: blur(12px)`) e sombras de elevação suaves (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4)`).
- **Bordas Arredondadas (Shape Hierarchy):** `16px` para cards, `12px` para botões e inputs, `9999px` (pílula) para chips e badges de status.

### 3. Tipografia Google
- **Fonte Principal (Sans):** `'Google Sans', 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- **Fonte Monospaçada (Contadores & Timers):** `'Roboto Mono', 'SF Mono', monospace` com pesos destacados (`700` e `800`).

### 4. Micro-interações, Animações & Feedback Visual de Alto Impacto
- **Partículas de Confete (`canvas-confetti`):**
  * **No Smartphone do Participante:** Quando o usuário votou na opção que venceu a rodada (maioria dos votos no `REVEAL`), disparar uma chuva festiva de confetes nas 4 cores do Google (`#4285F4`, `#EA4335`, `#FBBC04`, `#34A853`), acompanhada de vibração háptica comemorativa (`navigator.vibrate([120, 60, 120])`) e badge com glow dourado.
  * **No Telão do Palco:** A cada rodada revelada, disparar um canhão lateral de confetes emanando do lado da opção vencedora (canhão azul à esquerda se Opção A vencer; canhão vermelho à direita se Opção B vencer). Na Cerimônia Final (Oscar dos Devs), disparar uma salva de fogos de artifício em cascata por toda a tela.
- **Efeito de Vibração da Tela (Screen Shake Effect):**
  * **No Smartphone do Participante:** Se o participante votou na opção que perdeu a rodada (minoria), aplicar uma animação CSS acelerada de tremor na tela (`@keyframes screenShake`, duração de ~400ms), alertando com vibração rápida no aparelho (`navigator.vibrate(200)`) e exibindo um badge bem-humorado (*"Você votou com a minoria audaciosa! 🐺"*).
  * **No Telão do Palco:** O card da opção perdedora sofre um leve tremor com redução de opacidade e escala (`opacity: 0.6`, `transform: scale(0.97)`), enquanto o card vencedor salta para a frente com coroa luminosa (`@keyframes winnerBounce`) e borda neon dourada.
- **Micro-interações no Toque (1-Tap):** Efeito tátil de pressão imediata (`transform: scale(0.96)` ao toque), efeito de onda/ripple, feedback vibratório (`navigator.vibrate([40])`) e badge animado de confirmação em milissegundos.
- **Alerta de Timer Crítico no Telão:** Quando o timer regressivo atingir `<= 5s`, acionar uma animação pulsante urgente em vermelho néon (`@keyframes timerUrgentPulse`) para criar tensão cênica no auditório.
- **Cabo de Guerra Vivo com Física & Fluxo de Energia:**
  * **Interpolação Suave (Lerp via `requestAnimationFrame`):** Em vez de saltos bruscos a cada atualização de rede, o cabo de guerra desliza suavemente com peso e inércia física, acompanhando o caminho contínuo dos votos em tempo real.
  * **Marcador de Choque Móvel (*Clash Marker*):** Um nodo de energia elétrico posicionado exatamente na fronteira móvel (`left: ${percentA}%`), com feixe de luz vertical néon e diamante pulsante no ponto de atrito entre as duas tecnologias.
  * **Fluxo de Energia Direcional:** Feixes e ranhuras de luz animados fluindo para a direita na Opção A (`@keyframes energyFlowRight`) e para a esquerda na Opção B (`@keyframes energyFlowLeft`), acelerando e brilhando intensamente no lado que estiver conquistando votos no momento.
  * **Conclusão Cênica no Final (*REVEAL*):** Ao fechar a votação, disparo de uma onda de choque luminosa (*shockwave sweep*) ao longo da barra, travamento triunfal do marcador na marca final definitiva e pulso dourado comemorativo no lado vencedor.
- **Pills de Status:** Chips com ponto de luz pulsante (CSS `@keyframes pulseGlow`).

---

## 🎮 Mecânica do Jogo: Tech Battle Royale

### 📱 1. Tela do Participante (Mobile - `/`)
- **Zero Fricção:** O usuário lê o QR Code no telão e digita apenas seu **Apelido** (sem login, sem senha).
- **Interação de 1 Toque (1-Tap):** A cada rodada aberta, o participante vê apenas **2 botões grandes e contrastantes** na tela do smartphone.
- **Feedback Tátil & Latência:** Ao tocar no botão, a interface trava o voto (evitando clique duplo), vibra (haptic feedback) e exibe o tempo de resposta em milissegundos (ex: *"Votado em 340ms! Olhe para o telão"*).
- **Gestão de Sessão & Botão de Sair:**
  - Disponibilizar botão "Sair / Trocar Nickname" no cabeçalho e na tela de Lobby para quem quiser alterar seu nome enquanto uma rodada não estiver em andamento.
  - Durante o status `ACTIVE` da rodada, o botão de sair fica oculto para evitar toques acidentais durante a votação rápida.
  - **Auto-Logout ao Reiniciar Jogo:** O backend gera e atualiza um `sessionId` toda vez que a partida é reiniciada via `/api/admin/reset`. Os navegadores dos participantes comparam o `sessionId` atual via `/api/state` e deslogam automaticamente (limpando o `localStorage`), retornando à tela inicial de entrada de nome.

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
  - **Timer Regressivo Visual (30 Segundos):**
    * Configurado em 30 segundos que inicia após a abertura da rodada pelo admin.
    * Ao terminar os 30s, o timer congela em 0s sem disparar nenhuma ação automática, aguardando pacientemente que o apresentador encerre a votação no admin.
    * Se o apresentador encerrar a votação antes dos 30s, o timer é pausado imediatamente.
- **Modo Revelação da Rodada (Persistência no Telão):**
  * Quando o apresentador fecha uma votação no admin, o telão do palco continua exibindo os resultados consolidados da rodada (percentuais exatos, total de votos e vencedor).
  * O telão **só muda de tela quando o admin clicar em "Próxima Rodada"** no painel de controle.
  * **Avanço Direto para Nova Rodada:** Ao clicar em "Próxima Rodada", o telão do palco já mostra a próxima rodada imediatamente, inicia o timer regressivo de 30s e abre a votação nos smartphones dos participantes de uma só vez — sem a necessidade de um botão manual de "abrir votação" a cada rodada.
- **Modo Cerimônia Final ("O Oscar dos Devs"):**
  - Revelação dos troféus divertidos calculados matematicamente sobre os votos reais:
    - ⚡ **The Flash (Gatilho Rápido):** Menor tempo médio de resposta geral da sala.
    - 🧘 **O Filósofo da Arquitetura:** Maior tempo médio de resposta geral (pensou até o último segundo).
    - 🐺 **O Lobo Solitário:** Participante que mais votou na opção minoritária da sala.
    - 🤝 **A Voz do Povo:** Participante que votou 100% alinhado com a maioria em todas as rodadas.
    - 🏆 **A Stack Oficial do Auditório:** Resumo leve das tecnologias consagradas pela plateia.

### 🎛️ 3. Painel do Apresentador (Controle Protegido - `/admin.html`)
- **Proteção por Senha:** O acesso ao painel de administração e às rotas `/api/admin/*` exige autenticação por senha (definida inicialmente como `"techadmin"`).
- **Fluxo Ágil de 1 Toque por Rodada:**
  - **No Início (Lobby):** Botão "▶️ Iniciar Batalha (Rodada 1)" para disparar a primeira rodada já em votação ativa com timer de 30s.
  - **Durante a Votação (`ACTIVE`):** Botão "⏹️ Fechar Votação / Revelar" para pausar o timer e consolidar os resultados no telão.
  - **Na Revelação (`REVEAL`):** Botão "⏭️ Próxima Rodada" que avança a rodada, atualiza o telão, inicia o timer de 30s e abre a votação instantaneamente (sem botão redundante de abrir votação).
  - **Encerramento:** Botão "🏆 Ir para Troféus (Oscar)" para apresentar o pódio e "🔄 Resetar Jogo".

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
     * Cálculo de Votos: Quando total de votos for 0, retorne percentA: 0 e percentB: 0. Quando houver votos, calcule percentA = Math.round((countA / total) * 100) e percentB = 100 - percentA (soma sempre 100%).
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

3. DESIGN SYSTEM & UI MODERNA ESTILO GOOGLE DEVELOPER:
   - Adote rigorosamente a estética Google Developer / Material Design 3 (Dark Theme):
     * Paleta Oficial: Google Blue (#4285F4) na Opção A, Google Red (#EA4335) na Opção B, Google Yellow (#FBBC04) em timers/troféus, Google Green (#34A853) em status de conexão/sucesso.
     * Fita das 4 Cores do Google: Borda decorativa superior com linear-gradient(90deg, #4285F4, #EA4335, #FBBC04, #34A853) no cabeçalho e logo.
     * Tipografia: 'Google Sans', 'Outfit', 'Inter' para textos e títulos; 'Roboto Mono' para timers, votos e porcentagens.
     * Superfícies: Fundo preto profundo (#0b0e14) com brilho radial sutil, cards elevados em #161b26 com bordas translúcidas de 1px e backdrop-filter (glassmorphism).
      * Cabo de Guerra Vivo com Física & Fluxo de Energia: Interpolação contínua (lerp via requestAnimationFrame) para movimento orgânico com inércia, nodo de choque móvel elétrico (Clash Marker no ponto exato de contato), feixes de energia direcionais indicando o lado em avanço e onda de choque luminosa (shockwave) na conclusão final ao fechar a votação.
      * Microinterações & Efeitos Visuais Cinematográficos: Integração com 'canvas-confetti' para celebrações dinâmicas, animação CSS @keyframes screenShake para efeito de tremor ao errar e pulsos de alerta em timers críticos (<= 5s).

4. REQUISITOS DAS TELAS (FRONTEND MODERNO & RESPONSIVO):
   - Telão (/screen.html): Exibe QR Code com moldura iluminada no estilo Google Developer, contador de devs conectados, barra animada de "cabo de guerra vivo" com nodo de choque móvel, feixes de energia em fluxo direcional e física fluida por lerp, timer regressivo de 30s (com pulso urgente em <= 5s, pausa ao fechar e ocioso se zerar) e o pódio final dos troféus com cascata de confetes.
     * Conclusão Épica da Rodada no Telão: Ao fechar a rodada, dispara onda de choque na barra de cabo de guerra com travamento no percentual definitivo, canhão lateral de confetes emanando do lado vencedor (azul à esquerda ou vermelho à direita), coroa iluminada no card vencedor e leve tremor no perdedor.
     * Avanço Contínuo: Ao clicar em "Próxima Rodada", o telão atualiza imediatamente para o novo confronto, dispara o cronômetro de 30s e libera a votação instantaneamente.
     * Coerência de Votos em Tempo Real: Com 0 votos exiba 0% (0 votos) e mantenha a barra no centro (50%/50%). Conforme os votos chegam, a barra e os textos refletem as porcentagens reais (ex: 0% e 100%, 33% e 67%). NUNCA use 'data.percentA || 50' no frontend (pois '0 || 50' vira 50 em JS); use sempre verificação estrita ('data.percentA !== undefined ? Number(data.percentA) : 0').
   - Participante Mobile (/): Tela moderna e limpa para digitar apelido, 2 botões grandes coloridos por rodada com elevação Material e micro-interação ao toque (scale 0.96, ripple effect), haptic feedback no clique, bloqueio de voto duplo e registro do tempo de resposta (ms).
     * Feedback Visual Dramático na Revelação (REVEAL):
       - Se o usuário votou na opção vencedora (maioria): dispara explosão festiva de confetes na tela usando 'canvas-confetti', badge comemorativo iluminado e vibração de vitória no aparelho.
       - Se o usuário votou na opção perdedora (minoria): aplica efeito de tremor na tela inteira (screen shake CSS via @keyframes screenShake) com vibração e badge bem-humorado de minoria audaciosa.
     * Gestão de Sessão & Desconexão: Botão "Sair / Trocar Nickname" no cabeçalho e na tela de espera (ocultado durante ACTIVE para evitar toques acidentais). Rastreie um sessionId no servidor (regenerado ao reiniciar o jogo no admin); clientes sincronizam via polling e efetuam auto-logout ao detectar sessionId alterado, retornando à tela de inserção de nome.
   - Painel do Apresentador (/admin.html): Controle com layout inspirado no Google Cloud Console, protegido por senha fixa ("techadmin"). Ao clicar em "Próxima Rodada", o sistema avança a rodada, inicia o timer regressivo de 30s e abre a votação de uma só vez (sem necessidade de um botão avulso redundante para abrir votação a cada rodada). Rotas /api/admin/* protegidas com validação de senha.

5. ALGORITMO DOS TROFÉUS (O OSCAR DOS DEVS):
   - "The Flash" (Gatilho Rápido): Menor tempo médio de resposta geral.
   - "O Filósofo da Arquitetura": Maior tempo médio de resposta geral.
   - "O Lobo Solitário": Mais votos em opções minoritárias.
   - "A Voz do Povo": Mais votos alinhados com a maioria da sala.

6. QUALIDADE & TESTES:
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


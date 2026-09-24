---
name: gcp-cloud-run-firestore-scaling
description: Melhores práticas para deploy, arquitetura e escalabilidade de aplicações no Google Cloud Run e Cloud Firestore.
version: 1.0.0
tags: [gcp, cloud-run, firestore, scalability, serverless, devops]
---

# 🚀 Melhores Práticas: Escalabilidade com Google Cloud Run e Cloud Firestore

Este guia reúne padrões de arquitetura, configurações de runtime e diretrizes operacionais para construir e operar aplicações serverless altamente escaláveis, resilientes e com controle de custo usando **Google Cloud Run** e **Cloud Firestore**.

---

## 1. Cloud Run: Otimização de Runtime e Escalabilidade

O Cloud Run é uma plataforma serverless orientada a containers. Para atingir alta vazão (throughput) e baixa latência sem estourar custos, configure o runtime de acordo com o perfil da sua carga.

### 1.1 Concorrência (`--concurrency`)
Por padrão, uma instância do Cloud Run atende até **80 requisições simultâneas**.
- **Aplicações I/O-bound (ex: APIs Node.js, Go, Python FastAPI com async/await):**
  - Mantenha a concorrência entre **80 e 100**. Cada contêiner aproveita o event loop / goroutines para lidar com múltiplas conexões em espera de I/O de banco de dados.
- **Aplicações CPU-bound ou com consumo elevado de memória (ex: processamento de imagem, ML, SSR pesado):**
  - Reduza a concorrência para **1 a 10**. Evita estrangulamento da CPU e estouro de memória (OOM - Out Of Memory).

### 1.2 Controle de Instâncias (`--min-instances` e `--max-instances`)
- **`--min-instances` (Mitigação de Cold Start):**
  - Use `min-instances >= 1` para aplicações críticas voltadas ao usuário final (garante réplicas sempre aquecidas).
  - Em ambientes de teste/staging, use `min-instances 0` para economizar 100% quando ocioso.
- **`--max-instances` (Proteção Orçamentária e contra Sobrecarga no Backing Service):**
  - Sempre defina um teto máximo (ex: `--max-instances 50` ou `100`). Sem esse limite, um ataque DDoS ou pico repentino pode gerar custos imprevistos ou derrubar seu banco de dados relacional downstream.

### 1.3 Alocação de CPU e Ciclo de Vida
- **Alocação de CPU durante requisições (`--no-cpu-throttling` vs padrão):**
  - **Padrão (CPU Throttled):** A CPU é pausada assim que a resposta HTTP é enviada. Não execute threads em background sem aguardar a promise/task finalizar antes do response!
  - **CPU Always Allocated (`--no-cpu-throttling`):** A CPU permanece ativa mesmo fora de requisições. Obrigatório se você executa WebSockets, tarefas em fila assíncronas em memória ou timers recorrentes.
- **Startup CPU Boost (`--cpu-boost`):**
  - Habilite sempre. Fornece mais vCPUs temporárias no momento do boot do contêiner, reduzindo o tempo de Cold Start em até 50% sem custo adicional expressivo.

### 1.4 Probes de Saúde (Health Checks)
Configure probes HTTP para garantir que tráfego só seja roteado após o contêiner inicializar caches e conexões com o Firestore:
```bash
--startup-probe-path=/api/health \
--startup-probe-initial-delay=2 \
--startup-probe-period=3 \
--startup-probe-failure-threshold=5
```

---

## 2. Cloud Firestore: Escalabilidade e Prevenção de Gargalos

O Firestore escala massivamente em leituras distribuídas, mas possui restrições físicas em documentos específicos que precisam de design consciente.

### 2.1 A Regra de 1 Escrita por Segundo por Documento (Hotspotting)
- **O Limite:** Um documento individual no Firestore aceita com confiabilidade aproximadamente **1 gravação sustentada por segundo** (com picos curtos de até 5 req/s antes de disparar contenção de transação e erro `ABORTED` ou `RESOURCE_EXHAUSTED`).
- **Antipadrão:** Criar um único documento `stats/global` onde cada clique, voto ou requisição faz `counter.increment(1)`. Sob pico, o sistema entrará em colapso.

### 2.2 Padrão: Contadores Distribuídos (Distributed Counters)
Para agregações em tempo real com alta taxa de escrita (ex: votação em massa, likes, placares):
1. Crie uma subcoleção `shards` sob o documento do contador (ex: 10 a 50 shards).
2. Cada requisição incrementa um shard aleatório (`Math.floor(Math.random() * numShards)`).
3. Para ler o valor total, faça uma agregação `aggregate().sum()` (recurso nativo do Firestore que cobra apenas 1 leitura a cada 1000 índices verificados):

```javascript
// Exemplo em Node.js (Gravação distribuída)
async function incrementScore(db, gameId, delta = 1) {
  const NUM_SHARDS = 10;
  const shardId = `shard_${Math.floor(Math.random() * NUM_SHARDS)}`;
  const shardRef = db.doc(`games/${gameId}/shards/${shardId}`);
  
  await shardRef.set({
    count: FirebaseFirestore.FieldValue.increment(delta)
  }, { merge: true });
}

// Leitura agregada rápida e de baixo custo
async function getTotalScore(db, gameId) {
  const shardsCollection = db.collection(`games/${gameId}/shards`);
  const snapshot = await shardsCollection.aggregate({
    total: FirebaseFirestore.AggregateField.sum('count')
  }).get();
  
  return snapshot.data().total;
}
```

### 2.3 Paginação Eficiente: Evite `offset()`
- **Antipadrão:** `query.limit(20).offset(10000)` lê e cobra todas as 10.020 leituras no Firestore.
- **Padrão:** Use cursores com timestamps ordenados ou IDs:
```javascript
const firstPage = await db.collection('events')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

const lastDoc = firstPage.docs[firstPage.docs.length - 1];

// Próxima página a partir do cursor
const nextPage = await db.collection('events')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

### 2.4 Reutilização de Conexões e Singleton do SDK
- **Instancie o cliente do Firestore fora do handler da requisição** (escopo global do módulo).
- A conexão gRPC subjacente é multiplexada e reutilizada entre as requisições atendidas pela mesma réplica do Cloud Run, eliminando a sobrecarga de handshake SSL/TLS a cada chamada.

### 2.5 Isenção de Índices em Campos de Alta Frequência
- Cada campo indexado gera escritas extras na camada interna do Bigtable do Firestore.
- Para coleções que recebem muitas escritas com campos volumosos que não serão filtrados (ex: payloads JSON brutos, logs, timestamps de telemetria interna), crie **Index Exemptions** no console ou no arquivo `firestore.indexes.json`.

---

## 3. Modelo de Deploy de Alta Performance (Script Reference)

Comando de deploy de referência para produção em Cloud Run com todas as otimizações aplicadas:

```bash
gcloud run deploy meu-app-prod \
  --image=southamerica-east1-docker.pkg.dev/meu-projeto/apps/meu-app:v1.0.0 \
  --region=southamerica-east1 \
  --platform=managed \
  --allow-unauthenticated \
  --min-instances=1 \
  --max-instances=80 \
  --concurrency=80 \
  --cpu=2 \
  --memory=2Gi \
  --cpu-boost \
  --execution-environment=gen2 \
  --timeout=60s \
  --service-account=sa-meu-app@meu-projeto.iam.gserviceaccount.com \
  --set-env-vars="NODE_ENV=production,FIRESTORE_DATABASE_ID=(default)" \
  --labels="env=production,team=platform,workload=api"
```

---

## 4. Checklist de Produção

- [ ] Instância mínima (`--min-instances >= 1`) configurada para evitar lentidão no primeiro acesso.
- [ ] Concorrência ajustada conforme a natureza do app (I/O vs CPU).
- [ ] Startup CPU Boost (`--cpu-boost`) ativado.
- [ ] Service Account dedicada associada ao Cloud Run com permissão estrita (`roles/datastore.user`).
- [ ] Nenhuma escrita recorrente em documento único a taxas superiores a 1 escrita/segundo.
- [ ] Paginações implementadas com `startAfter` (sem `offset`).
- [ ] Cliente Firestore inicializado em escopo singleton fora do ciclo da requisição.

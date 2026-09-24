# 📚 Catálogo de Skills: Engenharia de Software, Nuvem & Segurança

Bem-vindo à suíte de **Skills de Engenharia**. Esta pasta reúne guias práticos, arquiteturas de referência, padrões de segurança e rotinas de automação projetados para elevar a maturidade técnica no desenvolvimento de aplicações escaláveis no **Google Cloud Platform (GCP)**.

---

## 🗂️ Índice de Skills

| Skill | Arquivo | Foco Principal |
|---|---|---|
| **Deploy & Escalabilidade** | [`gcp-cloud-run-firestore-scaling.md`](./gcp-cloud-run-firestore-scaling.md) | Configurações do Cloud Run (concorrência, CPU boost, min/max instances), contenção no Firestore (regra de 1 escrita/s), contadores distribuídos, cursores de paginação e caching. |
| **Segurança & Gestão de Segredos** | [`seguranca-apps-gcp.md`](./seguranca-apps-gcp.md) | Defesa em camadas contra vazamento de credenciais no GitHub (gitleaks, push protection), eliminação de chaves JSON, Google Secret Manager, Workload Identity e regras do Firestore. |
| **Pipelines CI/CD Automatizados** | [`pipeline-deploy-gcloud.md`](./pipeline-deploy-gcloud.md) | Entrega contínua com `gcloud`, Cloud Build e GitHub Actions, autenticação passwordless via OIDC, deploys canários (`--no-traffic`), testes de fumaça e rollback instantâneo. |
| **Test-Driven Development (TDD)** | [`testes-tdd.md`](./testes-tdd.md) | Ciclo Red-Green-Refactor, princípios F.I.R.S.T., pirâmide de testes, mocks conscientes vs emuladores locais (Firebase Emulator), tratamento de assincronismo e casos extremos. |
| **Versionamento com Git** | [`git-versionamento.md`](./git-versionamento.md) | Padrão Conventional Commits, commits atômicos (`git add -p`), fluxos Trunk-Based e GitHub Flow, Semantic Versioning (SemVer), tags anotadas e governança de branches. |

---

## 🛠️ Como Utilizar Estas Skills

### 1. No Desenvolvimento Cotidiano
- **Antes de iniciar uma feature:** Consulte [`testes-tdd.md`](./testes-tdd.md) para estruturar seus testes antes do código e [`git-versionamento.md`](./git-versionamento.md) para planejar commits atômicos.
- **Antes de configurar serviços em nuvem:** Revise [`gcp-cloud-run-firestore-scaling.md`](./gcp-cloud-run-firestore-scaling.md) para dimensionar concorrência e evitar custos desnecessários ou gargalos no banco.
- **Antes de comitar e criar PRs:** Verifique a checklist de segurança em [`seguranca-apps-gcp.md`](./seguranca-apps-gcp.md).

### 2. Com Assistentes de IA e Automação
Estes arquivos contêm metadados em formato YAML frontmatter (`name`, `description`, `tags`) e podem ser referenciados diretamente por agentes de IA e desenvolvedores para manter consistência arquitetural ao longo do ciclo de vida do projeto.

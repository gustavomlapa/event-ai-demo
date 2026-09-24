---
name: git-versionamento
description: Melhores práticas para versionamento de código com Git, Conventional Commits, estratégias de branch e fluxo de trabalho.
version: 1.0.0
tags: [git, versioning, conventional-commits, github-flow, trunk-based, devops, workflow]
---

# 🌿 Melhores Práticas: Versionamento de Código com Git

Um histórico Git limpo, semântico e consistente é fundamental para auditoria, automação de releases, geração de changelogs e colaboração sem atrito.

---

## 1. Padrão de Mensagens: Conventional Commits

Adote a especificação [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição curta no imperativo>

[corpo opcional explicando o PORQUÊ e não apenas o QUE]

[rodapé(s) opcional(is) para referenciar issues ou BREAKING CHANGE]
```

### 1.1 Prefixos Padrão e Finalidades
| Prefixo | Significado | Exemplo |
|---|---|---|
| `feat:` | Nova funcionalidade para o usuário final | `feat(auth): adicionar login com Google OAuth` |
| `fix:` | Correção de bug em código de produção | `fix(voting): tratar divisão por zero quando votos forem zero` |
| `test:` | Adição ou refatoração de testes automatizados | `test(trophy): cobrir caso de empate no troféu Lobo Solitário` |
| `refactor:` | Mudança de código que não corrige bug nem adiciona feat | `refactor(game): extrair cálculo de porcentagem para serviço puro` |
| `perf:` | Alteração de código que melhora desempenho | `perf(firestore): migrar leitura de lista para agregação de shards` |
| `docs:` | Mudanças exclusivamente em documentação | `docs: atualizar diagrama de arquitetura do Cloud Run` |
| `chore:` | Tarefas rotineiras de manutenção ou dependências | `chore(deps): atualizar dependência jest para v29` |
| `ci:` | Mudanças em arquivos de pipeline e scripts de CI/CD | `ci: adicionar step de workload identity federation no workflow` |

### 1.2 Regras de Qualidade para a Mensagem
- **Use o modo imperativo:** Escreva `fix: resolver timeout na API` e NÃO `fix: resolvido o timeout` ou `fix: resolvendo`.
- **Comece em minúsculas e sem ponto final na linha de título.**
- **Evite commits vazios de sentido:**
  - ❌ `wip`, `ajustes`, `corrigindo bug`, `testando deploy`.
  - ✔️ `fix(deploy): adicionar flag cpu-boost no comando gcloud run`.

---

## 2. Commits Atômicos: Uma Mudança Lógica por Commit

- **O que é um commit atômico?** É a menor alteração completa e independente que mantém o sistema funcionando e os testes passando.
- **Por que é essencial?**
  - Permite reverter um bug específico com `git revert <hash>` sem desfazer outras 10 funcionalidades.
  - Torna o `git bisect` cirúrgico na identificação de qual linha introduziu um problema.
- **Uso do staging seletivo (`git add -p`):**
  Nunca dê `git add .` às cegas. Revise os blocos de código com `git add -p` para agrupar apenas as linhas relacionadas ao objetivo do commit.

---

## 3. Estratégias de Branching (Fluxo de Trabalho)

### 3.1 Trunk-Based Development (Recomendado para CI/CD Moderno)
- **Como funciona:** Desenvolvedores criam branches curtas (vida útil máxima de 1 a 2 dias) derivadas da `main` e fazem merge frequentemente.
- **Vantagens:** Elimina conflitos gigantes de merge ("Merge Hell"), estimula entregas contínuas e integração com Feature Flags.

### 3.2 GitHub Flow (Padrão para a Maioria das Equipes de Produto)
1. Crie uma branch com nome semântico a partir da `main`:
   - `feat/trophy-calculation`
   - `fix/zero-votes-percentage`
   - `docs/api-readme`
2. Envie commits atômicos com testes verdes.
3. Abra um **Pull Request (PR)** com descrição clara do contexto, prints/evidências e testes realizados.
4. Após aprovação de code review e validação do CI, faça o merge na `main` e delete a branch.

---

## 4. Rebase vs. Merge: Como Manter o Histórico Limpo

### 4.1 Atualizando sua branch local antes de abrir PR (Use `rebase`)
Para sincronizar sua branch com as novidades da `main`:
```bash
# Na sua branch de feature:
git fetch origin
git rebase origin/main
```
*Vantagem:* Evita a criação de dezenas de commits poluídos de `Merge branch 'main' into feat/...`.

### 4.2 Integrando no repositório remoto (Squash and Merge ou Merge Commit)
- **Squash and Merge:** Excelente para features pequenas, agrupando commits exploratórios locais em um único commit bem documentado na `main`.
- **Regra Fundamental de Segurança:** **NUNCA faça rebase ou force push (`push -f`) em branches públicas compartilhadas (`main`, `master`, `staging`)**.

---

## 5. Versionamento Semântico (SemVer) e Tags de Release

Siga o padrão **`MAJOR.MINOR.PATCH`** ([semver.org](https://semver.org/lang/pt-BR/)):

- **MAJOR (ex: 2.0.0):** Quebra de compatibilidade na API pública (Breaking Changes).
- **MINOR (ex: 1.1.0):** Novas funcionalidades retrocompatíveis.
- **PATCH (ex: 1.0.1):** Correções de bugs retrocompatíveis.

### Criando Tags de Release Anotadas:
```bash
# Cria uma tag com mensagem descritiva
git tag -a v1.0.0 -m "Release v1.0.0: Lançamento oficial da plataforma de batalha tech"

# Envia a tag para o GitHub
git push origin v1.0.0
```

---

## 6. Governança e Proteção de Branch no GitHub

Configure as seguintes regras de proteção para a branch `main`:
1. **Require a pull request before merging:** Impede push direto na branch principal.
2. **Require status checks to pass before merging:** Obriga que o pipeline de testes (GitHub Actions / Cloud Build) esteja 100% verde antes do merge.
3. **Require review from code owners:** Pelo menos 1 aprovação de colega de time.
4. **Do not allow force pushes:** Garante a integridade histórica do código.

---

## 7. Checklist de Qualidade Git

- [ ] `.gitignore` configurado impedindo arquivos temporários, segredos e dependências (`node_modules`).
- [ ] Mensagens de commit seguindo o formato `tipo(escopo): descrição`.
- [ ] Commits pequenos, atômicos e com suite de testes passando.
- [ ] Staging realizado com granularidade (`git add -p`).
- [ ] Branches nomeadas com prefixo claro (`feat/`, `fix/`, `chore/`).
- [ ] Branches públicas preservadas sem `git push --force`.
- [ ] Releases marcadas com tags semânticas anotadas (`vX.Y.Z`).

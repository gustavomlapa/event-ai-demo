---
name: testes-tdd
description: Guia avançado e prático de Test-Driven Development (TDD), padrões de arquitetura de testes, mocking e garantia de qualidade.
version: 1.0.0
tags: [tdd, testing, jest, unit-tests, integration-tests, quality, clean-code]
---

# 🧪 Melhores Práticas: Desenvolvimento Orientado a Testes (TDD)

O **Test-Driven Development (TDD)** não é apenas uma técnica de testes — é uma metodologia de **design de software** que garante código limpo, desacoplado, modular e com regressão zero.

---

## 1. O Ciclo Red-Green-Refactor

O ritmo do TDD é estruturado em micropassos de minutos:

```
      ┌──────────────┐
      │   1. RED     │  Escreva um teste que falha para um
      │              │  comportamento desejado ainda inexistente.
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │   2. GREEN   │  Escreva o código mínimo e suficiente
      │              │  apenas para fazer o teste passar.
      └──────┬───────┘
             │
             ▼
      ┌──────────────┐
      │ 3. REFACTOR  │  Melhore a estrutura, remova duplicidades e
      │              │  aprimore legibilidade mantendo os testes verdes.
      └──────┬───────┘
             │
             └────────► (Repita para o próximo requisito)
```

### Regras de Ouro de Uncle Bob para TDD:
1. Você não tem permissão para escrever nenhum código de produção a menos que seja para fazer passar um teste de unidade falho.
2. Você não tem permissão para escrever mais de um teste de unidade do que o suficiente para falhar (e não compilar é falhar).
3. Você não tem permissão para escrever mais código de produção do que o suficiente para passar no teste de unidade que está falhando.

---

## 2. Princípios F.I.R.S.T. para Testes de Excelência

Todo teste automatizado deve atender a estes cinco critérios:

- **Fast (Rápido):** Milhares de testes unitários devem rodar em poucos segundos. Se os testes forem lentos, desenvolvedores pararão de executá-los com frequência.
- **Independent (Independente / Isolado):** Nenhum teste pode depender do resultado ou do estado deixado por outro teste. Use `beforeEach` e `afterEach` para resetar o estado.
- **Repeatable (Repetível):** O teste deve produzir o mesmo resultado em qualquer máquina, em qualquer ordem, com ou sem internet.
- **Self-Validating (Auto-validável):** O teste deve passar ou falhar com um booleano claro (`expect(...).toBe(...)`). Nunca exija que o programador leia saídas de `console.log` para saber se funcionou.
- **Timely (Oportuno):** O teste é escrito **imediatamente antes** do código de produção que o faz passar, não dias depois.

---

## 3. Exemplo Prático: Implementação Guiada por TDD

### Cenário: Calcular a porcentagem de votos de uma batalha sem divisão por zero

#### Passo 1: RED (Escrever o teste que falha)
```javascript
// tests/battleCalculator.test.js
const { calculatePercentages } = require('../src/battleCalculator');

describe('calculatePercentages', () => {
  it('deve retornar 0% para ambos os lados quando não houver votos', () => {
    const result = calculatePercentages(0, 0);
    expect(result).toEqual({ percentA: 0, percentB: 0 });
  });

  it('deve calcular porcentagens inteiras proporcionais quando houver votos', () => {
    const result = calculatePercentages(3, 1);
    expect(result).toEqual({ percentA: 75, percentB: 25 });
  });
});
```
*Execução:* `npm test` -> **FALHA** (`Cannot find module '../src/battleCalculator'`).

#### Passo 2: GREEN (Código mínimo para passar)
```javascript
// src/battleCalculator.js
function calculatePercentages(votesA, votesB) {
  const total = votesA + votesB;
  if (total === 0) {
    return { percentA: 0, percentB: 0 };
  }
  const percentA = Math.round((votesA / total) * 100);
  const percentB = 100 - percentA;
  return { percentA, percentB };
}

module.exports = { calculatePercentages };
```
*Execução:* `npm test` -> **PASSOU** (2 testes verdes).

#### Passo 3: REFACTOR (Limpar e tratar tipagens sem quebrar testes)
```javascript
// src/battleCalculator.js
function calculatePercentages(votesA = 0, votesB = 0) {
  const safeA = Number(votesA) || 0;
  const safeB = Number(votesB) || 0;
  const total = safeA + safeB;

  if (total <= 0) {
    return { percentA: 0, percentB: 0 };
  }

  const percentA = Math.round((safeA / total) * 100);
  return {
    percentA,
    percentB: 100 - percentA
  };
}

module.exports = { calculatePercentages };
```
*Execução:* `npm test` -> **CONTINUA VERDE**.

---

## 4. Dublês de Teste: Mocks, Stubs, Spies e Emuladores

### 4.1 Pirâmide de Decisão para Dependências Externas
- **Lógica de Domínio Pura:** Não use mocks! Passe entradas e asserte saídas diretamente.
- **Chamadas de Rede / APIs Externas:** Use Stubs/Mocks para simular respostas de sucesso, latência e falhas (HTTP 500/timeout).
- **Banco de Dados (Firestore / SQL):**
  - **Nos testes de unidade:** Isole a lógica de negócio através de uma interface ou mock de repositório.
  - **Nos testes de integração:** Use o **Firebase Local Emulator Suite** (nunca conecte no Firestore de produção durante os testes!).

### 4.2 O Perigo do "Over-Mocking"
- **Sintoma:** O teste passa, mas quando o código vai para o ambiente real tudo quebra.
- **Causa:** O teste mockou tantas funções internas que acabou testando a estrutura do mock em vez do comportamento do software.
- **Regra:** Teste o **comportamento observável** (entradas e saídas públicas), nunca detalhes de implementação privada.

---

## 5. Como Testar Código Assíncrono e Tratamento de Erros

### 5.1 Testando Rejeições e Exceções Esperadas
```javascript
it('deve rejeitar voto duplicado de um mesmo participante na mesma rodada', async () => {
  const service = new GameService();
  await service.registerVote('user-1', 'A');

  await expect(service.registerVote('user-1', 'B'))
    .rejects
    .toThrow('Voto já registrado para este participante');
});
```

### 5.2 Evite `setTimeout` em Testes (Use Fake Timers)
Em testes que envolvem temporizadores ou contagens regressivas, use os temporizadores falsos do test runner:
```javascript
// Jest
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('deve encerrar a rodada automaticamente após 15 segundos', () => {
  const service = new GameService();
  service.startRound();
  
  // Avança o relógio instantaneamente sem pausar a CPU
  jest.advanceTimersByTime(15000);

  expect(service.getState().isRoundActive).toBe(false);
});
```

---

## 6. Antipadrões Frequentes de TDD

| Antipadrão | Descrição | Como Corrigir |
|---|---|---|
| **The Liar (O Mentiroso)** | Teste passa sem asserções válidas ou com `expect(true).toBe(true)`. | Verifique se a asserção valida diretamente o dado de saída esperado. |
| **Test-After Disfarçado** | Escrever 500 linhas de código e depois escrever os testes para cobrir. | Escreva um único teste pequeno antes de cada função/método. |
| **The Free Ride (Pegando Carona)** | Adicionar asserções de novos casos de uso em um teste existente. | Crie um novo bloco `it('...')` específico para o novo caso. |
| **Flaky Tests (Testes Intermitentes)** | Testes que passam ou falham aleatoriamente devido a concorrência ou horários. | Isole totalmente o relógio (`Date.now`), elimine I/O real e evite estado global compartilhado. |

---

## 7. Checklist de Qualidade TDD

- [ ] Todo novo método/endpoint possui ao menos um teste escrito ANTES da implementação.
- [ ] O teste falhou comprovadamente antes do código ser adicionado.
- [ ] Casos extremos cobertos: valores nulos, strings vazias, números negativos e divisão por zero.
- [ ] Não há `console.log` disperso nos testes.
- [ ] O conjunto completo de testes roda em menos de 10 segundos localmente.
- [ ] Testes de integração usam o emulador local ou containers efêmeros em vez de serviços reais em nuvem.

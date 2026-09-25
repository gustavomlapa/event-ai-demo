# Plano de Implementação: Cabo de Guerra Dinâmico, Fluxo de Energia e Conclusão Cênica

## Diagnóstico & Objetivo
A barra atual é dividida em dois blocos estáticos com uma linha branca fixa no centro (`left: 50%`), sofrendo transições CSS que podem saltar ou não transmitir a sensação de disputa ao vivo de um auditório com mais de 300 pessoas. O objetivo é transformar essa barra em uma arena visual viva:
1. **Interpolação Suave com Inércia (Lerp via `requestAnimationFrame`):** Em vez de saltos a cada polling, a barra desliza continuamente como um cabo de guerra físico com peso e inércia.
2. **Marcador de Choque Móvel (*Clash Marker*):** Um nodo de energia no ponto exato de encontro entre a Opção A e a Opção B (`left: ${percentA}%`), emitindo faíscas e pulso de contato elétrico.
3. **Fluxo de Energia Direcional ("Caminhando para um lado"):** Feixes luminosos animados dentro de cada barra (Barra A fluindo para a direita quando ganha terreno; Barra B fluindo para a esquerda quando reage), indicando quem está empurrando a disputa naquele segundo.
4. **Conclusão Cênica no Final (*REVEAL*):** Ao fechar a votação, disparo de uma onda de choque luminosa (*shockwave*), desaceleração dramática, travamento do nodo de choque na marca final e consagração do lado vencedor com pulso dourado neon e rolagem dos números finais.
5. **Atualização do `TECH_BATTLE_SPEC_PROMPT.md`:** Documentação detalhada no Design System e no Prompt Mestre.

---

## Checklist de Execução

- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, update the Design System and Master Prompt specifications with the dynamic tug-of-war physics, moving clash marker, directional energy stream, and dramatic conclusion shockwave.
- [x] In `public/css/style.css`, implement the new UI styling for the tug-of-war arena:
  - Track with subtle depth, neon border, and 25%/50%/75% reference tick notches.
  - Moving Clash Marker (`#tugClashMarker`) with electric neon core, diamond emblem, and contact spark glow.
  - Directional animated energy streams (`@keyframes energyFlowRight`, `@keyframes energyFlowLeft`).
  - Momentum states (`.pushing-a`, `.pushing-b`) that accelerate and intensify the bar's internal glow.
  - Conclusão / Victory states (`.tug-concluded`, `.winner-surge-a`, `.winner-surge-b`, `@keyframes shockwaveSweep`).
- [x] In `public/screen.html`, update the `.tug-bar-track` structure to include the traveling Clash Marker, internal energy wave overlays, and reference tick notches.
- [x] In `public/js/screen.js`, implement:
  - Physics-based smooth animation loop (`requestAnimationFrame` with lerp interpolation).
  - Momentum velocity detection (comparing current vs target percentage to activate directional push cues).
  - Dramatic conclusion sequence on `REVEAL`: victory shockwave, clash lock, and smooth number counter roll.
- [x] Run full test suite (`npm test`), verify seamless operation, and commit changes atomically with conventional prefixes.

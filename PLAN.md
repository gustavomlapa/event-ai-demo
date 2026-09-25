# Plano de Implementação: Remoção de Texturas Internas e Movimentação Suave do Raio Divisor

## Diagnóstico
1. **Texturas indesejadas:** Foram aplicadas listras diagonais animadas (`repeating-linear-gradient` com `@keyframes energyFlowRight/Left`) que poluem a barra. Devem ser removidas em favor de um gradiente clean e moderno do Google.
2. **Raio estático no meio (Causa Raiz):** O loop de animação em `public/js/screen.js` verificava `if (this.currentStatus === 'BATTLE')`, mas os status reais do sistema são `'ACTIVE'` e `'REVEAL'`. Com isso, o loop de física nunca era executado e a barra ficava permanentemente travada em 50%, impedindo o raio de se mover.

---

## Checklist de Execução

- [x] In `TECH_BATTLE_SPEC_PROMPT.md`, update Design System and Master Prompt:
  - Prohibit internal moving patterns, diagonal stripes, or noisy textures inside the bars.
  - Require clean Google solid/gradient fills.
  - Strictly specify that the dividing line and central lightning icon (`⚡`) MUST smoothly glide horizontally across the bar matching the live percentage of votes (e.g., 67% vs 33% moves the divider and ray to 67%).
  - Clarify the status checks (`ACTIVE` / `REVEAL`).
- [x] In `public/css/style.css`:
  - Remove all moving stripe gradients (`repeating-linear-gradient`), `@keyframes energyFlowRight`, and `@keyframes energyFlowLeft`.
  - Apply clean, solid modern Google gradients for Bar A and Bar B.
  - Preserve the glowing center clash marker with the lightning icon (`⚡`) that moves with `left: ${percentA}%`.
- [x] In `public/js/screen.js`:
  - Fix status check in `startAnimationLoop`: replace `'BATTLE'` with `this.currentStatus === 'ACTIVE' || this.currentStatus === 'REVEAL'`.
  - Ensure `this.applyBarPositions(percentA)` smoothly positions both bar widths and the `tugClashMarker` at the exact live percentage.
  - Verify instant fallback if no votes (50%/50% with marker centered).
- [x] Run full test suite (`npm test`), verify clean operation, and commit atomically with conventional prefixes.

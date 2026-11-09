# pausa-faixa-tecnologias

> Status: `implementada`
> Encerrada em: `2026-11-09`
> Commits: `origin/staging..fix/136-pausa-faixa-tecnologias` · PR: — · Issue: #136

## O que foi pedido

A faixa de tecnologias da Início não pausava com mouse nem foco e o teclado não chegava a ela em movimento pleno, o que falha o WCAG 2.2.2.

## O que foi feito

Hook `useHoverFocusPause` (`src/hooks/`) guarda o estado de pausa por mouse (só `pointerType` mouse) e por foco dentro da região (foco que passa para dentro dela não retoma). `StackMarquee` aplica `data-paused` só com movimento pleno e sem toque, a região ficou sempre com `tabindex="0"` e o CSS usa `animation-play-state: paused`, de modo que a faixa retoma de onde parou. A D28 foi revisada em `docs/design/decisions.md` (pausa por hover e foco; "Reduzir movimento" fica como mecanismo complementar) e `accessibility.md` e `home.md` foram alinhados. Dois E2E em `e2e/motion.spec.ts` cobrem mouse e foco; a mutação do `animation-play-state` os fez falhar.

## Notas

Palavras cortadas nas bordas da faixa ficaram fora do escopo, por decisão do PO. O lint acusa `tabIndex={0}` literal em `section`, então o valor vem de uma constante local.

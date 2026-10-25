---
name: screen-qa
description: Roteiro de QA exploratório de uma tela deste projeto no navegador (Playwright), com a matriz de combinações, o que conferir contra docs/screens/<tela>.md e o formato do relatório de bugs. Use ao testar uma tela nova ou alterada antes do PR, ou ao investigar um bug visual ou de comportamento.
---

# QA de tela

## 1. Preparação

- Leia `docs/screens/<tela>.md` (requisitos `RF-*`, estados, textos), o trecho da tela em `docs/product/accessibility.md` e as decisões `D*` citadas. Anote os requisitos que dependem de comportamento observável.
- `npm run build:fatec`, depois `npm run preview:fatec` em segundo plano (`http://localhost:4173/ra2581392423047/`). Para ver mudança de código sem build, o `npm run dev` (porta 5173) serve, mas só o build do Pages vale como veredito.
- Capturas e anotações vão para o scratchpad da sessão, nunca para o repositório.

## 2. Matriz

Combine, no mínimo: idioma (`pt-BR`, `en`, `es`) x tema (claro, escuro) x largura (320, 390, 768, 1280, 1920) x movimento (pleno, reduzido) x ponteiro (mouse, teclado, toque). Não precisa de todas as combinações: percorra todos os eixos pelo menos uma vez e as combinações de risco (escuro + reduzido, 320px + `es`, 1920px de largura e altura alta).

## 3. O que conferir em toda tela

1. **Carga:** HTML pré-renderizado correto, sem piscar, sem erro no console, sem aviso de hidratação, `<title>` e `meta description` do idioma, canônica e `hreflang`.
2. **Estados:** normal, carregando (skeleton), erro (com "Tentar novamente"), vazio, com dado longo (título e texto grandes) e com dado ausente (sem capa, sem perfil). Force erro bloqueando a requisição com `page.route`.
3. **Conteúdo:** textos e chaves nos três idiomas, sem chave crua na tela, separador `·`, voz do `CLAUDE.md` (sem emoji, sem ponto em título).
4. **Layout:** sem rolagem horizontal, sem sobreposição, sem espaço vazio estranho na primeira tela, imagens sem salto de layout (CLS), cabeçalho fixo sem cobrir foco.
5. **Interação:** hover, foco e ativo de cada controle, links levam ao destino certo e mantêm o idioma, troca de idioma e de tema preservam a posição, botão Voltar do navegador.
6. **Movimento:** com movimento pleno os efeitos existem (fade-in, hover); com reduzido nada anima; a engrenagem vale mais que o sistema.
7. **Teclado:** passada completa só com `Tab`, `Shift+Tab`, `Enter`, `Space`, setas e `Escape`; ordem igual à visual; foco visível.
8. **Sem JavaScript:** conteúdo legível; só busca, filtros, idioma, tema, galeria e modais precisam de JS (NF-CO-03).
9. **Acessibilidade:** rode o axe (skill `accessibility-audit`) em cada estado.

## 4. Do achado ao teste

Cada comportamento que deve continuar valendo vira teste em `e2e/<tema>.spec.ts` (skill `playwright-e2e`). O que é só visual (cor exata, espaçamento fino, "ficou bonito") fica no relatório como checagem do PO, com captura. Um bug confirmado ganha, quando possível, um teste que falha hoje.

## 5. Relatório

Para cada bug:

- **Título** curto, em linguagem que PO e QA entendam.
- **Severidade:** bloqueador (quebra fluxo ou acessibilidade), importante (comportamento errado com contorno), menor (detalhe visual).
- **Passos** para reproduzir, com idioma, tema, largura e movimento.
- **Esperado** (com o ID do requisito, ex.: `RF-HOME-14`) e **obtido**.
- **Evidência:** captura ou trecho do console.

Termine com: o que foi verificado (matriz percorrida), o que não foi (e por quê) e o que fica manual com o PO. Não invente bug hipotético: relate só o que reproduziu.

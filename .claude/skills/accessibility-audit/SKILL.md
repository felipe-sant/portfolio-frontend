---
name: accessibility-audit
description: Como auditar acessibilidade de uma tela neste projeto (WCAG 2.2 AA mais cinco critérios AAA) com axe, teclado, foco, movimento, alvos e zoom, e o que fica manual com o PO. Use ao testar uma tela, escrever E2E de acessibilidade ou conferir os itens A11Y-* de docs/product/accessibility.md.
---

# Auditoria de acessibilidade

A fonte é `docs/product/accessibility.md` (meta, método, checklist por tela com IDs `A11Y-*`). Esta skill diz como transformar cada item em verificação, e qual camada cobre.

## 1. Meta

WCAG 2.2 AA em todas as rotas, nos dois temas, nos três idiomas e de 320px a 1280px ou mais, mais cinco critérios AAA obrigatórios: 2.4.9 propósito do link só pelo link, 2.4.13 aparência do foco, 1.4.8 apresentação visual, 2.5.5 alvo de 44px e 2.3.3 animação por interação. Fora da meta: 1.4.6 contraste 7:1, 3.1.5, 3.1.3 e 3.1.4.

## 2. Camadas e quem cobre

| Camada           | Como                                                                                           | Quem       |
| ---------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| Lint             | `npm run lint` (`jsx-a11y`)                                                                    | automático |
| Por papel        | Testing Library `getByRole` com `name`, `user-event`, `toHaveFocus()` em `src/**/test/`        | `executor` |
| axe no jsdom     | `expectNoAxeViolations(container)` de `src/testUtils/` (sem `color-contrast`)                  | `executor` |
| E2E no navegador | `e2e/*.spec.ts` com `@axe-core/playwright` (com `color-contrast`), teclado, alvos, foco        | você (QA)  |
| Manual           | Lighthouse, axe DevTools, teclado sem mouse, NVDA e TalkBack, zoom 200% e 400%, cores forçadas | PO         |

Você cobre a camada E2E e aponta, para cada item que fica manual, o ID do `A11Y-*` e o que o PO deve olhar. Nunca declare "acessível" pela soma dos testes automáticos: leitor de tela e experiência real não são automatizáveis.

## 3. Como verificar cada grupo

- **Axe na página:** `expectNoAxeViolations(page)` nas rotas de `e2e/support/routesUnderTest.ts`, nos quatro projetos (dois temas, 390 e 1280px). Estados que mudam a tela (menu aberto, erro, vazio, carregando) pedem o axe depois de provocar o estado.
- **Landmarks e títulos (G01, L03):** um `main`, um `h1`, `banner`, `navigation` "Principal", `contentinfo`; `<title>` próprio e traduzido (`expect(page).toHaveTitle`).
- **Idioma (G02, L05, L06):** `<html lang>` igual ao idioma do caminho; trocar idioma navega para a URL equivalente, atualiza `lang` e `<title>` e devolve o foco ao seletor.
- **Teclado e foco (G05, G06, L01, L09, L13):** `Tab` em sequência confere ordem igual à visual, o pular para o conteúdo é o primeiro, o menu mobile prende o foco, `Escape` fecha e devolve o foco, e o foco nunca fica sob o cabeçalho fixo (já há roteiro em `e2e/keyboard.spec.ts`; amplie, não duplique). Contorno de foco: `outline-width` computado >= 2px.
- **Nome acessível (G07):** todo link diz o destino sozinho; o nome de "Ver projeto" leva o nome do projeto quando houver mais de um; ícone decorativo com `aria-hidden`.
- **Alvos (G08):** `boundingBox()` >= 44 de altura e largura para controles e links isolados (link dentro de texto corrido fica de fora).
- **Movimento (G12, 2.3.3):** com `reducedMotion: "reduce"` nada anima; com `no-preference` a animação existe; a escolha da engrenagem (`data-motion`) vale mais que o sistema.
- **Região rolável:** todo elemento com rolagem horizontal ou vertical própria precisa ser focável por teclado (`scrollable-region-focusable`) e rolar pelas setas.
- **Estados de carregamento e erro (G13, G14):** skeleton `aria-hidden`, status "Carregando" visualmente oculto, erro em `role="alert"` com saída.
- **Reflow (G11):** a 320px de largura (`page.setViewportSize({ width: 320, height: 800 })`) `document.documentElement.scrollWidth <= clientWidth`.
- **Texto em três idiomas (G15):** afirme nomes e textos nas três rotas.
- **Sem JavaScript:** o HTML pré-renderizado tem `main`, `h1` e o conteúdo principal legível (`javaScriptEnabled: false`).

## 4. O que fica manual (liste no relatório)

NVDA com Chrome e TalkBack (anúncios, ordem de leitura, modais, `aria-live`); zoom 200% e 400% e zoom só de texto do Firefox; espaçamento de texto (1.4.12); cores forçadas do Windows; Lighthouse e axe DevTools de apoio; teclado sem mouse numa passada completa; contraste de token novo pela fórmula da WCAG. Para cada um, diga a tela, os IDs `A11Y-*` e o que olhar.

## 5. Armadilhas

- `color-contrast` do axe fica desligada no jsdom e ligada no E2E; uma violação de contraste só aparece no navegador e pode depender do tema, então rode os quatro projetos.
- Falso positivo do axe se resolve na marcação ou no CSS, não com `disableRules`. Se acredita ser falso positivo, reporte com o ID da regra e o alvo.
- Elemento com `inert` não aparece na árvore de foco: afirme `inert` no resto da página quando o menu estiver aberto.
- Arrastar com mouse é extra: toda rolagem precisa ter equivalente sem arrasto (barra de rolagem e teclado), por WCAG 2.5.7.

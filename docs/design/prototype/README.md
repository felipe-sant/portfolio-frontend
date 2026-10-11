# Protótipo navegável

Referência visual do portfólio validada pelo PO em 11-10-2026, feita no Claude Design. É o "figma"
das specs de tela: cobre as sete telas em 360, 390, 768 e 1280px, nos temas claro e escuro, com os
estados de carregando, vazio, erro, enviando e enviado.

É referência, não código: a interface é recriada em React, com os tokens de
`src/styles/global.css` e as convenções do `.claude/CLAUDE.md`. Não copie `support.js`, o HTML dos
`.dc.html` nem a pasta `tokens/`.

## Como abrir

1. Rode `npm run dev` na raiz do repositório.
2. Abra `http://localhost:5173/docs/design/prototype/prototipo-indice.dc.html`.

O índice leva a todas as telas e a cada estado.

- Abrir o arquivo com duplo clique não funciona: o `support.js` busca os componentes `Proto*` por
  `fetch` relativo, e o navegador bloqueia `fetch` em `file://`. O protótipo precisa de servidor
  HTTP, e o dev server do repositório serve a raiz do projeto e `public/` em `/`.
- Precisa de internet: o `support.js` carrega React 18, ReactDOM e Babel standalone de
  `https://unpkg.com/`. As fontes não saem da máquina (ver "Fontes").

## Telas

| Arquivo                         | Tela                                         |
| ------------------------------- | -------------------------------------------- |
| `prototipo-indice.dc.html`      | Índice, com link para cada tela e estado     |
| `prototipo-inicio.dc.html`      | Início                                       |
| `prototipo-projetos.dc.html`    | Projetos                                     |
| `prototipo-projeto.dc.html`     | Detalhe de projeto                           |
| `prototipo-informacoes.dc.html` | Informações                                  |
| `prototipo-contato.dc.html`     | Contato                                      |
| `prototipo-404.dc.html`         | Página não encontrada                        |
| `prototipo-erro.dc.html`        | Erro genérico                                |
| `prototipo-decisoes.dc.html`    | Decisões tomadas no protótipo                |
| `prototipo-verificacao.dc.html` | Verificação automática de layout e contraste |

## Componentes compartilhados

- `ProtoHeader.dc.html`: cabeçalho, menu mobile, seletor de idioma e alternador de tema.
- `ProtoFooter.dc.html`: rodapé padrão e a variação de navegação usada em Contato.
- `ProtoEstados.dc.html`: seletor de estado no canto inferior direito. É ferramenta do protótipo,
  não faz parte do produto.

## Estados e tema

O estado de cada tela é escolhido por `?estado=` na URL ou pelo `ProtoEstados`:

| Tela        | Estados                                 |
| ----------- | --------------------------------------- |
| Início      | `normal`, `carregando`, `erro`          |
| Projetos    | `normal`, `carregando`, `vazio`, `erro` |
| Projeto     | `normal`, `carregando`, `erro`          |
| Informações | `normal`, `carregando`                  |
| Contato     | `normal`, `erro`, `enviando`, `enviado` |

`?tema=dark` força o tema escuro, por exemplo
`prototipo-inicio.dc.html?estado=carregando&tema=dark`. O botão de tema do cabeçalho vale para
todas as páginas.

## Decisões e verificação

- As decisões tomadas no protótipo estão em `prototipo-decisoes.dc.html` e foram transcritas para
  [`../decisions.md`](../decisions.md), que prevalece sobre o protótipo quando os dois divergem.
- `prototipo-verificacao.dc.html` roda a varredura de layout e contraste que o protótipo usou; o
  que ela não cobriu está nas pendências PI2 e PI3 de `decisions.md`.

## Tokens

`styles.css` e `tokens/` são o CSS do protótipo. Eles só diferem de `src/styles/global.css` no que
a tabela "Divergências entre os tokens do protótipo e `global.css`" de `decisions.md` registra; o
código usa `global.css`.

## Fontes

`tokens/fonts.css` foi convertido: em vez do `@import` do Google Fonts, declara os mesmos
`@font-face` de `src/styles/global.css`, apontando para os `woff2` de `public/fonts/`
(`/fonts/<arquivo>.woff2`). Nenhuma requisição vai a serviço de fonte.

## Formatação

A pasta está no `.prettierignore` e no `ignorePatterns` do `.oxlintrc.json`: o export entra como
saiu do Claude Design, e só este README e `tokens/fonts.css` foram escritos no repositório.

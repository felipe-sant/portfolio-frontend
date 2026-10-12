# Design system

Resumo do design system do portfólio, para consulta rápida durante o desenvolvimento. O ponto de
partida é o handoff de design em `/home/felipe/faculdade/design_handoff_portfolio` (requisito R3), e
a referência visual validada pelo PO é o [protótipo navegável](prototype/README.md), com as sete
telas, os estados e os dois temas.

Onde as fontes divergem, vale esta ordem: convenções do repositório (`.claude/CLAUDE.md`), depois
[`decisions.md`](decisions.md), depois o protótipo, depois o handoff. Valor que não está em nenhum
deles sai do handoff.

| Arquivo do handoff      | O que tem                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `README.md`             | Handoff completo: tokens, telas, estados, voz, assets, acessibilidade e pendências   |
| `design-system.md`      | Origem, marca, fundamentos de conteúdo e visuais, iconografia e índice               |
| `tokens/*.css`          | Os tokens em CSS: `colors`, `fonts`, `typography`, `spacing`, `shape`, `motion`, ... |
| `components/`           | Componentes React de referência (`.jsx`, `.d.ts` e `.prompt.md` de cada um)          |
| `Design System.dc.html` | Prancha onde cada token foi decidido com o autor                                     |

No código, os tokens vivem em `src/styles/global.css`, com os mesmos nomes dos `tokens/` do
handoff. CSS Module lê esses tokens (de preferência os papéis semânticos) em vez de valor
hardcoded; token novo entra lá.

## Cores

### Escalas

- **Neutra clara, quente:** `--neutral-900` (`#202020`, todo texto forte e as faixas escuras) até
  `--neutral-050` (`#FBF9F5`, fundo de página), passando por `--neutral-700` (texto secundário),
  `--neutral-600` (rótulos), `--neutral-300` (borda forte), `--neutral-200` (divisor),
  `--neutral-150` (placeholder de imagem) e `--neutral-100` (superfície elevada).
- **Escura, também quente** (não cinza-azulada): `--dark-bg` (`#191919`, página), `--dark-raised`,
  `--dark-raised-2`, `--dark-border`, `--dark-400` (rótulos), `--dark-300`, `--dark-200` (corpo) e
  `--dark-050` (`#F2EEE7`, texto forte).
- **Sem `#fff` em nenhum ponto.** Branco puro foi rejeitado pelo autor por cansar a vista.

Cabeçalho e rodapé leem `--surface-chrome` (fundo) e `--border-chrome` (borda), que no tema claro
apontam para `--bg-page` e `--border-subtle` e no escuro valem `#141210` (um passo abaixo de
`--dark-bg`) e `#2C2925`. Os dois tokens substituem os hex soltos do handoff e entram em
`global.css` com a spec de cabeçalho e rodapé (D04).

### Marca

Um único acento, o âmbar: `--brand-primary` (`#FFCC00`), `--brand-variant` (`#F19100`),
`--brand-deep` (`#8A5A00`, link em tema claro), `--brand-wash` e `--brand-wash-dark` (destaque
suave) e `--brand-ink` (`#202020`, texto sobre o degradê). Os valores de marca não mudam entre
temas.

### Degradê e regra de uso

`--brand-gradient` (`linear-gradient(180deg, var(--brand-primary), var(--brand-variant))`) é a
assinatura visual.

- Sempre 180°, vertical de cima para baixo, idêntico nos dois temas.
- Texto sobre ele é sempre `--brand-ink`.
- É cor de **ação** (botão primário, badge de destaque), não de superfície: fundo de bloco inteiro
  deixa a ação sem para onde ir.
- O único uso horizontal é a borda superior de 2px do rodapé, uma linha
  (`border-image: linear-gradient(90deg, ...) 1`), não um preenchimento.
- No hover o degradê não muda; `--brand-variant` cobre o caso de fundo sólido.

### Papéis semânticos

Componentes leem só papéis, nunca hex direto. Exceção: marquee e rodapé, escuros de propósito nos
dois temas.

| Grupo      | Tokens                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| Fundo      | `--bg-page`, `--bg-raised`, `--bg-placeholder`, `--bg-highlight`                                            |
| Borda      | `--border-subtle`, `--border-strong`                                                                        |
| Texto      | `--text-strong`, `--text-body`, `--text-weak`, `--text-label`, `--text-link`                                |
| Sobreposto | `--overlay`, `--skeleton-base`, `--skeleton-sheen`, `--shadow-modal`                                        |
| Feedback   | `--success-surface`/`--success-ink`, `--warning-surface`/`--warning-ink`, `--danger-surface`/`--danger-ink` |

O link é `--brand-deep` no tema claro (o âmbar puro não passa contraste como texto corrido) e
`--brand-primary` no escuro, ambos via `--text-link`.

### Feedback semântico (`--success-*`, `--warning-*`, `--danger-*`)

Duas cores por tom, superfície suave e tinta saturada, que não competem com o âmbar:
`--success-bg`/`--success-text`, `--warning-bg`/`--warning-text` e `--danger-bg`/`--danger-text`,
com as variantes `*-dark` para o tema escuro. Os papéis `--*-surface` e `--*-ink` apontam para a
variante do tema ativo. Usos previstos no handoff: badge de disponibilidade e indicador "Atual"
(success), contador de caracteres do formulário de contato abaixo de 60 (`--warning-ink`), borda
de campo com erro (`--danger-ink`) e banner de falha de envio (danger), pelos componentes `Badge`
e `Banner` de `components/feedback/`.

A paleta semântica fica, e erro de campo usa `--danger-ink` na borda e na mensagem, com
`aria-invalid` e `aria-describedby`, não o `--brand-variant`/`--brand-deep` do `TextField` do
handoff (D07).

O repositório usa o prefixo `--danger-*`, igual ao handoff (o nome antigo `--error-*` saiu).

## Tipografia

### Famílias

| Token            | Família             | Uso                                                                |
| ---------------- | ------------------- | ------------------------------------------------------------------ |
| `--font-heading` | Bricolage Grotesque | Títulos (grotesca de eixo variável, personalidade em corpo grande) |
| `--font-body`    | IBM Plex Sans       | Corpo, botões, campos, legendas                                    |
| `--font-mono`    | IBM Plex Mono       | Rótulos de seção, chips de tecnologia, valores tabulares, datas    |

Pesos carregados: Bricolage Grotesque 400–800 (variável), IBM Plex Sans 400/500/600/700 e IBM Plex
Mono 400/500 (`--weight-regular` a `--weight-black`). Os pesos sem uso saem depois da última tela da
v1, antes da primeira entrega na `main`, pelo método registrado em `decisions.md` (D08).

### Escala

Base `1rem = 16px`, razão ~1.25, tudo em rem. Os três níveis maiores são fluidos com `clamp()`;
do `h3` para baixo são fixos.

| Token             | Tamanho                        | Altura de linha | Espaçamento    |
| ----------------- | ------------------------------ | --------------- | -------------- |
| `--text-display`  | `clamp(2.5rem, 6vw, 3.5rem)`   | `--lh-display`  | `--ls-display` |
| `--text-h1`       | `clamp(1.875rem, 4vw, 2.5rem)` | `--lh-h1`       | `--ls-h1`      |
| `--text-h2`       | `clamp(1.5rem, 3vw, 1.75rem)`  | `--lh-h2`       | `--ls-h2`      |
| `--text-h3`       | `1.25rem`                      | `--lh-h3`       | `--ls-h3`      |
| `--text-h4`       | `1rem`                         | `--lh-h4`       |                |
| `--text-body-lg`  | `1.125rem`                     | `--lh-body`     |                |
| `--text-body-md`  | `1rem`                         | `--lh-body`     |                |
| `--text-body-sm`  | `0.875rem`                     | `--lh-tight`    |                |
| `--text-caption`  | `0.8125rem`                    |                 |                |
| `--text-label-sm` | `0.75rem`                      |                 | `--ls-label`   |
| `--text-chip`     | `0.6875rem`                    |                 |                |

Títulos levam `letter-spacing` negativo; rótulos em mono, positivo (`--ls-label` 0.08em,
`--ls-label-wide` 0.1em). Todo parágrafo é limitado a `--measure` (34rem) e usa
`text-wrap: pretty`.

## Espaço e forma

- Passo de `0.25rem`: `--space-1` a `--space-16`.
- Padding responsivo por `clamp()`, não por breakpoint: `--pad-page`, `--pad-card`; controles com
  `--pad-control-y`/`--pad-control-x`. Contêiner máximo `--container-max` (`73.75rem`).
- **Um único raio**, `--radius` (`0.3rem`), em botões, campos, cards, imagens, chips e modais.
  Chips, badges, botões e campos usam `--radius`; círculo só no indicador de status, e não há
  avatar nesta versão. `--radius-pill` fica em `global.css` sem uso, e usá-lo exige revisar a
  decisão (D11).
- Bordas `--border-width` (1px) e `--border-width-active` (2px).
- Grade de projetos com colunas de no mínimo 18rem preenchendo o espaço: 1 coluna em 360/390px, 2
  em 768px e 3 em 1280px (D17).
- Toda imagem de projeto é 16:9 (`--ratio-media`), inclusive miniaturas de galeria. Placeholder de
  imagem é `--bg-placeholder` com borda de 1px, sem ícone nem texto dentro, em 16:9 e 1:1 (foto)
  só para projeto sem captura; capturas e foto reais entram na v1 (D26, que substitui D03).
- Ritmo de página vem de alternar bloco claro (`--bg-page`) e faixa escura (`--neutral-900`:
  marquee, complementos, rodapé), não de mudar cor de card. Uma faixa de marquee por página, no
  máximo.

## Elevação

O sistema é **desenhado com linha, não com sombra**.

- Repouso: 1px em `--border-subtle`; controle secundário: 1px em `--border-strong`; campo de texto:
  1px em `--border-control` (D29).
- Ativo/selecionado: 2px em `--brand-variant` (aba ativa, miniatura ativa, item de nav ativo).
- Hover de item de trajetória: 1px em `--text-strong`.
- Foco visível: contorno de 2px em `--focus-ring` (ver "Estados", D23 com a cor de D27).
- Tracejado marca o que **não** é conteúdo real: estado vazio e bloco informativo.
- Sombra só no modal (`--shadow-modal`). Card não tem sombra; nenhuma superfície tem blur ou
  gradiente de proteção.

## Movimento

Discreto e curto: `--ease` (`cubic-bezier(0.2, 0, 0.2, 1)`) com `--dur-fast` (120ms),
`--dur-base` (180ms, transição de cor, borda, fundo e transform) e `--dur-slow` (320ms). Animações
contínuas: `--dur-shimmer` (1.4s, skeleton), `--dur-spin` (700ms, spinner) e `--dur-marquee`
(22s, faixa de stack). Nada de bounce, entrada em escala ou parallax. A faixa de stack tem botão de
pausa (D28).

`prefers-reduced-motion: reduce` desliga tudo. No `global.css` isso zera os tokens de duração e
encurta animação e transição em `*`, `*::before` e `*::after`; a faixa de stack vira lista estática
(D28). Os keyframes do handoff (`ds-shimmer`, `ds-spin`, `ds-marquee`) ainda não existem no código:
entram no CSS Module do componente que os usar.

## Estados

| Estado                    | Tratamento                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hover em card             | `transform: translateY(-3px)`                                                                                   |
| Hover em item de lista    | Borda para `--text-strong`, fundo para `--bg-raised`, revela "Ver detalhes →"                                   |
| Hover em botão secundário | Borda para `--text-strong`                                                                                      |
| Hover em link de lista    | `padding-left` +0.375rem, texto para `--text-link`                                                              |
| Foco visível              | Contorno 2px `--focus-ring`, afastamento 2px, `--radius`, em todo `:focus-visible`, inclusive campos (D23, D27) |
| Ativo/selecionado         | 2px em `--brand-variant`                                                                                        |
| Desabilitado              | `opacity: 0.5`, `cursor: not-allowed`, sem trocar a cor                                                         |
| Carregando conteúdo       | Skeleton com shimmer, na forma do conteúdo real, `aria-hidden="true"`                                           |
| Carregando ação           | Spinner dentro do botão, `aria-busy`                                                                            |
| Toque                     | Alvo mínimo `--hit-min` (`2.75rem`) em contexto mobile                                                          |

Skeleton e spinner nunca no mesmo bloco: skeleton é para conteúdo que vai aparecer, spinner para
ação em curso.

## Voz e copy

Texto em primeira pessoa do singular, direto e sem autopromoção; o visitante é tratado por você.
O handoff escreve em português do Brasil, que é a língua de referência do repositório; `en` e `es`
seguem as mesmas regras (requisito R2).

- **Caixa:** frases em caixa normal. Caixa alta só em rótulo de seção e de campo, em
  `--font-mono` com `--ls-label`/`--ls-label-wide`. Nome de tecnologia mantém a grafia oficial
  (`TypeScript`).
- **Títulos:** substantivos curtos, sem verbo e sem ponto final ("Projetos", "Sobre mim"). A única
  frase completa em corpo grande é a chamada do Início, "Desenvolvedor full stack em TypeScript",
  também sem ponto (D24).
- **Botões:** verbo no infinitivo + objeto ("Ver projetos", "Baixar CV"); nunca "Clique aqui" nem
  "Saiba mais".
- **Links de continuação:** rótulo curto + flecha ("Ver todos →"). Voltar sempre nomeia o destino
  ("← Voltar para Projetos").
- **Datas:** `MM/AAAA`; período fechado com travessão espaçado (`06/2024 — 05/2026`), aberto com
  "desde" (`desde 06/2026`). "Atual" é badge, nunca valor de campo.
- **Metadados:** separador `·` (ponto médio com espaços).
- **Estado vazio e erro:** dizem o que aconteceu e oferecem a saída.
- **Sem emoji**, em lugar nenhum. **Sem superlativo nem jargão de vaga**: diferencial aparece como
  fato, não como adjetivo.

## Ícones

SVG inline traçado, no vocabulário do Lucide: `viewBox="0 0 24 24"`, `fill="none"`,
`stroke="currentColor"`, `stroke-linecap="round"`, traço de 2 a 2.4 e tamanho de 12 a 20px (D15). O
inventário é fechado (lupa, ×, chevrons, download, hambúrguer, lua, sol, arco de spinner, pin,
check, alerta, GitHub, LinkedIn, envelope, arquivo, lupa com mais, pausa e play da faixa de stack
(D28) e a estrela preenchida, único ícone com `fill`, que marca projeto em destaque). Setas no texto
são caracteres unicode (`→ ← ↗ ↓ ▾`), não ícones.

A recomendação do handoff é trocar por `lucide-react` e usar um pacote de marcas (ou os SVGs
oficiais) para GitHub e LinkedIn. Nada disso está instalado ainda: entra com o primeiro componente
que precisar de ícone.

## Acessibilidade

O requisito de acessibilidade (meta WCAG 2.2 AA, método de verificação, regras e checklist por
tela) está em [`accessibility.md`](../product/accessibility.md). Esta seção resume o que o handoff
e o protótipo já trazem.

Já resolvido nos protótipos do handoff, a manter na implementação:

- Contraste de texto ≥ 4.5:1 nos dois temas. `--text-label` e `--text-weak` foram escurecidos para
  isso (`#635F5A` e `#4A4643` no claro); não clareie de volta.
- Botão só de ícone tem `aria-label`; alternador de tema tem `aria-pressed`; botão carregando tem
  `aria-busy`; skeleton tem `aria-hidden="true"`.
- Modal tem `role="dialog"` e `aria-modal="true"` e fecha por Esc.
- Abas usam `role="tablist"`/`role="tab"` com `aria-selected`. Os documentos do projeto são exceção: têm endereço próprio e viram navegação com links (D33, ver `docs/product/accessibility.md`).
- Miniatura de galeria tem `aria-label` com a posição ("Imagem 2 de 5") e `aria-current`.
- Alvo de toque de `--hit-min` em contexto mobile.

Falta fazer, segundo o handoff e o protótipo: armadilha de foco nos modais e no menu, devolução do
foco ao elemento de origem ao fechar (PI1) e `aria-live` para anunciar resultado de busca e
confirmação do formulário. A varredura de contraste do protótipo não foi rodada de novo depois da
última correção (PI2) e não cobriu 390px, os estados além do normal nem o degradê com precisão
(PI3). No repositório, `jsx-a11y` (oxlint) cobre o básico mecanicamente; o restante é revisão.

## Responsividade

Nada de largura fixa em px fora das imagens; tipografia e padding usam `clamp()` e respondem de
forma contínua entre as quebras.

| Quebra                     | O que muda                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 900–980px (varia por tela) | Aside do projeto perde o sticky e desce (980px); grids de duas colunas viram uma; grade de projetos vai para duas colunas; complementos empilham                              |
| 640px                      | Nav do cabeçalho vira botão de menu; grade de projetos vira uma coluna; destaques empilham com a imagem primeiro; miniaturas vão para três colunas; rodapé empilha à esquerda |

Por tela, além das quebras:

- **Menu mobile (D01):** abaixo de 640px, botão de 44px que abre painel em largura total abaixo do
  cabeçalho, com links em coluna de 52px, seletor de idioma e alternador de tema; fecha por Esc,
  link, botão ou ao alargar, e trava a rolagem da página.
- **Filtros (D16):** no mobile, linha com rolagem horizontal encostando na borda, sem modal de
  filtros.
- **Galeria (D18):** no mobile, miniaturas em linha rolável de 6.5rem; no desktop, cinco colunas.
- **Ficha técnica (D19):** abaixo de 980px, entre a galeria e a documentação, em grade de pares e
  sem sticky.
- **Trajetória (D20):** no mobile o período quebra para baixo do título; modal em tela cheia abaixo
  de 640px.
- **Contato (D21):** duas colunas a partir de 900px; abaixo, os canais descem para depois do
  formulário, separados por uma linha.

## Logo

O gato ao lado do nome "Luiz Felipe dos Santos" (Bricolage 700), em SVG inline com corpo em
`--neutral-500` e detalhe em `--text-strong` nos dois temas, sem o placeholder tracejado do handoff.
SVGs-fonte em [`assets/logo/`](assets/logo/); contraste em `decisions.md` (D02) e
favicon em `decisions.md` (D34).

## Divergências adotadas pelo repositório

As convenções do repositório prevalecem onde divergem do handoff (R3):

| Handoff                                                    | Repositório                                                                                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Fontes do Google Fonts por `@import` em `tokens/fonts.css` | Fontes self-hospedadas: `woff2` e licença em `public/fonts/`, `@font-face` em `src/styles/global.css` e `preload` no `index.html` (D09) |
| Classes globais `.ds-*` e regras de `tokens/layout.css`    | CSS Module por página (`src/styles/pages/`) e componente (`src/styles/components/`), com as media queries no próprio módulo             |
| Tema por `data-theme="dark"` na raiz, com persistência     | Tema por `@media (prefers-color-scheme: dark)` em `global.css` até a spec de tema, que liga `data-theme` com persistência (D22)         |
| `tokens/*.css` e `components/*.jsx` com comentários        | Código sem comentários                                                                                                                  |
| Componentes React em JSX                                   | Recriados em TypeScript, com texto de UI por chave de tradução nos três idiomas                                                         |

## Decisões de design

As pendências e contradições do handoff estão decididas e registradas em
[`decisions.md`](decisions.md), com opções, fonte e data. Só falta material do PO: os PDFs de CV
por idioma, que deixam D14 `bloqueada`.

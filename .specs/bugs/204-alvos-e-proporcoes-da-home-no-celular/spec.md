# Spec: alvos e proporções da home no celular

> **Tipo:** `bug` <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#204, #205` <br />
> **Criado em:** `11-11-2026`

## Problema

A auditoria de SEO de 10/11/2026 (claude-seo em felipe-sant.vercel.app) apontou três falhas no celular. As duas issues
saem num só PR.

1. **#204, alvo dos links de projeto da home.** O link de título de cada destaque da Início (`.link` em
   `src/styles/components/featuredProject.module.css`, usado em `src/components/FeaturedProject.tsx`) tem 28 px de altura
   a 375 px (36 px no desktop), abaixo do alvo mínimo de 44 px (`--hit-min`, `A11Y-G08`, WCAG 2.5.5). É o mesmo defeito que
   a #137 corrigiu no link de título dos cartões de Projetos (`src/styles/components/projectCard.module.css`, regra `.link`).
2. **#205, parte 1, proporção das imagens da home.** A auditoria diz que as capas declaram 989×556 e o arquivo tem
   960×520. **Isso já está atendido no código atual** (ver "Evidência da #205, parte 1"): a auditoria leu um deploy antigo.
   Falta só um E2E que trave a proporção 16:9 da capa renderizada.
3. **#205, parte 2, filtros de Projetos abaixo de 640 px.** A linha de filtros de tipo e categoria passa da borda da tela e
   o último chip visível aparece cortado sem nenhum sinal de que a fila rola.

O alvo pequeno dificulta o toque, e o corte seco dos chips esconde filtros do visitante de celular.

### Evidência da #205, parte 1

- As dimensões em `public/content/{pt-BR,en,es}/projects.json` batem com os arquivos. Capas (primeira imagem) dos
  destaques, `large` e `small`: Maps 960×540 e 640×360; MNIST Classifier 720×405 e 640×360; Player Profile Clustering
  989×556 e 640×360. O arquivo de 989×556 tem de fato 989×556, e nenhum arquivo tem 960×520.
- `src/services/content/validation/validateImages.ts` rejeita divergência entre a dimensão declarada e o arquivo e exige
  16:9 com `RATIO_TOLERANCE = 0.01` sobre `width / height` (989/556 ≈ 1,7788, dentro da tolerância).
- `.image` em `featuredProject.module.css` já tem `aspect-ratio: var(--ratio-media)` (16 / 9), `height: auto` e
  `object-fit: cover`, e o `<img>` declara `width`/`height` da variante `large` (`RF-HOME-21`, `NF-DE-16`).
- `projects.json` não é editado nesta spec.

## Objetivo

- O link de título de cada destaque da Início tem ao menos 44 px de altura em qualquer largura, sem mudar a altura da linha
  do título nem o layout visível (`RF-HOME-19`, `A11Y-G08`).
- Um E2E garante que a capa de cada destaque é renderizada em 16:9 (`RF-HOME-21`, `NF-DE-16`).
- Abaixo de 640 px, a linha de filtros de Projetos indica que rola, com um esmaecimento nas bordas, sem quebrar a linha única
  de `RF-PROJECTS-08` e sem rolagem horizontal da página (decisão nova `D70`, sujeita ao PO, ver "Questões em aberto").

## Fora de escopo

- Editar `public/content/*/projects.json` ou as imagens.
- Quebrar a linha de filtros abaixo de 640 px (alternativa à recomendação; ver "Questões em aberto").
- O botão "Filtros" e o modal de tecnologia e ano (`RF-PROJECTS-28` a `RF-PROJECTS-30`).
- A imagem do Maps e a altura do bloco em Contato (#139).
- Qualquer texto de UI: a spec não cria nem altera chave de tradução (R2 não se aplica).
- Testes Vitest: a mudança é só de CSS (aparência não entra em TDD); a cobertura é E2E, escrita pelo `qa`.

## Tela

Sim. Início (`/pt-BR`, `/en`, `/es`) e Projetos (`/pt-BR/projects` e equivalentes). O `qa` se aplica.

## Critérios de aceite

Larguras 320, 375 e 768 px entram por `page.setViewportSize` dentro do teste (os projetos do Playwright são 390 e 1280 px,
nos dois temas).

### #204, alvo do link de título da home

- [ ] **CA1** (`RF-HOME-19`, `A11Y-G08`) — Em 320, 375 e 768 px, e nos projetos de 390 e 1280 px, a caixa do próprio `<a>` de
      título de cada destaque da Início (não a área do `::after`) tem `boundingBox().height ≥ 44`; hoje mede 28 px no
      celular e 36 px no desktop.
- [ ] **CA2** (`RF-HOME-19`, `A11Y-G08`) — Em 320 px, para cada destaque, a altura do `h3` difere em no máximo 1 px da altura
      do texto do link (medida por `Range` sobre o conteúdo do link, como em `e2e/projects.spec.ts`, teste
      "o alvo de 44px do título ... não muda a altura da linha do título"). O caso de duas linhas é previsto no destaque "Player
      Profile Clustering" a 320 px (estimativa, não medida); se ele quebrar, o teste afirma a quebra como pré-condição
      (altura do texto maior que 40 px) antes de comparar; se não quebrar, a comparação vale para todos os destaques e o caso
      de duas linhas fica só na verificação manual (T6 de `tasks.md`).
- [ ] **CA3** (`RF-HOME-19`) — O destaque continua com um único link, no título, e o item inteiro continua clicável
      (`.link::after` mantido); os E2E existentes de `RF-HOME-19` em `e2e/home.spec.ts` e `e2e/home-flows.spec.ts` seguem
      verdes.
- [ ] **CA4** (`A11Y-G06`) — O contorno de foco do link fica em volta do alvo de 44 px com `outline-offset: 0.25rem`, igual
      ao `projectCard`, e não é cortado (verificação manual por Tab).

### #205, parte 1, proporção das capas

- [ ] **CA5** (`RF-HOME-21`, `NF-DE-16`) — Em cada idioma, para cada destaque, depois de a imagem carregar:
    - a caixa renderizada do `<img>` tem `altura` igual a `largura × 9 / 16` com tolerância de 1 px;
    - `naturalWidth / naturalHeight` difere de 16/9 em no máximo 0,01 (a `RATIO_TOLERANCE` de `validateImages.ts`), qualquer
      que seja a variante escolhida pelo `srcset`;
    - os atributos `width` e `height` do `<img>` têm razão 16/9 com a mesma tolerância.
      O teste não compara `naturalWidth` com o `width` declarado, porque o `srcset` pode servir a variante `small`.

### #205, parte 2, filtros de Projetos

- [ ] **CA6** (`RF-PROJECTS-08`, `D70`) — Abaixo de 640 px, `getComputedStyle(linha).maskImage` contém `linear-gradient`; a partir de 640 px é `none`.
- [ ] **CA6b** (`A11Y-G06`, `D70`) — Abaixo de 640 px, cada chip focado por Tab fica inteiro dentro da área de conteúdo da
      linha: `box.x ≥ linha.x + paddingLeft − 1` e `box.x + box.width ≤ linha.x + linha.width − paddingRight + 1` (padding lido
      por `getComputedStyle`). Como o esmaecimento termina antes do padding, o anel de foco do chip focado fica fora dele.
- [ ] **CA7** (`RF-PROJECTS-08`, `NF-RE-04`) — Os E2E atuais da linha de filtros seguem verdes sem alteração: linha única que
      rola sem barra e encosta nas bordas, Tab alcança todos os botões e o botão focado fica dentro da linha com folga de
      4 px para o contorno, e a partir de 640 px a linha não rola.
- [ ] **CA8** (`NF-RE-03`) — Em 320, 375, 390 e 768 px, a Início e Projetos não rolam na horizontal
      (`document.documentElement.scrollWidth ≤ clientWidth`).
- [ ] **CA9** (`RF-PROJECTS-08`, `A11Y-G06`, manual) — Em 320 e 375 px, nos dois temas: com a rolagem no início, o primeiro
      chip aparece inteiro e sem esmaecimento e o fim da linha esmaece; no fim da rolagem, o inverso; no meio, as duas bordas
      esmaecem; o chip da borda focado por Tab tem o anel de foco inteiro e opaco.

### Verificação manual do PO

- [ ] **CA10** — Início e Projetos em 320, 375, 390 e 768 px, nos temas claro e escuro: o título do destaque não mudou de
      posição nem de espaçamento em relação à `staging` (uma e duas linhas), o foco por Tab no título mostra o anel em volta
      do alvo, as capas aparecem em 16:9 e a linha de filtros esmaece como em CA9.

## Estratégia de validação

- **Checagens automatizadas:** E2E em `e2e/home.spec.ts` (CA1, CA2, CA5, CA8 da Início) e `e2e/projects.spec.ts` (CA6,
  CA6b, CA8 de Projetos), escritos pelo `qa`; os E2E existentes cobrem CA3 e CA7. Nenhum spec novo de `e2e/`, então
  `e2e/support/specClassification.ts` não muda. Gate final: `npm run build && npm run test:cov`; E2E com
  `npm run build:fatec && npm run test:e2e -- e2e/home.spec.ts e2e/projects.spec.ts`.
- **Checagens manuais:** CA4, CA9 e CA10, com a aplicação em `npm run dev`.
- **Rollback / mitigação:** as mudanças são três regras de CSS independentes; reverter o commit da regra que falhar.

## Questões em aberto

- **Decisão do PO: indicar que rola (recomendado) ou quebrar linha.** A #205 aceita as duas.
    - **Indicar que rola (recomendado, é o que `tasks.md` planeja):** `mask-image` com gradiente nas duas bordas de
      `.filters`, só abaixo de 640 px. Mantém `RF-PROJECTS-08`, `D16`/`D62` (linha única, tipo e categoria sempre visíveis,
      encostando na borda) e todos os E2E atuais. Não depende de cor, então vale nos dois temas. Vira a decisão `D70`.
    - **Quebrar linha:** contraria `RF-PROJECTS-08` ("abaixo de 640px é uma linha só com rolagem horizontal"), `D16` e
      `D62`. Exige reescrever esse requisito e as decisões, e trocar os E2E de `e2e/projects.spec.ts` "abaixo de 640px a
      linha de filtros é uma só, rola na horizontal sem barra..." (afirma um único `top` e `scrollWidth > clientWidth`),
      "abaixo de 640px o Tab alcança todos os botões..." e "abaixo de 640px o botão focado pelo Tab fica dentro da
      linha...". Se o PO escolher esta, a spec volta ao `sdd` para replanejar a parte 2.
- **Como a decisão chega:** aprovar a spec como está (status `aprovada`) equivale a escolher "indicar que rola". Para
  escolher "quebrar linha", o PO devolve a spec ao `sdd` em vez de aprovar.
- **Largura do esmaecimento.** Recomendado `calc(var(--pad-page) - var(--space-1))`: em 320 e 375 px, `--pad-page` é 20 px,
  então o esmaecimento tem 16 px. O PO confirma na verificação manual se 16 px é perceptível; se não for, a alternativa é
  aumentar a largura aceitando esmaecer a borda do primeiro e do último chip nas pontas da rolagem.

## Riscos

- **Anel de foco sob a máscara.** O alcance do contorno é 4 px (2 px de `outline` + 2 px de `outline-offset` globais). Hipótese: o
  `scroll-padding-inline: var(--pad-page)` põe o chip focado a pelo menos `--pad-page` da borda, então o anel começa a
  `--pad-page - 4px` ou mais para dentro e, com o esmaecimento terminando opaco em `--pad-page - var(--space-1)`, fica todo
  opaco. O E2E de foco existente só exige 4 px de folga em relação à caixa da linha, o que não basta; CA6b confirma a
  hipótese pela geometria, e CA9 confere a opacidade à mão.
- **Esmaecimento curto em 320 px.** 16 px pode passar despercebido (ver "Questões em aberto").
- **Alvo do título invadindo vizinhos.** O `padding-block` do link cresce (44 px − 1lh) / 2 para cima e para baixo, sobre a
  linha de metadados e o resumo, compensado por `margin-block` negativa. Esses vizinhos não são interativos e ficam dentro
  do mesmo `article`, cuja área já é do link por `.link::after`, então não há conflito de toque.
- **Recorte de descendentes pela máscara.** `mask-image` recorta toda a pintura dentro de `.filters`. Lá só ficam os dois
  `FilterGroup` e o separador (`src/pages/Projects.page.tsx`); o botão "Filtros" fica em `.controls` e o
  `ProjectsFiltersModal` é renderizado fora da linha, então nada posicionado é recortado.
- **Rolagem horizontal da página.** A máscara não altera caixa; o padding do link é vertical. CA8 cobre.

## Notas / decisões

- **Desvio do briefing:** o pedido citava `RF-HOME-22`, mas esse requisito trata das saídas ("Ver todos os projetos" e "Ler
  sobre mim"). O link de título do destaque é `RF-HOME-19`, e o alvo de 44 px vem de `A11Y-G08`; a spec usa esses IDs.
- **#204, regra do link** (reaproveita a #137, `projectCard.module.css`): `.link` ganha `display: inline-flex`,
  `align-items: center`, `padding-block: calc((var(--hit-min) - 1lh) / 2)` e `margin-block: calc((var(--hit-min) - 1lh) / -2)`;
  `.link:focus-visible` passa de `outline-offset: 0.5rem` para `0.25rem`. O `h3` (`.title`) não muda. Como o `inline-flex`
  quebra o texto dentro da largura do `h3`, o título de duas linhas continua quebrando.
- **#205, parte 2, regra da máscara** (`src/styles/pages/projects.module.css`, mobile-first): no `.filters` base,
  `mask-image: linear-gradient(to right, transparent, #000 <fade>, #000 calc(100% - <fade>), transparent)` com
  `<fade> = calc(var(--pad-page) - var(--space-1))`, só na forma sem prefixo (o alvo dos E2E é Chromium, que a suporta); no
  bloco `@media (min-width: 640px)`, `mask-image: none`. A máscara fica presa à caixa visível da linha, não ao conteúdo
  rolado: no início da rolagem, o esmaecimento esquerdo cai no padding vazio (o primeiro chip começa em `--pad-page`); no
  fim, o direito idem; só há conteúdo esmaecido quando há mais para rolar daquele lado. `#000` aqui é canal alfa da máscara,
  não cor, então não entra token de cor.
- **R3:** o protótipo (`docs/design/prototype/`) e o handoff não têm esmaecimento nem máscara na linha de filtros. Por isso
  a recomendação vira `D70` em `docs/design/decisions.md`, citando `D16`, `D27` e `D62`, e `RF-PROJECTS-08` em
  `docs/screens/projects.md` passa a citar o esmaecimento.
- Nenhuma dependência nova.

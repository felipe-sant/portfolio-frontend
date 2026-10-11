# Acessibilidade

Este documento define o requisito de acessibilidade do portfólio: a meta de conformidade, como ela é verificada, as regras por tema e a checklist que cada tela cumpre. Vale para quem navega só pelo teclado, usa leitor de tela, amplia a página ou o texto, ou pede movimento reduzido ao sistema; e, pela mesma base semântica, para as IAs que leem o site (recrutadores usam IA para inspecionar páginas). As fontes são o [`design-system.md`](../design/design-system.md), o [`decisions.md`](../design/decisions.md) e o [protótipo](../design/prototype/README.md). O handoff de design não estava acessível quando este documento foi escrito; o que ele diz sobre acessibilidade fica **a conferir**, como na seção "Citação do handoff" de `decisions.md`. Onde as fontes divergem vale a ordem de R3: convenções do repositório, depois `decisions.md`, depois o protótipo, depois o handoff. Este documento cita decisões (`Dnn`, `PIn`) e tokens pelo ID e pelo nome; decisões e tokens continuam vivendo em `decisions.md` e em `design-system.md`.

## Meta

**WCAG 2.2, nível AA** (decisão do PO), em todas as rotas (`/`, `/projetos`, `/projetos/:slug`, `/informacoes` e `/contato`, nos três prefixos de idioma da URL definidos pela #8), na página não encontrada e na página de erro, nos dois temas, nos três idiomas e em qualquer largura de 320px a 1280px ou mais.

Além do AA, **cinco critérios AAA são obrigatórios**, porque saem baratos neste produto:

| Critério                                    | Como se cumpre aqui                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.4.9 Propósito do link (só pelo link)      | O nome acessível de todo link diz o destino sem depender do contexto: "Ver detalhes" e "Ver código no GitHub" levam o nome do projeto, e "Ver todos" diz "projetos" ([HTML semântico e nomes acessíveis](#html-semântico-e-nomes-acessíveis))                                                                                                          |
| 2.4.13 Aparência do foco                    | Contorno de D27: sólido, de no mínimo 2px, afastado 2px do componente (área maior que um perímetro de 2px) e com 3:1 contra o fundo em toda superfície, inclusive as faixas escuras ([Teclado e foco](#teclado-e-foco))                                                                                                                                |
| 1.4.8 Apresentação visual (no que é viável) | Linha de texto corrido com até 80 caracteres (`--measure`, 34rem, dá cerca de 70), entrelinha de pelo menos 1,5 em texto corrido (`--lh-body`, 1,65), nada de `text-align: justify`, cor escolhível pelos dois temas e texto a 200% sem rolagem horizontal ([Zoom, reflow, alvos e apresentação do texto](#zoom-reflow-alvos-e-apresentação-do-texto)) |
| 2.5.5 Tamanho do alvo (44px)                | Já atendido pelo design com `--hit-min` (2,75rem); vale em todas as larguras para controles ([Zoom, reflow, alvos e apresentação do texto](#zoom-reflow-alvos-e-apresentação-do-texto))                                                                                                                                                                |
| 2.3.3 Animação por interação                | `prefers-reduced-motion` desliga toda animação disparada por interação, e a faixa de stack tem pausa (D28) ([Movimento](#movimento))                                                                                                                                                                                                                   |

**Fora da meta, com motivo:**

- **1.4.6 Contraste reforçado (7:1):** mudaria a identidade da marca. O âmbar e os rótulos em `--text-label` não chegam a 7:1 sem trocar a paleta.
- **3.1.5 Nível de leitura:** o conteúdo é técnico, escrito para recrutador, cliente e professor da área.
- **3.1.3 Palavras incomuns e 3.1.4 Abreviaturas (glossário e expansão de siglas):** nomes de tecnologia e siglas da área são o vocabulário do público.

Os demais critérios AAA não são meta; onde o design já os cumpre, o design é mantido.

Critérios novos da WCAG 2.2 que pesam neste produto:

- **2.4.11 Foco não encoberto (mínimo):** o cabeçalho é fixo, e as abas da documentação do projeto também ficam fixas no topo (D06).
- **2.5.8 Tamanho do alvo (mínimo, 24px):** coberto com folga pelos 44px de 2.5.5.
- **3.2.6 Ajuda consistente:** o contato do rodapé fica no mesmo lugar em todas as telas que o têm.
- **2.5.7 Movimentos de arrastar:** não se aplica hoje, porque nenhuma interação depende de arrastar (as linhas roláveis de filtros e miniaturas também rolam por Tab e pela barra de rolagem). Se um carrossel com arrasto entrar, ele precisa de botões equivalentes.
- **3.3.7 Entrada redundante e 3.3.8 Autenticação acessível:** não se aplicam hoje. O formulário de contato tem uma etapa só e não pede o mesmo dado duas vezes, e não há login.

O **PDF do CV** (D14, issue I) entra na meta: PDF marcado (tagged), com o idioma do documento definido.

## Método de verificação

| Camada             | Ferramenta                                                                                                               | O que pega                                                                                                                                                                                                                                 | Quando                                                                       | Quem       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| Lint               | `jsx-a11y` do oxlint (já configurado em `.oxlintrc.json`)                                                                | `alt` ausente, rótulo sem controle, clique sem teclado, ARIA inválido no JSX                                                                                                                                                               | Cada commit (lint-staged) e CI                                               | Automático |
| Teste por papel    | Testing Library (`getByRole` com `name`) e `user-event`                                                                  | Landmarks, `h1`, nomes acessíveis, estados (`aria-pressed`, `aria-expanded`...), foco e Esc                                                                                                                                                | Cada PR de tela ou componente                                                | `executor` |
| Regras automáticas | `axe-core` no `jsdom`, por um helper de teste (issue T)                                                                  | ARIA inválido, nome ausente, landmark e heading duplicados, `scrollable-region-focusable`                                                                                                                                                  | Cada teste de página, layout e componente; CI                                | Automático |
| Ponta a ponta      | Playwright (Chromium) e `@axe-core/playwright` contra o build servido por `vite preview` com o `base` do Pages (issue Y) | Regras do axe com layout real, inclusive contraste, nas rotas principais, nos dois temas, em 390 e 1280px; roteiros de teclado: pular para o conteúdo, menu mobile que abre, fecha e devolve o foco, foco preso nos modais, abas por setas | CI em cada PR, a partir de M4; cada tela acrescenta as suas rotas e roteiros | Automático |
| Navegador          | Lighthouse (aba de acessibilidade do Chrome) e a extensão axe DevTools (gratuita)                                        | Contraste real, layout, o que o `jsdom` não calcula                                                                                                                                                                                        | Opcional em cada PR de tela; obrigatório na K                                | PO         |
| Teclado            | Manual, sem mouse                                                                                                        | Ordem de foco, foco visível, foco preso e devolvido, pular para o conteúdo                                                                                                                                                                 | Cada PR de tela (no `npm run dev`) e na K                                    | PO         |
| Leitor de tela     | NVDA com Chrome no Windows; TalkBack no Android do PO                                                                    | Anúncios (`aria-live`), nomes, ordem de leitura, modais, menu                                                                                                                                                                              | C (menu), F e G (modais) por amostra; K inteira                              | PO         |
| Zoom e espaçamento | Zoom do navegador (200% e 400%), zoom só de texto do Firefox e um bookmarklet de espaçamento de texto                    | Reflow a 320px, texto a 200%, 1.4.12                                                                                                                                                                                                       | K                                                                            | PO         |
| Contraste de token | Fórmula da WCAG (como em "D02 — logo" de `decisions.md`) e as ferramentas do navegador                                   | Par de token novo ou alterado                                                                                                                                                                                                              | Cada spec que cria ou muda token; K                                          | `sdd` e PO |
| Cores forçadas     | Temas de contraste do Windows                                                                                            | Contorno de foco e bordas que somem                                                                                                                                                                                                        | K                                                                            | PO         |

**Teste por papel.** O teste prefere `getByRole(papel, { name })` a `getByText` e `getByTestId`. O teste de cada tela afirma um `main`, um `h1`, o nome de cada controle e cada estado. Foco é verificado com `user-event` (`tab`, `keyboard("{Escape}")`) e `toHaveFocus()`.

**Duas camadas automáticas.**

- **Unitária (issue T):** `axe-core` direto, como devDependency, com um helper em `src/testUtils/`. Não usa `vitest-axe` nem `jest-axe`, cujo wrapper não acompanha o Vitest 5 e não acrescenta nada além de um matcher. É rápida e roda em todo teste de página, layout e componente.
- **Ponta a ponta (issue Y, pedido do PO):** Playwright com `@axe-core/playwright`, só Chromium, contra o build de produção servido por `vite preview` com o mesmo `base` do Pages, no CI. Pega o que o `jsdom` não vê (contraste, foco visível, reflow, `inert`) e trava regressão de teclado. O custo, um navegador baixado no CI e alguns minutos a mais por PR, foi aceito pelo PO.

Lighthouse e axe DevTools continuam como checagem manual de apoio na K.

**Limites do `jsdom`.** O `jsdom` não calcula layout nem cor: contraste, foco visível, reflow, `inert` e rolagem ficam para o navegador. Por isso a regra `color-contrast` do axe fica desligada no teste unitário e ligada no ponta a ponta (Y), que roda num navegador real.

**Limite da automação.** Leitor de tela real (NVDA, TalkBack) continua manual. Não há forma confiável de automatizar o que o leitor anuncia, em que ordem e com que entonação; os testes verificam a árvore de acessibilidade que o leitor consome, não a experiência de ouvir.

**Leitor de tela (decisão do PO).** NVDA (gratuito, Windows) com Chrome, obrigatório na K. Há amostra em C (menu mobile e seletor de idioma), em F (lightbox) e em G (modal de trajetória) logo depois de implementados, porque foco preso é onde mais quebra. No celular, TalkBack no Android do PO, na K, para o menu, um modal e o formulário.

**Registro.** A K registra o resultado em `docs/`, conforme o corpo da K, e abre uma issue `Fix` por falha.

## Estado atual

Cinco blocos: o que o design já resolve, o que está decidido, o que já está no código, o que falta no código e o que a leitura do protótipo achou de errado.

### Resolvido no design e no protótipo

A manter na implementação (fonte: seção "Acessibilidade" de `design-system.md` e o protótipo):

- Contraste de texto de pelo menos 4,5:1 nos dois temas; `--text-label` e `--text-weak` não podem clarear.
- `aria-label` em botão só de ícone.
- `role="dialog"` e `aria-modal` nos modais, que fecham por Esc (D01 para o menu).
- Abas com `role="tablist"`, `role="tab"` e `aria-selected`.
- Miniaturas com a posição ("Imagem 2 de 5") e `aria-current` (D18).
- Seletor de idioma em grupo nomeado (D12). No protótipo ele usa `aria-pressed`; no produto vira link para a URL do idioma ([Idioma](#idioma)).
- `aria-pressed` nos filtros; `aria-busy` em botão carregando; skeleton com `aria-hidden`.
- Alvos de `--hit-min` (2,75rem) no mobile.
- Erro de campo em `--danger-ink`, com `aria-invalid` e `aria-describedby` (D07).
- Contagem de resultados em `aria-live="polite"` e confirmação de envio em `role="status"` no protótipo.
- Navegação com `aria-label="Principal"`; botão de menu com `aria-expanded` e `aria-controls`.
- Um `main` e um `h1` por tela.

### Decidido

Fonte: [`decisions.md`](../design/decisions.md).

- **D23 — foco visível: decidido.** Contorno de 2px em `--brand-variant`, afastamento de 2px, `--radius`, em todo `:focus-visible`, inclusive campos, substituindo a regra de campo do handoff. A cor foi trocada por D27.
- **D01:** o menu fecha por Esc, por clique num link, no botão ou ao alargar a tela, e trava a rolagem.
- **D12:** sigla e nome acessível do idioma vêm de chave de tradução.
- **D25:** validação no envio, resumo com a contagem de erros e foco no primeiro campo inválido.
- **PI1:** prender e devolver o foco no menu e nos modais.
- **PI2 e PI3:** medições de contraste pendentes, feitas na K.
- **D27 — contorno de foco pelo token `--focus-ring`:** `--brand-deep` no tema claro (5,64:1 sobre `--bg-page`) e `--brand-variant` no escuro (7,36:1). Nas faixas escuras dos dois temas (`--neutral-900`: marquee, complementos) o token vale `--brand-variant` (6,82:1), porque `--brand-deep` daria 2,75:1 ali. Contorno sólido de no mínimo 2px, afastado 2px, nunca cortado pelo `overflow` do contêiner (contêiner rolável ganha folga interna), para cumprir 2.4.13. Substitui D23 na cor e acrescenta essas regras de aparência.
- **D28 — pausa na faixa de stack:** botão de pausa com `aria-pressed` e rótulo por chave; os ícones de pausa e play entram no inventário de D15; com movimento reduzido a faixa é estática.
- **D29 — `--border-control` só em campo de texto:** `--neutral-500` (4,22:1) no tema claro e `--dark-500` (3,27:1) no escuro.

### Já no código

Conferido na `staging` em `afa717b`:

- `<html lang>` acompanha o idioma ativo, pelo listener de `languageChanged` em `src/i18n/i18n.ts`. Hoje o idioma vem da detecção; a #8 o passa para o caminho da URL (`/en/`, `/es/`) já na v1.
- `prefers-reduced-motion` zera os `--dur-*`, encurta animação e transição e desliga `scroll-behavior` em `src/styles/global.css`.
- `jsx-a11y` ativo no lint, e `react/jsx-no-literals` cobrindo `alt` e `aria-label`.
- Viewport sem bloqueio de zoom no `index.html`.
- `<title>` e `<meta>` declarados por página.
- Cada página atual renderiza um `main` e um `h1`.

### Falta no código

Com a issue dona (letras do [roadmap](roadmap.md#issues-a-criar)):

| O que falta                                                                              | Issue                 |
| ---------------------------------------------------------------------------------------- | --------------------- |
| Foco visível global                                                                      | A                     |
| Link "Pular para o conteúdo", `main` único como alvo e foco no `h1` a cada troca de rota | C                     |
| Foco preso e devolvido no menu (PI1), na lightbox e no modal de trajetória               | C, F, G               |
| `aria-live` da busca e dos filtros, do "Copiar e-mail" e do formulário                   | E; C e H; H           |
| Teste automático com `axe-core`                                                          | T                     |
| Teste ponta a ponta no navegador                                                         | Y                     |
| Pausa da faixa de stack (D28)                                                            | D                     |
| Texto alternativo das capturas e da foto                                                 | L, com o campo da #10 |

### Achados

Pontos do protótipo e do design que viram falha se forem copiados como estão. O protótipo não é editado (é export do Claude Design e fica como saiu); a correção vale pela precedência de R3 e é feita na issue indicada. Os números de contraste foram calculados pela fórmula de luminância relativa da WCAG 2.x, como em "D02 — logo".

| Achado                                                                                                        | Critério WCAG  | Correção                                                                                                                                               | Issue |
| ------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Contorno de foco `#F19100` sobre `--bg-page` claro `#FBF9F5`: 2,27:1 (no escuro, 7,36:1)                      | 1.4.11, 2.4.13 | D27: `--focus-ring` vale `--brand-deep` no claro (5,64:1) e `--brand-variant` no escuro e nas faixas escuras (6,82:1); 2px sólido, afastado 2px        | A     |
| A faixa de stack anima sem fim e sem pausa; com movimento reduzido, a regra global a congela no último quadro | 2.2.2 (A)      | D28: botão de pausa, e lista estática que quebra linha com movimento reduzido                                                                          | D     |
| Borda de campo em `--border-strong`: 1,76:1 no claro, 1,54:1 no escuro                                        | 1.4.11         | D29: `--border-control` em campo de texto, `--neutral-500` (4,22:1) no claro e `--dark-500` (3,27:1) no escuro                                         | B, H  |
| `--text-label` no escuro (`#8E8981`) sobre `--bg-raised` (`#242422`): 4,48:1                                  | 1.4.3          | Medir onde o par ocorre; se ocorrer em texto, escurecer o fundo ou clarear o rótulo em decisão nova                                                    | K     |
| O alternador de tema troca o `aria-label` ("Usar tema claro"/"Usar tema escuro") e também o `aria-pressed`    | 4.1.2          | Nome fixo ("Tema escuro"), e só o `aria-pressed` muda                                                                                                  | C     |
| Faixa de stack: `div` com `aria-label` sem papel (proibido pela ARIA 1.2) e todo o conteúdo `aria-hidden`     | 1.1.1, 4.1.2   | Uma lista real (`ul`) acessível uma vez; a cópia que faz o laço fica `aria-hidden`                                                                     | D     |
| O título do card de projeto é `span`                                                                          | 1.3.1          | Heading no nível seguinte ao da seção                                                                                                                  | E     |
| Filtros em `role="toolbar"` sem navegação por setas                                                           | 4.1.2          | `role="group"` com `aria-label` (Tab entre os botões); `toolbar` só com setas e tabindex móvel                                                         | E     |
| O contador de caracteres em `aria-live` anuncia a cada tecla                                                  | 4.1.3          | Contador ligado por `aria-describedby`; anúncio só ao cruzar 60 restantes e ao chegar a 0                                                              | H     |
| Assunto em chips com `aria-pressed`, com escolha única obrigatória                                            | 1.3.1, 4.1.2   | `fieldset` com `legend` e `input type="radio"` estilizado como chip                                                                                    | H     |
| O painel do menu é `role="dialog"` com `aria-modal`, mas o botão que fecha fica fora dele                     | 4.1.2, 2.1.2   | Painel como disclosure (`aria-expanded` no botão), resto da página `inert` enquanto aberto, foco circulando entre botão e painel, Esc devolve ao botão | C     |
| O botão "Ampliar imagem" tem o mesmo nome para toda imagem                                                    | 2.4.6          | Nome com a posição e o texto alternativo da imagem                                                                                                     | F     |
| Rótulos de seção escritos em caixa alta no texto ("PROJETOS EM DESTAQUE")                                     | 1.3.1          | Texto em caixa normal no JSON; caixa alta por `text-transform`                                                                                         | C a H |
| Placeholder de foto com `role="img"` e "(placeholder)" no nome                                                | 1.1.1          | Com D26 a foto é real; o placeholder de projeto sem captura é decorativo (`aria-hidden`)                                                               | G, L  |

O menu vira disclosure com `inert`, e não diálogo com `aria-modal`, porque o botão que fecha fica no cabeçalho, fora do painel, e `aria-modal` o esconderia do leitor de tela.

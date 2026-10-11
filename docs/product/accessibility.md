# Acessibilidade

Este documento define o requisito de acessibilidade do portfólio: a meta de conformidade, como ela é verificada, as regras por tema e a checklist que cada tela cumpre. Vale para quem navega só pelo teclado, usa leitor de tela, amplia a página ou o texto, ou pede movimento reduzido ao sistema; e, pela mesma base semântica, para as IAs que leem o site (recrutadores usam IA para inspecionar páginas). As fontes são o [`design-system.md`](../design/design-system.md), o [`decisions.md`](../design/decisions.md) e o [protótipo](../design/prototype/README.md). O handoff de design não estava acessível quando este documento foi escrito; o que ele diz sobre acessibilidade fica **a conferir**, como na seção ["Citação do handoff"](../design/decisions.md#citação-do-handoff) de `decisions.md`. Onde as fontes divergem vale a ordem de R3: convenções do repositório, depois `decisions.md`, depois o protótipo, depois o handoff. Este documento cita decisões (`Dnn`, `PIn`) e tokens pelo ID e pelo nome; decisões e tokens continuam vivendo em `decisions.md` e em `design-system.md`.

## Meta

**WCAG 2.2, nível AA** (decisão do PO), em todas as rotas (`/`, `/projects`, `/projects/:id`, `/about` e `/contact`, nos três prefixos de idioma da URL definidos pela #8), na página não encontrada e na página de erro, nos dois temas, nos três idiomas e em qualquer largura de 320px a 1280px ou mais.

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

- **2.4.11 Foco não encoberto (mínimo):** o cabeçalho é fixo, e a navegação entre os documentos do projeto também fica fixa no topo (D06, D33).
- **2.5.8 Tamanho do alvo (mínimo, 24px):** coberto com folga pelos 44px de 2.5.5.
- **3.2.6 Ajuda consistente:** o contato do rodapé fica no mesmo lugar em todas as telas que o têm.
- **2.5.7 Movimentos de arrastar:** não se aplica hoje, porque nenhuma interação depende de arrastar (as linhas roláveis de filtros e miniaturas também rolam por Tab e pela barra de rolagem). Se um carrossel com arrasto entrar, ele precisa de botões equivalentes.
- **3.3.7 Entrada redundante e 3.3.8 Autenticação acessível:** não se aplicam hoje. O formulário de contato tem uma etapa só e não pede o mesmo dado duas vezes, e não há login.

O **PDF do CV** (D14, issue I) entra na meta: PDF marcado (tagged), com o idioma do documento definido.

## Método de verificação

| Camada             | Ferramenta                                                                                                               | O que pega                                                                                                                                                                                                                                                        | Quando                                                                       | Quem       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- |
| Lint               | `jsx-a11y` do oxlint (já configurado em `.oxlintrc.json`)                                                                | `alt` ausente, rótulo sem controle, clique sem teclado, ARIA inválido no JSX                                                                                                                                                                                      | Cada commit (lint-staged) e CI                                               | Automático |
| Teste por papel    | Testing Library (`getByRole` com `name`) e `user-event`                                                                  | Landmarks, `h1`, nomes acessíveis, estados (`aria-pressed`, `aria-expanded`...), foco e Esc                                                                                                                                                                       | Cada PR de tela ou componente                                                | `executor` |
| Regras automáticas | `axe-core` no `jsdom`, por um helper de teste (issue T)                                                                  | ARIA inválido, nome ausente, landmark e heading duplicados, `scrollable-region-focusable`                                                                                                                                                                         | Cada teste de página, layout e componente; CI                                | Automático |
| Ponta a ponta      | Playwright (Chromium) e `@axe-core/playwright` contra o build servido por `vite preview` com o `base` do Pages (issue Y) | Regras do axe com layout real, inclusive contraste, nas rotas principais, nos dois temas, em 390 e 1280px; roteiros de teclado: pular para o conteúdo, menu mobile que abre, fecha e devolve o foco, foco preso nos modais, navegação entre documentos do projeto | CI em cada PR, a partir de M4; cada tela acrescenta as suas rotas e roteiros | Automático |
| Navegador          | Lighthouse (aba de acessibilidade do Chrome) e a extensão axe DevTools (gratuita)                                        | Contraste real, layout, o que o `jsdom` não calcula                                                                                                                                                                                                               | Opcional em cada PR de tela; obrigatório na K                                | PO         |
| Teclado            | Manual, sem mouse                                                                                                        | Ordem de foco, foco visível, foco preso e devolvido, pular para o conteúdo                                                                                                                                                                                        | Cada PR de tela (no `npm run dev`) e na K                                    | PO         |
| Leitor de tela     | NVDA com Chrome no Windows; TalkBack no Android do PO                                                                    | Anúncios (`aria-live`), nomes, ordem de leitura, modais, menu                                                                                                                                                                                                     | C (menu), F e G (modais) por amostra; K inteira                              | PO         |
| Zoom e espaçamento | Zoom do navegador (200% e 400%), zoom só de texto do Firefox e um bookmarklet de espaçamento de texto                    | Reflow a 320px, texto a 200%, 1.4.12                                                                                                                                                                                                                              | K                                                                            | PO         |
| Contraste de token | Fórmula da WCAG (como em ["D02 — logo"](../design/decisions.md#d02--logo)) e as ferramentas do navegador                 | Par de token novo ou alterado                                                                                                                                                                                                                                     | Cada spec que cria ou muda token; K                                          | `sdd` e PO |
| Cores forçadas     | Temas de contraste do Windows                                                                                            | Contorno de foco e bordas que somem                                                                                                                                                                                                                               | K                                                                            | PO         |

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
- Abas com `role="tablist"`, `role="tab"` e `aria-selected` no protótipo. No produto, os documentos do projeto têm endereço próprio (D33), então as abas viram navegação com links (ver "Documentos do projeto" na seção de teclado).
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

Pontos do protótipo e do design que viram falha se forem copiados como estão. O protótipo não é editado (é export do Claude Design e fica como saiu); a correção vale pela precedência de R3 e é feita na issue indicada. Os números de contraste foram calculados pela fórmula de luminância relativa da WCAG 2.x, como em ["D02 — logo"](../design/decisions.md#d02--logo).

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

## HTML semântico e nomes acessíveis

Esta seção é a base comum para pessoas e para IAs que leem o site: a #8 a cita em vez de repetir as regras. Um HTML com landmarks, headings e nomes certos é o que o leitor de tela anuncia e o que uma ferramenta automática extrai.

- **Landmarks:** um `header` (banner), um `nav` principal com `aria-label` "Principal", um `main` por tela e um `footer` (contentinfo). O rodapé de navegação de Contato (D04) é outro `nav`, com nome diferente ("Rodapé"). Seção com título usa `section` com `aria-labelledby` apontando o heading; `aria-label` só onde não há heading visível.
- **Headings:** um `h1` por tela, que diz o que a tela é, e níveis sem pular. O nome no cabeçalho não é heading. Título de card é heading do nível seguinte ao da seção. O markdown da documentação do projeto (D06) tem os níveis rebaixados para começar abaixo do heading da seção, nunca com um segundo `h1`.
- **Listas e dados:** coleções são `ul` ou `ol` (cards, stack, trajetória, links do rodapé); a ficha técnica é `dl`; datas ficam em `time` com `datetime` (`2024-06`).
- **Link e botão:** navegação é link (`<Link>` com o path de `ROUTES`); ação na mesma tela é `button` com `type`. Card clicável tem um único link, cujo nome é o título do projeto, sem nada interativo aninhado.
- **Nomes acessíveis:** todo controle tem nome. Botão só de ícone tem `aria-label` por chave de tradução. O nome visível está contido no nome acessível, de preferência no começo (2.5.3). O nome não repete o papel ("Fechar", não "Botão fechar").
- **Propósito do link só pelo link (2.4.9, AAA obrigatório):** o nome acessível de cada link diz o destino sozinho, lido fora de contexto (na lista de links do leitor de tela ou por uma IA que extrai links). Quando o texto visível é genérico, o nome se completa com o objeto depois do texto visível, por chave com interpolação ou por texto visualmente oculto: "Ver detalhes: `<projeto>`", "Ver código no GitHub: `<projeto>`", "Ver todos os projetos", "Baixar CV (PDF)", "GitHub de Luiz Felipe dos Santos". Card com um link só tem o nome do projeto. Dois links com o mesmo nome levam ao mesmo destino.
- **Texto que o leitor não deve ler:** setas unicode (`→ ← ↗ ↓ ▾`) e o separador `·` ficam em `<span aria-hidden="true">`. Ícones SVG têm `aria-hidden="true"` e `focusable="false"`. O logo (D02) é `aria-hidden` dentro do link cujo nome é o nome do autor.
- **Caixa:** o texto fica em caixa normal nos JSON; caixa alta é estilo (`text-transform`).
- **Link externo e arquivo:** link que abre outra aba avisa no nome; link de PDF diz o formato ("Baixar CV (PDF)").
- **Título do documento:** `<title>` único por tela, no formato `<Tela> · Luiz Felipe dos Santos`, traduzido, mudando a cada rota.
- **Estado em ARIA, nunca só visual:** `aria-current="page"` no item da rota atual, `aria-pressed`, `aria-expanded`, `aria-selected`, `aria-invalid` e `aria-busy`.

## Teclado e foco

- A ordem de foco segue a ordem visual; não há `tabindex` positivo.
- **Pular para o conteúdo:** é o primeiro elemento focável da página, fica visível ao receber foco e leva ao `main` (`id` estável e `tabIndex={-1}`), com texto por chave nos três idiomas. Recomendação para C: o `main` passa a ser do `MainLayout`, em volta do `<Outlet />`, e as páginas deixam de renderizar o próprio; a página de erro, fora do layout, mantém o seu. O critério é um `main` por tela, alvo do link de pular.
- **Foco visível e aparência do foco (2.4.7, 2.4.13):** D23 com a cor de D27. `outline` sólido de no mínimo 2px em `--focus-ring`, afastado 2px, em todo `:focus-visible`, com 3:1 contra o fundo vizinho em toda superfície (página, `--bg-raised`, cromo escuro e as faixas `--neutral-900`, onde o token é redefinido), nunca cortado por `overflow: hidden` ou pela rolagem do contêiner.
- **Foco não encoberto (2.4.11):** `scroll-padding-top` igual à altura do cabeçalho fixo (e da navegação fixa entre documentos, no projeto).
- **Troca de rota:** na navegação interna o foco vai para o `h1` da nova tela (`tabIndex={-1}`) e o `<title>` muda; na primeira carga o foco não se move. A troca de idioma é exceção ([Anúncios dinâmicos](#anúncios-dinâmicos-aria-live)).
- **Menu e modais (PI1):** ao abrir, o foco vai para o primeiro controle (ou para o título do modal); Tab e Shift+Tab circulam só dentro; o resto da página fica `inert`; Esc, o botão de fechar e o clique no fundo fecham; ao fechar, o foco volta ao elemento que abriu. A rolagem fica travada (D01). O menu é disclosure, não diálogo (ver [Achados](#achados)).
- **Documentos do projeto:** cada documento tem endereço próprio (D33), então as abas são links dentro de um `nav` com nome acessível ("Documentação do projeto"), com `aria-current="page"` no documento aberto. Navegação por Tab, sem setas nem tabindex móvel. Trocar de documento é troca de rota sem recarregar: o foco vai para o título do documento, e não para o `h1` da tela.
- **Linhas roláveis** (filtros, D16, e miniaturas, D18) e bloco de código: alcançáveis por Tab. Bloco de código rolável tem `tabIndex={0}` e nome.
- Nenhuma armadilha de foco fora de um modal aberto (2.1.2).

## Anúncios dinâmicos (`aria-live`)

A região de anúncio existe no DOM desde a primeira renderização, vazia, para o anúncio disparar quando o conteúdo muda. Todo texto anunciado vem de chave de tradução.

| Evento                                         | Onde                      | Como                                                                                                                                                                           |
| ---------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Resultado da busca, dos filtros e da ordenação | Projetos                  | `aria-live="polite"` com a contagem ("8 projetos"), depois que a digitação para                                                                                                |
| Lista vazia                                    | Projetos                  | Mesma região: "Nenhum projeto encontrado"                                                                                                                                      |
| "Carregar mais"                                | Projetos                  | O foco vai para o primeiro card novo; a região anuncia a nova contagem                                                                                                         |
| Carregando conteúdo                            | Telas com skeleton        | Skeleton `aria-hidden`; texto "Carregando" visualmente oculto em `role="status"`                                                                                               |
| Erro de carregamento                           | Início, Projetos, Projeto | `role="alert"` com a saída                                                                                                                                                     |
| "Copiar e-mail" e "Copiar"                     | Rodapé, Contato           | `role="status"`: "E-mail copiado"                                                                                                                                              |
| Erro no envio do formulário                    | Contato                   | Resumo em `role="alert"` com a contagem e foco no primeiro campo inválido (D25)                                                                                                |
| Enviando                                       | Contato                   | Botão com `aria-busy` e campos desabilitados                                                                                                                                   |
| Enviado                                        | Contato                   | O formulário dá lugar à confirmação, com foco no título dela e `role="status"`                                                                                                 |
| Contador de caracteres                         | Contato                   | Ligado por `aria-describedby`; anúncio só ao cruzar 60 restantes e ao chegar a 0                                                                                               |
| Troca de idioma                                | Cabeçalho, menu           | O seletor navega para a URL equivalente no outro idioma; a página nova é anunciada pelo `lang` e pelo `<title>`; o foco volta para o seletor (exceção à regra de foco no `h1`) |
| Troca de tema                                  | Cabeçalho, menu           | Sem região: o estado é anunciado pelo `aria-pressed`, e o foco fica no botão                                                                                                   |

## Idioma

- O idioma vem do caminho da URL (`/`, `/en/`, `/es/`), decisão da #8 que vale já na v1, e `<html lang>` acompanha o idioma da URL. O sincronismo de `lang` com o idioma ativo já existe em `src/i18n/i18n.ts`.
- O seletor (D12) navega para a URL equivalente do idioma escolhido: cada opção é um link (`<Link>`) para a mesma tela no outro idioma, com `hreflang` e `lang` do idioma de destino, e a opção ativa tem `aria-current="true"`. Não é botão com `aria-pressed`, porque trocar de URL é navegação.
- O nome de cada idioma é escrito no próprio idioma ("Português", "English", "Español"), com `lang` no link (3.1.2); a sigla visível fica contida no nome acessível. O valor dessa chave é o mesmo nos três JSON.
- Trecho de conteúdo em outro idioma (por exemplo, documentação de projeto que só exista num idioma) recebe `lang` no contêiner.
- Nome de tecnologia não recebe `lang`.

## Imagens e texto alternativo

| Imagem                                          | Regra                                                                                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Captura na galeria do projeto (D26)             | `alt` descritivo vindo do dado, nos três idiomas: o que a tela mostra e por que importa, com até cerca de 150 caracteres, sem "imagem de" e sem repetir a legenda |
| Miniatura da galeria                            | Botão com nome "Imagem N de M" e `aria-current` na ativa; a imagem dentro tem `alt=""`                                                                            |
| Imagem de card (Início, Projetos, relacionados) | `alt=""`: o link do card já tem o nome do projeto                                                                                                                 |
| Foto de perfil (D26)                            | `alt` por chave: "Foto de Luiz Felipe dos Santos"                                                                                                                 |
| Placeholder de projeto sem captura (D26)        | Decorativo, `aria-hidden`, sem `role="img"`                                                                                                                       |
| Logo (D02) e ícones (D15)                       | `aria-hidden`; o nome vem do link ou do `aria-label` do botão                                                                                                     |
| Imagem ampliada (lightbox)                      | O mesmo `alt` da captura                                                                                                                                          |

Exigência para a #10: cada imagem do modelo de dados tem `alt` (e legenda, se houver) traduzido por idioma. A #13 preenche, e a L confere.

## Movimento

- `prefers-reduced-motion: reduce` desliga transição, hover com deslocamento, shimmer e rolagem suave (já feito em `global.css`). A faixa de stack vira uma lista estática que quebra linha, em vez de ficar congelada e cortada.
- **Faixa de stack (2.2.2, D28):** botão de pausa visível na própria faixa, com rótulo por chave nos três idiomas e `aria-pressed`.
- **Animação por interação (2.3.3, AAA obrigatório):** hover com deslocamento, abertura de menu e de modal e troca de documento ficam sem movimento com `prefers-reduced-motion: reduce`. A faixa de stack, que não depende de interação, tem a pausa de D28.
- Nada pisca mais de três vezes por segundo (2.3.1), e a galeria não troca de imagem sozinha.

## Contraste e cor

- Texto: 4,5:1. Texto grande (24px ou mais, ou 18,66px ou mais em negrito): 3:1. Componente e estado (borda de campo, contorno de foco, ícone que carrega informação, estado selecionado): 3:1 contra o vizinho.
- Medido nos dois temas, nos estados especiais e sobre o degradê (PI3), com o bloco de código no tema escuro (PI2), na K.
- Cor nunca sozinha: erro tem texto e ícone (D07); o item ativo da navegação tem traço, peso e `aria-current`; link em texto corrido é sublinhado.
- Cores forçadas (Windows): o contorno de foco usa `outline`, não `box-shadow`, porque `outline` sobrevive ao modo.
- Ver os [achados](#achados) e as decisões D27 e D29.

## Zoom, reflow, alvos e apresentação do texto

- A viewport nunca bloqueia zoom: `maximum-scale` e `user-scalable=no` são proibidos.
- A 320px de largura (o mesmo que 1280px a 400%) não há rolagem horizontal da página. Exceções: o bloco de código e as linhas roláveis de filtros e miniaturas, que rolam dentro de si.
- Texto a 200% (zoom só de texto) sem corte nem sobreposição, sem altura fixa em contêiner de texto, e sem perda com o espaçamento de texto de 1.4.12.
- O cabeçalho fixo não pode ocupar a tela em zoom alto, e o foco nunca fica embaixo dele (2.4.11).
- **Alvos:** `--hit-min` (2,75rem, 44px) em todo controle e link isolado, em todas as larguras (2.5.5, AAA obrigatório, que cobre 2.5.8). Link dentro de texto corrido está isento.
- **Apresentação do texto (1.4.8, AAA obrigatório no que é viável):** texto corrido com no máximo 80 caracteres por linha (`--measure`), entrelinha de pelo menos 1,5 (`--lh-body`), espaço entre parágrafos maior que a entrelinha, alinhado à esquerda e nunca justificado; cor de texto e de fundo escolhíveis pelos dois temas. Fica fora a escolha de cor arbitrária pelo usuário além dos temas.
- Orientação livre, retrato ou paisagem (1.3.4).

## Formulário

Vale para o formulário de Contato (D05, D07, D25) com a flag ligada; com a flag desligada (D05) o formulário não está no DOM.

- `label` visível ligado ao campo; obrigatório dito em texto, além de `required` ou `aria-required`.
- `autocomplete="name"` e `autocomplete="email"` (1.3.5).
- Erro com `aria-invalid`, mensagem em `aria-describedby` e cor `--danger-ink` junto do texto (D07).
- Borda de campo de texto em `--border-control` (D29).
- Resumo de erros e foco no primeiro inválido conforme D25.
- Assunto como grupo de rádio (ver [Achados](#achados)).
- Enviando e enviado conforme [Anúncios dinâmicos](#anúncios-dinâmicos-aria-live).

## Checklist por tela

Cada item tem um ID estável e a forma de verificação entre colchetes: `[teste]` (Testing Library), `[axe]` (helper da T), `[lint]` (oxlint), `[teclado]` (manual, sem mouse), `[leitor]` (NVDA ou TalkBack), `[navegador]` (Lighthouse ou axe DevTools), `[e2e]` (Playwright da Y) e `[medição]` (contraste ou zoom). O documento de cada tela (#2 a #7) copia a checklist "Todas as telas" e a da sua tela como critério de aceite, citando os IDs. ID não é reaproveitado: item que deixa de valer é riscado, e item novo recebe o próximo número.

### Todas as telas

- [ ] `A11Y-G01` — Um `main`, um `h1` e um `<title>` próprio e traduzido [teste]
- [ ] `A11Y-G02` — `<html lang>` igual ao idioma da URL (`/`, `/en/`, `/es/`) [teste]
- [ ] `A11Y-G03` — Nenhuma violação do axe em cada estado da tela [axe]
- [ ] `A11Y-G04` — Nenhuma violação do axe no navegador, nos dois temas [e2e]
- [ ] `A11Y-G05` — Ordem de foco igual à visual e foco visível em todo elemento focável [teclado]
- [ ] `A11Y-G06` — Contorno de foco de D27 com 2px, afastado, 3:1 em toda superfície e nunca cortado (2.4.13) [e2e] [medição]
- [ ] `A11Y-G07` — Todo link tem um nome que diz o destino sozinho (2.4.9) [teste]
- [ ] `A11Y-G08` — Controles e links isolados com alvo de 44px em todas as larguras (2.5.5) [e2e] [medição]
- [ ] `A11Y-G09` — Texto corrido com até 80 caracteres por linha, entrelinha de pelo menos 1,5 e sem justificar (1.4.8) [navegador]
- [ ] `A11Y-G10` — Contraste AA nos dois temas e em todos os estados [e2e] [medição]
- [ ] `A11Y-G11` — Sem rolagem horizontal a 320px e sem perda com texto a 200% [medição]
- [ ] `A11Y-G12` — Movimento reduzido respeitado, inclusive a animação disparada por interação (2.3.3) [navegador]
- [ ] `A11Y-G13` — Skeleton com `aria-hidden` e status "Carregando" visualmente oculto [teste]
- [ ] `A11Y-G14` — Erro de carregamento em `role="alert"`, com a saída [teste]
- [ ] `A11Y-G15` — Texto em `pt-BR`, `en` e `es`, inclusive os nomes acessíveis [teste]
- [ ] `A11Y-G16` — Nenhum erro de `jsx-a11y` [lint]

### Layout: cabeçalho, menu e rodapé

- [ ] `A11Y-L01` — "Pular para o conteúdo" é o primeiro Tab e leva ao `main` [teste] [e2e]
- [ ] `A11Y-L02` — A troca de rota põe o foco no `h1` da nova tela [teste]
- [ ] `A11Y-L03` — Landmarks `banner`, `navigation` "Principal" e `contentinfo` [teste]
- [ ] `A11Y-L04` — `aria-current="page"` no item da rota atual [teste]
- [ ] `A11Y-L05` — Seletor de idioma em grupo nomeado, com um link para a URL equivalente de cada idioma, `hreflang` e `lang` em cada link e `aria-current` no ativo [teste]
- [ ] `A11Y-L06` — Trocar de idioma navega para a URL equivalente, atualiza `<html lang>` e `<title>` e devolve o foco ao seletor [teste] [e2e]
- [ ] `A11Y-L07` — Alternador de tema com nome fixo e `aria-pressed` [teste]
- [ ] `A11Y-L08` — Botão de menu com `aria-expanded` e `aria-controls` [teste]
- [ ] `A11Y-L09` — Menu aberto: foco preso, Esc fecha e devolve o foco ao botão, resto da página `inert` [teste] [e2e] [leitor]
- [ ] `A11Y-L10` — Logo e ícones com `aria-hidden` [teste]
- [ ] `A11Y-L11` — "Copiar e-mail" anuncia o resultado [teste]
- [ ] `A11Y-L12` — O rodapé de Contato é um `nav` com nome próprio [teste]
- [ ] `A11Y-L13` — O foco nunca fica embaixo do cabeçalho fixo [teclado] [e2e]

### Início

- [ ] `A11Y-IN01` — `h1` "Desenvolvedor full stack em TypeScript" (D24) [teste]
- [ ] `A11Y-IN02` — Cada seção tem heading [teste]
- [ ] `A11Y-IN03` — Cards de destaque em lista, com um link por card, nome do link com o nome do projeto e imagem com `alt=""` [teste]
- [ ] `A11Y-IN04` — "Ver todos" tem o nome "Ver todos os projetos" (2.4.9) [teste]
- [ ] `A11Y-IN05` — Faixa de stack com a lista acessível uma vez e a cópia do laço com `aria-hidden` [teste]
- [ ] `A11Y-IN06` — Botão de pausa da faixa com `aria-pressed` e rótulo nos três idiomas (D28) [teste]
- [ ] `A11Y-IN07` — Faixa estática, quebrando linha, com movimento reduzido [navegador]
- [ ] `A11Y-IN08` — "Baixar CV (PDF)" no nome do link [teste]

### Projetos

- [ ] `A11Y-PS01` — Busca com rótulo [teste]
- [ ] `A11Y-PS02` — Filtros em grupo nomeado, com `aria-pressed` [teste]
- [ ] `A11Y-PS03` — Ordenação em `select` nativo com rótulo [teste]
- [ ] `A11Y-PS04` — Contagem de resultados e lista vazia anunciadas em `aria-live` [teste] [leitor]
- [ ] `A11Y-PS05` — "Carregar mais" leva o foco ao primeiro card novo [teste]
- [ ] `A11Y-PS06` — Título do card é heading, e o link do card tem o nome do projeto (2.4.9) [teste]
- [ ] `A11Y-PS07` — Linha de filtros alcançável por Tab no mobile [teclado]

### Projeto

- [ ] `A11Y-PJ01` — "← Voltar para Projetos" com a seta oculta do leitor [teste]
- [ ] `A11Y-PJ02` — "Ver código no GitHub" com o nome do projeto no nome acessível e aviso de nova aba, se abrir (2.4.9) [teste]
- [ ] `A11Y-PJ03` — Galeria: imagem com o `alt` do dado e miniaturas "Imagem N de M" com `aria-current` [teste]
- [ ] `A11Y-PJ04` — Lightbox: diálogo nomeado, foco preso, Esc e devolução do foco, anterior e próxima nomeados [teste] [e2e] [leitor]
- [ ] `A11Y-PJ05` — Documentos do projeto: `nav` com nome acessível, links com `aria-current="page"` no aberto e foco no título do documento ao trocar (D33) [teste] [e2e]
- [ ] `A11Y-PJ06` — Markdown da documentação sem segundo `h1` [teste]
- [ ] `A11Y-PJ07` — Bloco de código rolável focável e com nome [axe]
- [ ] `A11Y-PJ08` — Contraste do nome de arquivo do bloco de código no tema escuro (PI2) [medição]
- [ ] `A11Y-PJ09` — Ficha técnica em `dl` [teste]
- [ ] `A11Y-PJ10` — A navegação fixa entre documentos não cobre o foco [teclado]
- [ ] `A11Y-PJ11` — Slug inexistente mostra a página não encontrada [teste]

### Informações

- [ ] `A11Y-IF01` — Foto de perfil com `alt` (D26) [teste]
- [ ] `A11Y-IF02` — Stack e trajetória em listas, datas em `time` [teste]
- [ ] `A11Y-IF03` — Item de trajetória é `button` com `aria-haspopup="dialog"` [teste]
- [ ] `A11Y-IF04` — Modal de trajetória com `aria-labelledby`, foco preso, Esc, devolução do foco e tela cheia abaixo de 640px (D20) [teste] [e2e] [leitor]
- [ ] `A11Y-IF05` — "Baixar CV (PDF)" no nome do link [teste]

### Contato

- [ ] `A11Y-CT01` — Canais com nomes claros e "Copiar" anunciado [teste]
- [ ] `A11Y-CT02` — Com a flag ligada: rótulos, `autocomplete`, obrigatórios em texto e assunto em grupo de rádio [teste]
- [ ] `A11Y-CT03` — Validação no envio, com resumo e foco no primeiro inválido (D25) [teste]
- [ ] `A11Y-CT04` — Erro com `aria-invalid` e `aria-describedby`, em `--danger-ink` e com texto (D07) [teste]
- [ ] `A11Y-CT05` — Contador de caracteres sem anúncio a cada tecla [teste]
- [ ] `A11Y-CT06` — Enviando com `aria-busy` [teste]
- [ ] `A11Y-CT07` — Enviado com o foco na confirmação [teste] [leitor]
- [ ] `A11Y-CT08` — Borda de campo de texto com 3:1 (D29) [e2e] [medição]

### Página não encontrada e erro

- [ ] `A11Y-ER01` — `h1` que diz o que aconteceu, `<title>` próprio e link para o início [teste]
- [ ] `A11Y-ER02` — A página de erro tem os próprios landmarks, por estar fora do layout [teste]

## Relação com outros documentos

- **#8 (requisitos não funcionais):** cita [HTML semântico e nomes acessíveis](#html-semântico-e-nomes-acessíveis) como base comum para pessoas e IAs e não repete as regras.
- **Telas (#2 a #7):** copiam "Todas as telas" e a checklist da tela como critério de aceite.
- **#10 (modelo de dados):** `alt` e legenda traduzidos por imagem ([Imagens e texto alternativo](#imagens-e-texto-alternativo)).
- **K (verificação da v1):** executa o [método de verificação](#método-de-verificação) e esta checklist no build do Pages.
- **T (teste automático):** fornece o helper que os itens `[axe]` usam.
- **Y (ponta a ponta):** a suíte cobre os itens `[e2e]`; cada tela (D a H) acrescenta as suas rotas e roteiros.
- **[`decisions.md`](../design/decisions.md) e [`design-system.md`](../design/design-system.md):** decisões e tokens continuam lá; este documento cita os IDs.

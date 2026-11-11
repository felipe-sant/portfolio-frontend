# Spec: declara-vaga-junior-e-encurta-cartao-fatec

> **Tipo:** `feature` (Feat na branch e no commit) <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#134` <br />
> **Criado em:** `11-11-2026`

Feature com tela (Início, e Informações pelo texto do cargo): o `qa` se aplica. Base: `origin/staging` em `a413e7a`.

## Problema

A primeira tela da Início descreve o perfil, mas não diz qual vaga o PO procura: o `h1` é "Desenvolvedor full stack em TypeScript" e a palavra "Júnior" só aparece em Informações, no quarto parágrafo de "Sobre mim". Além disso, no celular o cartão "Cursando" (Fatec) junta o nome inteiro da instituição ao nome do curso (cerca de 130 caracteres, `Fatec – Faculdade de Tecnologia do Estado de São Paulo (Jacareí) · Tecnólogo em Desenvolvimento de Software Multiplataforma`) e quebra em quatro ou cinco linhas, empurrando "Projetos em destaque" para baixo (`src/components/StatusCard.tsx`, `src/styles/pages/home.module.css` `.cards`, colunas de no mínimo 17rem). Origem: revisão do site de 07/11/2026, achado 2.

Hoje o site diz, em lugares diferentes, coisas diferentes sobre o cargo: o `jobTitle` do JSON-LD da Início vem de `home:heading` ("Desenvolvedor full stack em TypeScript") e o de Informações vem de `profile.role` ("Estagiário de Desenvolvimento Frontend"), e as duas páginas descrevem a mesma `Person` (`@id` `.../#person`). O mesmo texto de estagiário está no perfil, na trajetória e nos CV.

## Decisão do PO (registrada pelo Master como "D-05")

Não confundir com a `D05` de `docs/design/decisions.md` (formulário de contato desligado). A decisão: o cargo principal é **"Desenvolvedor full stack Júnior"** (React, TypeScript e Node.js) em todos os lugares (JSON-LD da Início e de Informações, `h1`, linha sob o título, README, textos de Início e Informações, `<title>`/`<meta>` e `index.html`), nos três idiomas, e o cargo atual deixa de ser estagiário e passa a ser Júnior; a InCicle segue como empregador (`worksFor`).

## Objetivo

1. Declarar na Início, nos três idiomas, o cargo "Desenvolvedor full stack Júnior" e uma linha sob o título que diz que a vaga procurada é Júnior, com React, TypeScript e Node.js.
2. Fazer o cargo ser o mesmo texto em todo lugar onde ele aparece: `h1`, `jobTitle` da Início, `profile.role` (que é o `jobTitle` de Informações e o cartão "Agora"), título da experiência atual (cartão "Trabalhando como") e metadados.
3. No celular (375 e 390px), o destaque do cartão "Cursando" ocupa uma linha e a seção "Projetos em destaque" começa mais acima do que hoje.
4. Nada no conteúdo, no código e na documentação viva diz que o cargo atual é de estagiário.

## Fora de escopo

- Reescrever o design da Início, o `AvailabilityBadge`, a faixa de stack ou os destaques.
- O conteúdo de Projetos, o CV como documento do PO (ver "Questões em aberto", Q3) e a `description` do `package.json` (não é metadado do site; `package.json` também é editado pela #143).
- Formulário de contato, `D05`, backend (R1).
- Os fixtures de teste que usam "Desenvolvedor full stack" sem depender do conteúdo real (`src/testUtils/buildProfile.ts`, `src/components/test/AboutNowCard.test.tsx`, `src/utils/test/buildAboutJsonLd.test.ts`, `src/components/test/StatusCard.test.tsx`): são dados de teste, ficam como estão.
- `docs/adr/0004-prerendering.md` (registro histórico) e `docs/design/prototype/` (protótipo congelado, PI5): ficam como estão.
- Regenerar a imagem OG (`scripts/generateOgImage.ts` só desenha o gato, sem texto de cargo).
- Texto novo de UI além do que está listado em "Textos novos" abaixo.

## Inventário (arquivo e linha, em `origin/staging` a413e7a)

Estagiário, intern, pasante, estágio, internship:

| Onde | O que diz | Muda? |
| ---- | --------- | ----- |
| `public/content/pt-BR/profile.json:2` | `role`: "Estagiário de Desenvolvimento Frontend" | Sim: vira "Desenvolvedor full stack Júnior" |
| `public/content/en/profile.json:2`, `es/profile.json:2` | "Frontend Development Intern", "Pasante de Desarrollo Frontend" | Sim: "Junior full stack developer", "Desarrollador full stack junior" |
| `public/content/{pt-BR,en,es}/profile.json:3` | `homeIntro` com "estagiário/intern/pasante de desenvolvimento frontend" e a stack | Sim (Q6): a stack passa para a linha do hero |
| `public/content/{pt-BR,en,es}/profile.json:29` | `aboutParagraphs[1]`: "Atualmente sou estagiário de desenvolvimento na InCicle" | Sim, ou some se a #145 tiver cortado o parágrafo (reconferir depois do rebase) |
| `public/content/{pt-BR,en,es}/profile.json:31` | `aboutParagraphs[3]`: "evoluir de estagiário para uma posição júnior e, no médio prazo, pleno" | Sim, ou some pela #145 (reconferir) |
| `public/content/pt-BR/timeline.json:6,8`, `en/timeline.json:6,8`, `es/timeline.json:6,8` | `title` "Estagiário de Desenvolvimento Frontend" e `details` "Estágio · Híbrido" | Sim (Q4, Q5): é a entrada atual, lida pelo cartão "Trabalhando como" |
| `public/cv/cv-pt-BR.md:14`, `cv-en.md:14`, `cv-es.md:14` (e os três `.pdf`) | "InCicle — Estagiário de Desenvolvimento (05/2026 – atual)" | Decisão do PO (Q3); default: fora desta PR |
| `src/utils/test/buildAboutJsonLd.test.ts:97,127`, `src/components/test/AboutNowCard.test.tsx:8,22` | "Estagiário" em fixture | Não (dado de teste independente do conteúdo) |
| `docs/` (`home.md`, `about.md`, `overview.md`, `non-functional-requirements.md`, `glossary.md`) | nenhum diz estagiário/intern/pasante (conferido por `grep`) | Não |

"Desenvolvedor full stack" como cargo ou título:

| Onde | Muda? |
| ---- | ----- |
| `src/locales/{pt-BR,en,es}/home.json:6` (`heading`) e `:4` (`meta.description`) | Sim |
| `src/pages/hooks/useHome.ts:40` (`jobTitle: t("home:heading")`) | Não muda o código: o `jobTitle` continua vindo de `home:heading` |
| `src/utils/buildAboutJsonLd.ts:60` (`jobTitle: profile?.role`) | Não muda o código; muda o dado |
| `public/content/{pt-BR,en,es}/profile.json:4` (`summary`: "desenvolvedor full stack") | Sim: acrescenta o nível |
| `index.html:95,97` (`<meta description>` e `<title>`) | Sim |
| `README.md:3` (resumo em inglês) | Sim |
| `docs/screens/home.md:37,85,147,197,198,353,397` | Sim (RF-HOME-04 e A11Y-IN01 são riscados; ver T8) |
| `docs/design/design-system.md:223`, `docs/screens/layout.md:301`, `docs/product/accessibility.md:300`, `docs/product/overview.md:3` | Sim |
| `docs/architecture/api-contract.md:117,119` (exemplo) | Não, é exemplo ilustrativo; só muda se T4 acrescentar `cardTitle` ao exemplo |
| `package.json:3` (`description`) | Não (fora de escopo) |
| Testes que afirmam o `h1`/descrição: `src/pages/test/Home.page.test.tsx:110,127,138,153,159,163,196`, `src/test/App.test.tsx:28,41,53,65,69,80,91`, `src/test/entry-server.test.tsx:18,23,28`, `src/routers/test/routes.test.tsx:47,56-58,126,240,246,253,325`, `src/prerender/test/mountClient.test.tsx:134,145,157,166`, `src/pages/hooks/test/useHome.test.tsx:123` | Sim |
| E2E: `e2e/support/uiTexts.ts:36,39,252,255,466,469`, `e2e/language.spec.ts:15,22,29` | Sim (`navigation`, `not-found` e `home-flows` leem de `uiTexts`, não têm literal) |

## Decisões de design propostas (o PO aprova a spec)

### a) Estrutura do hero (D24, RF-HOME-04, RF-HOME-05, D44)

- O `h1` passa a ser exatamente o cargo: pt-BR "Desenvolvedor full stack Júnior", en "Junior full stack developer", es "Desarrollador full stack junior" (chave `home:heading`, sem ponto, D24; "em TypeScript" sai porque a stack agora tem linha própria).
- Entre o `h1` e o parágrafo do conteúdo entra um `<p>` com a chave nova `home:hero.positioning`: pt-BR "Procuro uma vaga Júnior com React, TypeScript e Node.js", en "Looking for a Junior role with React, TypeScript and Node.js", es "Busco una posición Junior con React, TypeScript y Node.js" (primeira pessoa, sem ponto, sem superlativo). Declara a vaga (a intenção), enquanto o `h1` declara quem é e o nível.
- O parágrafo `homeIntro` continua vindo do conteúdo (D44, RF-HOME-05) e deixa de repetir a stack (Q6).
- **Por que não o `h1` mantido e só a linha nova:** o `jobTitle` do JSON-LD é `home:heading`; com "em TypeScript" ele seguiria diferente do `profile.role` de Informações, e as duas páginas descrevem a mesma `Person`. Com o `h1` igual ao cargo, `jobTitle` da Início, `profile.role` e o título da experiência atual passam a ser a mesma string por idioma (CA7).
- **Chaves:** `hero.positioning` é nova nos três idiomas; `heading` e `meta.description` mudam de valor; nenhuma chave deixa de ter uso (R2).
- A linha fica fora do `h1` (o `h1` é só o cargo, alvo de foco na navegação, RF-LAY-32) e usa `--text-body-lg` com `--text-strong`, limitada a `--measure`; sem token novo.

### b) Cartão "Cursando" no celular

Investigação: `.cards` é `grid` com `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))`, então abaixo de ~37rem os dois cartões empilham, e o destaque do cartão `studying` é `<JoinedParts parts={[organization, title]} />` em `--text-body-lg` (Bricolage 700), que quebra em quatro ou cinco linhas a 390px. Não existe texto curto no conteúdo que caiba numa linha, e cortar por reticências esconde conteúdo visível (A11Y-G11, 1.4.4/1.4.10; o axe não acusa). Por isso:

- **Proposta (default): campo opcional `cardTitle` na trajetória** (texto curto traduzido, só para o cartão estreito). `StatusCard` ganha a prop opcional `compactTitle` e renderiza o destaque completo e o compacto em dois `<span>`; abaixo de 640px (NF-RE-01) o CSS mostra só o compacto, a partir de 640px só o completo (`display: none` esconde o outro também do leitor de tela, sem leitura duplicada). Sem `cardTitle`, o cartão se comporta como hoje. Valores: pt-BR "Fatec Jacareí · Multiplataforma", en "Fatec Jacareí · Multiplatform", es "Fatec Jacareí · Multiplataforma" (exceção de tradução, pois é igual ao pt-BR). A instituição e o curso completos continuam em Informações.
- Abaixo de 640px os dois cartões também usam `--space-4` de padding e `--text-body-md` no destaque, para o cargo ("Desarrollador full stack junior", 31 caracteres) caber em uma linha a 375px; sem token novo.
- Medida: a 375px e 390px, nos três idiomas, o destaque de cada cartão tem altura de no máximo 1,5 vez o `line-height` calculado, nenhum cartão rola na horizontal, e a altura do cartão "Cursando" cai de ~170px para um valor medido pelo executor (anotado na Evidência, ponto de partida do teto: 8rem). "Os projetos sobem" é conferido contra a linha de base medida pelo executor em `staging` (posição do `h2` "Projetos em destaque" a 375 e 390px, antes e depois, na Evidência); a linha nova do hero soma uma linha, então o critério é: depois ≤ antes.
- Alternativas e custo em "Questões em aberto" (Q2).

### c) Entrada atual da trajetória (cartão "Trabalhando como")

O cartão lê o item `current` (experiência sem `end`) de `buildCurrentTimeline`. Default seguro enquanto o PO não informar a data da promoção: **editar no lugar** (mesmo `id` e `start` "2026-05"), trocando `title` e `details`. Efeito: o cartão passa a dizer "Júnior desde 05/2026". Opção preferida pelo PO, se ele der a data (Q5): encerrar a entrada de estagiário com `end` e abrir outra (`id` novo por `npm run content:id`, `start` na data da promoção); `buildCurrentTimeline` já pega a sem `end`.

### d) Metadados

- `meta.description`: pt-BR "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack Júnior com React, TypeScript e Node.js: projetos, trajetória e contato."; en "Portfolio of Luiz Felipe dos Santos, junior full stack developer with React, TypeScript and Node.js: projects, background and contact."; es "Portafolio de Luiz Felipe dos Santos, desarrollador full stack junior con React, TypeScript y Node.js: proyectos, trayectoria y contacto." `og:description` e `twitter:description` seguem por `PageMeta` (mesma chave).
- `meta.title` não muda ("Portfólio · Luiz Felipe dos Santos"; `layout.md` guarda a exceção da raiz).
- `index.html` (shell sem JavaScript, em `pt-BR`): `<title>` "Luiz Felipe dos Santos · Desenvolvedor full stack Júnior" e a descrição igual à de `pt-BR` acima.
- JSON-LD da Início: `jobTitle` segue por `home:heading`; o de Informações segue por `profile.role`; os dois agora iguais (e).

### e) Onde registrar a decisão

Proposta: acrescentar uma linha em `docs/design/decisions.md` (fonte "PO (spec)"), porque a decisão atravessa Início, Informações, JSON-LD, README e CV, e `decisions.md` é o registro transversal citado por specs e issues. O último ID em `origin/staging` é `D68` (o texto "último é D56" do pedido está desatualizado) e a branch da #143 cria `D69`; portanto o ID esperado é `D70`, mas **o executor reconfere o próximo ID livre depois do rebase** e nunca fixa `D69`. Alternativa mais barata (sem conflito com a #143): registrar só em `home.md` e `about.md`.

## Textos novos (R2, `pt-BR` referência, `en` e `es`)

| Namespace | Chave | pt-BR | en | es |
| --------- | ----- | ----- | -- | -- |
| `home` | `heading` (muda) | Desenvolvedor full stack Júnior | Junior full stack developer | Desarrollador full stack junior |
| `home` | `meta.description` (muda) | ver d) | ver d) | ver d) |
| `home` | `hero.positioning` (nova) | Procuro uma vaga Júnior com React, TypeScript e Node.js | Looking for a Junior role with React, TypeScript and Node.js | Busco una posición Junior con React, TypeScript y Node.js |

Conteúdo (não é chave; `public/content/`): `profile.role` igual ao `heading`; `homeIntro` (Q6, proposta): pt-BR "Estudante de Desenvolvimento de Software Multiplataforma e desenvolvedor na InCicle, construindo produtos reais com foco em frontend.", en "Multiplatform Software Development student and developer at InCicle, building real products with a focus on the frontend.", es "Estudiante de Desarrollo de Software Multiplataforma y desarrollador en InCicle, construyendo productos reales con foco en el frontend."; `summary` com "full stack Júnior"/"junior full stack"; título da experiência atual igual ao `heading`; `cardTitle` do item `education` em curso.

## Critérios de aceite

Legenda: [teste] Vitest, [E2E] Playwright, [manual] verificação do PO ou do `qa` na tela.

- [ ] **CA1** (issue 1) [teste] [E2E]: a Início em `pt-BR`, `en` e `es` tem `h1` exatamente igual a "Desenvolvedor full stack Júnior", "Junior full stack developer" e "Desarrollador full stack junior", sem ponto (D24), e logo abaixo dele o `<p>` com `hero.positioning` nos três idiomas, sem chave aparecendo no lugar do texto (RF-HOME-26, RF-HOME-27).
- [ ] **CA2** (issue 1) [E2E]: sem JavaScript, o HTML pré-renderizado de `/pt-BR`, `/en` e `/es` já traz o `h1` e a linha de posicionamento (`no-javascript.spec.ts`), e `entry-server.test.tsx` afirma o mesmo.
- [ ] **CA3** (issue 2) [teste] [E2E]: `<title>`, `<meta name="description">`, `og:description` e `twitter:description` da Início usam a descrição nova (`pt-BR`, `en`, `es`) e o `<title>` e a descrição de `index.html` batem com a de `pt-BR` (RF-HOME-26, NF-IA).
- [ ] **CA4** (issue 2) [teste]: `README.md` abre com o resumo em inglês dizendo "Junior full stack developer" com React, TypeScript e Node.js, e `npm test -- --run scripts/test/readme.test.ts` continua verde.
- [ ] **CA5** (issue 3) [E2E]: a 375px e a 390px, nos três idiomas, o destaque do cartão "Cursando" ocupa uma linha (altura ≤ 1,5 vez o `line-height` calculado), o do cartão "Trabalhando como" também, e a página não rola na horizontal (RF-HOME-28, NF-RE-03).
- [ ] **CA6** (issue 3) [E2E] [manual]: a 375px e 390px, o `h2` "Projetos em destaque" fica em posição menor ou igual à da linha de base medida em `staging`, mesmo com a linha nova do hero; a 640px e acima, o cartão mostra o texto completo (instituição e curso) e nada muda no desktop.
- [ ] **CA7** (decisão do PO) [teste]: nos três idiomas, `home:heading`, `profile.role` e o `title` da experiência atual da trajetória são a mesma string, e o `jobTitle` do JSON-LD da Início é igual ao de Informações (`Home.page.test.tsx` lê o `<script type="application/ld+json">`; a igualdade entre as fontes é afirmada em `src/services/content/test/content.test.ts`).
- [ ] **CA8** (decisão do PO) [teste]: nenhum `public/content/{pt-BR,en,es}/profile.json` e `timeline.json` contém "estagiário", "estágio", "intern", "internship", "pasante" ou "pasantía" (teste de conteúdo, caixa ignorada); a validação de conteúdo real (`content.test.ts`) continua sem problemas, inclusive de tradução.
- [ ] **CA9** (decisão do PO) [teste]: o cartão "Trabalhando como" mostra o cargo Júnior e a InCicle e o `worksFor` do JSON-LD de Informações continua `InCicle` (`Home.page.test.tsx`, `buildAboutJsonLd.test.ts`).
- [ ] **CA10** (issue 4) [teste] [E2E]: `npm run test:cov`, os testes de tela e os E2E de Início, Informações, idioma e navegação passam com os textos novos; `StatusCard` tem teste dos dois spans (completo e compacto) e do comportamento sem `cardTitle` (RF-HOME-28).
- [ ] **CA11** (R2) [teste]: os três `home.json` têm as mesmas chaves e `hero.positioning` existe nos três; nenhuma chave de `home` ficou sem uso.
- [ ] **CA12** (documentação) [review]: `home.md` risca `RF-HOME-04` e `A11Y-IN01` e traz `RF-HOME-26`, `RF-HOME-27`, `RF-HOME-28` e o novo ID de acessibilidade; `design-system.md`, `layout.md`, `accessibility.md`, `overview.md`, `about.md` (se citar o cargo), `data-model.md` e `api-contract.md` (se `cardTitle` entrar) e `decisions.md` coerentes com a decisão.
- [ ] **CA13** [E2E] [teste]: acessibilidade preservada: `expectNoAxeViolations` na Início e em Informações nos temas e larguras já cobertos, e `jsx-a11y` limpo.
- [ ] **CA14** (pré-condição) [review]: a execução só começa depois do merge da #229 e do rebase; o texto dos parágrafos de `aboutParagraphs` foi reconferido depois dele.

## Casos de borda

- QUANDO a trajetória não tem item `education` em curso ENTÃO a seção mostra só o cartão "Trabalhando como" e nada quebra.
- QUANDO o item `education` não tem `cardTitle` ENTÃO o cartão mostra o destaque completo em qualquer largura (comportamento de hoje).
- QUANDO o idioma é `es` ENTÃO "Desarrollador full stack junior" cabe em uma linha a 375px no cartão "Trabalhando como" (o caso mais longo).
- QUANDO a largura é exatamente 640px ENTÃO o cartão mostra o texto completo (compacto só abaixo de 640px, NF-RE-01).
- QUANDO o perfil falha ao carregar ENTÃO o `h1` e a linha de posicionamento (texto fixo) continuam visíveis e o parágrafo do conteúdo some sem mensagem (RF-HOME-05, RF-HOME-24).
- QUANDO a trajetória carrega devagar ENTÃO o skeleton dos cartões não muda de altura de forma visível quando o conteúdo chega (cartão compacto ocupa o espaço do skeleton, sem salto grande).
- QUANDO o texto é ampliado a 200% ENTÃO nenhum texto é cortado (não há reticências nem `overflow: hidden` no destaque; A11Y-G11).

## Estratégia de validação

- **Checagens automatizadas:** por tarefa, `npm run typecheck && npm run lint && npm test -- --run <arquivos>`; no fim, `npm run build`, `npm run test:cov` e os E2E de Início, Informações, idioma, navegação e sem JavaScript (`npm run build:fatec` antes; ver T10).
- **Checagens manuais (`qa` e PO):** Início a 375, 390 e 1280px, nos três idiomas e nos dois temas (aparência do cartão e da linha nova; capturas anotadas na Evidência da T6); conferir que o desktop não mudou.
- **Rollback / mitigação:** reverter o commit da tarefa de cartão (T6) sem tocar nos textos; os textos do cargo são independentes do cartão.

## Pré-condição de execução, conflitos e ordem

- **#145 (PR #229, `feat/145-informacoes-trajetoria-antes-da-stack`, aberto):** edita `public/content/{pt-BR,en,es}/profile.json` (reduz `aboutParagraphs` a dois parágrafos), `src/pages/About.page.tsx`, `docs/screens/about.md`, `docs/product/overview.md`, `docs/README.md`, `docs/product/non-functional-requirements.md`, `e2e/about.spec.ts` e `e2e/no-javascript.spec.ts`. Esta feature edita `profile.json` (os parágrafos que dizem estagiário podem ter sumido lá), `about.md`, `overview.md` e `e2e/no-javascript.spec.ts`. **Pré-condição: executar depois do merge da #229 em `staging` e rebasear esta branch.** Se for preciso começar antes, as tarefas editam só `role`, `homeIntro` e `summary` (linhas 2 a 4) em `profile.json`, e deixam `aboutParagraphs` e os docs para depois do rebase. Toda tarefa que toca `aboutParagraphs` diz "reconferir o texto depois do rebase".
- **#143 (`feat/143-secao-experimentos-vitrine`, ainda não é PR):** mexe em Projetos e também em `docs/design/decisions.md` (cria `D69`), `e2e/support/uiTexts.ts`, `e2e/no-javascript.spec.ts`, `src/testUtils/buildContentSnapshot.ts` e `package.json`. Sobreposição provável nesses quatro arquivos de texto/teste. Mitigação: tarefas pequenas e atômicas que tocam cada um desses arquivos num commit só (T3 para `uiTexts.ts` e `no-javascript.spec.ts`, T4 para `buildContentSnapshot.ts`, T8 para `decisions.md`), o que deixa o rebase barato; não tocar `package.json`.
- **Changeset:** `patch` (`roadmap.md#versionamento`: ajuste de conteúdo e texto, sem tela nova), com texto sem jargão, um arquivo `.changeset/*.md` por PR (T10).

## Questões em aberto

- **Q1 (hero).** A linha sob o `h1` é a intenção ("Procuro uma vaga Júnior com React, TypeScript e Node.js") ou só a stack ("React, TypeScript e Node.js")? Proposta/default: a intenção (atende o critério 1 da issue, que pede que a linha "declare a vaga Júnior"), com o `h1` sendo o cargo.
- **Q2 (cartão "Cursando", uma linha).** O nome completo cabe em duas a quatro linhas a 390px. Opções: (a) campo novo opcional `cardTitle` no conteúdo, com texto curto traduzido (default; sem corte de conteúdo, mas muda o contrato: `TimelineItem.types.ts`, `validateTimeline`, `createBlankTimelineItem`, `translatablePaths`, `buildContentSnapshot`, `data-model.md`, `api-contract.md`); (b) aceitar duas linhas e só compactar o padding (sem contrato, mas não cumpre "uma linha"); (c) reticências por CSS (sem contrato e uma linha, mas corta texto visível e fere A11Y-G11/1.4.4; não recomendado). O PO escolhe; as tarefas T4 a T6 estão escritas para (a) e T4/T5 somem se for (b) ou (c).
- **Q3 (CV).** `public/cv/cv-*.md` (escritos pelo PO) dizem "Estagiário" e os `.pdf` são versionados; mudar o `.md` obriga regerar os PDFs com `npm run cv:pdf` (Chromium) no mesmo commit, senão `scripts/test/resumePdfsUpToDate.test.ts` falha. Default: **fora desta PR** (é documento do PO e depende da data da promoção, Q5), registrado como pendência para uma issue própria; o risco é o botão "Baixar CV" entregar um PDF que ainda diz estagiário. Se o PO mandar entrar, a T9 é feita (só a linha do cargo e o período, com os PDFs).
- **Q4 (`details` da entrada atual).** "Estágio · Híbrido" perde "Estágio". Qual o regime a mostrar (CLT, PJ, nenhum)? Default: só "Híbrido" (pt-BR), "Hybrid" (en), "Híbrido" (es); como pt-BR e es ficam iguais, a T2 acrescenta "Híbrido" a `items[].details[]` em `translationExceptions.ts`. Se o PO quiser o regime, trocar o texto.
- **Q5 (data da promoção).** Editar a entrada no lugar (default, `start` "2026-05") ou encerrar a de estagiário com `end` e abrir a Júnior (precisa do mês da promoção, `AAAA-MM`)? Default seguro: no lugar, anotando que o período passa a valer para o cargo novo. Se o PO der a data, a T2 troca para duas entradas.
- **Q6 (`homeIntro`).** A proposta de texto (ver "Textos novos") remove a stack e "estagiário" do parágrafo e mantém o sentido; o PO ajusta o tom.
- **Q7 (decisão registrada).** `decisions.md` (D70 esperado, reconferir) ou só `home.md`/`about.md`? Default: `decisions.md`, por ser transversal.
- **Q8 (capturas do README).** `docs/design/assets/readme/home-{light,dark}.png` mostram o título antigo; regerar com `npm run readme:images` (exige `build:fatec` e `preview:fatec`, Chromium). Default: regerar na T7, com o limite de 300 KB cada; se a máquina não aguentar, vira pendência anotada.

## Riscos

- Conflito de rebase com a #229 em `profile.json` (mitigado pela pré-condição) e com a #143 em `decisions.md`, `uiTexts.ts`, `no-javascript.spec.ts` e `buildContentSnapshot.ts` (mitigado por tarefas pequenas).
- "Uma linha" depende de texto curto; sem `cardTitle` (opções b e c) o critério 3 não se cumpre ou fere a acessibilidade.
- Mudar `home:heading` quebra de uma vez seis arquivos de teste e `uiTexts`: a T1 e a T3 precisam atualizá-los no mesmo commit do código para nunca haver estado vermelho commitado.
- O CV (Q3) pode ficar diferente do site; E2E de CV (`resume.spec.ts`) não afirma o conteúdo do PDF.
- E2E de largura 375px usa `setViewportSize` dentro de `home.spec.ts` (já em `perEnvironmentSpecs`); roda nos quatro projetos, o que acrescenta tempo (pular nos projetos desktop).

## Notas / decisões

- Decisões de design aplicadas: D24 (sem ponto), D44 (selo e parágrafo do hero vêm do perfil), D39 (período "desde"), D54 (status atual da API), NF-RE-01 (640px), D68 (faixa de stack, não mexe). Precedência R3: convenções do repositório > `decisions.md` > protótipo > handoff; o protótipo (`prototipo-inicio`) tem o título antigo e é congelado (PI5).
- IDs novos em `home.md` (nunca reaproveitar, risca-se o que deixa de valer): `RF-HOME-26` (h1 igual ao cargo), `RF-HOME-27` (linha de posicionamento), `RF-HOME-28` (cartões de status compactos abaixo de 640px); `RF-HOME-04` e `A11Y-IN01` são riscados. O novo ID de acessibilidade é o próximo livre depois de `A11Y-IN07` (conferir por `grep` em `accessibility.md`).
- R1: tudo local (JSON); nada depende de backend. `cardTitle` é campo opcional de conteúdo que a API futura também devolve.
- A linha de posicionamento é texto fixo (chave), não conteúdo, para o SEO (`meta.description`) e o HTML pré-renderizado não dependerem do carregamento do perfil.

# Roadmap

Este documento diz em que ordem as entregas do portfólio acontecem e o que define cada versão. Não é cronograma nem quadro de status: datas e andamento vivem nas issues do GitHub e no `**Status:**` de cada spec. A única data fixa é o prazo da v1: **23/11/2026**. O produto tem duas fases: a **v1** é a entrega da faculdade (Fatec) e as versões **V2+** são de uso pessoal. As issues que ainda não existem aparecem por letra e descrição (A a Y) e serão criadas depois que a documentação (#1 a #11) terminar; ao criar uma delas, a letra vira o número neste documento. Mudar a ordem dos marcos ou o escopo de uma versão é decisão do PO e muda este documento no mesmo PR. Os requisitos R1 a R3 estão em [`overview.md`](overview.md) e as decisões de design (`Dnn`, `PIn`) em [`decisions.md`](../design/decisions.md).

## Versões

| Versão | Para quê                     | Onde roda                                                                                       | Dados                                          | Backend |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------- |
| v1     | Entrega da faculdade (Fatec) | GitHub Pages de `fatec-jacarei-dsm-portfolio/ra2581392423047`, subcaminho `/ra2581392423047/`   | Reais, em JSON local, pelo caminho da API (R1) | Não     |
| V2+    | Uso pessoal                  | Vercel (`staging` = testes, `main` = produção), depois AWS com backend e banco na mesma máquina | Do backend, quando existir                     | Sim     |

A Vercel (#15) pode existir antes da v1 como ambiente pessoal, mas não é requisito dela.

**Destino por versão:** a linha 1.x (de `v1.0.0` até antes de `v2.0.0`) é a única publicada no repositório da Fatec. A partir de `v2.0.0` o destino é só o deploy pessoal (Vercel, depois AWS), e a Action de publicação da Fatec fica inerte (ver M4).

## Versionamento

A partir da v1, o projeto usa SemVer com versão automática por Changesets (issue Q), no modelo do repositório `ai-core` do PO, adaptado a uma aplicação que não publica pacote.

- **Antes da v1, sem tags.** O `version` do `package.json` fica em `0.1.0` até a entrega.
- **Cada release é uma tag `vX.Y.Z` na `main`**, com GitHub Release e a seção correspondente do `CHANGELOG.md`, gerado pelo Changesets.
- **Regra de incremento:** `major` quando muda o público ou a forma de publicar (`v1.0.0` = entrega da Fatec; `v2.0.0` = uso pessoal com backend); `minor` para tela ou funcionalidade nova; `patch` para correção e ajuste de conteúdo. Hotfix gera `patch`.
- **Cada PR de trabalho traz um changeset** (`.changeset/*.md` com o tipo e uma nota em português), ou um changeset vazio (`changeset --empty`) quando não muda versão, como em documentação. Uma checagem de CI configurada na Q garante isso.
- **Fluxo:** o changeset entra no PR para a `staging`. Um push na `staging` com changesets pendentes faz a Action abrir ou atualizar o PR de versão (`changeset-release/staging` → `staging`), que sobe o `version` e escreve o `CHANGELOG.md`. A promoção `staging` → `main` leva a versão nova. Um push na `main` com versão `>= 1.0.0` ainda sem tag cria a tag `vX.Y.Z` e o Release e, se a versão for 1.x, chama a publicação da Fatec (O).
- **Chegada à `1.0.0`:** o PR que marca a entrega traz um changeset `major`; o PR de versão gera `1.0.0` (a partir de `0.1.0`) e a promoção cria a tag `v1.0.0`, sem tag manual. Entre a configuração da Q e esse PR, todo changeset é vazio, para nenhuma versão `0.x` ser gerada.

## Ponto de partida: a ordem do handoff

A ordem sugerida pelo handoff, citada na #11: (1) tokens e tema com `data-theme`; (2) primitivos; (3) cabeçalho e rodapé; (4) Início; (5) Projetos; (6) Projeto; (7) Informações e Contato; (8) menu mobile. O roadmap muda essa ordem nestes pontos:

- A documentação de requisitos e decisões (#1 a #11) vem antes da implementação, e as issues de implementação só nascem depois dela.
- O menu mobile entra no layout, porque D01 já decidiu o painel.
- O conteúdo real (#13) é marco próprio, em paralelo à fundação visual, e depende de material do PO além do modelo de dados (#10).
- Informações e Contato viram duas entregas: Contato carrega o formulário desligado (D05).
- A publicação no GitHub Pages do repositório da v1 (O) é configurada cedo, logo depois do layout, em modo de ensaio, para as telas já nascerem funcionando sob o subcaminho. A primeira publicação real é a `v1.0.0`.

## Marcos

| Marco                     | Entrega                                                                                                                                                                                                                                                                                                                                                                              | Depende de                                                                           | Issues                                                     | Bloqueio                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------ |
| M0 Requisitos e decisões  | Roadmap; visão; requisitos não funcionais e de acessibilidade; layout e cinco telas; modelo de dados e contrato. Ao fim, criação das issues A a Y                                                                                                                                                                                                                                    | Nada                                                                                 | #11, #1, #8, #9, #2, #3, #4, #5, #6, #7, #10 (nesta ordem) | Nenhum                                     |
| M1 Fundação visual        | A: tokens do protótipo, tema por `data-theme`, foco visível. T: verificação automática de acessibilidade com `axe-core` nos testes. B: componentes base e ícones                                                                                                                                                                                                                     | #2, #8, #9                                                                           | A, B, T (a criar)                                          | Nenhum                                     |
| M2 Conteúdo real          | JSONs com o conteúdo real do PO (projetos, trajetória, perfil, stack, CV, certificados, canais) em `pt-BR`, traduzido para `en` e `es` no projeto, servido pela camada local no formato do contrato                                                                                                                                                                                  | #10 e o conteúdo entregue pelo PO                                                    | #13                                                        | Material do PO (conteúdo)                  |
| M3 Layout compartilhado   | W: idioma no caminho da URL, `/en/` e `/es/`, sem `?lng=`. C: cabeçalho com logo, navegação, idioma e tema; menu mobile; rodapé e variante de Contato; 404 e erro; metadados. V: canônica por idioma, `hreflang`, Open Graph e dados estruturados                                                                                                                                    | #2, A, B; W: #2 e #8, com início possível em paralelo ao M1; C e V também W          | W, C, V (a criar)                                          | Nenhum (D01 e D02 decididos)               |
| M4 Publicação Fatec       | O: build com `base` `/ra2581392423047/`, `basename` no router, `404.html`, `.nojekyll` e workflow que faz commit do `dist/` em `main:/docs` do repositório da v1. Y: teste de acessibilidade ponta a ponta com Playwright e axe no CI, contra esse build. S: pré-renderização das rotas públicas nos três idiomas, com página própria por rota e idioma e `404.html` pré-renderizado | C; S também A, W e #10; token do PO nos Secrets deste repositório                    | O, S, Y (a criar)                                          | Credencial (token aceito pela organização) |
| M5 Telas                  | D Início → E Projetos → F Projeto → G Informações → H Contato, com estados, dois temas e três idiomas                                                                                                                                                                                                                                                                                | Cada tela: o próprio documento (#3 a #7), #13, C, O, S e V; F também E               | D, E, F, G, H (a criar)                                    | Nenhum para implementar                    |
| M6 Preparação da v1       | Q: versionamento por Changesets, tag e Release. X: CV gerado do JSON em PDF, Markdown e HTML nos três idiomas (D30). I: botões de CV ligados aos PDFs gerados. U: `robots.txt`, `sitemap.xml` e `llms.txt`. L: capturas reais e foto (D26). J: poda de pesos de fonte. K: verificação de acessibilidade, responsividade e performance no build do Pages                              | M5; I depende de X; X e L também dependem de material do PO; K também de S, U, V e W | Q, I, J, K, L, U, X (a criar)                              | Material do PO (conteúdo do CV e imagens)  |
| M7 Entrega da v1          | PR com changeset `major`, PR de versão (`1.0.0`), promoção `staging` → `main`, tag `v1.0.0` e Release criados pela Action, publicação no GitHub Pages do repositório da v1 e URL entregue ao professor; R: vídeo de demonstração                                                                                                                                                     | M6, O e Q                                                                            | R (a criar)                                                | Herda os de M6                             |
| Trilha pessoal (paralela) | Deploy na Vercel: `staging` em testes, `main` em produção pessoal                                                                                                                                                                                                                                                                                                                    | Nada além do PO configurar a conta                                                   | #15                                                        | Nenhum; não é requisito da v1              |
| V2+ Uso pessoal           | Backend; troca da fonte local pela API; envio real do formulário com proteção contra spam e sem flag; domínio próprio; migração para AWS; destino só pessoal a partir de `v2.0.0`                                                                                                                                                                                                    | Backend e banco                                                                      | M, N, P (a criar); domínio sem issue                       | Backend                                    |

```mermaid
flowchart LR
    M0["M0 Requisitos e decisões<br/>#1 a #11"] --> M1["M1 Fundação visual<br/>A, B, T"]
    M0 --> M2["M2 Conteúdo real<br/>#13"]
    M1 --> M3["M3 Layout compartilhado<br/>W, C, V"]
    M3 --> M4["M4 Publicação Fatec<br/>O, S, Y"]
    M2 --> M5["M5 Telas<br/>D, E, F, G, H"]
    M3 --> M5
    M4 --> M5
    M5 --> M6["M6 Preparação da v1<br/>Q, I, L, J, U, X, K"]
    M6 --> M7["M7 Entrega da v1<br/>v1.0.0"]
    M4 --> M7
    TP["Trilha pessoal<br/>#15"] -.-> V2["V2+ Uso pessoal<br/>M, N, P"]
    M7 --> V2
```

### M0 — Requisitos e decisões

Ordem interna e motivo: #11 primeiro, porque ordena o resto; #1 (escopo, que passa a citar a entrega da Fatec); #8 e #9 antes das telas, porque cada documento de tela cita a checklist de acessibilidade e os requisitos transversais, inclusive as restrições do GitHub Pages (ver M4); #2 antes de #3 a #7; #10 por último, porque precisa que toda informação das cinco telas tenha entidade. Ao fechar #1 a #11, as issues A a Y são criadas. M1 anda quando #2, #8 e #9 fecham; M2, quando #10 fecha e o PO entrega o conteúdo.

### M1 — Fundação visual

A aplica D04 (tokens de cromo), D22, D23 com a cor e a aparência de D27 e as linhas "color-scheme", "Mecanismo de tema" e "Foco global" das divergências de tokens de [`decisions.md`](../design/decisions.md). B aplica D07, D11, D15 e D29, com os ícones de marca (GitHub, LinkedIn) junto. T vem antes de B e liga as regras do `axe-core` nos testes do `jsdom`, para todo componente de B já nascer verificado; as regras e a checklist de acessibilidade estão em [`accessibility.md`](accessibility.md).

### M2 — Conteúdo real

O conteúdo é o real do PO: o "mock" de R1 quer dizer só que a fonte é local, no formato do contrato de #10, trocável pela API sem mexer nas telas. O PO escreve o conteúdo só em `pt-BR`, num modelo gerado a partir do contrato de #10; `en` e `es` são traduzidos no projeto e revisados pelo PO antes da v1 (R2). Aplica PI5 (nada do provisório do protótipo vira dado) e D26 para as imagens. Todo caminho de arquivo servido de `public/` (JSON, imagem, PDF) é montado com `import.meta.env.BASE_URL`, porque no Pages o site vive num subcaminho.

### M3 — Layout compartilhado

Aplica D01, D02 (inclui o favicon), D04, D12, D21, D22, D23 (com D27), D31, PI1 e PI4. O link "Currículo em PDF" aponta para o arquivo de D14 mesmo antes de ele existir; o arquivo é gerado por X (D30).

W vem antes de C porque muda o roteamento e `src/i18n/`, que todas as telas e o seletor de C usam (NF-IN de [`non-functional-requirements.md`](non-functional-requirements.md)). Data-limite recomendada: na `staging` até 25/10/2026. W não tem plano B: mudar URL depois de publicada é pior que atrasar.

### M4 — Publicação Fatec

O repositório da v1 é [`fatec-jacarei-dsm-portfolio/ra2581392423047`](https://github.com/fatec-jacarei-dsm-portfolio/ra2581392423047), da organização da Fatec Jacareí, publicado em `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/`. O Pages de lá está em modo `legacy` e publica o que está commitado em `main:/docs` via Jekyll. O PO tem push, mas não admin nem maintain: não dá para trocar a fonte do Pages para GitHub Actions nem cadastrar deploy key ou secret lá. Hoje `docs/` tem o portfólio antigo (build de Create React App), que a v1 substitui por inteiro; o `README.md` da raiz fica.

Recomendações, decididas de vez na spec de O:

- **`base` e `basename`:** o `base` do Vite vem de variável de ambiente lida no `vite.config.ts` em tempo de build, com `/` por padrão, para o mesmo código servir a Vercel na raiz e o Pages no subcaminho. O `createBrowserRouter` recebe `basename` de `import.meta.env.BASE_URL`.
- **Fallback de SPA:** cópia do `index.html` para `404.html` no build do Pages. Mantém `createBrowserRouter` e URLs limpas, sem script de redirecionamento; o custo é a primeira carga de uma rota interna responder com status 404, irrelevante para a entrega. Descartados: `createHashRouter` (troca o router e muda todas as URLs) e o `404.html` que redireciona por query string (script extra no `index.html` e uma navegação a mais). Com S, cada rota pública tem HTML próprio e responde 200, e o `404.html` passa a ser a página não encontrada pré-renderizada.
- **Pré-renderização (S):** data-limite 08/11/2026. Se S não estiver na `staging` até lá, vai para a V2+ e a v1 sai pelo plano B (rotas pelo `404.html`, sem HTML legível sem JavaScript, mas com U e V). Se apertar, cai nesta ordem: S, os `llms-full.en.txt` e `llms-full.es.txt`, o JSON-LD de `/contact` e `/projects`. W e X não caem. Detalhe em [`non-functional-requirements.md`](non-functional-requirements.md#custo-e-prazo).
- **Workflow:** reutilizável, deste repositório (`workflow_call` e `workflow_dispatch`), válido só para a linha 1.x. Não há gatilho por push de tag: a tag é criada pela Action de release da Q com `GITHUB_TOKEN`, e evento gerado por `GITHUB_TOKEN` não dispara outro workflow. Por isso o job de release da Q chama este workflow (`uses: ./.github/workflows/<publicação da Fatec>.yml`) logo depois de criar a tag, quando a versão casa `^1\.`. Descartado criar a tag com token pessoal: exigiria um segundo token com escrita neste repositório só para disparar o evento, e o token da Fatec é restrito àquele repositório.
- **A fonte da versão é a tag.** O primeiro passo exige uma tag casando `^v1\.[0-9]+\.[0-9]+$` (recebida como entrada no `workflow_call` ou como ref no `workflow_dispatch`) e, sem ela, não publica. No `workflow_dispatch` fora de tag 1.x o workflow roda em modo de ensaio: faz o build da Fatec e o anexa como artefato, sem tocar no outro repositório. É assim que M4 valida o subcaminho antes da v1 (artefato e `vite preview` com o mesmo `base`), já que antes da v1 não há tag. O `version` do `package.json` não é consultado: a tag nasce dele, pelo Changesets.
- **Publicação:** roda build, lint e testes; builda com `base` `/ra2581392423047/`; copia `index.html` para `404.html`; adiciona `.nojekyll` (sem ele o Jekyll do modo `legacy` descarta arquivo e pasta com `_`); substitui todo o conteúdo de `docs/` do repositório da v1 pelo `dist/` e faz commit e push em `main`, mantendo o `README.md` da raiz. O workflow fica deste lado porque o PO não é admin do repositório da v1.
- **Na V2:** o workflow não é removido. Fica inerte, porque a release só o chama para 1.x e a checagem recusa outra tag, e continua podendo publicar uma correção `v1.x.y` se a Fatec pedir depois que a V2 começar. A remoção é um `Chore` opcional quando o PO der a entrega da Fatec por encerrada.
- **Credencial:** token pessoal do PO guardado nos Secrets deste repositório. Preferido: fine-grained com acesso só a `ra2581392423047` e permissão `contents: write`, se a organização aceitar fine-grained PAT (ela pode exigir aprovação de um admin). Se não aceitar, classic com escopo `repo`, com o risco registrado: o token dá escrita em todos os repositórios que o PO alcança, então tem expiração curta e é revogado depois da entrega. O que a organização aceita é verificado na execução de O.
- **Plano B sem token:** passo manual documentado em O (build local com o mesmo `base`, `404.html` e `.nojekyll`, cópia para `docs/` do outro repositório e commit). Não é reproduzível nem garante que o publicado passou no CI.
- O formulário de contato continua desligado no build do Pages (D05).

### M5 — Telas

Ordem Início → Projetos → Projeto → Informações → Contato: Início exercita o layout; Projeto reutiliza o card da listagem; Informações linka para projetos; Contato fecha com o formulário. Decisões por tela:

| Tela        | Issue | Decisões                                                              |
| ----------- | ----- | --------------------------------------------------------------------- |
| Início      | D     | D26, D11, D13, D14, D24, D28                                          |
| Projetos    | E     | D16, D17                                                              |
| Projeto     | F     | D06 (markdown sob demanda, conforme #8), D10, D18, D19, D33, PI1, PI2 |
| Informações | G     | D13, D14, D20, PI1                                                    |
| Contato     | H     | D05, D07, D21, D25, D29                                               |

Cada tela é conferida no build com o `base` do Pages, entra na pré-renderização de S e acrescenta as suas rotas e os seus roteiros de teclado à suíte ponta a ponta da Y (lightbox e seletor de documentos em F, modal em G, formulário em H).

### M6 — Preparação da v1

- **Q** configura o versionamento antes do PR que marca a entrega (ver [Versionamento](#versionamento)).
- **X** gera no build, a partir do JSON do CV, `cv-pt-BR.pdf`, `cv-en.pdf` e `cv-es.pdf` em `public/cv/` (D14), com as versões em Markdown e HTML (D30).
- **I** liga os quatro pontos de CV aos PDFs gerados por X (D30).
- **U** gera `robots.txt`, `sitemap.xml`, `llms.txt` e `llms-full*.txt` no build, a partir dos JSONs.
- **L** aplica D26: substitui os placeholders pelas capturas e pela foto; o projeto sem captura mantém o placeholder neutro.
- **J** faz a poda de D08, depois da última tela e antes da `main`.
- **K** roda, no build publicado do Pages, o método de verificação e a checklist de [`accessibility.md`](accessibility.md) (#9) em cada tela, a varredura em 360, 390, 768 e 1280px nos dois temas e nos estados especiais (PI3), o contraste de PI2 e as metas e o roteiro de verificação de [`non-functional-requirements.md`](non-functional-requirements.md), e abre uma issue de correção para cada falha.

### M7 — Entrega da v1

Um PR para a `staging` só com o changeset `major` da entrega; o PR de versão gera `1.0.0` e o `CHANGELOG.md`; a promoção `staging` → `main` segue o padrão do `CLAUDE.md`; o push na `main` faz a Action da Q criar a tag `v1.0.0` e o Release e chamar a publicação de O, que publica em `main:/docs` do repositório da v1; a URL pública do Pages é registrada no Release. Com o build publicado, o PO grava o vídeo de demonstração da v1 (R), com roteiro preparado no projeto, e entrega URL e vídeo até 23/11/2026. Se a #15 já existir, a mesma `main` também vai para a produção pessoal na Vercel, mas isso não faz parte do critério.

### Trilha pessoal

A #15 pode correr a qualquer momento (Vercel escolhida) e é recomendada cedo, para a `staging` ter ambiente de testes. Ela configura a Vercel e registra em ADR a hospedagem: Vercel agora e AWS quando houver backend.

### V2+ — Uso pessoal

M (fonte local → API), N (formulário real, proteção contra spam, remoção da flag; D05), P (migração para AWS com backend e banco na mesma máquina) e domínio próprio. A Action da Fatec fica inerte, com remoção opcional em `Chore` quando a entrega da Fatec for encerrada.

## Onde entra cada item

| Item                                     | Marco                         | Issue | Decisão             |
| ---------------------------------------- | ----------------------------- | ----- | ------------------- |
| Conteúdo real em JSON                    | M2                            | #13   | R1                  |
| Menu mobile                              | M3                            | C     | D01                 |
| Logo e favicon                           | M3                            | C     | D02                 |
| Seletor de idioma                        | M3                            | C, W  | D12, D31, PI4       |
| Ícones Lucide e de marca                 | M1                            | B     | D15                 |
| Renderizador de markdown                 | M5                            | F     | D06                 |
| Formulário de contato                    | M5 (desligado na v1); V2+     | H; N  | D05                 |
| Imagens reais e foto                     | M6                            | L     | D26 (substitui D03) |
| CV em PDF                                | M6                            | I, X  | D14, D30            |
| CV gerado do JSON                        | M6                            | X     | D30                 |
| Poda de pesos de fonte                   | M6                            | J     | D08                 |
| Pausa da faixa de stack                  | M5                            | D     | D28                 |
| Publicação da v1                         | M4 (ensaio) e M7 (publicação) | O     | —                   |
| Pré-renderização                         | M4                            | S     | NF-IA               |
| Canônica, Open Graph e JSON-LD           | M3                            | V     | NF-IA               |
| `robots.txt`, `sitemap.xml` e `llms.txt` | M6                            | U     | NF-IA               |
| Idioma no caminho e `hreflang`           | M3                            | W, V  | NF-IN, D31, D32     |
| Versionamento e release                  | M6                            | Q     | —                   |
| Hospedagem pessoal                       | Trilha pessoal                | #15   | —                   |
| AWS                                      | V2+                           | P     | —                   |
| Domínio próprio                          | V2+                           | —     | —                   |

## v1

A v1 é a entrega da faculdade, publicada no GitHub Pages do repositório da v1 a partir da tag `v1.0.0` da `main`, criada pelo versionamento automático, com a URL entregue ao professor. **Prazo: 23/11/2026.** Ela só sai com todos os itens marcados:

- [ ] As rotas `/`, `/projects`, `/projects/:id`, `/about` e `/contact`, a página não encontrada e a página de erro cumprem os critérios de aceite dos documentos de #2 a #7.
- [ ] Todo dado exibido é o conteúdo real do PO, vindo dos JSONs locais de #13 no formato do contrato de #10, sem requisição a backend.
- [ ] Toda tela abre e recarrega nas três URLs (sem prefixo, `/en/` e `/es/`) no Pages, e o seletor leva à URL equivalente, com interface e conteúdo traduzidos, sem chave no lugar de texto.
- [ ] Toda tela funciona nos temas claro e escuro.
- [ ] Imagens seguem D26: capturas e foto reais, placeholder neutro só para projeto sem captura.
- [ ] O conteúdo em `en` e `es` foi traduzido a partir do `pt-BR` e revisado pelo PO.
- [ ] O formulário de contato está implementado e desligado no build publicado (D05).
- [ ] Os PDFs de CV nos três idiomas são gerados no build a partir do JSON, com as versões em Markdown e HTML, e "Baixar CV" baixa o do idioma ativo (D14, D30).
- [ ] Os pesos de fonte sem uso foram removidos (D08).
- [ ] A verificação K passou no build publicado.
- [ ] `npm run build`, `npm run lint` e `npm run test:cov` (80% ou mais) passam no CI.
- [ ] No GitHub Pages do repositório da v1, abrir e recarregar cada rota nas três versões de URL (sem prefixo, `/en/` e `/es/`, inclusive `/projects/<id>`, uma inexistente e `/en/<rota-inexistente>`) mostra a aplicação, com fontes, imagens, JSONs e CV carregando sob o subcaminho.
- [ ] `curl` em cada rota e idioma do Pages devolve 200 e o conteúdo no idioma sem JavaScript, com `hreflang`, e `llms.txt` e `sitemap.xml` existem sob o subcaminho (NF-IA de [`non-functional-requirements.md`](non-functional-requirements.md)).
- [ ] `main:/docs` do repositório da v1 tem só o build da v1, com `404.html` e `.nojekyll`, e o `README.md` da raiz continua lá.
- [ ] O `package.json` está em `1.0.0`, gerado pelo PR de versão a partir do changeset `major`, e o `CHANGELOG.md` tem a seção `1.0.0`.
- [ ] A tag `v1.0.0` e o GitHub Release foram criados pela Action da Q (sem tag manual), e o Release tem a URL publicada.
- [ ] A publicação de O só ocorre para tag 1.x: um `workflow_dispatch` numa branch ou numa tag que não seja 1.x roda em ensaio, sem alterar o repositório da Fatec.
- [ ] O vídeo de demonstração da v1 (R) foi gravado no build publicado e entregue junto com a URL.

Fica fora da v1: backend, envio real do formulário, deploy na Vercel, domínio próprio e AWS.

## Bloqueios

| Item                                                      | Tipo           | Motivo                                                              | Quem desbloqueia                                            | Referência |
| --------------------------------------------------------- | -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| Conteúdo real (#13)                                       | Material do PO | JSONs ou textos ainda não entregues                                 | PO                                                          | R1, #10    |
| CV (X)                                                    | Material do PO | O conteúdo do CV ainda não está no JSON                             | PO                                                          | D30, #10   |
| Capturas e foto (L)                                       | Material do PO | Imagens ainda não entregues                                         | PO                                                          | D26        |
| Publicação Fatec (O)                                      | Credencial     | A organização pode não aceitar fine-grained PAT ou exigir aprovação | Admin da organização, ou o PO (classic PAT ou passo manual) | M4         |
| Fonte local → API (M), formulário real (N), AWS (P)       | Backend        | O backend não existe                                                | Backend                                                     | R1, D05    |
| Domínio próprio                                           | Decisão do PO  | Ainda não escolhido                                                 | PO                                                          | V2+        |
| Desbloqueados por decisão: menu mobile (D01) e logo (D02) | —              | Previstos como bloqueados por design na #11, já decididos           | —                                                           | D01, D02   |

## Issues a criar

Serão criadas depois que #1 a #11 terminarem; a letra vira número neste documento quando isso acontecer.

| Letra | Descrição                                                                                              | Marco            | Depende de                                      |
| ----- | ------------------------------------------------------------------------------------------------------ | ---------------- | ----------------------------------------------- |
| A     | Tokens do protótipo, foco visível e tema claro e escuro por `data-theme`                               | M1               | #2, #8, #9                                      |
| B     | Componentes base (Button, Chip, TextField, SearchInput, Skeleton, Spinner) e ícones                    | M1               | A, T                                            |
| C     | Layout compartilhado com cabeçalho, menu mobile, seletor de idioma, rodapé e erros                     | M3               | #2, A, B, W                                     |
| D     | Tela Início                                                                                            | M5               | #3, #13, C, O, Y, S, V                          |
| E     | Listagem de Projetos com busca, filtros e carregamento incremental                                     | M5               | #4, #13, C, O, Y, S, V                          |
| F     | Detalhe de Projeto com galeria e documentação em markdown                                              | M5               | #5, #13, C, O, E, Y, S, V                       |
| G     | Tela Informações com a trajetória                                                                      | M5               | #6, #13, C, O, Y, S, V                          |
| H     | Tela Contato com o formulário atrás de flag                                                            | M5               | #7, #13, C, O, Y, S, V                          |
| I     | Botões de CV ligados aos PDFs gerados nos três idiomas                                                 | M6               | X; C, D, G, H                                   |
| J     | Poda dos pesos de fonte sem uso                                                                        | M6               | D, E, F, G, H                                   |
| K     | Verificação de acessibilidade, responsividade e performance da v1                                      | M6               | D a J, L, O, S, U, V, W                         |
| L     | Capturas dos projetos e foto no lugar dos placeholders                                                 | M6               | Imagens do PO; D26; #13; D, E, F, G             |
| M     | Troca da fonte local de dados pela API do backend                                                      | V2+              | Backend publicado com o contrato de #10         |
| N     | Formulário de contato ligado ao backend, sem a flag                                                    | V2+              | Endpoint de contato com proteção contra spam; H |
| O     | Publicação da v1 no GitHub Pages do repositório da Fatec                                               | M4 (ensaio) e M7 | C; token do PO aceito pela organização          |
| P     | Migração da hospedagem pessoal da Vercel para AWS junto do backend                                     | V2+              | Backend e banco na mesma máquina; ADR da #15    |
| Q     | SemVer automático com Changesets, tag e GitHub Release                                                 | M6               | O                                               |
| S     | Pré-renderização das rotas públicas nos três idiomas, com hidratação no cliente                        | M4               | A, W, C, O, #10                                 |
| T     | Verificação automática de acessibilidade com `axe-core` nos testes do `jsdom`                          | M1 (antes de B)  | #9                                              |
| U     | `robots.txt`, `sitemap.xml` e `llms.txt` gerados no build                                              | M6               | #13, O, D a H, X                                |
| V     | URL canônica, `hreflang`, Open Graph e dados estruturados nas páginas                                  | M3               | W, C, #10                                       |
| W     | Idioma no caminho das URLs (`/en/`, `/es/`), sem `?lng=`                                               | M3               | #2, #8                                          |
| X     | CV em PDF, Markdown e HTML gerado do JSON nos três idiomas                                             | M6               | #10, #13, O                                     |
| Y     | Teste de acessibilidade ponta a ponta com Playwright e axe no CI, contra o build com o `base` do Pages | M4               | C, O, T                                         |

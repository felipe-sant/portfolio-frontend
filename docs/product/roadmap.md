# Roadmap

Este documento diz em que ordem as entregas do portfólio acontecem e o que define cada versão. Não é cronograma nem quadro de status: datas e andamento vivem nas issues do GitHub e no `**Status:**` de cada spec. A única data fixa é o prazo da v1: **22/11/2026**. O produto tem duas fases: a **v1** é a entrega da faculdade (Fatec) e as versões **V2+** são de uso pessoal. As issues de implementação são #31 a #56, resumidas em [Issues de implementação](#issues-de-implementação). Mudar a ordem dos marcos ou o escopo de uma versão é decisão do PO e muda este documento no mesmo PR. Os requisitos R1 a R3 estão em [`overview.md`](overview.md) e as decisões de design (`Dnn`, `PIn`) em [`decisions.md`](../design/decisions.md).

## Versões

| Versão | Para quê                     | Onde roda                                                                                       | Dados                                          | Backend |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------- |
| v1     | Entrega da faculdade (Fatec) | GitHub Pages de `fatec-jacarei-dsm-portfolio/ra2581392423047`, subcaminho `/ra2581392423047/`   | Reais, em JSON local, pelo caminho da API (R1) | Não     |
| V2+    | Uso pessoal                  | Vercel (`staging` = testes, `main` = produção), depois AWS com backend e banco na mesma máquina | Do backend, quando existir                     | Sim     |

A Vercel (#15) pode existir antes da v1 como ambiente pessoal, mas não é requisito dela.

**Destino por versão:** a linha 1.x (de `v1.0.0` até antes de `v2.0.0`) é a única publicada no repositório da Fatec. A partir de `v2.0.0` o destino é só o deploy pessoal (Vercel, depois AWS), e a Action de publicação da Fatec fica inerte (ver M4).

## Versionamento

A partir da v1, o projeto usa SemVer com versão automática por Changesets (issue #47), no modelo do repositório `ai-core` do PO, adaptado a uma aplicação que não publica pacote.

- **Antes da v1, sem tags.** O `version` do `package.json` fica em `0.1.0` até a entrega.
- **Cada release é uma tag `vX.Y.Z` na `main`**, com GitHub Release e a seção correspondente do `CHANGELOG.md`, gerado pelo Changesets.
- **Regra de incremento:** `major` quando muda o público ou a forma de publicar (`v1.0.0` = entrega da Fatec; `v2.0.0` = uso pessoal com backend); `minor` para tela ou funcionalidade nova; `patch` para correção e ajuste de conteúdo. Hotfix gera `patch`.
- **Cada PR de trabalho traz um changeset** (`.changeset/*.md` com o tipo e uma nota em português), ou um changeset vazio (`changeset --empty`) quando não muda versão, como em documentação. Uma checagem de CI configurada na #47 garante isso.
- **Fluxo:** o changeset entra no PR para a `staging`. Um push na `staging` com changesets pendentes faz a Action abrir ou atualizar o PR de versão (`changeset-release/staging` → `staging`), que sobe o `version` e escreve o `CHANGELOG.md`. A promoção `staging` → `main` leva a versão nova. Um push na `main` com versão `>= 1.0.0` ainda sem tag cria a tag `vX.Y.Z` e o Release e, se a versão for 1.x, chama a publicação da Fatec (#63).
- **Chegada à `1.0.0`:** o PR que marca a entrega traz um changeset `major`; o PR de versão gera `1.0.0` (a partir de `0.1.0`) e a promoção cria a tag `v1.0.0`, sem tag manual. Entre a configuração da #47 e esse PR, todo changeset é vazio, para nenhuma versão `0.x` ser gerada.

## Ponto de partida: a ordem do handoff

A ordem sugerida pelo handoff, citada na #11: (1) tokens e tema com `data-theme`; (2) primitivos; (3) cabeçalho e rodapé; (4) Início; (5) Projetos; (6) Projeto; (7) Informações e Contato; (8) menu mobile. O roadmap muda essa ordem nestes pontos:

- A documentação de requisitos e decisões (#1 a #11) vem antes da implementação, e as issues de implementação só nascem depois dela.
- O menu mobile entra no layout, porque D01 já decidiu o painel.
- O conteúdo real é marco próprio, em paralelo à fundação visual: a camada de dados com dados de exemplo (#13) depende só do modelo de dados (#10) e libera as telas; o conteúdo real (#58) e a tradução (#59) dependem de material do PO.
- Informações e Contato viram duas entregas: Contato carrega o formulário desligado (D05).
- A publicação no GitHub Pages do repositório da v1 é preparada cedo, logo depois do layout, em modo de ensaio (#45), para as telas já nascerem funcionando sob o subcaminho. A primeira publicação real é a `v1.0.0`.

## Marcos

| Marco                     | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Depende de                                                                                                                        | Issues                                                     | Bloqueio                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| M0 Requisitos e decisões  | Roadmap; visão; requisitos não funcionais e de acessibilidade; layout e cinco telas; modelo de dados e contrato. As issues de implementação são #31 a #64                                                                                                                                                                                                                                                                                                                                                | Nada                                                                                                                              | #11, #1, #8, #9, #2, #3, #4, #5, #6, #7, #10 (nesta ordem) | Nenhum                                     |
| M1 Fundação visual        | #31: tokens do protótipo, tema por `data-theme`, foco visível. #50: verificação automática de acessibilidade com `axe-core` nos testes. #32: componentes base e ícones                                                                                                                                                                                                                                                                                                                                   | #2, #8, #9                                                                                                                        | #31, #32, #50                                              | Nenhum                                     |
| M2 Conteúdo real          | #13: camada de dados local no formato do contrato, com dados de exemplo. #58: conteúdo real do PO (projetos, trajetória, perfil, stack, CV, certificados, canais) em `pt-BR`. #59: tradução para `en` e `es` no projeto                                                                                                                                                                                                                                                                                  | #10 e o conteúdo entregue pelo PO                                                                                                 | #13, #58, #59                                              | Material do PO (conteúdo)                  |
| M3 Layout compartilhado   | #53: idioma no caminho da URL, `/en/` e `/es/`, sem `?lng=`. #33: cabeçalho com logo, navegação, idioma e tema; menu mobile. #60: rodapé e variante de Contato; 404 e erro; metadados. #52: canônica por idioma, `hreflang`, Open Graph e dados estruturados                                                                                                                                                                                                                                             | #2, #31, #32; #53: #2 e #8, com início possível em paralelo ao M1; #33 e #52 também #53; #60 e #52 também #33                     | #53, #33, #60, #52                                         | Nenhum (D01 e D02 decididos)               |
| M4 Publicação Fatec       | #45: build com `base` `/ra2581392423047/`, `basename` no router, `404.html`, `.nojekyll` e workflow em modo de ensaio, que gera o artefato. #63: publicação desse build com commit em `main:/docs` do repositório da v1, com o token do PO. #55: teste de acessibilidade ponta a ponta com Playwright e axe no CI, contra esse build. #64: spike e ADR da pré-renderização. #49: pré-renderização das rotas públicas nos três idiomas, com página própria por rota e idioma e `404.html` pré-renderizado | #33; #63 e #64 também #45; #64 também #53; #49 também #64, #31, #60 e #10; #63 também o token do PO nos Secrets deste repositório | #45, #63, #64, #49, #55                                    | Credencial (token aceito pela organização) |
| M5 Telas                  | #34 Início → #35 Projetos → #36 Projeto (com #61 galeria e #62 documentação) → #37 Informações → #38 Contato, com estados, dois temas e três idiomas                                                                                                                                                                                                                                                                                                                                                     | Cada tela: o próprio documento (#3 a #7), #13, #33, #60, #45, #49, #52 e #55; #36 também #35; #61 e #62 dependem de #36           | #34, #35, #36, #61, #62, #37, #38                          | Nenhum para implementar                    |
| M6 Preparação da v1       | #47: versionamento por Changesets, tag e Release. #54: CV em Markdown por idioma, PDF gerado no build e modal de pré-visualização (D52), com os quatro pontos de CV ligados a ele. #51: `robots.txt`, `sitemap.xml` e `llms.txt`. #42: capturas reais e foto (D26). #40: poda de pesos de fonte. #41: verificação de acessibilidade, responsividade e performance no build do Pages                                                                                                                      | M5; #54 depende do conteúdo do CV (#58, #59) e #42 das imagens do PO; #41 também de #49, #51, #52 e #53                           | #47, #40, #41, #42, #51, #54                               | Material do PO (conteúdo do CV e imagens)  |
| M7 Entrega da v1          | PR com changeset `major`, PR de versão (`1.0.0`), promoção `staging` → `main`, tag `v1.0.0` e Release criados pela Action, publicação no GitHub Pages do repositório da v1 e URL entregue ao professor; #48: vídeo de demonstração                                                                                                                                                                                                                                                                       | M6, #63 e #47                                                                                                                     | #48                                                        | Herda os de M6                             |
| Trilha pessoal (paralela) | Deploy na Vercel: `staging` em testes, `main` em produção pessoal                                                                                                                                                                                                                                                                                                                                                                                                                                        | Nada além do PO configurar a conta                                                                                                | #15                                                        | Nenhum; não é requisito da v1              |
| V2+ Uso pessoal           | Backend; troca da fonte local pela API; envio real do formulário com proteção contra spam e sem flag; domínio próprio; migração para AWS; destino só pessoal a partir de `v2.0.0`                                                                                                                                                                                                                                                                                                                        | Backend e banco                                                                                                                   | #43, #44, #46; domínio sem issue                           | Backend                                    |

```mermaid
flowchart LR
    M0["M0 Requisitos e decisões<br/>#1 a #11"] --> M1["M1 Fundação visual<br/>#31, #32, #50"]
    M0 --> M2["M2 Conteúdo real<br/>#13, #58, #59"]
    M1 --> M3["M3 Layout compartilhado<br/>#53, #33, #60, #52"]
    M3 --> M4["M4 Publicação Fatec<br/>#45, #63, #64, #49, #55"]
    M2 --> M5["M5 Telas<br/>#34, #35, #36, #61, #62, #37, #38"]
    M3 --> M5
    M4 --> M5
    M5 --> M6["M6 Preparação da v1<br/>#47, #42, #40, #51, #54, #41"]
    M6 --> M7["M7 Entrega da v1<br/>v1.0.0"]
    M4 --> M7
    TP["Trilha pessoal<br/>#15"] -.-> V2["V2+ Uso pessoal<br/>#43, #44, #46"]
    M7 --> V2
```

### M0 — Requisitos e decisões

Ordem interna e motivo: #11 primeiro, porque ordena o resto; #1 (escopo, que passa a citar a entrega da Fatec); #8 e #9 antes das telas, porque cada documento de tela cita a checklist de acessibilidade e os requisitos transversais, inclusive as restrições do GitHub Pages (ver M4); #2 antes de #3 a #7; #10 por último, porque precisa que toda informação das cinco telas tenha entidade. As issues de implementação (#31 a #64) já estão criadas. M1 anda quando #2, #8 e #9 fecham; M2 começa quando #10 fecha (#13) e termina quando o PO entrega o conteúdo (#58, #59).

### M1 — Fundação visual

#31 aplica D04 (tokens de cromo), D22, D23 com a cor e a aparência de D27 e as linhas "color-scheme", "Mecanismo de tema" e "Foco global" das divergências de tokens de [`decisions.md`](../design/decisions.md). #32 aplica D07, D11, D15 e D29, com os ícones de marca (GitHub, LinkedIn) junto. #50 vem antes de #32 e liga as regras do `axe-core` nos testes do `jsdom`, para todo componente de #32 já nascer verificado; as regras e a checklist de acessibilidade estão em [`accessibility.md`](accessibility.md).

### M2 — Conteúdo real

O conteúdo é o real do PO: o "mock" de R1 quer dizer só que a fonte é local, no formato do contrato de #10, trocável pela API sem mexer nas telas. #13 cria essa camada com dados de exemplo e o modelo gerado a partir do contrato, para as telas não esperarem o conteúdo. O PO escreve o conteúdo só em `pt-BR`, nesse modelo (#58); `en` e `es` são traduzidos no projeto e revisados pelo PO antes da v1 (#59, R2). Aplica PI5 (nada do provisório do protótipo vira dado) e D26 para as imagens. Todo caminho de arquivo servido de `public/` (JSON, imagem, PDF) é montado com `import.meta.env.BASE_URL`, porque no Pages o site vive num subcaminho.

### M3 — Layout compartilhado

#33 faz a estrutura e o cabeçalho; #60, o rodapé, as páginas de erro e os metadados. Aplica D01, D02 (inclui o favicon), D04, D12, D21, D22, D23 (com D27), D31, D34, D35, D36, PI1 e PI4. O link "Currículo em PDF" de #60 aponta para o arquivo de D14 mesmo antes de ele existir; o arquivo é gerado por #54 e, com JavaScript, o link abre a pré-visualização (D52).

#53 vem antes de #33 porque muda o roteamento e `src/i18n/`, que todas as telas e o seletor de #33 usam (NF-IN de [`non-functional-requirements.md`](non-functional-requirements.md)). Data-limite recomendada: na `staging` até 25/10/2026. #53 não tem plano B: mudar URL depois de publicada é pior que atrasar.

### M4 — Publicação Fatec

O repositório da v1 é [`fatec-jacarei-dsm-portfolio/ra2581392423047`](https://github.com/fatec-jacarei-dsm-portfolio/ra2581392423047), da organização da Fatec Jacareí, publicado em `https://fatec-jacarei-dsm-portfolio.github.io/ra2581392423047/`. O Pages de lá está em modo `legacy` e publica o que está commitado em `main:/docs` via Jekyll. O PO tem push, mas não admin nem maintain: não dá para trocar a fonte do Pages para GitHub Actions nem cadastrar deploy key ou secret lá. Hoje `docs/` tem o portfólio antigo (build de Create React App), que a v1 substitui por inteiro; o `README.md` da raiz fica.

Recomendações, decididas de vez nas specs de #45 (build e ensaio) e #63 (publicação):

- **`base` e `basename`:** o `base` do Vite vem de variável de ambiente lida no `vite.config.ts` em tempo de build, com `/` por padrão, para o mesmo código servir a Vercel na raiz e o Pages no subcaminho. O `createBrowserRouter` recebe `basename` de `import.meta.env.BASE_URL`.
- **Fallback de SPA:** cópia do `index.html` para `404.html` no build do Pages. Mantém `createBrowserRouter` e URLs limpas, sem script de redirecionamento; o custo é a primeira carga de uma rota interna responder com status 404, irrelevante para a entrega. Descartados: `createHashRouter` (troca o router e muda todas as URLs) e o `404.html` que redireciona por query string (script extra no `index.html` e uma navegação a mais). Com #49, cada rota pública tem HTML próprio e responde 200, e o `404.html` passa a ser a página não encontrada pré-renderizada.
- **Pré-renderização (#49):** a forma é decidida antes, num spike com ADR (#64). Data-limite 08/11/2026. Se #49 não estiver na `staging` até lá, vai para a V2+ e a v1 sai pelo plano B (rotas pelo `404.html`, sem HTML legível sem JavaScript, mas com #51 e #52). Se apertar, cai nesta ordem: #49, os `llms-full.en.txt` e `llms-full.es.txt`, o JSON-LD de `/contact` e `/projects`. #53 e #54 não caem. Detalhe em [`non-functional-requirements.md`](non-functional-requirements.md#custo-e-prazo).
- **Workflow:** reutilizável, deste repositório (`workflow_call` e `workflow_dispatch`), válido só para a linha 1.x. Não há gatilho por push de tag: a tag é criada pela Action de release da #47 com `GITHUB_TOKEN`, e evento gerado por `GITHUB_TOKEN` não dispara outro workflow. Por isso o job de release da #47 chama o workflow de publicação de #63 (`uses: ./.github/workflows/<publicação da Fatec>.yml`) logo depois de criar a tag, quando a versão casa `^1\.`. Descartado criar a tag com token pessoal: exigiria um segundo token com escrita neste repositório só para disparar o evento, e o token da Fatec é restrito àquele repositório.
- **A fonte da versão é a tag.** O primeiro passo exige uma tag casando `^v1\.[0-9]+\.[0-9]+$` (recebida como entrada no `workflow_call` ou como ref no `workflow_dispatch`) e, sem ela, não publica. No `workflow_dispatch` fora de tag 1.x o workflow roda em modo de ensaio: faz o build da Fatec e o anexa como artefato, sem tocar no outro repositório. É assim que M4 valida o subcaminho antes da v1 (artefato e `vite preview` com o mesmo `base`), já que antes da v1 não há tag. O `version` do `package.json` não é consultado: a tag nasce dele, pelo Changesets.
- **Publicação (#63):** roda build, lint e testes; builda com `base` `/ra2581392423047/`; copia `index.html` para `404.html` (até #49 existir; com #49, o `404.html` é a página não encontrada pré-renderizada); adiciona `.nojekyll` (sem ele o Jekyll do modo `legacy` descarta arquivo e pasta com `_`); substitui todo o conteúdo de `docs/` do repositório da v1 pelo `dist/` e faz commit e push em `main`, mantendo o `README.md` da raiz. O workflow fica deste lado porque o PO não é admin do repositório da v1.
- **Na V2:** o workflow não é removido. Fica inerte, porque a release só o chama para 1.x e a checagem recusa outra tag, e continua podendo publicar uma correção `v1.x.y` se a Fatec pedir depois que a V2 começar. A remoção é um `Chore` opcional quando o PO der a entrega da Fatec por encerrada.
- **Credencial:** token pessoal do PO guardado nos Secrets deste repositório. Preferido: fine-grained com acesso só a `ra2581392423047` e permissão `contents: write`, se a organização aceitar fine-grained PAT (ela pode exigir aprovação de um admin). Se não aceitar, classic com escopo `repo`, com o risco registrado: o token dá escrita em todos os repositórios que o PO alcança, então tem expiração curta e é revogado depois da entrega. O que a organização aceita é verificado na execução de #63.
- **Plano B sem token:** passo manual documentado em #63 (build local com o mesmo `base`, `404.html` e `.nojekyll`, cópia para `docs/` do outro repositório e commit). Não é reproduzível nem garante que o publicado passou no CI.
- O formulário de contato continua desligado no build do Pages (D05).

### M5 — Telas

Ordem Início → Projetos → Projeto → Informações → Contato: Início exercita o layout; Projeto reutiliza o card da listagem; Informações linka para projetos; Contato fecha com o formulário. Decisões por tela:

| Tela        | Issue         | Decisões                                                                   |
| ----------- | ------------- | -------------------------------------------------------------------------- |
| Início      | #34           | D26, D11, D13, D14, D24, D28                                               |
| Projetos    | #35           | D16, D17                                                                   |
| Projeto     | #36, #61, #62 | D06 (markdown sob demanda, conforme #8), D10, D18, D19, D33, D55, PI1, PI2 |
| Informações | #37           | D13, D14, D20, PI1                                                         |
| Contato     | #38           | D05, D07, D21, D25, D29                                                    |

Cada tela é conferida no build com o `base` do Pages, entra na pré-renderização de #49 e acrescenta as suas rotas e os seus roteiros de teclado à suíte ponta a ponta da #55 (lightbox em #61, seletor de documentos em #62, modal em #37, formulário em #38).

### M6 — Preparação da v1

- **#47** configura o versionamento antes do PR que marca a entrega (ver [Versionamento](#versionamento)).
- **#54** gera no build, a partir do CV em Markdown escrito pelo PO (`cv-<idioma>.md`), `cv-pt-BR.pdf`, `cv-en.pdf` e `cv-es.pdf` em `public/cv/` (D14), com padrões de design próprios para impressão, e faz o modal de pré-visualização que os quatro pontos de CV abrem (D52).
- **#51** gera `robots.txt`, `sitemap.xml`, `llms.txt` e `llms-full*.txt` no build, a partir dos JSONs.
- **#42** aplica D26 com as imagens do PO: substitui os placeholders pelas capturas e pela foto; o projeto sem captura mantém o placeholder neutro.
- **#40** faz a poda de D08, depois da última tela e antes da `main`.
- **#41** roda, no build publicado do Pages, o método de verificação e a checklist de [`accessibility.md`](accessibility.md) (#9) em cada tela, a varredura em 360, 390, 768 e 1280px nos dois temas e nos estados especiais (PI3), o contraste de PI2 e as metas e o roteiro de verificação de [`non-functional-requirements.md`](non-functional-requirements.md), e abre uma issue de correção para cada falha.

### M7 — Entrega da v1

Um PR para a `staging` só com o changeset `major` da entrega; o PR de versão gera `1.0.0` e o `CHANGELOG.md`; a promoção `staging` → `main` segue o padrão do `CLAUDE.md`; o push na `main` faz a Action da #47 criar a tag `v1.0.0` e o Release e chamar a publicação de #63, que publica em `main:/docs` do repositório da v1; a URL pública do Pages é registrada no Release. Com o build publicado, o PO grava o vídeo de demonstração da v1 (#48), com roteiro preparado no projeto, e entrega URL e vídeo até 22/11/2026. Se a #15 já existir, a mesma `main` também vai para a produção pessoal na Vercel, mas isso não faz parte do critério.

### Trilha pessoal

A #15 pode correr a qualquer momento (Vercel escolhida) e é recomendada cedo, para a `staging` ter ambiente de testes. Ela configura a Vercel e registra em ADR a hospedagem: Vercel agora e AWS quando houver backend.

### V2+ — Uso pessoal

#43 (fonte local → API), #44 (formulário real, proteção contra spam, remoção da flag; D05), #46 (migração para AWS com backend e banco na mesma máquina) e domínio próprio. A Action da Fatec fica inerte, com remoção opcional em `Chore` quando a entrega da Fatec for encerrada.

## Onde entra cada item

| Item                                        | Marco                         | Issue         | Decisão             |
| ------------------------------------------- | ----------------------------- | ------------- | ------------------- |
| Conteúdo real em JSON                       | M2                            | #13, #58, #59 | R1                  |
| Menu mobile                                 | M3                            | #33           | D01                 |
| Logo e favicon                              | M3                            | #33           | D02, D34            |
| Seletor de idioma                           | M3                            | #33, #53      | D12, D31, PI4       |
| Ícones Lucide e de marca                    | M1                            | #32           | D15                 |
| Renderizador de markdown                    | M5                            | #62           | D06                 |
| Formulário de contato                       | M5 (desligado na v1); V2+     | #38; #44      | D05                 |
| Imagens reais e foto                        | M6                            | #42           | D26 (substitui D03) |
| CV em PDF                                   | M6                            | #54           | D14, D52            |
| CV gerado do Markdown, com pré-visualização | M6                            | #54           | D52                 |
| Poda de pesos de fonte                      | M6                            | #40           | D08                 |
| Pausa da faixa de stack                     | M5                            | #34           | D28                 |
| Publicação da v1                            | M4 (ensaio) e M7 (publicação) | #45, #63      | —                   |
| Pré-renderização                            | M4                            | #64, #49      | NF-IA               |
| Canônica, Open Graph e JSON-LD              | M3                            | #52           | NF-IA               |
| `robots.txt`, `sitemap.xml` e `llms.txt`    | M6                            | #51           | NF-IA               |
| Idioma no caminho e `hreflang`              | M3                            | #53, #52      | NF-IN, D31, D32     |
| Versionamento e release                     | M6                            | #47           | —                   |
| Hospedagem pessoal                          | Trilha pessoal                | #15           | —                   |
| AWS                                         | V2+                           | #46           | —                   |
| Domínio próprio                             | V2+                           | —             | —                   |

## v1

A v1 é a entrega da faculdade, publicada no GitHub Pages do repositório da v1 a partir da tag `v1.0.0` da `main`, criada pelo versionamento automático, com a URL entregue ao professor. **Prazo: 22/11/2026.** Ela só sai com todos os itens marcados:

- [ ] As rotas `/`, `/projects`, `/projects/:id`, `/about` e `/contact`, a página não encontrada e a página de erro cumprem os critérios de aceite dos documentos de #2 a #7.
- [ ] Todo dado exibido é o conteúdo real do PO, vindo dos JSONs locais de #58 e #59, no formato do contrato de #10, sem requisição a backend.
- [ ] Toda tela abre e recarrega nas três URLs (sem prefixo, `/en/` e `/es/`) no Pages, e o seletor leva à URL equivalente, com interface e conteúdo traduzidos, sem chave no lugar de texto.
- [ ] Toda tela funciona nos temas claro e escuro.
- [ ] Imagens seguem D26: capturas e foto reais, placeholder neutro só para projeto sem captura.
- [ ] O conteúdo em `en` e `es` foi traduzido a partir do `pt-BR` e revisado pelo PO.
- [ ] O formulário de contato está implementado e desligado no build publicado (D05).
- [ ] Os PDFs de CV nos três idiomas são gerados no build a partir do Markdown, e "Baixar CV" abre a pré-visualização do idioma ativo, que baixa (D14, D52).
- [ ] Os pesos de fonte sem uso foram removidos (D08).
- [ ] A verificação #41 passou no build publicado.
- [ ] `npm run build`, `npm run lint` e `npm run test:cov` (80% ou mais) passam no CI.
- [ ] No GitHub Pages do repositório da v1, abrir e recarregar cada rota nas três versões de URL (sem prefixo, `/en/` e `/es/`, inclusive `/projects/<id>`, uma inexistente e `/en/<rota-inexistente>`) mostra a aplicação, com fontes, imagens, JSONs e CV carregando sob o subcaminho.
- [ ] `curl` em cada rota e idioma do Pages devolve 200 e o conteúdo no idioma sem JavaScript, com `hreflang`, e `llms.txt` e `sitemap.xml` existem sob o subcaminho (NF-IA de [`non-functional-requirements.md`](non-functional-requirements.md)); se #49 tiver ido para a V2+ pelo plano B (ver M4), vale só a parte de `hreflang`, `llms.txt` e `sitemap.xml`, com o plano B registrado no Release.
- [ ] `main:/docs` do repositório da v1 tem só o build da v1, com `404.html` e `.nojekyll`, e o `README.md` da raiz continua lá.
- [ ] O `package.json` está em `1.0.0`, gerado pelo PR de versão a partir do changeset `major`, e o `CHANGELOG.md` tem a seção `1.0.0`.
- [ ] A tag `v1.0.0` e o GitHub Release foram criados pela Action da #47 (sem tag manual), e o Release tem a URL publicada.
- [ ] A publicação de O só ocorre para tag 1.x: um `workflow_dispatch` numa branch ou numa tag que não seja 1.x roda em ensaio, sem alterar o repositório da Fatec.
- [ ] O vídeo de demonstração da v1 (#48) foi gravado no build publicado e entregue junto com a URL.

Fica fora da v1: backend, envio real do formulário, deploy na Vercel, domínio próprio e AWS.

## Bloqueios

| Item                                                      | Tipo           | Motivo                                                              | Quem desbloqueia                                            | Referência |
| --------------------------------------------------------- | -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| Conteúdo real (#58, #59)                                  | Material do PO | JSONs ou textos ainda não entregues                                 | PO                                                          | R1, #10    |
| CV (#54, #58)                                             | Material do PO | Conteúdo do CV em Markdown ainda não entregue                       | PO                                                          | D52, #54   |
| Capturas e foto (#42)                                     | Material do PO | Imagens ainda não entregues                                         | PO                                                          | D26        |
| Publicação Fatec (#63)                                    | Credencial     | A organização pode não aceitar fine-grained PAT ou exigir aprovação | Admin da organização, ou o PO (classic PAT ou passo manual) | M4         |
| Fonte local → API (#43), formulário real (#44), AWS (#46) | Backend        | O backend não existe                                                | Backend                                                     | R1, D05    |
| Domínio próprio                                           | Decisão do PO  | Ainda não escolhido                                                 | PO                                                          | V2+        |
| Desbloqueados por decisão: menu mobile (D01) e logo (D02) | —              | Previstos como bloqueados por design na #11, já decididos           | —                                                           | D01, D02   |

## Issues de implementação

Criadas no GitHub, com o corpo completo de cada uma; esta tabela é o resumo. A #39 (botões de CV) foi juntada à #54.

| Issue | Descrição                                                                                                   | Marco                                                           | Depende de                                          |
| ----- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| #31   | Tokens do protótipo, foco visível e tema claro e escuro por `data-theme`                                    | M1                                                              | #2, #8, #9                                          |
| #32   | Componentes base (Button, Chip, TextField, SearchInput, Skeleton, Spinner) e ícones                         | M1                                                              | #31, #50                                            |
| #33   | Cabeçalho com navegação, menu mobile, seletor de idioma e tema                                              | M3                                                              | #2, #31, #32, #53                                   |
| #34   | Tela Início                                                                                                 | M5                                                              | #3, #13, #33, #60, #45, #55, #49, #52               |
| #35   | Listagem de Projetos com busca, filtros e carregamento incremental                                          | M5                                                              | #4, #13, #33, #60, #45, #55, #49, #52               |
| #36   | Detalhe de Projeto com ficha técnica e relacionados                                                         | M5                                                              | #5, #13, #33, #60, #45, #35, #53, #55, #49, #52     |
| #37   | Tela Informações com a trajetória                                                                           | M5                                                              | #6, #13, #33, #60, #45, #55, #49, #52               |
| #38   | Tela Contato com o formulário atrás de flag                                                                 | M5                                                              | #7, #13, #33, #60, #45, #55, #49, #52               |
| #40   | Poda dos pesos de fonte sem uso                                                                             | M6                                                              | #34 a #38, #61, #62                                 |
| #41   | Verificação de acessibilidade, responsividade e performance da v1                                           | M6                                                              | #34 a #38, #40, #42, #45, #49, #51 a #54, #59 a #63 |
| #42   | Capturas dos projetos e foto no lugar dos placeholders                                                      | M6                                                              | Imagens do PO; D26; #58; #34, #35, #36, #37, #61    |
| #43   | Troca da fonte local de dados pela API do backend                                                           | V2+                                                             | Backend publicado com o contrato de #10             |
| #44   | Formulário de contato ligado ao backend, sem a flag                                                         | V2+                                                             | Endpoint de contato com proteção contra spam; #38   |
| #45   | Build da v1 para o GitHub Pages da Fatec, com ensaio em artefato                                            | M4                                                              | #33                                                 |
| #46   | Migração da hospedagem pessoal da Vercel para AWS junto do backend                                          | V2+                                                             | Backend e banco na mesma máquina; ADR da #15        |
| #47   | SemVer automático com Changesets, tag e GitHub Release                                                      | M6                                                              | #63                                                 |
| #48   | Roteiro e vídeo de demonstração da v1                                                                       | M7                                                              | v1 publicada (#63, #47)                             |
| #49   | Pré-renderização das rotas públicas nos três idiomas, com hidratação no cliente                             | M4                                                              | #64, #31, #53, #33, #60, #45, #10                   |
| #50   | Verificação automática de acessibilidade com `axe-core` nos testes do `jsdom`                               | M1 (antes de #32)                                               | #9                                                  |
| #51   | `robots.txt`, `sitemap.xml` e `llms.txt` gerados no build                                                   | M6                                                              | #13, #45, #34 a #38, #54                            |
| #52   | URL canônica, `hreflang`, Open Graph e dados estruturados nas páginas                                       | M3                                                              | #53, #33, #60, #10                                  |
| #53   | Idioma no caminho das URLs (`/en/`, `/es/`), sem `?lng=`                                                    | M3                                                              | #2, #8                                              |
| #54   | CV em Markdown nos três idiomas, PDF gerado no build e modal de pré-visualização (D52), com os pontos de CV | M6                                                              | #10, #13, #58, #59, #45, #60, #34, #37, #38         |
| #55   | Teste de acessibilidade ponta a ponta com Playwright e axe no CI, contra o build com o `base` do Pages      | M4                                                              | #33, #45, #50                                       |
| #56   | Busca inteligente de projetos                                                                               | V2+ (degrau (a) pode entrar na v1 se sobrar tempo depois de M6) | #35, #13; degraus (b) e (c) também #49 e #43        |
| #58   | Conteúdo real do portfólio em português                                                                     | M2                                                              | #13; material do PO                                 |
| #59   | Tradução do conteúdo real para inglês e espanhol                                                            | M2                                                              | #58                                                 |
| #60   | Rodapé, página não encontrada, página de erro e metadados por página                                        | M3                                                              | #33                                                 |
| #61   | Galeria e lightbox do detalhe de Projeto                                                                    | M5                                                              | #32, #36                                            |
| #62   | Documentação em markdown do detalhe de Projeto, com as rotas dos documentos                                 | M5                                                              | #36, #49, #53                                       |
| #63   | Publicação da v1 no repositório da Fatec com o token do PO                                                  | M4 (pronta) e M7 (publicação)                                   | #45; token do PO aceito pela organização            |
| #64   | Spike e ADR da forma de pré-renderizar as rotas                                                             | M4                                                              | #45, #53                                            |
| #69   | Realce de sintaxe de documentos `.json` e `.yml` do projeto, como valor novo de `format` (D55)              | V2+                                                             | #62                                                 |
| #70   | Diagramas Mermaid dos documentos do projeto gerados como SVG no build (D55)                                 | V2+                                                             | #62, #49                                            |

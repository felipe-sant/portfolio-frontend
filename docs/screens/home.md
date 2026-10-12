# Início

A tela Início (`/`, também sob `/en/` e `/es/`, D32) é a primeira impressão do portfólio e o fim da
jornada do recrutador ("Baixar CV" no hero). Quem a implementa é a issue #34, com #31 (tokens, tema e
foco), #32 (componentes base e ícones, inclusive pausa e play de D28), #33 e #60 (layout), #53 (idioma no
caminho), #52 (canônica, Open Graph e o mecanismo do JSON-LD), #49 (pré-renderização) e #54 (CV gerado e botões de CV
ligados aos PDFs). Este documento diz o comportamento; não escolhe nome de componente nem de
arquivo, além do namespace e da chave de tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-inicio`, em
[`prototype/`](../design/prototype/README.md)), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md),
[`glossary.md`](../product/glossary.md) e [`layout.md`](layout.md), dono de tudo que a tela divide
com as outras (cabeçalho, rodapé, "Pular para o conteúdo", foco no `h1` na troca de rota,
canônica, `hreflang` e Open Graph).

Cada requisito funcional tem um ID `RF-HOME-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O protótipo usa caminhos
antigos (`prototipo-*.dc.html`) e três destaques de exemplo, e o texto dele é provisório (PI5):
vale o que este documento diz, com a tabela de divergências no fim de "Regras de negócio".

## Objetivo

Mostrar em poucos segundos quem é o autor e o que faz agora, provar com até quatro projetos
escolhidos e levar cada público ao próximo passo: o recrutador ao CV ou a Informações, o cliente e
o professor à lista de projetos ou a um estudo de caso.

## Estados

Na primeira carga de cada idioma o HTML pré-renderizado (#49) já traz os dados (NF-IA-01, NF-IA-03),
então "carregando" só aparece em navegação interna, antes de o conteúdo estar no cache da store.
Cada bloco de dados (perfil, status atual, stack e destaques) tem estado próprio. No hero, `h1` e
botões nunca esperam dado; selo e parágrafo vêm do perfil.

| Estado                                 | O que aparece                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal                                 | Hero (selo de disponibilidade com a frase do perfil, se `isAvailable`, `h1` "Desenvolvedor full stack em TypeScript", parágrafo, "Ver projetos" e "Baixar CV"); status atual com os cards "Trabalhando como" e "Cursando"; faixa escura de stack com o botão de pausa; "Projetos em destaque" com "Ver todos →" e até quatro projetos em ritmo alternado; "Ver todos os projetos" e "Ler sobre mim"                                                                                                      |
| Carregando                             | Hero com `h1` e botões prontos; skeleton do tamanho do selo no lugar dele e três linhas de skeleton no lugar do parágrafo (largura até `--measure`); dois skeletons de card (6.5rem) no status; a faixa de stack com altura reservada e sem itens; dois skeletons de destaque (imagem 16:9, título e duas linhas) em ritmo alternado. Skeletons `aria-hidden`, shimmer `--dur-shimmer` (sem animação com movimento reduzido) e um único "Carregando..." visualmente oculto em `role="status"` (A11Y-G13) |
| Vazio: perfil com `isAvailable: false` | Sem selo; o resto igual                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Vazio: nada em curso                   | Card sem item em curso some; os dois sem item, a seção de status some inteira (heading inclusive)                                                                                                                                                                                                                                                                                                                                                                                                        |
| Vazio: stack sem itens                 | A faixa some inteira                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Vazio: nenhum projeto em destaque      | Heading "Projetos em destaque" e "Ver todos →" ficam; no lugar da lista, bloco de borda tracejada ("tracejado marca o que não é conteúdo real", [`design-system.md`](../design/design-system.md)) com "Nenhum projeto em destaque no momento"; as saídas continuam                                                                                                                                                                                                                                       |
| Erro: perfil                           | Sem selo e sem parágrafo, sem mensagem: `h1` e botões ficam e bastam para seguir (a falha do perfil já é visível pelo rodapé sem contato, RF-LAY-21)                                                                                                                                                                                                                                                                                                                                                     |
| Erro: status atual                     | No lugar dos cards, alerta (`role="alert"`, `--danger-surface`/`--danger-ink`, ícone de alerta) "Não consegui carregar o que faço agora", "Verifique sua conexão e tente de novo." e botão "Tentar novamente"                                                                                                                                                                                                                                                                                            |
| Erro: stack                            | A faixa some, sem mensagem (a stack também está em Informações)                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Erro: destaques                        | No lugar da lista, o alerta do protótipo: "Não consegui carregar os projetos", "Verifique sua conexão e tente de novo." e "Tentar novamente"; heading e saídas ficam                                                                                                                                                                                                                                                                                                                                     |
| Tentando de novo                       | O bloco volta a "carregando" só ali; o foco vai para o heading do bloco quando o conteúdo chega ou para o alerta quando falha de novo. O `h2` do status atual é visualmente oculto e aparece enquanto tem foco, para o foco nunca cair num elemento invisível (A11Y-G05)                                                                                                                                                                                                                                 |
| Faixa pausada                          | Itens parados na posição em que estavam; o botão mostra o ícone de play e `aria-pressed="true"`                                                                                                                                                                                                                                                                                                                                                                                                          |
| Movimento reduzido                     | Faixa estática que quebra linha, com a lista uma vez e sem cópia, sem botão de pausa (nada se move); sem shimmer e sem deslocamento no hover                                                                                                                                                                                                                                                                                                                                                             |
| Sem JavaScript                         | HTML pré-renderizado com todos os blocos no estado normal, legíveis (NF-CO-03); a faixa anima por CSS e para com o ponteiro sobre ela ou com o foco dentro dela, também só por CSS (RF-HOME-14); o botão de pausa, "Tentar novamente" e salvar idioma precisam de JavaScript                                                                                                                                                                                                                             |

## Validações

Não há campo de formulário. Regras sobre o dado que a tela recebe, verificadas pelo teste de
conteúdo da #13, com o comportamento da tela se algo passar:

| Dado                         | Regra                                                                                        | Quando falha                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Projetos em destaque         | No máximo quatro com a marcação de destaque no conteúdo (D43); `date` em `AAAA-MM`           | O teste de conteúdo da #13 falha; o pedido usa `limit=4`, então chegam no máximo os quatro primeiros pela ordem de D43 e D53 |
| Id do projeto                | UUID v7 (NF-DA-07), usado no link `/projects/:id`                                            | Teste de conteúdo da #13; a tela não valida                                                                                  |
| Imagem do destaque           | Primeira captura 16:9 do projeto (D26), com largura e altura                                 | Projeto sem captura mostra o placeholder neutro 16:9 (`--bg-placeholder`, borda de 1px, `aria-hidden`)                       |
| Datas do status              | Início em `AAAA-MM`, exibido "desde `MM/AAAA`" por `Intl` dentro de `<time>` (NF-IN-04, D39) | Teste de conteúdo da #13                                                                                                     |
| Texto do conteúdo por idioma | Presente no idioma ativo (NF-IN-02)                                                          | Teste de conteúdo da #13; a tela não cai para outro idioma                                                                   |
| CV                           | Caminho `cv/cv-<idioma>.pdf` com `import.meta.env.BASE_URL` (D14, NF-DA-03)                  | Antes de #54 gerar os PDFs o link quebra (aceito até #54, roadmap M6)                                                        |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê e usa tudo. Não há ação restrita.

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Página

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                                                             | Fonte                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `RF-HOME-01` | A rota é `/` (também `/en/` e `/es/`, D32, NF-IN-06), filha do `MainLayout`, que dá cabeçalho, rodapé padrão, `main` e "Pular para o conteúdo" (RF-LAY-31); a página não renderiza o próprio `main`. Item ativo "Início" (RF-LAY-04). Ordem das seções: hero, status atual, faixa de stack, projetos em destaque com as saídas. Sem depoimentos (D13)                                                             | Protótipo, D13, `layout.md` |
| `RF-HOME-02` | Toda informação vem do conteúdo por endpoints do RTK Query com `queryFn` local (R1, NF-DA-02), só no idioma ativo (NF-DA-05); a página não importa JSON. A seleção e a ordem dos destaques e dos itens em curso vêm prontas da API (D51, D53, D54); o que a tela calcula (ano a partir de `date`, card pelo `kind`) fica fora do JSX: no hook da página (`src/pages/hooks/useHome.ts`) ou em função pura testável | R1, `.claude/CLAUDE.md`     |

### Hero

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fonte                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `RF-HOME-03` | Selo de disponibilidade acima do `h1`, com indicador redondo em `currentColor` (`aria-hidden`), texto `--success-ink` sobre `--success-surface`, raio `--radius` (D11, sem pílula). O texto é a frase livre do perfil (`availability.label`, traduzida no conteúdo, ex.: "Disponível para projetos", "Disponível a partir de 01/2027"), não chave de tradução; aparece só com `availability.isAvailable` verdadeiro, e falso esconde o selo, sem selo de "indisponível" (D44). É o mesmo campo de Informações, Contato e do rodapé (RF-LAY-21). É texto, não link nem botão | Protótipo, D11, D44        |
| `RF-HOME-04` | `h1` "Desenvolvedor full stack em TypeScript", sem ponto (D24), por chave (`home:heading`), Bricolage 800 em `--text-display` fluido, `text-wrap: balance`; é o `h1` da tela e o alvo de foco na navegação interna (RF-LAY-32, A11Y-IN01)                                                                                                                                                                                                                                                                                                                                   | D24, A11Y-IN01             |
| `RF-HOME-05` | Parágrafo de apresentação limitado a `--measure`, `--lh-body`, `text-wrap: pretty` (A11Y-G09), vindo do conteúdo (texto de apresentação do perfil, traduzido), não de chave. Enquanto o perfil carrega, três linhas de skeleton `aria-hidden` reservam o espaço; na pré-renderização (#49) ele já está no HTML. Se o perfil falha, o parágrafo some sem mensagem (RF-HOME-24)                                                                                                                                                                                               | Protótipo, PO (11-10-2026) |
| `RF-HOME-06` | Dois links lado a lado, que quebram linha quando não cabem: "Ver projetos" (primário, degradê âmbar, seta `→` em ícone `aria-hidden`) para `/projects`, e "Baixar CV" (secundário, ícone de download `aria-hidden`), ambos com alvo de no mínimo 44px (o protótipo usa 3rem)                                                                                                                                                                                                                                                                                                | Protótipo, D14, A11Y-G08   |
| `RF-HOME-07` | "Baixar CV" baixa o PDF do idioma ativo: `cv/cv-pt-BR.pdf`, `cv/cv-en.pdf` ou `cv/cv-es.pdf` em `public/cv/`, com `import.meta.env.BASE_URL`, atributo `download` (mesma origem), sem `target`; texto visível `common:resume.download` e nome acessível "Baixar CV (PDF)" (`common:resume.downloadPdf`, que começa pelo texto visível, A11Y-IN08). O link existe antes de #54 gerar os arquivos, e a própria #54 confere que ele aponta para o arquivo gerado                                                                                                               | D14, D30, D36, A11Y-IN08   |

### Status atual

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Fonte                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `RF-HOME-08` | Seção com heading `h2` visualmente oculto "O que faço agora" (A11Y-IN02) e até dois cards lado a lado (colunas de no mínimo 17rem preenchendo o espaço; uma coluna quando não cabem), borda 1px `--border-subtle`, sem sombra. Os cards são texto, não links                                                                                                                                                                                                                                                                                                                                                              | Protótipo, A11Y-IN02                               |
| `RF-HOME-09` | Card "Trabalhando como": rótulo fixo (mono, caixa alta por CSS, `--text-label`), o cargo do item de experiência em curso em destaque (Bricolage 700) e, abaixo, a organização e "desde `MM/AAAA`" (`common:period.since`, data por `Intl` dentro de `<time datetime="AAAA-MM">`, D39) separados por `·` (`common:symbols.separator`, `aria-hidden`). Sem o selo "Atual" (`common:period.current`): o rótulo do card já diz que o item está em curso; o selo vale onde períodos em curso e encerrados aparecem juntos (trajetória de Informações)                                                                          | Protótipo, glossário (Status atual), NF-IN-04, D39 |
| `RF-HOME-10` | Card "Cursando": indicador redondo `--success-ink` (`aria-hidden`) antes do rótulo; a instituição e o curso do item de formação ou curso em curso em destaque e, abaixo, a etapa quando houver ("6º semestre", texto do conteúdo) e "desde `MM/AAAA`", no mesmo formato do RF-HOME-09                                                                                                                                                                                                                                                                                                                                     | Protótipo, glossário                               |
| `RF-HOME-11` | Os itens vêm de `GET /timeline?current=true` (D54, [`api-contract.md`](../architecture/api-contract.md#get-timeline)), que aplica a regra no contrato: "em curso" é o item da trajetória sem data de fim (glossário, "Status atual"); experiência para o primeiro card; formação ou curso para o segundo; havendo mais de um, vale o de início mais recente; empate, o primeiro na ordem do conteúdo. A tela só escolhe o card pelo `kind` do item. Card sem item some; os dois sem item (lista vazia), a seção some. O dado vem da mesma fonte que a trajetória de Informações, sem campo duplicado no perfil (NF-DA-04) | Glossário, NF-DA-04, PO (11-10-2026), D54          |

### Faixa de stack

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Fonte                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `RF-HOME-12` | Faixa em largura total, fundo `--neutral-900` nos dois temas, com `--focus-ring` redefinido para `--brand-variant` dentro dela (D27). Uma `section` com heading `h2` visualmente oculto "Tecnologias que uso" e uma `ul` com os itens, lida uma vez pelo leitor; a cópia que fecha o laço é `aria-hidden`. Nomes de tecnologia em texto (NF-IA-16), sem `lang`                                                                                                                                                                                                                   | Protótipo, D27, `accessibility.md` (achado da faixa de stack), A11Y-IN05 |
| `RF-HOME-13` | Os itens são a stack do site (a mesma de Informações), achatada na ordem do conteúdo (categorias `frontend`, `backend`, `tooling`, nessa ordem, e os itens na ordem de cada uma); as categorias não aparecem na faixa. O item marcado como principal no conteúdo usa `--brand-primary` e os demais `--dark-300` (no protótipo, TypeScript). Animação por `transform` (NF-DE-19) com duração `--dur-marquee`, em laço                                                                                                                                                             | Protótipo, glossário (Stack)                                             |
| `RF-HOME-14` | Botão de pausa visível na própria faixa, antes da lista na ordem de foco, alvo de 44px, nome fixo "Pausar faixa de tecnologias" e `aria-pressed` (`true` quando pausada); ícone de pausa quando anda e de play quando parada (D15, `aria-hidden`). Pausar congela a posição; a escolha vale enquanto a página está aberta (não é salva). Além do botão, a faixa para por CSS enquanto o ponteiro está sobre ela ou o foco está dentro dela (`:hover`, `:focus-within`), o que mantém uma pausa que funciona sem JavaScript (2.2.2), sem mudar a primeira renderização (NF-TE-04) | D28, A11Y-IN06, NF-MO-03                                                 |
| `RF-HOME-15` | Com `prefers-reduced-motion: reduce`, a faixa vira lista estática que quebra linha, sem a cópia e sem o botão de pausa. A troca é por media query no CSS e pelo hook de movimento reduzido de `src/hooks/` (NF-MO-02) só para não renderizar a cópia e o botão, sem mudar a primeira renderização em relação ao HTML pré-renderizado (NF-TE-04: o hook lê a preferência depois de montar)                                                                                                                                                                                        | D28, A11Y-IN07, NF-MO-01, NF-MO-02                                       |

### Projetos em destaque

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Fonte                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `RF-HOME-16` | Cabeçalho da seção: `h2` "Projetos em destaque" (mono, caixa alta por CSS, `--text-label`) à esquerda e link "Ver todos →" à direita para `/projects`, com nome acessível "Ver todos os projetos" (A11Y-IN04), alvo de 44px, linha inferior `--border-subtle`                                                                                                                                                                                                                                                                                                                                    | Protótipo, A11Y-IN04                                                       |
| `RF-HOME-17` | Quais e em que ordem: a resposta de `GET /projects?featured=true&sort=recent&limit=4` (D51), com os projetos marcados como destaque no conteúdo, até quatro, do mais recente para o mais antigo pelo campo `date` (`AAAA-MM`), empate por título A–Z e depois `id` (D53, que substitui a ordem do conteúdo de D43); a tela mostra na ordem da resposta. De um a três, mostra os que houver no mesmo ritmo, sem completar com projeto não marcado; nenhum, estado vazio                                                                                                                           | Corpo da #3, glossário, D43, D51, D53                                      |
| `RF-HOME-18` | Lista (`ul`) de itens; cada item é um `article` com a imagem e o texto: rótulo de metadados "`<tipos>` · `<categoria>` · `<ano>`" (mono, caixa alta por CSS), com todos os `types` do projeto na ordem do conteúdo, cada um por `common:projectType.<código>` (ex.: "Web · API · Pessoal · 2026"), a categoria por `common:projectCategory.<código>` e o ano de `date`, separados por `·` (`common:symbols.separator`, `aria-hidden`); título `h3` do projeto, resumo (até `30rem`), até três tecnologias da stack do projeto em chips (`--radius`, D11, na ordem do conteúdo) e "Ver projeto →" | Protótipo, A11Y-IN03, D11                                                  |
| `RF-HOME-19` | Um link só por item: o título, com nome igual ao nome do projeto, para `/projects/:id` do idioma atual; a área clicável se estende ao item inteiro (imagem e "Ver projeto →") por CSS, sem outro elemento interativo dentro. "Ver projeto →" é texto `aria-hidden` e a imagem tem `alt=""` (A11Y-IN03, 2.5.3: o nome visível do link é o título). Hover em qualquer parte do item desloca a imagem `translateY(-3px)` (`--dur-base`, `--ease`), sem movimento com `prefers-reduced-motion`                                                                                                       | A11Y-IN03, `accessibility.md` (Link e botão), `design-system.md` (Estados) |
| `RF-HOME-20` | Ritmo alternado a partir de 640px: duas colunas iguais, imagem à esquerda no 1º e no 3º item e à direita no 2º e no 4º. Abaixo de 640px, uma coluna com a imagem primeiro. A ordem no DOM é a mesma em todas as larguras (imagem, depois texto); só a posição visual muda, por media query no CSS (NF-TE-04); a ordem de foco não muda porque o único focável é o título                                                                                                                                                                                                                         | Corpo da #3, `design-system.md`, NF-RE-01                                  |
| `RF-HOME-21` | Imagem: a primeira captura 16:9 do projeto (D26), com `width`/`height` ou `aspect-ratio` reservados (NF-DE-16), `srcset`/`sizes` (NF-DE-14), `loading="lazy"` e `decoding="async"` (abaixo da dobra, NF-DE-17); sem captura, placeholder neutro 16:9 `aria-hidden` (D26)                                                                                                                                                                                                                                                                                                                         | D26, NF-DE-14, NF-DE-16, NF-DE-17                                          |

### Saídas

| ID           | Regra                                                                                                                                                                                                                                                                                  | Fonte                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `RF-HOME-22` | Depois dos destaques, centralizados e quebrando linha: "Ver todos os projetos" (primário) para `/projects` e "Ler sobre mim" (secundário) para `/about`, alvos de 44px. Os dois links com nome "Ver todos os projetos" (este e o do cabeçalho da seção) levam ao mesmo destino (2.4.9) | Protótipo, `accessibility.md` |

### Carregamento e erro

| ID           | Regra                                                                                                                                                                                                                                                                                                                                                                  | Fonte                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `RF-HOME-23` | Cada bloco de dados (perfil, status, stack, destaques) carrega e falha de forma independente; skeleton na forma do conteúdo, `aria-hidden`, e um só `role="status"` visualmente oculto com "Carregando..." enquanto algum bloco carrega (A11Y-G13). Skeleton e spinner nunca no mesmo bloco                                                                            | Protótipo, `design-system.md` (Estados), A11Y-G13    |
| `RF-HOME-24` | Erro de status ou de destaques: alerta `role="alert"` no lugar do bloco, com título do bloco, "Verifique sua conexão e tente de novo." e botão "Tentar novamente" (44px) que refaz só aquela consulta (`refetch` do RTK Query), sem recarregar a página; o heading da seção fica. Erro de perfil e de stack: o bloco some sem mensagem. Mensagem técnica nunca aparece | Protótipo, A11Y-G14, `design-system.md` (Voz e copy) |

### Link e idioma

| ID           | Regra                                                                                                                                              | Fonte         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `RF-HOME-25` | Todo link interno usa `<Link>` com o path de `ROUTES` e o prefixo do idioma atual, pela função de #53 (NF-IN-11, D36); a tela não tem link externo | D36, NF-IN-11 |

### Divergências do protótipo e do corpo da #3

Precedência R3: convenções do repositório, depois [`decisions.md`](../design/decisions.md), depois
o protótipo, depois o handoff.

| Corpo da #3, glossário ou protótipo                                                                       | Vale agora                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Título "Desenvolvedor full stack em TypeScript." (com ponto; o `home.json` atual também tem)              | Sem ponto final (D24)                                                                                                                              |
| Cards "Trabalhando atualmente como" e "Cursando atualmente" (corpo da #3, glossário)                      | "Trabalhando como" e "Cursando", como no protótipo validado; caixa alta por CSS                                                                    |
| Badge "Atual" no item em curso do status atual (glossário)                                                | Sem selo nos cards: o rótulo já diz que o item está em curso (RF-HOME-09)                                                                          |
| Stack "nunca como lista única" (glossário)                                                                | A faixa mostra a stack achatada, como no protótipo validado; os grupos por categoria ficam em Informações (RF-HOME-13)                             |
| CTA "Mais sobre mim" (corpo da #3)                                                                        | "Ler sobre mim", como no protótipo (verbo no infinitivo + objeto)                                                                                  |
| Três destaques (protótipo)                                                                                | Até quatro (corpo da #3, glossário), pela regra de seleção de D43, com o desempate por título de D53                                               |
| Destaques empilham abaixo de 768px (protótipo, por `innerWidth` em JavaScript)                            | Abaixo de 640px (corpo da #3, `design-system.md`, NF-RE-01), por media query no CSS (NF-TE-04)                                                     |
| Card de destaque com dois links: a imagem ("Abrir `<projeto>`") e "Ver projeto →"                         | Um link só por card, com o nome do projeto (A11Y-IN03); a imagem e "Ver projeto →" são área clicável dele                                          |
| Faixa de stack: `div` com `aria-label`, todo o conteúdo `aria-hidden`, sem pausa                          | Lista real acessível uma vez, cópia do laço `aria-hidden`, botão de pausa (D28, A11Y-IN05, A11Y-IN06); estática com movimento reduzido (A11Y-IN07) |
| Faixa anima em 40s (protótipo)                                                                            | Token `--dur-marquee` (22s, `global.css`)                                                                                                          |
| Contêiner de `80rem` (protótipo)                                                                          | Token `--container-max` (`73.75rem`, `global.css`)                                                                                                 |
| Links "Ver projetos", "Ver todos", "Ler sobre mim" para `prototipo-*.dc.html`; "Baixar CV" para `#` (PI5) | `/projects`, `/about` com o prefixo do idioma (D32, NF-IN-11); "Baixar CV" é download direto do PDF do idioma ativo (D14, D30, D36)                |
| Erro do bloco de destaques com "Tentar novamente" que recarrega a página (`?estado=normal`)               | Botão que refaz só a consulta que falhou, sem recarregar                                                                                           |
| Depoimentos (`Início.dc.html` do handoff)                                                                 | Fora do produto (D13)                                                                                                                              |

## Navegação

Caminhos de D32, sempre com o prefixo do idioma atual (NF-IN-11).

| De onde                               | Ação                                         | Para onde                                                 |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------------------- |
| Qualquer tela                         | Gato e nome, "Início" na navegação           | `/` do idioma atual (RF-LAY-02, RF-LAY-03)                |
| Página não encontrada, página de erro | "Voltar para o início"                       | `/` (RF-LAY-28, RF-LAY-29)                                |
| Primeira carga em `/`                 | Escolha salva diferente de `pt-BR`           | `/en/` ou `/es/` (NF-IN-09, #53)                          |
| Hero                                  | "Ver projetos"                               | `/projects`                                               |
| Hero                                  | "Baixar CV"                                  | Download do PDF do idioma ativo, sem sair da página (D36) |
| Projetos em destaque                  | "Ver todos →"                                | `/projects`                                               |
| Projetos em destaque                  | Título, imagem ou "Ver projeto →" de um item | `/projects/:id` do projeto                                |
| Saídas                                | "Ver todos os projetos", "Ler sobre mim"     | `/projects`, `/about`                                     |
| Alerta de erro                        | "Tentar novamente"                           | Fica na tela; refaz a consulta do bloco                   |
| Faixa de stack                        | Pausar                                       | Fica na tela                                              |

## Textos fixos e chaves

Todo texto fixo vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e `es`
são escritos na implementação (#34), com as mesmas chaves (R2). Nomes de tecnologia, "CV", "PDF" e
os símbolos são iguais nos três JSON.

O namespace `home` (existe) guarda o que só o Início usa. `common` guarda o que outras telas também
mostram: "Baixar CV" (Informações e Contato), tipo e categoria de projeto (Projetos e Projeto), o
formato de período (Informações), o nome do autor e os símbolos. As chaves `resume.*`,
`projectType.*`, `projectCategory.*`, `period.*` e `symbols.forward` têm o nome fixado pelo PO para
as cinco telas (decisão transversal de 11-10-2026): `resume.*`, `period.*` e `symbols.forward` são
as mesmas de [`about.md`](about.md) e [`contact.md`](contact.md); `projectType.*` e
`projectCategory.*` aparecem pela primeira vez aqui e serão reaproveitadas por Projetos e Projeto. A
tela que chegar primeiro cria, as outras reaproveitam. O selo de
disponibilidade e o parágrafo do hero não têm chave: vêm do perfil (D44).

| Namespace | Chave                          | Valor em `pt-BR`                                                                                                      | Onde                                                                     |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `home`    | `meta.title`                   | Luiz Felipe dos Santos · Desenvolvedor full stack em TypeScript (existe, valor muda, como em `layout.md`)             | `<title>`, `og:title`                                                    |
| `home`    | `meta.description`             | Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato. (existe) | Descrição, `og:description`                                              |
| `home`    | `heading`                      | Desenvolvedor full stack em TypeScript (existe, perde o ponto, D24)                                                   | `h1`; `jobTitle` do JSON-LD                                              |
| `home`    | `hero.viewProjects`            | Ver projetos                                                                                                          | Link primário do hero                                                    |
| `home`    | `status.heading`               | O que faço agora                                                                                                      | `h2` oculto do status                                                    |
| `home`    | `status.working`               | Trabalhando como                                                                                                      | Rótulo do primeiro card                                                  |
| `home`    | `status.studying`              | Cursando                                                                                                              | Rótulo do segundo card                                                   |
| `home`    | `status.error`                 | Não consegui carregar o que faço agora                                                                                | Título do alerta                                                         |
| `home`    | `stack.heading`                | Tecnologias que uso                                                                                                   | `h2` oculto da faixa                                                     |
| `home`    | `stack.pause`                  | Pausar faixa de tecnologias                                                                                           | Nome fixo do botão de pausa                                              |
| `home`    | `featured.heading`             | Projetos em destaque                                                                                                  | `h2` da seção                                                            |
| `home`    | `featured.viewAll`             | Ver todos                                                                                                             | Texto visível do link do cabeçalho da seção                              |
| `home`    | `featured.viewAllName`         | Ver todos os projetos                                                                                                 | Nome acessível do mesmo link                                             |
| `home`    | `featured.viewProject`         | Ver projeto                                                                                                           | Texto `aria-hidden` do item                                              |
| `home`    | `featured.empty`               | Nenhum projeto em destaque no momento                                                                                 | Estado vazio                                                             |
| `home`    | `featured.error`               | Não consegui carregar os projetos                                                                                     | Título do alerta                                                         |
| `home`    | `loadError.description`        | Verifique sua conexão e tente de novo.                                                                                | Texto dos alertas                                                        |
| `home`    | `loadError.retry`              | Tentar novamente                                                                                                      | Botão dos alertas                                                        |
| `home`    | `exits.allProjects`            | Ver todos os projetos                                                                                                 | Saída primária                                                           |
| `home`    | `exits.about`                  | Ler sobre mim                                                                                                         | Saída secundária                                                         |
| `common`  | `loading`                      | Carregando... (existe)                                                                                                | `role="status"`                                                          |
| `common`  | `authorName`                   | Luiz Felipe dos Santos (de `layout.md`)                                                                               | `name` do JSON-LD                                                        |
| `common`  | `resume.download`              | Baixar CV                                                                                                             | Texto visível do link de CV                                              |
| `common`  | `resume.downloadPdf`           | Baixar CV (PDF)                                                                                                       | Nome acessível do link de CV                                             |
| `common`  | `projectType.web`              | Web                                                                                                                   | Rótulo de metadados (também Projetos e Projeto)                          |
| `common`  | `projectType.mobile`           | Mobile                                                                                                                | Idem                                                                     |
| `common`  | `projectType.api`              | API                                                                                                                   | Idem                                                                     |
| `common`  | `projectType.desktop`          | Desktop                                                                                                               | Idem                                                                     |
| `common`  | `projectType.cli`              | CLI                                                                                                                   | Idem                                                                     |
| `common`  | `projectType.library`          | Biblioteca                                                                                                            | Idem                                                                     |
| `common`  | `projectType.extension`        | Extensão                                                                                                              | Idem                                                                     |
| `common`  | `projectType.bot`              | Bot / automação                                                                                                       | Idem                                                                     |
| `common`  | `projectType.data`             | Dados / IA                                                                                                            | Idem                                                                     |
| `common`  | `projectType.game`             | Jogo                                                                                                                  | Idem                                                                     |
| `common`  | `projectType.iot`              | IoT / embarcado                                                                                                       | Idem                                                                     |
| `common`  | `projectType.infra`            | Infraestrutura                                                                                                        | Idem                                                                     |
| `common`  | `projectCategory.academic`     | Acadêmico                                                                                                             | Idem                                                                     |
| `common`  | `projectCategory.personal`     | Pessoal                                                                                                               | Idem                                                                     |
| `common`  | `projectCategory.professional` | Profissional                                                                                                          | Idem                                                                     |
| `common`  | `period.since`                 | desde `{{date}}`                                                                                                      | Linha de detalhe dos cards de status (D39)                               |
| `common`  | `symbols.forward`              | →                                                                                                                     | Seta de "Ver todos →" e "Ver projeto →", em `aria-hidden`                |
| `common`  | `symbols.separator`            | · (de `layout.md`)                                                                                                    | Separador dos cards de status e do rótulo de metadados, em `aria-hidden` |

O rótulo de metadados do destaque é montado na tela com os rótulos de `common` e o
`symbols.separator` entre eles, sem chave de frase única, porque cada separador fica em
`aria-hidden` (RF-HOME-18). `home:intro` sai de `src/locales/` nos três idiomas (R2), porque o
parágrafo do hero passa a vir do conteúdo (resposta do PO de 11-10-2026); o texto do protótipo
("Trabalho em produtos web de ponta a ponta, do banco de dados à interface. Aqui estão os projetos
que melhor mostram como resolvo problemas.") é a sugestão de valor `pt-BR` para a #58. O
`common:symbols.download` do layout (`↓`) não é usado aqui: o hero usa o ícone de download (D14).
"desde" é "since" em `en` e "desde" em `es`; o valor `es` de "Cursando" é "Estudiando" e o `en`
"Studying" (sugestões para a #34).

## Conteúdo e contrato de dados

### Vem do conteúdo, não de chave

Campo definido na #10, valor na #58 e na #59, texto nos três idiomas, lido por endpoint (NF-DA-02). Enquanto
não há backend, cada fonte é um JSON local servido por endpoint do RTK Query com `queryFn` (R1).

| Bloco                | Dado                                                                                                   | Onde aparece                            | Observação                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Hero                 | Disponibilidade: `isAvailable` e `label` (frase traduzida) do perfil                                   | Selo do hero                            | Mesmo campo do rodapé (RF-LAY-21), de Informações e de Contato (D44)                         |
| Hero                 | Texto de apresentação do Início, do perfil                                                             | Parágrafo do hero                       | Traduzido (resposta do PO de 11-10-2026)                                                     |
| Status atual         | Item de experiência em curso da trajetória: cargo, organização, início                                 | Card "Trabalhando como"                 | RF-HOME-11; de `GET /timeline?current=true` (D54)                                            |
| Status atual         | Item de formação ou curso em curso da trajetória: curso, instituição, etapa (opcional), início         | Card "Cursando"                         | A etapa ("6º semestre") é texto traduzido                                                    |
| Faixa de stack       | Stack do site, com a marcação de item principal                                                        | Faixa de stack; `knowsAbout` do JSON-LD | A mesma lista da stack de Informações, agrupada por categoria no conteúdo                    |
| Projetos em destaque | Projeto: id, título, resumo, `date`, `types`, categoria, marcação de destaque, stack, primeira captura | Itens da seção de destaques             | Tipo e categoria como código de enum, traduzidos por chave; a tela mostra só o ano de `date` |
| Metadados            | URLs de GitHub e LinkedIn do perfil                                                                    | `sameAs` do JSON-LD                     | Já previstas por `layout.md`                                                                 |

Texto fixo, não conteúdo: o `h1`, "Ver projetos", "Baixar CV", os rótulos e headings das seções,
"Ver todos", "Ver projeto", as mensagens de vazio e de erro, "Tentar novamente", "Ler sobre mim", o
nome do botão de pausa e os rótulos de tipo e categoria (tabela acima).

### O que a tela pede ao contrato (#10)

Lista de necessidades; os nomes de campo, os arquivos e os endpoints estão decididos em
[`data-model.md`](../architecture/data-model.md) e [`api-contract.md`](../architecture/api-contract.md).

1. Perfil com `availability: { isAvailable: boolean, label: string }` (`label` traduzido, frase
   livre do PO), o mesmo campo do selo e do rodapé, e o texto de apresentação do Início
   (traduzido).
2. Trajetória com experiência, formação e curso trazendo: título (cargo ou curso), organização
   (empresa ou instituição) em campo próprio, etapa opcional traduzida, início em `AAAA-MM` e fim
   ausente quando em curso. O status atual vem de `GET /timeline?current=true`, com a regra de
   escolha de RF-HOME-11 no contrato (D54), sem campo duplicado no perfil; a tela só escolhe o
   card pelo `kind`.
3. Stack do site agrupada pelas categorias `frontend`, `backend` e `tooling`, com ordem definida
   pelo conteúdo e uma marcação de item principal (booleano opcional).
4. Projeto com id UUID v7, título, resumo curto, `date` (`AAAA-MM`), `types: ProjectType[]` (pelo
   menos um, sem repetição, na ordem do conteúdo; enum `web`, `mobile`, `api`, `desktop`, `cli`,
   `library`, `extension`, `bot`, `data`, `game`, `iot`, `infra`, sem `fullstack`: projeto web com
   backend é `["web", "api"]`), categoria (`academic`, `personal`, `professional`, um valor),
   booleano de destaque, stack ordenada e a lista de capturas 16:9 com `alt`; a ordem do array no
   JSON é a "ordem do conteúdo" usada no desempate (igual nos três idiomas).
5. Uma consulta leve de projetos para listagens (sem documentos markdown nem galeria completa),
   para o Início não baixar o detalhe de todos (NF-DA-05, NF-DE-15): os destaques vêm de
   `GET /projects?featured=true&sort=recent&limit=4` (D51), com o desempate por título de D53.
6. Todo texto do conteúdo por idioma, servido só no idioma ativo (NF-DA-05); erro de carga como
   falha de rede comum, sem mensagem do servidor na tela.

## Metadados e dados estruturados

- `<title>` "Luiz Felipe dos Santos · Desenvolvedor full stack em TypeScript" e
  `<meta name="description">`, das chaves de `home`, com as tags nativas do React 19; o título da
  raiz é a exceção ao formato `<Tela> · Luiz Felipe dos Santos` ([`layout.md`](layout.md)).
- Canônica, `hreflang`, Open Graph (`og:type` `website`, `og:image` a do site, 1200×630) e
  `twitter:card`: pelo mecanismo de #52, como em [`layout.md`](layout.md) ("Metadados por rota e
  idioma"); a tela não declara nada além disso.
- JSON-LD (NF-IA-08, NF-IA-09), num `<script type="application/ld+json">` com `<` escapado,
  gerado dos mesmos dados da tela, um por idioma: `WebSite` e `Person`, ligados pelo `@id` da
  `Person`. #52 fornece o mecanismo e #34 declara os dados, sem inventar campo que o conteúdo não tem.

```json
{
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "name": "<common:authorName>",
            "url": "<canônica de / no idioma>",
            "inLanguage": "<pt-BR, en ou es>",
            "publisher": { "@id": "<URL canônica de />#person" }
        },
        {
            "@type": "Person",
            "@id": "<URL canônica de />#person",
            "name": "<common:authorName>",
            "jobTitle": "<home:heading>",
            "url": "<canônica de / no idioma>",
            "sameAs": ["<GitHub>", "<LinkedIn>"],
            "knowsAbout": ["<itens da stack do site>"]
        }
    ]
}
```

O `@id` da `Person` é `<URL canônica de />#person`, o mesmo em todas as telas e idiomas (decisão
transversal do PO de 11-10-2026), e `/about` o reutiliza na `ProfilePage` (#37,
[`about.md`](about.md)). `sameAs` só tem as redes que existirem no conteúdo. `image` só entra
depois de #42 (foto, D26). `jobTitle` vem da mesma chave do `h1`, para o cargo exibido e o declarado
serem o mesmo dado (NF-IA-09). Sem `noindex`. A pré-renderização (#49) gera `/`, `/en/` e `/es/` com
tudo isso no HTML.

## Critérios de aceite

Copiáveis para a issue #34. Verificação entre colchetes, com a legenda de
[`accessibility.md`](../product/accessibility.md#checklist-por-tela) (`[teste]`, `[axe]`, `[lint]`,
`[teclado]`, `[leitor]`, `[navegador]`, `[e2e]` e `[medição]`) e mais `[review]` para o que só a
revisão do PR confere. Nos itens funcionais, `[teste]` usa Testing Library com `renderWithStore` e
`preloadedState`, `user-event` e `createMemoryRouter`; `[e2e]` cobre media query e posição visual,
`[navegador]` o movimento reduzido e `[medição]` cor e alvo.

### Funcionais

- [ ] `RF-HOME-01` — Rota `/`, `/en/` e `/es/` dentro do `MainLayout`, sem `main` próprio, "Início" ativo, seções na ordem hero, status atual, faixa de stack e destaques com saídas, sem depoimentos [teste]
- [ ] `RF-HOME-02` — Conteúdo só por endpoints do RTK Query, no idioma ativo; seleção e ordenação vindas da API; o que a tela calcula fica no hook da página ou em função pura com teste [teste] [review]
- [ ] `RF-HOME-03` — Selo com `availability.label` do conteúdo, indicador `aria-hidden`, em `--success-surface`/`--success-ink` e `--radius`; com `isAvailable: false` não aparece [teste] [medição]
- [ ] `RF-HOME-04` — `h1` "Desenvolvedor full stack em TypeScript", sem ponto, por `home:heading`, alvo de foco na navegação interna, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-05` — Parágrafo do hero vindo do perfil, limitado a `--measure`; três linhas de skeleton `aria-hidden` enquanto carrega; some sem mensagem se o perfil falha [teste] [review]
- [ ] `RF-HOME-06` — "Ver projetos" para `/projects` e "Baixar CV" com ícones `aria-hidden` e alvo de 44px, quebrando linha quando não cabem, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-HOME-07` — "Baixar CV" aponta para o PDF do idioma ativo sob `BASE_URL`, com `download`, sem `target` e nome acessível "Baixar CV (PDF)", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-08` — Status atual com `h2` visualmente oculto "O que faço agora" e até dois cards de texto, uma coluna quando não cabem, nos três idiomas, sem chave no lugar de texto [teste] [e2e]
- [ ] `RF-HOME-09` — Card "Trabalhando como" com cargo, organização e "desde `MM/AAAA`" em `<time datetime>`, separador `aria-hidden` e sem selo "Atual", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-10` — Card "Cursando" com indicador `aria-hidden`, instituição e curso, etapa quando houver e "desde `MM/AAAA`", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-11` — Status atual de `GET /timeline?current=true`, card escolhido pelo `kind`; card sem item some e a seção some sem os dois; a regra de escolha num teste da camada local (#13) [teste]
- [ ] `RF-HOME-12` — Faixa `--neutral-900` com `--focus-ring` redefinido, `section` com `h2` oculto e `ul` lida uma vez, cópia `aria-hidden`, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-HOME-13` — Itens da stack do site achatados na ordem `frontend`, `backend`, `tooling`, item principal em `--brand-primary`, animação por `transform` com `--dur-marquee` [teste] [medição] [review]
- [ ] `RF-HOME-14` — Botão de pausa antes da lista, 44px, nome "Pausar faixa de tecnologias", `aria-pressed` alternando e ícone de pausa ou play; a pausa não é salva; a faixa para com ponteiro ou foco dentro dela, também sem JavaScript [teste] [medição] [navegador]
- [ ] `RF-HOME-15` — Com movimento reduzido, lista estática que quebra linha, sem cópia e sem botão, sem diferença na primeira renderização em relação ao HTML [teste] [navegador]
- [ ] `RF-HOME-16` — `h2` "Projetos em destaque" e "Ver todos →" para `/projects` com nome "Ver todos os projetos" e alvo de 44px, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-HOME-17` — Destaques de `GET /projects?featured=true&sort=recent&limit=4`, na ordem da resposta (`date` decrescente, empate por título e `id`, D53), sem completar com projeto não marcado; nenhum mostra o estado vazio [teste]
- [ ] `RF-HOME-18` — Itens em `ul` de `article`, rótulo de metadados com todos os `types`, a categoria e o ano, separadores `aria-hidden`, `h3`, resumo, até três chips e "Ver projeto →", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-19` — Um link por item, no título, para `/projects/:id` do idioma; área clicável estendida por CSS; imagem com `alt=""`; hover sem movimento com movimento reduzido [teste] [e2e] [navegador]
- [ ] `RF-HOME-20` — Duas colunas alternadas a partir de 640px e uma coluna abaixo, por media query, com a mesma ordem no DOM [e2e]
- [ ] `RF-HOME-21` — Primeira captura 16:9 com espaço reservado, `srcset`/`sizes`, `loading="lazy"` e `decoding="async"`; placeholder `aria-hidden` sem captura [teste] [review]
- [ ] `RF-HOME-22` — "Ver todos os projetos" para `/projects` e "Ler sobre mim" para `/about`, alvos de 44px, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-HOME-23` — Cada bloco carrega e falha sozinho; skeletons `aria-hidden` e um único `role="status"` [teste]
- [ ] `RF-HOME-24` — Erro de status ou destaques em `role="alert"` com "Tentar novamente" que refaz só aquela consulta, heading mantido; perfil e stack somem sem mensagem; nunca mensagem técnica, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-HOME-25` — Todo link interno por `<Link>` com o prefixo do idioma, montado pela função de #53; nenhum link externo [teste] [review]

### Acessibilidade

Copiados de [`accessibility.md`](../product/accessibility.md#checklist-por-tela), sem renumerar.

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

- [ ] `A11Y-IN01` — `h1` "Desenvolvedor full stack em TypeScript" (D24) [teste]
- [ ] `A11Y-IN02` — Cada seção tem heading [teste]
- [ ] `A11Y-IN03` — Cards de destaque em lista, com um link por card, nome do link com o nome do projeto e imagem com `alt=""` [teste]
- [ ] `A11Y-IN04` — "Ver todos" tem o nome "Ver todos os projetos" (2.4.9) [teste]
- [ ] `A11Y-IN05` — Faixa de stack com a lista acessível uma vez e a cópia do laço com `aria-hidden` [teste]
- [ ] `A11Y-IN06` — Botão de pausa da faixa com `aria-pressed` e rótulo nos três idiomas (D28) [teste]
- [ ] `A11Y-IN07` — Faixa estática, quebrando linha, com movimento reduzido [navegador]
- [ ] `A11Y-IN08` — "Baixar CV (PDF)" no nome do link [teste]

### Não funcionais

De [`non-functional-requirements.md`](../product/non-functional-requirements.md), com o momento de
verificação de lá. As metas de desempenho NF-DE-01, NF-DE-02, NF-DE-05 e NF-DE-06 são medidas com
Lighthouse mobile no build publicado do Pages, como diz aquele documento.

- [ ] `NF-IN-01` — Todo texto da tela existe em `pt-BR`, `en` e `es` [CI]
- [ ] `NF-IN-02` — Perfil, trajetória, stack e projetos traduzidos nos três idiomas [CI; #59]
- [ ] `NF-IN-03` — Nenhuma tela mostra chave no lugar de texto [CI; #41]
- [ ] `NF-IN-04` — Datas em `MM/AAAA` por `Intl.DateTimeFormat` nos três idiomas; o período em curso segue D39 ("desde MM/AAAA") [CI; #37, #36]
- [ ] `NF-IN-05` — `<html lang>` acompanha o idioma do caminho, já no HTML pré-renderizado [CI; #49; #53]
- [ ] `NF-IN-06` — `/`, `/en/` e `/es/` abrem a tela no idioma do caminho [CI; #53]
- [ ] `NF-IN-11` — Todo link interno mantém o prefixo do idioma, montado por função única [CI; #53]
- [ ] `NF-IN-13` — Caminhos em inglês: `/projects`, `/projects/:id` e `/about` [CI; #53; #36]
- [ ] `NF-DA-02` — A tela não importa JSON de conteúdo: o acesso é por endpoints do RTK Query [Review; CI]
- [ ] `NF-DA-03` — JSONs e PDFs com caminho montado por `import.meta.env.BASE_URL` [Review; #45; #41]
- [ ] `NF-DA-05` — A tela carrega só o conteúdo do idioma ativo [#10; #41]
- [ ] `NF-DE-01` — LCP até 2,5 s [Lighthouse mobile]
- [ ] `NF-DE-02` — CLS até 0,1, rolando até o fim da página [Lighthouse mobile]
- [ ] `NF-DE-05` — FCP até 1,8 s [Lighthouse mobile]
- [ ] `NF-DE-06` — Nota de Performance de pelo menos 90 [Lighthouse mobile]
- [ ] `NF-DE-07` — JS da primeira carga de `/` até 180 KB gzip [DevTools Network, filtro JS, cache desligado]
- [ ] `NF-DE-14` — Imagem 16:9 de destaque com no máximo 80 KB, servida por `srcset`/`sizes` [DevTools em 390px]
- [ ] `NF-DE-15` — Total transferido na primeira carga de `/` até 800 KB [DevTools Network, rodapé]
- [ ] `NF-DE-16` — Imagens e placeholders com `width` e `height` (ou `aspect-ratio`) reservados [Review; #41]
- [ ] `NF-DE-17` — Imagens de destaque, abaixo da dobra, com `loading="lazy"` e `decoding="async"` [Review; #41]
- [ ] `NF-DE-19` — Faixa de stack e hover animados só por `transform` e `opacity` [Review]
- [ ] `NF-RE-01` — Quebra de 640px dos destaques por media query; tipografia contínua por `clamp()` [#41]
- [ ] `NF-RE-02` — Sem largura fixa em px fora das imagens [Review]
- [ ] `NF-RE-03` — Sem rolagem horizontal em 360, 390, 768 e 1280px, nos dois temas e nos estados especiais [#41]
- [ ] `NF-TE-04` — Movimento reduzido e quebras não mudam a primeira renderização em relação ao HTML [#49; #41]
- [ ] `NF-MO-01` — `prefers-reduced-motion: reduce` desliga marquee, shimmer e `translateY` de hover [#41]
- [ ] `NF-MO-02` — A faixa consulta a preferência pelo hook reutilizável de `src/hooks/` [CI; quem usar]
- [ ] `NF-MO-03` — A faixa de stack tem pausa (D28) [#34; #41]
- [ ] `NF-IA-01` — `/`, `/en/` e `/es/` com HTML gerado no build, legível sem JavaScript [CI; #49; #41]
- [ ] `NF-IA-03` — Primeira renderização do cliente igual ao HTML, com os dados serializados na store [CI; #49; #41]
- [ ] `NF-IA-08` — JSON-LD `WebSite` e `Person` com nome, cargo, URL, `sameAs` e `knowsAbout` [CI; #52; #34 a #38; #41]
- [ ] `NF-IA-09` — JSON-LD gerado dos mesmos dados da tela, com `<` escapado [CI; #52]
- [ ] `NF-IA-10` — `<title>`, descrição, Open Graph e `twitter:card` por idioma [CI; #52; #41]
- [ ] `NF-IA-16` — HTML semântico, com o conteúdo principal dentro do `main` e a stack em texto [CI; #33, #34 a #38]
- [ ] `NF-CO-03` — Sem JavaScript, o conteúdo é legível; pausa e "Tentar novamente" precisam de JavaScript [#41]
- [ ] `NF-PR-01` — Nenhuma requisição a terceiros: imagens, JSONs e PDFs da própria origem [#41; Review]

### Gerais

- [ ] `npm run build`, `npm run lint` e `npm test -- --run` passam
- [ ] Textos novos de `home` e `common` em `pt-BR`, `en` e `es`; `home:intro` e outras chaves sem uso removidas (R2)
- [ ] A rota abre e recarrega nos três prefixos (`/`, `/en/`, `/es/`) no build com o `base` do Pages

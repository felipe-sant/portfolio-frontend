# Informações

A tela Informações (`/about`, também sob `/en/about` e `/es/about`, D32) junta o que o recrutador
procura antes de chamar alguém para conversar: quem é o autor, o que ele domina, por onde passou e
o CV para baixar. Quem a implementa é a issue G, com C (layout), S (pré-renderização), V
(canônica, Open Graph e JSON-LD), I (botões de CV), L (foto) e #13 (conteúdo). Este documento diz o
comportamento; não escolhe nome de componente nem de arquivo, além do namespace e da chave de
tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-informacoes`, em
[`prototype/`](../design/prototype/README.md)), [`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md) e
[`layout.md`](layout.md) (cabeçalho, rodapé, foco na troca de rota e abertura de links).

Cada requisito funcional tem um ID `RF-ABOUT-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O texto do protótipo é
provisório (PI5): nenhum valor dele vira dado, e o conteúdo real vem da #13.

## Objetivo

Mostrar quem é o autor, o que ele domina e por onde passou, com a saída que o recrutador procura
("Baixar CV") à vista na primeira dobra, e deixar o detalhe de cada experiência, formação e curso a
um clique, sem sair da tela.

## Estados

| Estado                                  | O que aparece                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal, a partir de 640px               | Apresentação com a foto à esquerda (localização e disponibilidade abaixo dela) e, à direita, rótulo "Informações", `h1` com o nome, parágrafo de apresentação, "Baixar CV" e "Entrar em contato". Depois: Sobre mim (duas colunas quando cabem), Stack (três grupos), Complementos (faixa escura, duas colunas) e Trajetória (três grupos)                                                                   |
| Normal, abaixo de 640px                 | Mesma ordem em uma coluna: foto em cima do texto; complementos empilhados (a partir de 900–980px já empilham, [`design-system.md`](../design/design-system.md)); no item de trajetória, o período quebra para baixo do título (D20)                                                                                                                                                                          |
| Carregando                              | `h1`, títulos de seção, "Baixar CV" e "Entrar em contato" visíveis (não dependem do conteúdo); skeleton `aria-hidden` no lugar da foto (1:1), do parágrafo de apresentação, de localização e disponibilidade, dos parágrafos de Sobre mim, dos chips de Stack e Complementos e dos itens de trajetória (altura de um item); um único status "Carregando..." visualmente oculto em `role="status"` (A11Y-G13) |
| Erro ao carregar o perfil               | Nas partes que dependem do perfil (parágrafo de apresentação, localização e disponibilidade, Sobre mim, Stack, "Como eu trabalho"): mensagem "Não foi possível carregar esta parte da página." e o botão "Tentar novamente", que refaz só essa carga; o anúncio em `role="alert"` acontece uma vez, na primeira parte afetada (A11Y-G14). O resto da tela segue normal                                       |
| Erro ao carregar a trajetória           | O mesmo, em Trajetória e na coluna "Certificados" (derivada da trajetória, D38)                                                                                                                                                                                                                                                                                                                              |
| Erro ao carregar os projetos            | Só o bloco "Projetos relacionados" do modal deixa de aparecer; sem mensagem (o resto do detalhe é útil sozinho)                                                                                                                                                                                                                                                                                              |
| Vazio                                   | Parte sem dado não aparece, com o título junto (nunca título sem conteúdo): grupo de stack ou de trajetória sem itens, coluna de complementos sem itens, faixa de complementos com as duas colunas vazias, seção Stack ou Trajetória sem nenhum item. Apresentação e Sobre mim são obrigatórios no contrato e nunca ficam vazios                                                                             |
| Foto ainda não entregue (D26 bloqueada) | Placeholder neutro 1:1 (`--bg-placeholder`, borda `--border-subtle`), decorativo (`aria-hidden`, sem `role="img"`, achado de `accessibility.md`)                                                                                                                                                                                                                                                             |
| Modal aberto, a partir de 640px         | Fundo `--overlay` sobre a página; caixa centralizada de até 34rem, `--radius`, `--shadow-modal`, com cabeçalho fixo dentro dela (título, linha de metadados e "Fechar") e o corpo rolando; rolagem da página travada                                                                                                                                                                                         |
| Modal aberto, abaixo de 640px (D20)     | Tela cheia, sem raio nem margem, mesmo conteúdo                                                                                                                                                                                                                                                                                                                                                              |
| Sem JavaScript                          | HTML pré-renderizado (S) com todas as seções e o detalhe de cada item no HTML, fechado (D37); "Baixar CV", "Entrar em contato" e os links do layout funcionam; os itens de trajetória não abrem o modal (NF-CO-03)                                                                                                                                                                                           |

## Validações

Não há campo de formulário. As regras abaixo são do conteúdo, verificadas pelo teste de conteúdo
da #13 (o build falha), com o comportamento da tela se algo passar:

| Entrada                                 | Regra                                                                              | Na tela, se falhar                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Início e fim de item de trajetória      | `AAAA-MM` (ISO 8601); fim opcional (ausente = em curso) e maior ou igual ao início | Não se aplica: o teste de conteúdo barra                                    |
| Tipo de item de trajetória              | `experience`, `education` ou `course`                                              | Item com tipo desconhecido não aparece                                      |
| Categoria de stack                      | `frontend`, `backend` ou `tooling`                                                 | Grupo com categoria desconhecida não aparece                                |
| Projeto relacionado                     | id (UUID v7, NF-DA-07) de um projeto existente no conteúdo do mesmo idioma         | O link não aparece; se nenhum sobrar, o bloco não aparece                   |
| Resumo do item, apresentação, Sobre mim | Obrigatórios, não vazios                                                           | Não se aplica: o teste de conteúdo barra                                    |
| Arquivo do CV                           | `cv/cv-<idioma>.pdf` sob `import.meta.env.BASE_URL`, gerado por X                  | Até X existir, o link quebra (aceito em M5, como em `layout.md`, RF-LAY-27) |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê tudo e usa todas as ações. Não há
ação restrita.

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Estrutura

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                  | Fonte                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `RF-ABOUT-01` | Ordem fixa das seções: Apresentação, Sobre mim, Stack, Complementos e Trajetória; sem depoimentos (D13). Cada seção é `section` com `aria-labelledby` no seu heading (a Apresentação aponta para o `h1`). Headings: `h1` com o nome; `h2` Sobre mim, Stack, Certificados, Como eu trabalho e Trajetória; `h3` nos grupos de stack e de trajetória. Rótulos em caixa normal no JSON, caixa alta por CSS | Protótipo, D13, `accessibility.md` (HTML semântico e nomes acessíveis) |

### Apresentação

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Fonte                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `RF-ABOUT-02` | Foto de perfil 1:1 (D26) com `alt` por chave, "Foto de Luiz Felipe dos Santos" (A11Y-IF01), `width` e `height` declarados (NF-DE-16), `srcset`/`sizes` com no máximo 80 KB (NF-DE-14), `fetchpriority="high"` e sem `loading="lazy"` por estar na primeira dobra (NF-DE-17), sem EXIF (NF-PR-05). Até L entregar a foto, placeholder neutro decorativo (`aria-hidden`)                                                                                                                                                                                        | D26, `accessibility.md` (Imagens e texto alternativo)       |
| `RF-ABOUT-03` | Abaixo da foto, a localização com ícone de pin e o selo de disponibilidade, ambos do conteúdo. O selo usa `availability` do perfil, o mesmo campo de Início, Contato e rodapé (RF-LAY-21): o texto é `label`, frase livre do PO traduzida por idioma (ex.: "Disponível a partir de 01/2027"), nunca chave de tradução; o indicador redondo (único elemento redondo, D11) fica em `--success-ink`; com `isAvailable: false` o selo não aparece, e a localização fica sozinha. O texto carrega o estado (cor nunca sozinha). Ícone e indicador em `aria-hidden` | Protótipo, D15, D11, decisão transversal do PO (11-10-2026) |
| `RF-ABOUT-04` | Rótulo "Informações" acima do `h1`; `h1` com o nome do autor (`common:authorName`), que não depende do conteúdo e existe já no carregamento (alvo do foco na troca de rota, RF-LAY-32); parágrafo de apresentação do conteúdo, com largura máxima `--measure`                                                                                                                                                                                                                                                                                                 | Protótipo, `layout.md`                                      |
| `RF-ABOUT-05` | "Baixar CV": link com aparência de botão primário (degradê da marca) e ícone de download (`aria-hidden`), apontando para o PDF do idioma ativo (`cv/cv-pt-BR.pdf`, `cv/cv-en.pdf`, `cv/cv-es.pdf`, com `import.meta.env.BASE_URL`), com download direto (atributo `download`, mesma origem, sem nova aba) e nome acessível "Baixar CV (PDF)", que começa pelo texto visível (A11Y-IF05, 2.5.3). Não depende do conteúdo carregar                                                                                                                              | D14, D30, D36                                               |
| `RF-ABOUT-06` | "Entrar em contato": link secundário para `/contact` com o prefixo do idioma (NF-IN-11), com a mesma chave do rodapé (`common:footer.contact.cta`). Substitui o "Enviar mensagem" do protótipo                                                                                                                                                                                                                                                                                                                                                                | `layout.md` (RF-LAY-22, resposta do PO a Q1)                |

### Sobre mim

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                   | Fonte               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `RF-ABOUT-07` | `h2` "Sobre mim" e os parágrafos do conteúdo (o protótipo tem quatro; o número vem do conteúdo), em grade de colunas de no mínimo 22rem (duas quando cabem, uma no celular), cada parágrafo com no máximo `--measure` e entrelinha `--lh-body` (1.4.8). Faixa `--bg-raised` com bordas `--border-subtle`. É conteúdo, não chave (ver "Vem do conteúdo") | Protótipo, NF-IN-02 |

### Stack

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fonte                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `RF-ABOUT-08` | `h2` "Stack" e três grupos em ordem fixa, Frontend, Backend e Infra e ferramentas, cada um com `h3` (rótulo por `common:stackCategory.frontend`, `.backend` e `.tooling`, porque a categoria é enum) e a contagem, e os itens em `ul` de chips em `--font-mono` com `--radius` (D11). A stack nunca aparece como lista única sem categoria. Ordem dos itens: a do conteúdo. Nome de tecnologia sem tradução e sem `lang`. Os dados são os mesmos da faixa de stack do Início, do `knowsAbout` do JSON-LD e do CV (NF-DA-04) | Protótipo, glossário (Stack)                           |
| `RF-ABOUT-09` | Contagem de grupo (stack e trajetória): o número visível fica em `aria-hidden` e um texto visualmente oculto diz a contagem com o substantivo, por chave com plural ("4 tecnologias", "2 itens"), para o leitor de tela não ouvir um número solto                                                                                                                                                                                                                                                                           | `accessibility.md` (HTML semântico e nomes acessíveis) |

### Complementos

| ID            | Regra                                                                                                                                                                                                                                                                           | Fonte               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `RF-ABOUT-10` | Faixa escura `--neutral-900` (o `--focus-ring` é redefinido nela, D27, caso algum elemento focável entre), com duas colunas de no mínimo 18rem, "Certificados" e "Como eu trabalho", cada uma com `h2` (caixa alta por CSS) e os itens em `ul` de chips                         | Protótipo, D27      |
| `RF-ABOUT-11` | "Certificados" lista os certificados dos itens de trajetória (D38), na ordem da trajetória (RF-ABOUT-14, grupos na ordem fixa), sem repetir o mesmo certificado; o chip mostra o nome e, se houver, o emissor separado por `·`. É o mesmo dado do bloco "Certificados" do modal | D38                 |
| `RF-ABOUT-12` | "Como eu trabalho": frases curtas do conteúdo, na ordem do conteúdo                                                                                                                                                                                                             | Protótipo, NF-IN-02 |

### Trajetória

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Fonte                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `RF-ABOUT-13` | `h2` "Trajetória", a instrução "Selecione um item para ver o detalhe." e três grupos em ordem fixa, Experiências profissionais, Formações e Cursos, cada um com `h3` e contagem (RF-ABOUT-09) e os itens em `ul`                                                                                                                                                                                                                                                                                                        | Protótipo, A11Y-IF02                           |
| `RF-ABOUT-14` | Ordenação dentro de cada grupo, mais recente primeiro: itens em curso antes (início mais recente primeiro), depois os encerrados por fim mais recente e, no empate, início mais recente; empate total mantém a ordem do conteúdo. Calculada pela tela (função pura com teste), sem depender da ordem do JSON                                                                                                                                                                                                            | Issue #6                                       |
| `RF-ABOUT-15` | Cada item é um `button` (`type="button"`, `aria-haspopup="dialog"`, A11Y-IF03) de largura total e alvo mínimo de 44px, com o título (Bricolage 700), o selo "Atual" (`common:period.current`) quando não há fim (texto e indicador, nunca só cor), a linha de detalhes (organização e detalhes do conteúdo, separados por `·` em `aria-hidden`) e o período à direita (abaixo do título em menos de 640px, D20). Hover: borda `--text-strong` e fundo `--bg-raised`, sem deslocamento, desligado com movimento reduzido | Protótipo, D20, `design-system.md`             |
| `RF-ABOUT-16` | Período: datas em `MM/AAAA` por `Intl.DateTimeFormat` do idioma ativo com `month: "2-digit"` e `year: "numeric"` (NF-IN-04), cada data em `<time datetime="AAAA-MM">` (A11Y-IF02). Encerrado: "06/2024 – 05/2026" (`common:period.range`). Em curso: "desde 06/2026", "since 06/2026", "desde 06/2026" (`common:period.since`, D39), com o selo "Atual" (`common:period.current`) à parte, nunca como valor do período. A mesma função formata o período no modal e no "status atual" do Início                         | `design-system.md` (Voz e copy), NF-IN-04, D39 |

### Modal de trajetória

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Fonte                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `RF-ABOUT-17` | Clique, Enter ou Espaço no item abre o detalhe em `role="dialog"` com `aria-modal="true"` e `aria-labelledby` no título (`h2`). Cabeçalho fixo dentro do modal: título do item, linha de metadados (organização, detalhes e período, com `·`) e o botão "Fechar" só de ícone (×, 44px, `aria-label` por chave). Um modal por vez                                                                                                                             | Protótipo, A11Y-IF04                     |
| `RF-ABOUT-18` | Ordem canônica do corpo: resumo → responsabilidades (experiência) ou principais disciplinas (formação e curso) → tecnologias → certificados → projetos relacionados. Cada bloco tem rótulo `h3` (caixa alta por CSS); responsabilidades e disciplinas em `ul` com marcador; tecnologias e certificados em `ul` de chips; projetos em lista de links. Bloco sem itens não aparece, com o rótulo junto; o resumo é obrigatório, então o modal nunca fica vazio | Protótipo (`blocos()`), issue #6         |
| `RF-ABOUT-19` | Projetos relacionados: um link por projeto para `/projects/:id` com o prefixo do idioma (NF-IN-11), na mesma aba (D36), com texto igual ao título do projeto vindo do conteúdo de projetos (não duplicado na trajetória) e seta `→` em `aria-hidden`; alvo de 44px. Clicar navega: o modal fecha, a rolagem é liberada e o foco vai para o `h1` do projeto (RF-LAY-32). Id que não resolve não vira link                                                     | Issue #6, D32, D36, 2.4.9                |
| `RF-ABOUT-20` | Foco e fechamento (PI1, A11Y-IF04): ao abrir, o foco vai para o título do modal (`tabIndex={-1}`); Tab e Shift+Tab circulam só dentro; o resto da página fica `inert`; a rolagem da página trava. Fecha por "Fechar", por clique no fundo (fora da caixa) e por Esc; ao fechar, o foco volta ao item que abriu e a rolagem é liberada na mesma posição                                                                                                       | PI1, `accessibility.md` (Teclado e foco) |
| `RF-ABOUT-21` | Tamanho e movimento: a partir de 640px, caixa de até 34rem; abaixo, tela cheia (D20). A troca é por media query no CSS, não por largura lida em JavaScript (como RF-LAY-05, NF-TE-04). Abrir e fechar não animam com `prefers-reduced-motion: reduce` (2.3.3). Sem rolagem horizontal com o modal aberto de 320px a 1280px (NF-RE-03)                                                                                                                        | D20, A11Y-G12                            |
| `RF-ABOUT-22` | O modal não tem URL própria: abrir não muda a URL nem o histórico, e a canônica de `/about` continua sem query (NF-IA-11). Se a rota muda com o modal aberto (voltar do navegador), ele fecha e a rolagem é liberada. Motivo: o detalhe é complemento da tela, não destino, e o conteúdo já está no HTML da própria `/about` (RF-ABOUT-23)                                                                                                                   | PO (spec da #6)                          |
| `RF-ABOUT-23` | O detalhe de todo item está no HTML pré-renderizado de `/about` em cada idioma, fechado e fora da árvore de acessibilidade até abrir (D37); com JavaScript, abrir o item mostra esse mesmo conteúdo como modal. Cumpre NF-IA-07 ("`/about` traz as mesmas informações em HTML pré-renderizado") além de NF-IA-02 (o detalhe também está em `llms-full*.txt` e no CV em texto)                                                                                | D37                                      |

### Dados e estados

| ID            | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                         | Fonte                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `RF-ABOUT-24` | A tela lê o conteúdo só por endpoints do RTK Query em `src/store/api/` (NF-DA-02), dos JSONs em `public/` com `import.meta.env.BASE_URL` (NF-DA-03), só no idioma ativo (NF-DA-05). Fontes: perfil (apresentação, localização, disponibilidade, foto, Sobre mim, stack e "Como eu trabalho"), trajetória e projetos (só id e título, para os relacionados). Trocar de idioma leva à URL equivalente (D31) e carrega o conteúdo do novo idioma | R1, NF-DA                                 |
| `RF-ABOUT-25` | Carregando: como em [Estados](#estados); o shimmer para com movimento reduzido (NF-MO-01). Um único `role="status"` para a tela inteira, não um por seção                                                                                                                                                                                                                                                                                     | A11Y-G13, `design-system.md`              |
| `RF-ABOUT-26` | Erro por fonte: como em [Estados](#estados); mensagem e "Tentar novamente" por parte afetada, `role="alert"` uma vez por fonte (na primeira parte afetada); "Tentar novamente" refaz só a carga daquela fonte; a mensagem nunca mostra detalhe técnico                                                                                                                                                                                        | A11Y-G14, `design-system.md` (Voz e copy) |
| `RF-ABOUT-27` | Vazio: como em [Estados](#estados); parte sem dado some com o título                                                                                                                                                                                                                                                                                                                                                                          | Issue #6, `design-system.md` (Voz e copy) |

### Metadados e pré-renderização

| ID            | Regra                                                                                                                                                                                                                                                                                           | Fonte                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `RF-ABOUT-28` | `<title>` "Informações · Luiz Felipe dos Santos" e `<meta name="description">` por chave do namespace `about` (A11Y-G01); canônica, `hreflang`, Open Graph e `twitter:card` pelo mecanismo de V (NF-IA-10, NF-IA-11), com `og:type` `profile` e `og:image` do site (a foto é 1:1, não 1200×630) | `layout.md` (Metadados), NF-IA-10 |
| `RF-ABOUT-29` | JSON-LD `ProfilePage` com `mainEntity` `Person` (ver [Metadados e dados estruturados](#metadados-e-dados-estruturados)), gerado dos mesmos dados da tela, com `<` escapado (NF-IA-08, NF-IA-09)                                                                                                 | NF-IA-08                          |
| `RF-ABOUT-30` | `/about` é pré-renderizada nos três idiomas com `h1`, todas as seções e o detalhe dos itens no `main` (NF-IA-01, NF-IA-16, RF-ABOUT-23); os dados de perfil, trajetória e projetos usados no HTML vão serializados para a store (NF-IA-03), sem erro de hidratação                              | NF-IA-01, NF-IA-03                |

## Navegação

| De onde                               | Ação                                       | Para onde                                               |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Cabeçalho, menu, rodapé de `/contact` | "Informações"                              | `/about` do idioma atual                                |
| Qualquer link externo ou URL digitada | Abrir `/about`, `/en/about` ou `/es/about` | A tela no idioma do caminho                             |
| Apresentação                          | "Baixar CV"                                | Download do PDF do idioma ativo, sem sair da tela (D36) |
| Apresentação                          | "Entrar em contato"                        | `/contact` do idioma atual                              |
| Item de trajetória                    | Clique, Enter ou Espaço                    | Modal de detalhe, na mesma URL                          |
| Modal                                 | "Fechar", fundo ou Esc                     | Fecha; o foco volta ao item                             |
| Modal, projetos relacionados          | Título do projeto                          | `/projects/:id` do idioma atual                         |
| Seletor de idioma                     | `PT`, `EN`, `ES`                           | `/about`, `/en/about`, `/es/about` (D31)                |

O Início pode ter um link para `/about`; isso é da spec da #3.

## Textos fixos e chaves

Todo texto fixo vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e `es`
são escritos na implementação (G), com as mesmas chaves (R2). O namespace novo é `about`,
registrado em `src/locales/*/about.json`, em `src/i18n/resources.ts` e no `ns` de
`src/i18n/i18n.ts` (na G). Texto usado por mais de uma tela vai para `common` (convenção do
`.claude/CLAUDE.md`).

| Namespace | Chave                                             | Valor em `pt-BR`                                                        | Onde                                                        |
| --------- | ------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| `about`   | `meta.title`                                      | Informações · Luiz Felipe dos Santos                                    | `<title>` (valor de `layout.md`)                            |
| `about`   | `meta.description`                                | Quem é Luiz Felipe dos Santos: sobre mim, stack, trajetória e formação. | Descrição (valor de `layout.md`)                            |
| `about`   | `hero.label`                                      | Informações                                                             | Rótulo acima do `h1`                                        |
| `about`   | `hero.photoAlt`                                   | Foto de `{{name}}`                                                      | `alt` da foto, com `common:authorName`                      |
| `about`   | `aboutMe.heading`                                 | Sobre mim                                                               | `h2`                                                        |
| `about`   | `stack.heading`                                   | Stack                                                                   | `h2`                                                        |
| `about`   | `stack.count_one` / `stack.count_other`           | `{{count}}` tecnologia / `{{count}}` tecnologias                        | Contagem oculta (RF-ABOUT-09)                               |
| `about`   | `complements.certificates`                        | Certificados                                                            | `h2` da faixa                                               |
| `about`   | `complements.workStyle`                           | Como eu trabalho                                                        | `h2` da faixa                                               |
| `about`   | `trajectory.heading`                              | Trajetória                                                              | `h2`                                                        |
| `about`   | `trajectory.hint`                                 | Selecione um item para ver o detalhe.                                   | Instrução                                                   |
| `about`   | `trajectory.groups.experience`                    | Experiências profissionais                                              | `h3`                                                        |
| `about`   | `trajectory.groups.education`                     | Formações                                                               | `h3`                                                        |
| `about`   | `trajectory.groups.course`                        | Cursos                                                                  | `h3`                                                        |
| `about`   | `trajectory.count_one` / `trajectory.count_other` | `{{count}}` item / `{{count}}` itens                                    | Contagem oculta                                             |
| `about`   | `modal.close`                                     | Fechar                                                                  | `aria-label` do botão ×                                     |
| `about`   | `modal.responsibilities`                          | Responsabilidades                                                       | Rótulo de bloco                                             |
| `about`   | `modal.disciplines`                               | Principais disciplinas                                                  | Rótulo de bloco                                             |
| `about`   | `modal.technologies`                              | Tecnologias                                                             | Rótulo de bloco                                             |
| `about`   | `modal.certificates`                              | Certificados                                                            | Rótulo de bloco                                             |
| `about`   | `modal.relatedProjects`                           | Projetos relacionados                                                   | Rótulo de bloco                                             |
| `about`   | `loadError.message`                               | Não foi possível carregar esta parte da página.                         | Erro por fonte                                              |
| `about`   | `loadError.retry`                                 | Tentar novamente                                                        | Botão do erro                                               |
| `common`  | `resume.download`                                 | Baixar CV                                                               | Texto visível do botão (Início, Informações e Contato; D14) |
| `common`  | `resume.downloadPdf`                              | Baixar CV (PDF)                                                         | Nome acessível (A11Y-IF05)                                  |
| `common`  | `period.range`                                    | `{{start}}` – `{{end}}`                                                 | Período encerrado (Informações e Início)                    |
| `common`  | `period.since`                                    | desde `{{date}}`                                                        | Período em curso (D39)                                      |
| `common`  | `period.current`                                  | Atual                                                                   | Selo do item em curso                                       |
| `common`  | `stackCategory.frontend`                          | Frontend                                                                | `h3` do grupo de stack                                      |
| `common`  | `stackCategory.backend`                           | Backend                                                                 | `h3` do grupo de stack                                      |
| `common`  | `stackCategory.tooling`                           | Infra e ferramentas                                                     | `h3` do grupo de stack                                      |
| `common`  | `symbols.forward`                                 | →                                                                       | Seta de link de continuação, em `aria-hidden`               |
| `common`  | `authorName`                                      | Luiz Felipe dos Santos (de `layout.md`)                                 | `h1`                                                        |
| `common`  | `loading`                                         | Carregando... (existe)                                                  | Status da tela                                              |
| `common`  | `footer.contact.cta`                              | Entrar em contato (de `layout.md`)                                      | Link secundário                                             |
| `common`  | `symbols.separator`                               | · (de `layout.md`)                                                      | Linha de detalhes e de metadados                            |

`resume.*`, `period.*`, `stackCategory.*` e `symbols.forward` são as chaves compartilhadas pelas
cinco telas (decisão transversal do PO de 11-10-2026), com esses nomes exatos: a tela que chegar
primeiro cria, as outras reaproveitam. "desde" é "since" em `en` e "desde" em `es`. A contagem usa
o plural do i18next (`_one`/`_other`), nos três idiomas.

## Vem do conteúdo

Campo definido pela #10, com valor da #13 nos três idiomas quando é texto, lido por endpoint
(NF-DA-02):

| Dado                                                     | Onde aparece                                           |
| -------------------------------------------------------- | ------------------------------------------------------ |
| Cargo                                                    | JSON-LD (`jobTitle`) e CV; não aparece escrito na tela |
| Parágrafo de apresentação                                | Apresentação, JSON-LD (`description`)                  |
| Localização                                              | Apresentação, rodapé, JSON-LD                          |
| Disponibilidade (`label` livre e `isAvailable`)          | Apresentação, Início, Contato, rodapé                  |
| Foto (arquivo e dimensões)                               | Apresentação, JSON-LD (`image`)                        |
| Parágrafos de Sobre mim                                  | Sobre mim                                              |
| Stack por categoria                                      | Stack, faixa do Início, JSON-LD (`knowsAbout`), CV     |
| Frases de "Como eu trabalho"                             | Complementos                                           |
| Itens de trajetória (com certificados e ids de projetos) | Trajetória, modal, Certificados, JSON-LD, CV           |
| Título do projeto                                        | Projetos relacionados do modal                         |

Texto fixo, não conteúdo: rótulos de seção, de grupo e de bloco, instrução, selo "Atual", "Baixar
CV", "Entrar em contato", "Fechar", `alt` da foto e o nome do autor (`common:authorName`,
`layout.md`). Sobre mim, apresentação e "Como eu trabalho" são conteúdo, e não chave, porque são
escritos pelo PO, mudam sem mexer em código, são traduzidos com o resto do conteúdo (NF-IN-02) e
alimentam o CV e os arquivos para IA da mesma fonte (NF-DA-04).

## O que a tela pede ao contrato (#10)

Lista de necessidades da tela, com nomes sugeridos em inglês; a #10 decide nomes, arquivos e
endpoints.

### Perfil

Um por idioma.

| Campo sugerido                            | Tipo                                                                    | Uso                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `role`                                    | texto                                                                   | JSON-LD `jobTitle`, CV                                                |
| `summary`                                 | texto, obrigatório                                                      | Parágrafo de apresentação, JSON-LD `description`, CV                  |
| `location`                                | `{ city, region, country }`                                             | "São José dos Campos · SP"; JSON-LD `homeLocation`; rodapé            |
| `availability`                            | `{ isAvailable: boolean, label: texto }`                                | Selo de Informações, Início, Contato e rodapé; `false` esconde o selo |
| `photo`                                   | `{ src, width, height }` (o `alt` é chave)                              | Foto 1:1 (D26, L)                                                     |
| `about`                                   | texto[], pelo menos um                                                  | Sobre mim                                                             |
| `workPrinciples`                          | texto[]                                                                 | "Como eu trabalho"                                                    |
| `stack`                                   | `{ category: "frontend" \| "backend" \| "tooling", items: string[] }[]` | Stack, Início, JSON-LD, CV                                            |
| `email`, `links.github`, `links.linkedin` | (já pedidos por `layout.md`)                                            | JSON-LD `sameAs`, CV                                                  |

### Item de trajetória

Entidade única para experiência, formação e curso; substitui `Experiencia` e `Formacao` de
[`entity.md`](../diagrams/entity.md), que não tipam curso.

| Campo sugerido     | Tipo                                                         | Uso                                                                |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| `id`               | texto estável, igual nos três idiomas (sugestão: UUID v7)    | Chave do item, ids de `aria-labelledby`, referência a partir do CV |
| `kind`             | `"experience" \| "education" \| "course"`                    | Grupo e escolha entre responsabilidades e disciplinas              |
| `title`            | texto                                                        | Título do item e do modal                                          |
| `organization`     | texto                                                        | Linha de detalhes; JSON-LD `worksFor`/`alumniOf`                   |
| `details`          | texto[]                                                      | Linha de detalhes ("CLT", "6º semestre", "120 horas")              |
| `start`, `end?`    | `AAAA-MM`; `end` ausente = em curso; iguais nos três idiomas | Período, selo "Atual", ordenação                                   |
| `summary`          | texto, obrigatório                                           | Resumo do modal, JSON-LD `Occupation.description`                  |
| `responsibilities` | texto[] (experiência)                                        | Bloco do modal, CV                                                 |
| `disciplines`      | texto[] (formação e curso)                                   | Bloco do modal, CV                                                 |
| `technologies`     | string[] (nomes, sem tradução)                               | Bloco do modal, CV                                                 |
| `certificates`     | `{ id, name, issuer? }[]`                                    | Bloco do modal, coluna Certificados (D38), JSON-LD `hasCredential` |
| `projectIds`       | UUID v7[] de projetos (NF-DA-07)                             | Projetos relacionados; o título vem do projeto, nunca copiado      |

### Projeto

Só `id` e `title` do conteúdo de projetos que a #4 e a #5 já pedem. O `Link` (`titulo`/`url`) em
`projetos` de `Experiencia` e `Formacao` de `entity.md` sai: a referência é por id, porque o título
muda e a URL depende do idioma.

### Ligação com o CV (D30)

O CV não tem uma cópia própria de perfil, stack e trajetória. O "JSON do CV" de D30 é a composição
desses mesmos dados (perfil, stack e trajetória) mais o que só o CV mostra (por exemplo, idiomas
falados), que a #10 define. X gera PDF, Markdown e HTML lendo os mesmos JSONs da tela (NF-DA-04,
NF-IA-07), então mudar um item de trajetória muda tela, CV, `llms-full*.txt` e JSON-LD de uma vez.
Se o PO quiser um item só no site ou só no CV, a #10 prevê um campo de visibilidade por destino; a
tela mostra todo item que não for marcado como "só CV".

### Endpoints

Perfil, trajetória e projetos por idioma, com erro independente (a tela trata erro por fonte,
RF-ABOUT-26). Se a #10 juntar perfil e trajetória num documento só, os dois estados de erro viram
um.

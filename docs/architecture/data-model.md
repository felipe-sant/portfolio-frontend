# Modelo de dados

Este documento descreve as entidades de conteúdo do portfólio: cada campo, o tipo, o formato, se é
obrigatório, se é traduzido, a regra de validação e a decisão que o originou. Ele é a
**expectativa do frontend**: o backend ainda não existe, e o contrato oficial passará a viver no
repositório do backend quando ele existir. A partir daí, este documento passa a apontar para lá e
deixa de ser a fonte.

Na v1 não há backend (R1): os dados são o conteúdo real do PO, em JSON e Markdown locais em
`public/`, servidos por uma camada local que se comporta como o backend, com as mesmas respostas,
parâmetros e erros ([`api-contract.md`](api-contract.md), "Camada local na v1"). Página e
componente nunca leem esses arquivos: o acesso é sempre pelos endpoints do RTK Query (NF-DA-02).

Documentos relacionados:

- [`api-contract.md`](api-contract.md): endpoints, parâmetros, respostas, erros e idioma.
- [`../diagrams/entity.md`](../diagrams/entity.md): diagrama das entidades.
- [`../screens/`](../screens/): o que cada tela exibe ([`layout.md`](../screens/layout.md),
  [`home.md`](../screens/home.md), [`projects.md`](../screens/projects.md),
  [`project.md`](../screens/project.md), [`about.md`](../screens/about.md) e
  [`contact.md`](../screens/contact.md)).
- [`../design/decisions.md`](../design/decisions.md): as decisões citadas aqui (`Dnn`).

## Convenções

- **Identificadores em inglês**, em lowerCamelCase, como no código (`.claude/CLAUDE.md`). Os nomes
  do handoff, em português, estão em [Mapeamento do handoff](#mapeamento-do-handoff).
- **Id:** UUID v7 no formato canônico, em minúsculas e com hífens
  (`0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50`), gerado uma vez no cadastro e nunca regenerado
  (D32, NF-DA-07). Projetos, itens de trajetória e certificados têm id, igual nos três idiomas. Não
  existe `slug`.
- **Datas em ISO 8601:** `date`, `start` e `end` em `AAAA-MM` (mês e ano, `2024-06`);
  `updatedAt` em `AAAA-MM-DD`. `end` ausente significa em curso (D39); a tela formata o período.
- **Enum é código, nunca rótulo:** o conteúdo e a API guardam o código em inglês (`web`,
  `inDevelopment`), e a tela mostra o rótulo por chave de tradução ([Enums](#enums)). Valor novo de
  enum exige decisão do PO e chave nova nos três idiomas.
- **Opcional é ausente:** campo opcional sem valor não aparece no objeto; nunca `null` nem string
  vazia. Lista sem itens é `[]`, nunca ausente.
- **Ordem do conteúdo:** a ordem dos itens de uma lista no conteúdo é significativa e preservada na
  resposta, salvo onde a API ordena ([O que a API calcula e o que a tela calcula](#o-que-a-api-calcula-e-o-que-a-tela-calcula)).
- **Imagens:** `ImageAsset { src, width, height }`. `src` é um caminho relativo à raiz do site, sem
  barra inicial (`images/projects/<id>/1-large.webp`), que o cliente resolve com
  `import.meta.env.BASE_URL` (NF-DA-03), ou uma URL `https:` absoluta, quando o backend servir de
  outra origem. Imagem responsiva é `ResponsiveImage { large, small }`.
- **URLs externas** (`demoUrl`, `repositoryUrl`, redes) são `https:` absolutas.
- **Texto sem HTML:** todo texto de conteúdo é texto puro; o único conteúdo com marcação são os
  documentos do projeto, em Markdown GFM (D50).

## Tradução do conteúdo

### Estratégia

O conteúdo dinâmico (projetos, trajetória, perfil, documentos) existe em `pt-BR`, `en` e `es`
(NF-IN-02), e a tela carrega só o idioma ativo (NF-DA-05). Três formas foram consideradas:

| Opção                                                                                                                         | Prós                                                                                                                                                                        | Contras                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Campo por idioma na resposta (`title: { "pt-BR": "...", "en": "...", "es": "..." }`)                                       | Um arquivo por entidade; tradução faltando fica visível no próprio objeto                                                                                                   | Cada tela baixa os três idiomas, contra NF-DA-05; tipos mais pesados em toda tela; markdown não cabe                                                            |
| B. Resposta conforme o header `Accept-Language`                                                                               | O cliente HTTP e o `prepareHeaders` do RTK Query já enviam o header; URL igual nos três idiomas                                                                             | O GitHub Pages da v1 não negocia conteúdo por header; cache e CDN precisam de `Vary: Accept-Language`; a URL não diz o idioma, o que atrapalha pré-renderização |
| **C. Idioma explícito no pedido, parâmetro obrigatório `lang` (`GET /projects?lang=en`), com `Content-Language` na resposta** | Uma resposta por idioma (NF-DA-05); a URL diz o idioma, como a da página (D31); cache por URL sem `Vary`; a pré-renderização (#49) e o build (#51) pedem cada idioma direto | Um parâmetro a mais em toda leitura                                                                                                                             |

**Escolhida: C**, pelo PO (11-10-2026). Motivo: é a única das três que serve só o idioma ativo,
funciona com arquivos estáticos no GitHub Pages e deixa o idioma visível na URL, que é a mesma
regra das páginas (D31).

Regras que acompanham a escolha:

- **`lang` decide o conteúdo; `Accept-Language` decide a mensagem de erro.** O cliente continua
  enviando `Accept-Language` em toda requisição (convenção do `.claude/CLAUDE.md`), mas ele só
  escolhe o idioma da mensagem de erro da API. Os dois vêm de `getLanguage()`.
- **Sem fallback de idioma em runtime.** Conteúdo incompleto é barrado antes, pelo teste de
  conteúdo da #13 (RF-PROJECT-20); a tela não cai para outro idioma. Na API, `lang` ausente ou fora
  de `pt-BR`, `en` e `es` responde `400 UNSUPPORTED_LANGUAGE`.
- **Busca e ordenação por título** usam o texto e as regras do idioma pedido (RF-PROJECTS-03,
  RF-PROJECTS-09).
- **Documento Markdown:** um arquivo por documento e idioma (D33).
- **Enum nunca é rótulo:** o rótulo vem de chave (`common:projectType.*`,
  `common:projectCategory.*`, `common:projectStatus.*`, `common:stackCategory.*`).
- **Autoria:** o PO escreve em `pt-BR` (#58); `en` e `es` são traduzidos no projeto (#59).

### Campos neutros e por idioma

**Neutros** (o mesmo valor nos três idiomas, NF-IN-02, RF-PROJECT-13): ids (`id`, `projectIds`,
id de `related` e de certificado), enums (`kind`, `types`, `category`, `status`,
`StackGroup.category`, `documents`), datas (`date`, `start`, `end`, `updatedAt`), booleanos
(`featured`, `availability.isAvailable`, `isPrimary`, `isProgrammingLanguage`), nomes de tecnologia
(`StackItem.name`, `technologies`, `cardTechnologies`), URLs e e-mail (`demoUrl`, `repositoryUrl`,
`links.github`, `links.linkedin`, `contact.email`), `location.countryCode` e as imagens (`src`,
`width`, `height`). A ordem das listas também é a mesma nos três idiomas.

**Por idioma** (um valor em cada idioma, escrito em `pt-BR` e traduzido): `title`, `summary`,
`role`, `duration`, `team`, `alt`, `caption`, `reason` (projeto); `role`, `homeIntro`, `summary`,
`availability.label`, `location.city`, `location.region`, `location.detail`,
`responseTime.label`, `responseTime.detail`, `aboutParagraphs`, `workPrinciples` (perfil);
`title`, `organization`, `stage`, `details`, `summary`, `responsibilities`, `disciplines`,
`Certificate.name`, `Certificate.issuer` (trajetória); e os documentos Markdown.

## Decisões do contrato

### Identificador do projeto: UUID v7, sem slug

O projeto tem `id` UUID v7, gerado uma vez no cadastro e nunca regenerado; não existe `slug`. O
detalhe é `GET /projects/{id}`. O handoff e o corpo da #10 ("detalhe por slug") são anteriores a
D32 e foram substituídos. Motivo: o PO renomeia projetos com frequência, e um id derivado do título
quebraria os links publicados na v1 (D32, NF-DA-07, NF-IN-13). Itens de trajetória e certificados
também têm `id` UUID v7 estável, igual nos três idiomas, usado como chave de lista, em
`aria-labelledby` e na deduplicação de certificados (D38).

### Tradução por `lang`

Ver [Tradução do conteúdo](#tradução-do-conteúdo).

### Lista de projetos pela API (D51, D53)

Busca, filtros de tipo e categoria, ordenação e paginação são aplicados pela API em
`GET /projects`, não pela tela; a resposta é uma página (`ProjectPage`) com `total` e
`availableTypes`. Os destaques do Início vêm do mesmo endpoint, com
`featured=true&sort=recent&limit=4`, e o desempate entre destaques do mesmo mês é por título A–Z e
depois `id` (D53, que substitui D43 só nesse ponto). Os relacionados do projeto vêm expandidos em
`GET /projects/{id}`. Motivo (PO, 11-10-2026): a regra fica num lugar só, igual para a camada
local e para o backend, e a tela não precisa baixar a lista inteira. Regras completas em
[`api-contract.md`](api-contract.md#get-projects).

### Trajetória agrupada e ordenada pela API (D54)

`GET /timeline` devolve os três grupos já ordenados e a lista de certificados sem repetição;
`GET /timeline?current=true` devolve os itens em curso do Início. A tela só formata o período e
escolhe o que destacar em cada item. Motivo (PO, 11-10-2026): ordem, agrupamento e escolha dos
itens atuais são regras de dado, não de apresentação. Regras completas em
[`api-contract.md`](api-contract.md#get-timeline).

### Camada local da v1 simula o backend

Na v1 os registros ficam em `public/content/<lang>/`, na forma das entidades deste documento, e uma
camada local monta as respostas exatamente como o backend montaria, com os mesmos parâmetros e
erros. A troca pela API (#43) é só a troca da origem. Detalhes em
[`api-contract.md`](api-contract.md#camada-local-na-v1).

### Destaque do item de trajetória por `kind`

O contrato é semântico: `title` é sempre o cargo (experiência) ou o curso (formação e curso), e
`organization` é a empresa ou a instituição. A **tela** escolhe o que destacar pelo `kind`:

| `kind`       | Em destaque                         | Linha de detalhes, nesta ordem                     |
| ------------ | ----------------------------------- | -------------------------------------------------- |
| `experience` | `title` (cargo)                     | `organization`, `details`                          |
| `education`  | `organization` (instituição, Fatec) | `title` (curso), `stage`, `details`                |
| `course`     | `title` (curso)                     | `organization` (quando houver), `stage`, `details` |

`organization` é obrigatória em `experience` e `education` e opcional em `course` (curso online
sem instituição). Motivo: nenhum texto duplicado, o JSON-LD continua com `worksFor` e `alumniOf`
pela `organization` ([`about.md`](../screens/about.md)) e a formação fica como no protótipo e no
handoff, com a instituição em destaque (PO, 11-10-2026). Descartado: um `title` livre com o
texto do destaque, que repetiria a instituição em `title` e em `organization`.

### Ajustes de forma em relação aos pedidos das telas

- **Etapa:** `stage` próprio ("6º semestre"), fora de `details`, porque o card "Cursando" do Início
  mostra a etapa (RF-HOME-10) e `details` pode ter outros itens ("120 horas").
- **Dois textos de apresentação:** `homeIntro` (parágrafo do hero do Início, RF-HOME-05) e
  `summary` (apresentação de Informações e `description` do JSON-LD).
- **Linguagens de programação do projeto:** marcação `isProgrammingLanguage` no item de stack, em
  vez de lista paralela, para não repetir nomes (opção prevista em `project.md`).
- **Item principal da stack do site:** marcação `isPrimary` no item (RF-HOME-13).
- **Localização:** `{ city, region, countryCode, detail? }`; a linha principal é montada na tela
  como `city · region` (`common:symbols.separator`), `countryCode` é ISO 3166-1 alfa-2 (`BR`) para o
  JSON-LD e `detail` é o texto traduzido ("Remoto ou híbrido na região", RF-CONTACT-05).
- **Links de projeto:** `demoUrl?` e `repositoryUrl?` em vez de uma lista `links`, porque a tela tem
  exatamente esses dois botões (RF-PROJECT-14).
- **Tecnologias e certificados em todo item de trajetória:** o handoff só tipa tecnologias em
  experiência e certificados em formação; o modelo aceita os dois em qualquer `kind`, porque o modal
  já tem os dois blocos para qualquer item (RF-ABOUT-18).
- **Nome do autor:** continua chave (`common:authorName`, [`layout.md`](../screens/layout.md)), não
  campo do perfil; o JSON-LD lê a mesma chave.

### O CV fica fora do modelo (D52)

O CV não é composto destas entidades: é um arquivo próprio por idioma, escrito pelo PO em Markdown
(`cv/cv-<idioma>.md`), com o PDF (`cv/cv-<idioma>.pdf`) gerado dele no build (D14, D52). Por isso
o modelo não tem entidade de CV, lista de idiomas falados nem campo de visibilidade por destino, e
nenhum endpoint serve o CV.

## Entidades

Cada tabela diz o campo, o tipo, se é obrigatório, se tem um valor por idioma, a regra e a fonte
(decisão ou requisito). A nota de cada entidade diz o que é **guardado no conteúdo** (o registro
em `public/content/<lang>/` na v1, a tabela no backend depois) e o que é **montado na resposta**
pela API, ou pela camada local na v1, a partir dos registros. Tipo `T[]` é lista; `string` sem
formato é texto puro.

### `Profile`

O perfil do autor, um por idioma. Resposta de `GET /profile`. Guardado no conteúdo como está;
nada é montado.

| Campo             | Tipo              | Obrigatório | Por idioma | Regra                                                                                          | Fonte                                       |
| ----------------- | ----------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `role`            | `string`          | Sim         | Sim        | Cargo, texto curto                                                                             | `about.md` (JSON-LD `jobTitle` de `/about`) |
| `homeIntro`       | `string`          | Sim         | Sim        | Parágrafo do hero do Início, até cerca de 300 caracteres                                       | RF-HOME-05                                  |
| `summary`         | `string`          | Sim         | Sim        | Parágrafo de apresentação de Informações; também `description` do JSON-LD                      | RF-ABOUT-04                                 |
| `location`        | `Location`        | Sim         | Em parte   | Ver [`Location`](#location)                                                                    | RF-ABOUT-03, RF-CONTACT-05, RF-LAY-21       |
| `availability`    | `Availability`    | Sim         | Em parte   | Ver [`Availability`](#availability)                                                            | D44                                         |
| `photo`           | `ResponsiveImage` | Não         | Não        | Foto 1:1; ausente até a #42 entregar (D26). O `alt` é chave (`about:hero.photoAlt`), não campo | D26, RF-ABOUT-02                            |
| `aboutParagraphs` | `string[]`        | Sim         | Sim        | Parágrafos de "Sobre mim", pelo menos um, na ordem do conteúdo                                 | RF-ABOUT-07                                 |
| `workPrinciples`  | `string[]`        | Sim         | Sim        | Frases curtas de "Como eu trabalho", na ordem do conteúdo; pode ser `[]` (a coluna some)       | RF-ABOUT-12                                 |
| `stack`           | `StackGroup[]`    | Sim         | Não        | Stack do site; ver [`StackGroup`](#stackgroup). Pode ser `[]` (a faixa e a seção somem)        | RF-HOME-13, RF-ABOUT-08                     |
| `contact`         | `ContactChannels` | Sim         | Em parte   | Ver [`ContactChannels`](#contactchannels)                                                      | RF-CONTACT-04 a RF-CONTACT-07               |
| `links`           | `SocialLinks`     | Sim         | Não        | Ver [`SocialLinks`](#sociallinks)                                                              | RF-LAY-24, RF-LAY-26                        |

Não há campo de idiomas falados, de montagem do CV nem de visibilidade por destino: o CV é um
arquivo próprio (D52). O status atual do Início não é campo do perfil: vem de
`GET /timeline?current=true` (D54).

### `Availability`

| Campo         | Tipo      | Obrigatório | Por idioma | Regra                                                                                  | Fonte |
| ------------- | --------- | ----------- | ---------- | -------------------------------------------------------------------------------------- | ----- |
| `isAvailable` | `boolean` | Sim         | Não        | `false` esconde o selo em todas as telas e o rodapé; não existe selo de "indisponível" | D44   |
| `label`       | `string`  | Sim         | Sim        | Frase livre do PO ("Disponível a partir de 01/2027"), nunca chave de tradução          | D44   |

### `Location`

| Campo         | Tipo     | Obrigatório | Por idioma | Regra                                                                              | Fonte                        |
| ------------- | -------- | ----------- | ---------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| `city`        | `string` | Sim         | Sim        | "São José dos Campos"; a linha principal é `city · region`, montada na tela        | RF-CONTACT-05                |
| `region`      | `string` | Sim         | Sim        | Sigla ou nome da região ("SP")                                                     | RF-CONTACT-05                |
| `countryCode` | `string` | Sim         | Não        | ISO 3166-1 alfa-2 em maiúsculas (`BR`); `addressCountry` do JSON-LD; não é exibido | `about.md` (JSON-LD)         |
| `detail`      | `string` | Não         | Sim        | Linha de detalhe de Contato ("Remoto ou híbrido na região"); ausente, a linha some | RF-CONTACT-05, RF-CONTACT-07 |

### `ContactChannels`

| Campo          | Tipo           | Obrigatório | Por idioma | Regra                                                                                     | Fonte                    |
| -------------- | -------------- | ----------- | ---------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| `email`        | `string`       | Sim         | Não        | E-mail válido, até 254 caracteres; usado no rodapé, em Contato, no `mailto:` e no JSON-LD | RF-CONTACT-04, RF-LAY-23 |
| `responseTime` | `ResponseTime` | Não         | Em parte   | Bloco "Resposta" de Contato; ausente, o bloco some                                        | RF-CONTACT-06            |

### `ResponseTime`

| Campo    | Tipo     | Obrigatório | Por idioma | Regra                                                  | Fonte         |
| -------- | -------- | ----------- | ---------- | ------------------------------------------------------ | ------------- |
| `label`  | `string` | Sim         | Sim        | Linha principal ("Em até 1 dia útil")                  | RF-CONTACT-06 |
| `detail` | `string` | Não         | Sim        | Linha de detalhe ("Fuso GMT-3"); ausente, a linha some | RF-CONTACT-06 |

### `SocialLinks`

| Campo      | Tipo     | Obrigatório | Por idioma | Regra                                                                     | Fonte               |
| ---------- | -------- | ----------- | ---------- | ------------------------------------------------------------------------- | ------------------- |
| `github`   | `string` | Não         | Não        | URL `https://github.com/...`; ausente, o ícone e o item de `sameAs` somem | RF-LAY-24, NF-IA-08 |
| `linkedin` | `string` | Não         | Não        | URL `https://www.linkedin.com/in/...`; ausente, idem                      | RF-LAY-24, NF-IA-08 |

### `StackGroup`

Usado na stack do site (`Profile.stack`) e na do projeto (`ProjectDetail.stack`).

| Campo      | Tipo            | Obrigatório | Por idioma | Regra                                                                                                         | Fonte                                  |
| ---------- | --------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `category` | `StackCategory` | Sim         | Não        | Cada categoria aparece no máximo uma vez, e os grupos vêm na ordem do enum (`frontend`, `backend`, `tooling`) | RF-HOME-13, RF-ABOUT-08, RF-PROJECT-13 |
| `items`    | `StackItem[]`   | Sim         | Não        | Pelo menos um item, sem nome repetido no grupo, na ordem de exibição                                          | RF-ABOUT-08                            |

### `StackItem`

| Campo                   | Tipo      | Obrigatório | Por idioma | Regra                                                                                          | Fonte                   |
| ----------------------- | --------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| `name`                  | `string`  | Sim         | Não        | Nome oficial da tecnologia ("TypeScript"), sem tradução                                        | NF-IN-02, RF-PROJECT-13 |
| `isPrimary`             | `boolean` | Não         | Não        | Só na stack do site; no máximo um item marcado; ausente é falso                                | RF-HOME-13              |
| `isProgrammingLanguage` | `boolean` | Não         | Não        | Só na stack do projeto; marca o que entra em `programmingLanguage` do JSON-LD; ausente é falso | `project.md` (JSON-LD)  |

### `TimelineItem`

Um item de trajetória: experiência, formação ou curso. Guardado no conteúdo com `projectIds`; na
resposta, `projectIds` é trocado por `projects` (montado).

| Campo              | Tipo                   | Obrigatório                   | Por idioma | Regra                                                                                                                                | Fonte                           |
| ------------------ | ---------------------- | ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `id`               | `string`               | Sim                           | Não        | UUID v7, único entre os itens de trajetória                                                                                          | D32, `about.md`                 |
| `kind`             | `TimelineKind`         | Sim                           | Não        | `experience`, `education` ou `course`                                                                                                | RF-ABOUT-13                     |
| `title`            | `string`               | Sim                           | Sim        | Cargo (experiência) ou curso (formação e curso); o destaque depende do `kind` ([Destaque](#destaque-do-item-de-trajetória-por-kind)) | PO, `about.md`                  |
| `organization`     | `string`               | Em `experience` e `education` | Sim        | Empresa ou instituição; opcional em `course`                                                                                         | RF-HOME-09, RF-HOME-10, JSON-LD |
| `stage`            | `string`               | Não                           | Sim        | Etapa em curso ("6º semestre"); só em `education` e `course`                                                                         | RF-HOME-10                      |
| `details`          | `string[]`             | Sim                           | Sim        | Outros detalhes da linha de detalhes ("CLT", "120 horas"); pode ser `[]`                                                             | RF-ABOUT-15                     |
| `start`            | `string`               | Sim                           | Não        | `AAAA-MM`                                                                                                                            | RF-ABOUT-16, D39                |
| `end`              | `string`               | Não                           | Não        | `AAAA-MM`, não anterior a `start`; ausente = em curso                                                                                | D39, RF-HOME-11                 |
| `summary`          | `string`               | Sim                           | Sim        | Resumo do modal; `Occupation.description` do JSON-LD                                                                                 | RF-ABOUT-18                     |
| `responsibilities` | `string[]`             | Sim                           | Sim        | Só com itens em `experience`; `[]` nos outros `kind`                                                                                 | RF-ABOUT-18                     |
| `disciplines`      | `string[]`             | Sim                           | Sim        | Só com itens em `education` e `course`; `[]` em `experience`                                                                         | RF-ABOUT-18                     |
| `technologies`     | `string[]`             | Sim                           | Não        | Nomes de tecnologia, em qualquer `kind`; pode ser `[]`                                                                               | RF-ABOUT-18                     |
| `certificates`     | `Certificate[]`        | Sim                           | Em parte   | Em qualquer `kind`; pode ser `[]`                                                                                                    | D38                             |
| `projectIds`       | `string[]`             | Sim, só no conteúdo           | Não        | Ids de projetos existentes, sem repetição; pode ser `[]`. Não sai na resposta                                                        | RF-ABOUT-19, NF-DA-04           |
| `projects`         | `TimelineProjectRef[]` | Sim, só na resposta           | Em parte   | Montado de `projectIds`, na mesma ordem, com o título do projeto no `lang` pedido; nunca copiado no conteúdo                         | RF-ABOUT-19, D54                |

### `Certificate`

| Campo    | Tipo     | Obrigatório | Por idioma | Regra                                                                                                                                               | Fonte       |
| -------- | -------- | ----------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `id`     | `string` | Sim         | Não        | UUID v7; o mesmo certificado em dois itens repete o mesmo `id` (e o mesmo `name` e `issuer`), e a lista de `Timeline.certificates` o mostra uma vez | D38         |
| `name`   | `string` | Sim         | Sim        | Nome do certificado, o mesmo na faixa "Certificados", no modal e no CV                                                                              | D38         |
| `issuer` | `string` | Não         | Sim        | Emissor; o chip mostra `name · issuer`                                                                                                              | RF-ABOUT-11 |

### `TimelineProjectRef`

Montado na resposta; não existe no conteúdo.

| Campo   | Tipo     | Obrigatório | Por idioma | Regra                                              | Fonte       |
| ------- | -------- | ----------- | ---------- | -------------------------------------------------- | ----------- |
| `id`    | `string` | Sim         | Não        | Id do projeto, vindo de `projectIds`               | RF-ABOUT-19 |
| `title` | `string` | Sim         | Sim        | `ProjectSummary.title` do projeto no `lang` pedido | RF-ABOUT-19 |

### `ImageAsset`

| Campo    | Tipo     | Obrigatório | Por idioma | Regra                                                                                        | Fonte              |
| -------- | -------- | ----------- | ---------- | -------------------------------------------------------------------------------------------- | ------------------ |
| `src`    | `string` | Sim         | Não        | Caminho relativo à raiz do site, sem barra inicial, ou URL `https:`; AVIF ou WebP            | NF-DA-03, NF-DE-13 |
| `width`  | `number` | Sim         | Não        | Inteiro positivo, em pixels                                                                  | NF-DE-16           |
| `height` | `number` | Sim         | Não        | Inteiro positivo, em pixels; `width`/`height` dão a proporção (16:9 em projeto, 1:1 na foto) | NF-DE-16, D26      |

### `ResponsiveImage`

| Campo   | Tipo         | Obrigatório | Por idioma | Regra                                                                              | Fonte                   |
| ------- | ------------ | ----------- | ---------- | ---------------------------------------------------------------------------------- | ----------------------- |
| `large` | `ImageAsset` | Sim         | Não        | Variante grande: até 1600px de largura e 200 KB; usada na lightbox e no `og:image` | NF-DE-13, RF-PROJECT-07 |
| `small` | `ImageAsset` | Sim         | Não        | Variante pequena: até 80 KB; usada em card, miniatura e foto                       | NF-DE-14                |

As duas variantes têm a mesma proporção.

### `ProjectImage`

Uma captura do projeto: `ResponsiveImage` mais texto.

| Campo     | Tipo         | Obrigatório | Por idioma | Regra                                                                                       | Fonte             |
| --------- | ------------ | ----------- | ---------- | ------------------------------------------------------------------------------------------- | ----------------- |
| `large`   | `ImageAsset` | Sim         | Não        | 16:9                                                                                        | D48               |
| `small`   | `ImageAsset` | Sim         | Não        | 16:9                                                                                        | D48               |
| `alt`     | `string`     | Sim         | Sim        | Até cerca de 150 caracteres, sem "imagem de" e sem repetir a legenda; também `og:image:alt` | D48, `project.md` |
| `caption` | `string`     | Não         | Sim        | Legenda curta da galeria e da lightbox                                                      | RF-PROJECT-04     |

### `ProjectSummary`

O projeto como aparece em listas (Projetos, destaques do Início, relacionados). Resposta de
`GET /projects` (dentro de `ProjectPage`) e parte de `RelatedProject`. É uma projeção de
`ProjectDetail`: `technologies` e `cover` são montados a partir de `stack` e de `images`, e os
outros campos são os mesmos.

| Campo              | Tipo              | Obrigatório | Por idioma | Regra                                                                                                                  | Fonte                         |
| ------------------ | ----------------- | ----------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `id`               | `string`          | Sim         | Não        | UUID v7, único entre os projetos; rota `/projects/:id`                                                                 | D32, NF-DA-07                 |
| `title`            | `string`          | Sim         | Sim        | Texto curto; `h1`, card, busca, ordenação A–Z, JSON-LD                                                                 | RF-PROJECTS-14, RF-PROJECT-02 |
| `summary`          | `string`          | Sim         | Sim        | Uma ou duas frases, até cerca de 160 caracteres; também a descrição da página do projeto                               | RF-PROJECTS-14, `project.md`  |
| `date`             | `string`          | Sim         | Não        | `AAAA-MM`; a tela mostra o ano e as listas ordenam por ela                                                             | `projects.md`, D43            |
| `types`            | `ProjectType[]`   | Sim         | Não        | Pelo menos um código, sem repetição, na ordem do conteúdo; não existe `fullstack` (web com backend é `["web", "api"]`) | RF-PROJECTS-05                |
| `category`         | `ProjectCategory` | Sim         | Não        | Um valor                                                                                                               | RF-PROJECTS-06                |
| `featured`         | `boolean`         | Sim         | Não        | Marcação de destaque; no máximo quatro projetos com `true` (D43)                                                       | D43, RF-PROJECTS-16           |
| `technologies`     | `string[]`        | Sim         | Não        | Montado: os `name` de `stack`, achatados na ordem dos grupos e dos itens; usado na busca                               | RF-PROJECTS-03                |
| `cardTechnologies` | `string[]`        | Sim         | Não        | De um a três nomes, todos contidos em `technologies`, na ordem de exibição dos chips                                   | RF-PROJECTS-14, RF-HOME-18    |
| `cover`            | `ResponsiveImage` | Não         | Não        | Montado: `large` e `small` de `images[0]`, sem `alt` (o card usa `alt=""`); ausente quando `images` é `[]`             | D26, RF-PROJECTS-14           |

### `ProjectDetail`

O projeto inteiro. Resposta de `GET /projects/{id}`. Tem todos os campos de `ProjectSummary`, com
as mesmas regras, mais os abaixo. Guardado no conteúdo com `related` na forma `{ id, reason }`; na
resposta, `related` é expandido (montado), e `technologies` e `cover` são montados.

| Campo           | Tipo                | Obrigatório | Por idioma       | Regra                                                                                                                                                       | Fonte                             |
| --------------- | ------------------- | ----------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `role`          | `string`            | Sim         | Sim              | Papel do autor no projeto ("Full stack"); ficha técnica                                                                                                     | RF-PROJECT-11                     |
| `duration`      | `string`            | Sim         | Sim              | Duração em texto ("4 meses")                                                                                                                                | RF-PROJECT-11                     |
| `team`          | `string`            | Sim         | Sim              | Time em texto ("Sozinho", "3 pessoas")                                                                                                                      | RF-PROJECT-11                     |
| `status`        | `ProjectStatus`     | Sim         | Não              | `inDevelopment`, `completed` ou `discontinued`                                                                                                              | D49, RF-PROJECT-12                |
| `stack`         | `StackGroup[]`      | Sim         | Não              | Pelo menos um grupo com pelo menos um item; `technologies` sai daqui                                                                                        | RF-PROJECT-13                     |
| `demoUrl`       | `string`            | Não         | Não              | URL `https:` absoluta; ausente, "Ver projeto ao vivo" não aparece                                                                                           | RF-PROJECT-14                     |
| `repositoryUrl` | `string`            | Não         | Não              | URL `https://github.com/...` pública; ausente, "Ver código no GitHub" não aparece e o JSON-LD é `CreativeWork`                                              | RF-PROJECT-14, `project.md`       |
| `images`        | `ProjectImage[]`    | Sim         | Em parte         | De zero a cinco, ordenadas, todas 16:9; a primeira é a capa (`cover`) e a imagem principal                                                                  | D48, RF-PROJECT-05                |
| `documents`     | `ProjectDocument[]` | Sim         | Não (o conjunto) | Contém `readme`; sem repetição, na ordem do enum; o mesmo conjunto nos três idiomas. O conteúdo de cada um vem de `GET /projects/{id}/documents/{document}` | D33, RF-PROJECT-15, RF-PROJECT-20 |
| `related`       | `RelatedProject[]`  | Sim         | Em parte         | Até três, na ordem do conteúdo, cada um com id de outro projeto existente, sem repetição; pode ser `[]` (a seção some). No conteúdo, `{ id, reason }`       | RF-PROJECT-28                     |
| `updatedAt`     | `string`            | Não         | Não              | `AAAA-MM-DD`; `dateModified` do JSON-LD e `lastmod` do `sitemap.xml`                                                                                        | NF-IA-15, `project.md`            |

### `RelatedProject`

| Campo     | Tipo             | Obrigatório | Por idioma | Regra                                                                                | Fonte         |
| --------- | ---------------- | ----------- | ---------- | ------------------------------------------------------------------------------------ | ------------- |
| `reason`  | `string`         | Sim         | Sim        | Motivo da relação ("Mesma stack"), em caixa normal (a caixa alta é por CSS)          | RF-PROJECT-28 |
| `project` | `ProjectSummary` | Sim         | Em parte   | Montado na resposta a partir do `id` guardado; no conteúdo, o par é `{ id, reason }` | D51           |

### `ProjectPage`

Montado na resposta de `GET /projects`; não existe no conteúdo.

| Campo            | Tipo               | Obrigatório | Por idioma | Regra                                                                                                                         | Fonte               |
| ---------------- | ------------------ | ----------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `items`          | `ProjectSummary[]` | Sim         | Em parte   | A página pedida, depois de busca, filtros e ordenação; `[]` sem resultado ou com `offset` além do fim                         | D51                 |
| `total`          | `number`           | Sim         | Não        | Quantos projetos casam busca e filtros, sem contar a paginação                                                                | RF-PROJECTS-10      |
| `offset`         | `number`           | Sim         | Não        | O `offset` aplicado                                                                                                           | D51                 |
| `limit`          | `number`           | Sim         | Não        | O `limit` aplicado                                                                                                            | D51                 |
| `availableTypes` | `ProjectType[]`    | Sim         | Não        | Tipos presentes em pelo menos um projeto publicado do idioma, na ordem do enum, **sem** aplicar busca, filtros nem `featured` | RF-PROJECTS-05, D51 |

### `TimelineGroup`

Montado na resposta de `GET /timeline`.

| Campo   | Tipo             | Obrigatório | Por idioma | Regra                                                                   | Fonte            |
| ------- | ---------------- | ----------- | ---------- | ----------------------------------------------------------------------- | ---------------- |
| `kind`  | `TimelineKind`   | Sim         | Não        | O grupo                                                                 | RF-ABOUT-13      |
| `items` | `TimelineItem[]` | Sim         | Em parte   | Os itens desse `kind`, na ordem de RF-ABOUT-14; `[]` quando não há item | RF-ABOUT-14, D54 |

### `Timeline`

Resposta de `GET /timeline`.

| Campo          | Tipo              | Obrigatório | Por idioma | Regra                                                                                                                          | Fonte                 |
| -------------- | ----------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `groups`       | `TimelineGroup[]` | Sim         | Em parte   | Sempre três grupos, nesta ordem: `experience`, `education`, `course`                                                           | RF-ABOUT-13, D54      |
| `certificates` | `Certificate[]`   | Sim         | Em parte   | Todos os certificados dos itens, na ordem dos grupos e dos itens de `groups` e na ordem de cada item, sem repetir o mesmo `id` | D38, RF-ABOUT-11, D54 |

### `CurrentTimeline`

Resposta de `GET /timeline?current=true`.

| Campo   | Tipo             | Obrigatório | Por idioma | Regra                                                                                                                                                                    | Fonte           |
| ------- | ---------------- | ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| `items` | `TimelineItem[]` | Sim         | Em parte   | Até dois itens em curso: primeiro a experiência em curso de início mais recente, depois a formação ou o curso em curso de início mais recente; `[]` se não houver nenhum | RF-HOME-11, D54 |

### `ContactMessage`

Corpo de `POST /contact-messages` (#44). Não é guardado no conteúdo; na v1 o envio é simulado
(D05, RF-CONTACT-22). As regras são as de [`contact.md`](../screens/contact.md) ("Formulário
(backend futuro, #44)"), e o backend as valida de novo.

| Campo      | Tipo                | Obrigatório | Por idioma | Regra                                                                                 | Fonte                     |
| ---------- | ------------------- | ----------- | ---------- | ------------------------------------------------------------------------------------- | ------------------------- |
| `name`     | `string`            | Sim         | —          | De 1 a 100 caracteres depois de `trim`                                                | RF-CONTACT-13, D42        |
| `email`    | `string`            | Sim         | —          | Até 254 caracteres; casa com `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` depois de `trim`       | `contact.md` (Validações) |
| `subject`  | `ContactSubject`    | Sim         | —          | `newProject`, `freelance`, `job` ou `other`                                           | RF-CONTACT-14             |
| `message`  | `string`            | Sim         | —          | De 20 (depois de `trim`) a 600 caracteres                                             | RF-CONTACT-15             |
| `language` | `SupportedLanguage` | Sim         | —          | Idioma da página, para a resposta ao visitante sair no idioma certo                   | `contact.md`              |
| `website`  | `string`            | Sim         | —          | Campo-isca, sempre `""`; preenchido, o backend responde sucesso e descarta a mensagem | RF-CONTACT-24             |

## Enums

Os rótulos vêm de chave de tradução; a coluna "Chave do rótulo" diz qual, quando a tela mostra o
valor. Ordem dos códigos = ordem de exibição.

### `ProjectType`

Doze códigos, nesta ordem (RF-PROJECTS-05). Não existe `fullstack`: projeto web com backend é
`["web", "api"]`.

| Código      | Rótulo `pt-BR`  | Chave do rótulo                |
| ----------- | --------------- | ------------------------------ |
| `web`       | Web             | `common:projectType.web`       |
| `mobile`    | Mobile          | `common:projectType.mobile`    |
| `api`       | API             | `common:projectType.api`       |
| `desktop`   | Desktop         | `common:projectType.desktop`   |
| `cli`       | CLI             | `common:projectType.cli`       |
| `library`   | Biblioteca      | `common:projectType.library`   |
| `extension` | Extensão        | `common:projectType.extension` |
| `bot`       | Bot / automação | `common:projectType.bot`       |
| `data`      | Dados / IA      | `common:projectType.data`      |
| `game`      | Jogo            | `common:projectType.game`      |
| `iot`       | IoT / embarcado | `common:projectType.iot`       |
| `infra`     | Infraestrutura  | `common:projectType.infra`     |

### `ProjectCategory`

| Código         | Rótulo `pt-BR` | Chave do rótulo                                                                            |
| -------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `academic`     | Acadêmico      | `common:projectCategory.academic` (filtro no plural: `projects:filters.category.academic`) |
| `personal`     | Pessoal        | `common:projectCategory.personal` (filtro: `projects:filters.category.personal`)           |
| `professional` | Profissional   | `common:projectCategory.professional` (filtro: `projects:filters.category.professional`)   |

### `ProjectStatus`

Três valores (D49). "Em produção" não existe.

| Código          | Rótulo `pt-BR`     | Chave do rótulo                      |
| --------------- | ------------------ | ------------------------------------ |
| `inDevelopment` | Em desenvolvimento | `common:projectStatus.inDevelopment` |
| `completed`     | Concluído          | `common:projectStatus.completed`     |
| `discontinued`  | Descontinuado      | `common:projectStatus.discontinued`  |

### `StackCategory`

| Código     | Rótulo `pt-BR`      | Chave do rótulo                 |
| ---------- | ------------------- | ------------------------------- |
| `frontend` | Frontend            | `common:stackCategory.frontend` |
| `backend`  | Backend             | `common:stackCategory.backend`  |
| `tooling`  | Infra e ferramentas | `common:stackCategory.tooling`  |

### `TimelineKind`

| Código       | Rótulo do grupo `pt-BR`    | Chave do rótulo                      |
| ------------ | -------------------------- | ------------------------------------ |
| `experience` | Experiências profissionais | `about:trajectory.groups.experience` |
| `education`  | Formações                  | `about:trajectory.groups.education`  |
| `course`     | Cursos                     | `about:trajectory.groups.course`     |

### `ProjectDocument`

Os quatro documentos de D33, nesta ordem. Rótulo fixo em inglês, igual nos três idiomas.

| Código         | Rótulo (`project:documents.*`) | Caminho da tela              | Obrigatório |
| -------------- | ------------------------------ | ---------------------------- | ----------- |
| `readme`       | `README.md`                    | `/projects/:id`              | Sim         |
| `architecture` | `ARCHITECTURE.md`              | `/projects/:id/architecture` | Não         |
| `setup`        | `SETUP.md`                     | `/projects/:id/setup`        | Não         |
| `changelog`    | `CHANGELOG.md`                 | `/projects/:id/changelog`    | Não         |

### `ProjectSort`

| Código   | Rótulo `pt-BR` | Chave do rótulo        | Regra                                                                      |
| -------- | -------------- | ---------------------- | -------------------------------------------------------------------------- |
| `recent` | Mais recente   | `projects:sort.recent` | Padrão. `date` decrescente; empate por título A–Z; por fim, `id` crescente |
| `oldest` | Mais antigo    | `projects:sort.oldest` | `date` crescente; empate por título A–Z; por fim, `id` crescente           |
| `title`  | A–Z            | `projects:sort.title`  | Título A–Z; empate por `date` decrescente; por fim, `id` crescente         |

### `ContactSubject`

| Código       | Rótulo `pt-BR` | Chave do rótulo                           |
| ------------ | -------------- | ----------------------------------------- |
| `newProject` | Projeto novo   | `contact:form.subject.options.newProject` |
| `freelance`  | Freelance      | `contact:form.subject.options.freelance`  |
| `job`        | Vaga           | `contact:form.subject.options.job`        |
| `other`      | Outro          | `contact:form.subject.options.other`      |

### `SupportedLanguage`

Os idiomas de `src/i18n/supportedLanguages.ts`, valores de `lang` e de `ContactMessage.language`.

| Código  | Nome      | Chave do rótulo                                                           |
| ------- | --------- | ------------------------------------------------------------------------- |
| `pt-BR` | Português | `common:languageSelector.ptBR.short`, `common:languageSelector.ptBR.name` |
| `en`    | English   | `common:languageSelector.en.short`, `common:languageSelector.en.name`     |
| `es`    | Español   | `common:languageSelector.es.short`, `common:languageSelector.es.name`     |

## O que a API calcula e o que a tela calcula

**API** (e a camada local na v1, com a mesma regra, D51, D53, D54):

- busca, filtros de tipo e categoria, ordenação e paginação de projetos (`GET /projects`);
- `total` e `availableTypes` da página de projetos;
- destaques do Início (`featured=true`), com o desempate por título e `id` (D53);
- `technologies` e `cover` de cada projeto, montados de `stack` e de `images`;
- relacionados expandidos (`related[].project`) no detalhe;
- título dos projetos ligados à trajetória (`projects[].title`);
- grupos da trajetória e a ordem dos itens em cada grupo;
- `certificates` da trajetória, sem repetição;
- itens em curso do Início (`current=true`).

**Tela**, por serem apresentação e não seleção nem ordem:

- formatar datas e período ("desde `MM/AAAA`", "`MM/AAAA` – `MM/AAAA`", só o ano de `date`) por
  `Intl.DateTimeFormat` (D39, NF-IN-04);
- escolher o que destacar em cada item de trajetória pelo `kind`
  ([Destaque](#destaque-do-item-de-trajetória-por-kind));
- montar rótulos de enum por chave e juntar partes com `common:symbols.separator`;
- montar URLs com `import.meta.env.BASE_URL` e com o prefixo do idioma (#53);
- esconder bloco sem dado (lista vazia, campo opcional ausente, grupo vazio).

**Ordem do conteúdo**, preservada pela API e pela camada local: o desempate final da trajetória,
`related`, `images`, `stack` e seus itens, `aboutParagraphs`, `workPrinciples`, `responsibilities`,
`disciplines`, `technologies`, `certificates` e `projectIds` de cada item, `details` e
`cardTechnologies`.

## Tipos previstos para a #13

Sugestão de onde cada tipo vive em `src/types/`, um tipo por arquivo
(`src/types/<dominio>/<Nome>.types.ts`, `.claude/CLAUDE.md`); a #13 decide os domínios.

| Domínio    | Tipos                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile`  | `Profile`, `Availability`, `Location`, `ContactChannels`, `SocialLinks`, `ResponseTime`                                                                                                      |
| `content`  | `ImageAsset`, `ResponsiveImage`, `StackGroup`, `StackItem`, `StackCategory`                                                                                                                  |
| `timeline` | `TimelineItem`, `TimelineKind`, `TimelineGroup`, `Timeline`, `CurrentTimeline`, `Certificate`, `TimelineProjectRef`                                                                          |
| `project`  | `ProjectSummary`, `ProjectDetail`, `ProjectImage`, `RelatedProject`, `ProjectPage`, `ProjectListParams`, `ProjectType`, `ProjectCategory`, `ProjectStatus`, `ProjectDocument`, `ProjectSort` |
| `contact`  | `ContactMessage`, `ContactSubject`                                                                                                                                                           |
| `api`      | `ApiError` (o corpo de [Formato de erro](api-contract.md#formato-de-erro)) e `ListResponse` (o envelope `{ items }`)                                                                         |

`ProjectListParams` são os parâmetros de `GET /projects` (`lang`, `q`, `type`, `category`,
`featured`, `sort`, `offset`, `limit`, [`api-contract.md`](api-contract.md#get-projects)).
`SupportedLanguage` já existe em `src/types/language/`.

## Mapeamento do handoff

Fonte: a seção "Modelo de dados" do `README.md` do handoff de design (tipos `Link`, `Experiencia`,
`Formacao` e `Projeto`) e os dados das telas (`Projetos.dc.html`, `Projeto.dc.html`,
`Informações.dc.html`, `Início.dc.html` e `Contato.dc.html`), conferidos em 11-10-2026. "Mudança"
diz se o campo foi renomeado, mudou de forma, foi removido ou não foi adotado.

### Tipos do `README.md` do handoff

| Handoff                                    | Código                                                                     | Mudança                                       | Motivo                                                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Projeto`                                  | `ProjectSummary` (listas) e `ProjectDetail` (detalhe)                      | Mudou: duas formas                            | A lista não baixa galeria nem documentos (NF-DA-05, NF-DE-15)                                                           |
| `Projeto.slug`                             | `id`                                                                       | Mudou: UUID v7, sem slug                      | D32, NF-DA-07: renomear o projeto não pode quebrar links                                                                |
| `Projeto.titulo`                           | `title`                                                                    | Renomeado                                     | Identificadores em inglês                                                                                               |
| `Projeto.resumo`                           | `summary`                                                                  | Renomeado; até cerca de 160 caracteres        | `projects.md`, `project.md`                                                                                             |
| `Projeto.ano: number`                      | `date` (`AAAA-MM`)                                                         | Mudou: mês e ano                              | Decisão do PO; ordenação por mês (D43, RF-PROJECTS-09)                                                                  |
| `Projeto.tipo: "Web" \| "Mobile" \| "API"` | `types: ProjectType[]`                                                     | Mudou: lista, 12 códigos                      | Decisão do PO (RF-PROJECTS-05); projeto web com backend é `["web", "api"]`                                              |
| `Projeto.categoria`                        | `category: ProjectCategory`                                                | Mudou: código em inglês                       | Enum é código, rótulo por chave                                                                                         |
| `Projeto.destaque`                         | `featured`                                                                 | Renomeado                                     | D43                                                                                                                     |
| `Projeto.papel`                            | `role`                                                                     | Renomeado                                     | Ficha técnica (RF-PROJECT-11)                                                                                           |
| `Projeto.duracao`                          | `duration`                                                                 | Renomeado                                     | Ficha técnica                                                                                                           |
| `Projeto.time`                             | `team`                                                                     | Renomeado                                     | Ficha técnica                                                                                                           |
| `Projeto.situacao: string`                 | `status: ProjectStatus`                                                    | Mudou: três valores fixos                     | D49                                                                                                                     |
| `Projeto.stack`                            | `stack: StackGroup[]` (`category`, `items: StackItem[]`)                   | Mudou: categoria é enum; item é objeto        | Marcações `isPrimary` e `isProgrammingLanguage` sem lista paralela                                                      |
| `Projeto.imagens: string[]`                | `images: ProjectImage[]`                                                   | Mudou: variantes, dimensões e `alt`           | D48, NF-DE-13, NF-DE-14, NF-DE-16; `alt` obrigatório por idioma                                                         |
| `Projeto.legendas: string[]`               | `images[].caption`                                                         | Mudou: junto da imagem, opcional              | Listas paralelas desalinham; D48                                                                                        |
| `Projeto.documentos: { nome, conteudo }[]` | `documents: ProjectDocument[]` e `GET /projects/{id}/documents/{document}` | Mudou: códigos de D33 e um `.md` por idioma   | D33: cada documento tem rota e arquivo próprios                                                                         |
| `Projeto.links: Link[]`                    | `demoUrl?`, `repositoryUrl?`                                               | Mudou                                         | A tela tem exatamente esses dois botões (RF-PROJECT-14)                                                                 |
| `Projeto.relacionados: { slug, motivo }[]` | `related`: `{ id, reason }` no conteúdo, `RelatedProject` na resposta      | Mudou: por id, expandido na resposta          | D32, D51                                                                                                                |
| `Experiencia`, `Formacao`                  | `TimelineItem` com `kind`                                                  | Mudou: uma entidade só                        | Curso não tinha tipo; os três têm a mesma forma (`about.md`)                                                            |
| `inicio: Date`                             | `start` (`AAAA-MM`)                                                        | Mudou: sem dia nem hora                       | Decisão do PO; a tela mostra `MM/AAAA` (D39)                                                                            |
| `fim?: Date`                               | `end?` (`AAAA-MM`)                                                         | Mudou: sem dia nem hora; ausente = em curso   | D39                                                                                                                     |
| `titulo`                                   | `title` (cargo ou curso)                                                   | Renomeado; na formação, mudou de sentido      | Na formação o `titulo` era a instituição; agora é `organization` ([Destaque](#destaque-do-item-de-trajetória-por-kind)) |
| `detalhes: string[]`                       | `organization`, `stage?` e `details`                                       | Mudou: organização e etapa em campos próprios | RF-HOME-09, RF-HOME-10, JSON-LD `worksFor` e `alumniOf`                                                                 |
| `resumo`                                   | `summary`                                                                  | Renomeado; obrigatório                        | RF-ABOUT-18                                                                                                             |
| `Experiencia.responsabilidades`            | `responsibilities`                                                         | Renomeado                                     | —                                                                                                                       |
| `Formacao.disciplinas`                     | `disciplines` (formação e curso)                                           | Renomeado                                     | —                                                                                                                       |
| `Experiencia.tecnologias`                  | `technologies` (todo `kind`)                                               | Renomeado; vale para todo `kind`              | RF-ABOUT-18                                                                                                             |
| `Formacao.certificados: string[]`          | `certificates: Certificate[]` (todo `kind`)                                | Mudou: objeto com `id`, `name`, `issuer?`     | D38: deduplicação e mesmo nome na faixa, no modal e no CV                                                               |
| `projetos: Link[]`                         | `projectIds` no conteúdo, `projects: TimelineProjectRef[]` na resposta     | Mudou: por id                                 | O título muda e a URL depende do idioma (`about.md`)                                                                    |
| `Link`                                     | —                                                                          | Removido                                      | Substituído por id (trajetória, relacionados) e por `demoUrl`/`repositoryUrl` (projeto)                                 |
| `Link.titulo`                              | —                                                                          | Removido                                      | O título vem do projeto, nunca copiado                                                                                  |
| `Link.url`                                 | —                                                                          | Removido                                      | A URL é montada pela tela com o prefixo do idioma (#53)                                                                 |

### Entidades que o handoff não tipa

| Handoff                                                           | Código                                                                                     | Mudança                | Motivo                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------- |
| Perfil (texto fixo do HTML: cargo, apresentação, foto)            | `Profile` (`role`, `homeIntro`, `summary`, `photo?`)                                       | Novo                   | RF-HOME-05, RF-ABOUT-02, RF-ABOUT-04          |
| Disponibilidade ("Disponível para projetos", fixo no HTML)        | `Profile.availability` (`Availability`)                                                    | Novo                   | D44                                           |
| Stack do site                                                     | `Profile.stack` (`StackGroup[]`)                                                           | Novo                   | RF-HOME-13, RF-ABOUT-08                       |
| Curso (dados de `CURSOS`, com a forma de `Formacao`)              | `TimelineItem` com `kind: "course"`                                                        | Novo                   | RF-ABOUT-13                                   |
| Grupos (`GRUPOS`: experiências, formações, cursos)                | `Timeline.groups` (`TimelineGroup[]`)                                                      | Novo, montado pela API | D54                                           |
| Certificado                                                       | `Certificate`                                                                              | Novo                   | D38                                           |
| "Como eu trabalho"                                                | `Profile.workPrinciples`                                                                   | Novo                   | RF-ABOUT-12                                   |
| Canais (e-mail, localização, "Fuso GMT-3", fixos no HTML) e redes | `Profile.contact` (`ContactChannels`, `ResponseTime`), `Profile.location`, `Profile.links` | Novo                   | D44, RF-CONTACT-04 a RF-CONTACT-07, RF-LAY-24 |
| Mensagem de contato (campos do formulário)                        | `ContactMessage`                                                                           | Novo                   | `contact.md`, #44                             |

### Dados e estado das telas do handoff

| Handoff                                                                                              | Código                                                                          | Mudança                   | Motivo                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `PROJETOS[].id` curto (`"maps"`)                                                                     | `id` UUID v7                                                                    | Não adotado               | D32                                                                                              |
| `PROJETOS[].tags` (tecnologias do card)                                                              | `cardTechnologies`                                                              | Renomeado                 | RF-PROJECTS-14                                                                                   |
| `PROJETOS[].papel` combinado com a duração (`"Fullstack · 4 meses"`)                                 | `role` e `duration`, só na ficha técnica                                        | Não adotado no card       | O card do protótipo validado não mostra papel                                                    |
| `GALERIA[].rotulo` (texto do placeholder, "Visão geral")                                             | `images[].alt`                                                                  | Mudou                     | É o que mais se aproxima do `alt`; agora obrigatório e por idioma (D48)                          |
| `GALERIA[].legenda`                                                                                  | `images[].caption`                                                              | Renomeado                 | —                                                                                                |
| `DOCS[].atualizado` ("há 2 meses")                                                                   | `updatedAt?` do projeto                                                         | Não adotado por documento | Não é exibido no handoff nem no protótipo; a data do projeto serve ao JSON-LD e ao `sitemap.xml` |
| `relacionados[].motivo` em caixa alta nos dados                                                      | `related[].reason` em caixa normal                                              | Mudou                     | A caixa alta é por CSS                                                                           |
| `REDES[].detalhe` (`"@luizfelipe"`, `"in/luizfelipe"`)                                               | só a URL em `Profile.links`                                                     | Não adotado               | As redes saíram de Contato (D21); o rodapé mostra só o nome da rede                              |
| Item "Currículo" de `REDES` ("PDF · 180 KB")                                                         | Arquivo do CV por idioma                                                        | Não adotado               | O CV é arquivo próprio (D52), fora do modelo                                                     |
| Organização em `detalhes[0]` da experiência (`["Empresa", "CLT"]`)                                   | `organization`                                                                  | Mudou                     | Campo próprio ([Destaque](#destaque-do-item-de-trajetória-por-kind))                             |
| `titulo` da formação com a instituição (`"Fatec"`) e o curso em `detalhes`                           | `organization` = instituição, `title` = curso                                   | Mudou                     | Contrato semântico; a tela destaca a instituição pelo `kind`                                     |
| Organização do curso às vezes em `detalhes` (`"Microcamp"`), às vezes ausente                        | `organization?` em `course`                                                     | Mudou                     | Opcional só em curso                                                                             |
| Etapa em `detalhes` ("6º semestre") e no card "Cursando" ("5º semestre · desde 2023")                | `stage?`                                                                        | Mudou                     | RF-HOME-10                                                                                       |
| Datas `Date` com hora (`"2021-01-01T00:00:00.000Z"`) no tipo e `"MM/AAAA"` com `fim: null` nos dados | `start`/`end` em `AAAA-MM`, `end` ausente                                       | Mudou                     | Opcional é ausente, nunca `null`; a tela formata `MM/AAAA`                                       |
| Estado de Projetos: `busca`, `tipo`, `categoria`, `ordenacao`, `visiveis`                            | Parâmetros `q`, `type`, `category`, `sort`, `offset`/`limit` de `GET /projects` | Mudou                     | D45 (estado na URL), D51 (aplicado pela API)                                                     |

## Origem dos dados por tela

Cada tabela cobre o que as seções "Vem do conteúdo" e "O que a tela pede ao contrato" do documento
da tela listam. "Origem" é `Entidade.campo`, a resposta de um endpoint, "derivado de" (calculado
pela tela a partir de um campo) ou "chave `ns:chave`" (texto fixo, não conteúdo). Os endpoints
levam sempre `lang` com o idioma ativo, omitido abaixo quando é o único parâmetro.

### Layout

[`layout.md`](../screens/layout.md).

| Dado exibido                                                 | Origem                                                           | Endpoint             |
| ------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------- |
| Frase de disponibilidade do rodapé                           | `Profile.availability.label`, só com `isAvailable`               | `GET /profile`       |
| Localização do rodapé                                        | Derivado de `Profile.location.city` e `region` (`city · region`) | `GET /profile`       |
| E-mail, "Copiar e-mail" e ícone `mailto:`                    | `Profile.contact.email`                                          | `GET /profile`       |
| GitHub e LinkedIn (rodapé padrão e de navegação)             | `Profile.links.github`, `Profile.links.linkedin`                 | `GET /profile`       |
| `<title>` e descrição de `/projects/:id` e dos documentos    | `ProjectDetail.title`, `ProjectDetail.summary`                   | `GET /projects/{id}` |
| "Currículo em PDF" do rodapé de Contato                      | Arquivo do CV por idioma (D52), fora do modelo                   | —                    |
| Nome do autor (logo, copyright, nomes acessíveis, JSON-LD)   | Chave `common:authorName`                                        | —                    |
| Ano do copyright                                             | Constante do build (RF-LAY-25)                                   | —                    |
| Navegação, seletor de idioma, tema, rótulos do rodapé, erros | Chaves `common:*`, `notFound:*`, `error:*`                       | —                    |

### Início

[`home.md`](../screens/home.md).

| Dado exibido                                        | Origem                                                                                                                   | Endpoint                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Selo de disponibilidade                             | `Profile.availability.isAvailable` e `label`                                                                             | `GET /profile`                                    |
| Parágrafo do hero                                   | `Profile.homeIntro`                                                                                                      | `GET /profile`                                    |
| `h1`, "Ver projetos", rótulos e headings das seções | Chaves `home:heading`, `home:hero.viewProjects`, `home:status.*`, `home:stack.*`, `home:featured.*`                      | —                                                 |
| "Baixar CV"                                         | Arquivo do CV por idioma (D52), fora do modelo; texto pela chave `common:resume.download`                                | —                                                 |
| Card "Trabalhando como": cargo, organização, desde  | `CurrentTimeline.items[]` com `kind: "experience"`: `title`, `organization`, `start`                                     | `GET /timeline?current=true`                      |
| Card "Cursando": instituição, curso, etapa, desde   | `CurrentTimeline.items[]` com `kind` `education` ou `course`: `organization`, `title`, `stage`, `start`                  | `GET /timeline?current=true`                      |
| Seção de status ausente                             | Derivado de `CurrentTimeline.items` vazio                                                                                | `GET /timeline?current=true`                      |
| Faixa de stack                                      | `Profile.stack[].items[].name`, achatados na ordem; item principal por `isPrimary`                                       | `GET /profile`                                    |
| Destaques (até quatro, na ordem)                    | Resposta de `GET /projects` (`ProjectPage.items`)                                                                        | `GET /projects?featured=true&sort=recent&limit=4` |
| Rótulo de metadados do destaque                     | `ProjectSummary.types` e `category` (chaves `common:projectType.*`, `common:projectCategory.*`) e ano derivado de `date` | `GET /projects?featured=true&sort=recent&limit=4` |
| Título, resumo, chips e link do destaque            | `ProjectSummary.title`, `summary`, `cardTechnologies`, `id`                                                              | `GET /projects?featured=true&sort=recent&limit=4` |
| Imagem do destaque                                  | `ProjectSummary.cover`; ausente, placeholder                                                                             | `GET /projects?featured=true&sort=recent&limit=4` |
| Estado vazio dos destaques                          | Derivado de `ProjectPage.items` vazio; texto pela chave `home:featured.empty`                                            | `GET /projects?featured=true&sort=recent&limit=4` |
| JSON-LD: `sameAs` e `knowsAbout`                    | `Profile.links` e `Profile.stack`                                                                                        | `GET /profile`                                    |
| JSON-LD: `name` e `jobTitle`                        | Chaves `common:authorName` e `home:heading`                                                                              | —                                                 |

### Projetos

[`projects.md`](../screens/projects.md).

| Dado exibido                                              | Origem                                                                                                                              | Endpoint                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Cards da grade                                            | Resposta de `GET /projects` (`ProjectPage.items`), páginas acumuladas                                                               | `GET /projects?q=&type=&category=&sort=&offset=&limit=9`  |
| Imagem do card                                            | `ProjectSummary.cover`; ausente, placeholder                                                                                        | Idem                                                      |
| Título e link do card                                     | `ProjectSummary.title` e `id`                                                                                                       | Idem                                                      |
| Ano do card                                               | Derivado de `ProjectSummary.date`                                                                                                   | Idem                                                      |
| Linha de tipos e categoria                                | `ProjectSummary.types` e `category`, por chave                                                                                      | Idem                                                      |
| Resumo e chips                                            | `ProjectSummary.summary` e `cardTechnologies`                                                                                       | Idem                                                      |
| Estrela de destaque                                       | `ProjectSummary.featured`                                                                                                           | Idem                                                      |
| Contagem "`<mostrados>` de `<total>` projetos"            | Derivado da quantidade de itens acumulados e `ProjectPage.total`                                                                    | Idem                                                      |
| "Carregar mais" visível                                   | Derivado: itens acumulados menores que `ProjectPage.total`; o próximo pedido usa `offset` = mostrados                               | Idem                                                      |
| Botões do filtro de tipo                                  | `ProjectPage.availableTypes`                                                                                                        | Idem                                                      |
| Busca, filtros e ordenação aplicados                      | Parâmetros `q`, `type`, `category` e `sort`, a partir da query da URL (D45); a API busca em `ProjectSummary.title` e `technologies` | Idem                                                      |
| Sem resultado, vazio                                      | Derivado de `ProjectPage.total` 0 (com ou sem filtro ativo); textos pelas chaves `projects:noResults.*` e `projects:empty.*`        | Idem                                                      |
| JSON-LD `ItemList` (todos os projetos, ordem padrão)      | `ProjectSummary.id` e `title` de todas as páginas, na pré-renderização                                                              | `GET /projects?sort=recent&offset=&limit=50`, até `total` |
| Textos fixos (busca, filtros, ordenação, contagem, erros) | Chaves `projects:*`, `common:projectType.*`, `common:projectCategory.*`, `common:projectCard.featured`                              | —                                                         |

### Projeto

[`project.md`](../screens/project.md). Todos os dados do projeto vêm de um pedido; o documento
aberto, de outro.

| Dado exibido                                                                     | Origem                                                                                   | Endpoint                                                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Badge "Em destaque"                                                              | `ProjectDetail.featured`                                                                 | `GET /projects/{id}`                                            |
| Badge da categoria, rótulo de tipos e ano                                        | `ProjectDetail.category`, `types` (por chave) e ano derivado de `date`                   | `GET /projects/{id}`                                            |
| `h1` e resumo                                                                    | `ProjectDetail.title`, `summary`                                                         | `GET /projects/{id}`                                            |
| Imagem principal, miniaturas, lightbox                                           | `ProjectDetail.images[]` (`large`, `small`, `alt`)                                       | `GET /projects/{id}`                                            |
| Legenda                                                                          | `ProjectDetail.images[].caption`                                                         | `GET /projects/{id}`                                            |
| Contador "N de M", modo da galeria (zero, uma, duas a cinco)                     | Derivado de `ProjectDetail.images.length`                                                | `GET /projects/{id}`                                            |
| Ficha: Ano, Tipo, Categoria                                                      | Derivado de `date`; `types` e `category` por chave                                       | `GET /projects/{id}`                                            |
| Ficha: Papel, Duração, Time                                                      | `ProjectDetail.role`, `duration`, `team`                                                 | `GET /projects/{id}`                                            |
| Ficha: Situação                                                                  | `ProjectDetail.status`, por chave `common:projectStatus.*`                               | `GET /projects/{id}`                                            |
| Stack por categoria                                                              | `ProjectDetail.stack[].category` (chave `common:stackCategory.*`) e `items[].name`       | `GET /projects/{id}`                                            |
| "Ver projeto ao vivo", "Ver código no GitHub"                                    | `ProjectDetail.demoUrl`, `repositoryUrl`                                                 | `GET /projects/{id}`                                            |
| Navegação entre documentos                                                       | `ProjectDetail.documents`; rótulos pelas chaves `project:documents.*`                    | `GET /projects/{id}`                                            |
| Documento aberto (Markdown)                                                      | Resposta de `GET /projects/{id}/documents/{document}`                                    | `GET /projects/{id}/documents/{document}`                       |
| Relacionados: motivo                                                             | `ProjectDetail.related[].reason`                                                         | `GET /projects/{id}`                                            |
| Relacionados: card (título, resumo, capa, ano, tipos, categoria, chips, estrela) | `ProjectDetail.related[].project` (`ProjectSummary`)                                     | `GET /projects/{id}`                                            |
| Página não encontrada                                                            | Resposta `404 NOT_FOUND` de qualquer dos dois endpoints; id fora do formato não é pedido | `GET /projects/{id}`, `GET /projects/{id}/documents/{document}` |
| `<title>` e descrição                                                            | `ProjectDetail.title`, `summary`; chaves `project:meta.*`                                | `GET /projects/{id}`                                            |
| `og:image` e `og:image:alt`                                                      | `ProjectDetail.images[0].large` e `images[0].alt`                                        | `GET /projects/{id}`                                            |
| JSON-LD: `dateCreated`, `dateModified`                                           | `ProjectDetail.date`, `updatedAt`                                                        | `GET /projects/{id}`                                            |
| JSON-LD: `genre`, `keywords`                                                     | Rótulos de `types` no idioma; `technologies`                                             | `GET /projects/{id}`                                            |
| JSON-LD: `codeRepository`, `programmingLanguage`                                 | `ProjectDetail.repositoryUrl`; `stack[].items[]` com `isProgrammingLanguage`             | `GET /projects/{id}`                                            |
| Textos fixos (galeria, ficha, links, erros, markdown)                            | Chaves `project:*` e `common:*`                                                          | —                                                               |

### Informações

[`about.md`](../screens/about.md). Duas fontes, com erro independente: perfil e trajetória.

| Dado exibido                                                                        | Origem                                                                                                                                               | Endpoint        |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Foto                                                                                | `Profile.photo`; ausente, placeholder; `alt` pela chave `about:hero.photoAlt`                                                                        | `GET /profile`  |
| Localização                                                                         | Derivado de `Profile.location.city` e `region`                                                                                                       | `GET /profile`  |
| Selo de disponibilidade                                                             | `Profile.availability.isAvailable` e `label`                                                                                                         | `GET /profile`  |
| Rótulo "Informações" e `h1`                                                         | Chaves `about:hero.label` e `common:authorName`                                                                                                      | —               |
| Parágrafo de apresentação                                                           | `Profile.summary`                                                                                                                                    | `GET /profile`  |
| "Baixar CV"                                                                         | Arquivo do CV por idioma (D52), fora do modelo                                                                                                       | —               |
| "Entrar em contato"                                                                 | Chave `common:footer.contact.cta`                                                                                                                    | —               |
| Sobre mim                                                                           | `Profile.aboutParagraphs`                                                                                                                            | `GET /profile`  |
| Stack: grupos, itens e contagem                                                     | `Profile.stack[].category` (chave `common:stackCategory.*`), `items[].name`; contagem derivada de `items.length`                                     | `GET /profile`  |
| Certificados                                                                        | `Timeline.certificates[].name` e `issuer`                                                                                                            | `GET /timeline` |
| Como eu trabalho                                                                    | `Profile.workPrinciples`                                                                                                                             | `GET /profile`  |
| Trajetória: grupos, ordem e contagem                                                | `Timeline.groups[].kind` (chave `about:trajectory.groups.*`) e `items`; contagem derivada de `items.length`                                          | `GET /timeline` |
| Item: destaque e linha de detalhes                                                  | `TimelineItem.title` ou `organization` conforme o `kind`, `stage`, `details` ([Destaque](#destaque-do-item-de-trajetória-por-kind))                  | `GET /timeline` |
| Item: período e selo "Atual"                                                        | Derivado de `TimelineItem.start` e `end` (D39); selo quando `end` está ausente                                                                       | `GET /timeline` |
| Modal: resumo e blocos                                                              | `TimelineItem.summary`, `responsibilities`, `disciplines`, `technologies`, `certificates`                                                            | `GET /timeline` |
| Modal: projetos relacionados                                                        | `TimelineItem.projects[].id` e `title`                                                                                                               | `GET /timeline` |
| JSON-LD: `jobTitle`, `description`, `image`, `sameAs`, `knowsAbout`, `homeLocation` | `Profile.role`, `summary`, `photo.large`, `links`, `stack`, `location` (`city`, `region`, `countryCode`)                                             | `GET /profile`  |
| JSON-LD: `alumniOf`, `worksFor`, `hasOccupation`, `hasCredential`                   | `organization` dos itens `education`; `organization` das experiências em curso; `title` e `summary` das experiências; `Timeline.certificates[].name` | `GET /timeline` |
| Textos fixos (rótulos de seção, grupo e bloco, instrução, erros)                    | Chaves `about:*`, `common:period.*`, `common:stackCategory.*`                                                                                        | —               |

### Contato

[`contact.md`](../screens/contact.md).

| Dado exibido                              | Origem                                                                         | Endpoint                 |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| Selo de disponibilidade                   | `Profile.availability.isAvailable` e `label`                                   | `GET /profile`           |
| `h1` e texto de abertura                  | Chaves `contact:heading`, `contact:lede.direct` ou `contact:lede.form`         | —                        |
| E-mail, "Copiar e-mail", "Enviar e-mail"  | `Profile.contact.email`                                                        | `GET /profile`           |
| Localização: linha e detalhe              | Derivado de `Profile.location.city` e `region`; `Profile.location.detail`      | `GET /profile`           |
| Resposta: linha e detalhe                 | `Profile.contact.responseTime.label` e `detail`; ausente, o bloco some         | `GET /profile`           |
| "Baixar CV"                               | Arquivo do CV por idioma (D52), fora do modelo                                 | —                        |
| Envio do formulário (flag ligada)         | Corpo `ContactMessage`; na v1, mutation com `queryFn` simulada, sem requisição | `POST /contact-messages` |
| JSON-LD: `email`, `sameAs`                | `Profile.contact.email`, `Profile.links`                                       | `GET /profile`           |
| Textos fixos (rótulos, formulário, erros) | Chaves `contact:*` e `common:*`                                                | —                        |

## Validação do conteúdo

O que o teste de conteúdo da #13 barra (o build falha), para nenhuma tela precisar de fallback.
Quando o backend existir, ele aplica as mesmas regras na escrita.

- **Idiomas:** todo registro existe em `pt-BR`, `en` e `es`; todo campo por idioma está presente e
  não vazio nos três (NF-IN-02); os campos neutros têm o mesmo valor nos três, e as listas têm o
  mesmo tamanho e a mesma ordem.
- **Ids:** `id` de projeto, de item de trajetória e de certificado em UUID v7 canônico, em
  minúsculas (NF-DA-07); únicos entre projetos e entre itens de trajetória; o mesmo `id` de
  certificado sempre com o mesmo `name` e `issuer`.
- **Referências:** todo `projectIds` e todo `related[].id` aponta para um projeto existente; um
  projeto não se relaciona consigo mesmo nem repete relacionado.
- **Datas:** `date`, `start` e `end` em `AAAA-MM` válido; `updatedAt` em `AAAA-MM-DD` válido; `end`
  não anterior a `start`.
- **Enums:** todo valor de `types`, `category`, `status`, `kind`, `StackGroup.category` e
  `documents` está no enum; `types` com pelo menos um código e sem repetição.
- **Projeto:** no máximo quatro com `featured` (D43); `cardTechnologies` com um a três nomes, todos
  em `technologies`; `stack` com pelo menos um item, sem categoria repetida e na ordem do enum;
  `summary` com até cerca de 160 caracteres; `related` com até três; `demoUrl` e `repositoryUrl`
  `https:` absolutas.
- **Imagens:** de zero a cinco por projeto (D48), todas 16:9 nas duas variantes, com `width` e
  `height` reais do arquivo, `alt` presente nos três idiomas e o arquivo existente em `public/`;
  foto do perfil 1:1.
- **Documentos** (de [`project.md`](../screens/project.md), "O que o teste de conteúdo da #13
  verifica"): `readme` presente; o mesmo conjunto de documentos nos três idiomas, cada um com o
  arquivo `.md` existente; `README.md` com as seções de RF-PROJECT-27 na ordem; Markdown GFM sem
  HTML, sem imagem, sem nota de rodapé e sem título `#`; linguagem em todo bloco de código; toda
  tabela com linha de cabeçalho; só links `https:`, `http:`, `mailto:`, `project:<id existente>` (e
  o documento citado, se houver, existente) e `#âncora`.
- **Trajetória:** `organization` presente em `experience` e `education`; `summary` presente;
  `responsibilities` vazio fora de `experience` e `disciplines` vazio em `experience`; `stage` só em
  `education` e `course`.
- **Perfil:** `aboutParagraphs` com pelo menos um item; `summary` e `homeIntro` presentes; no máximo
  um `isPrimary` na stack do site; `contact.email` válido; `links` `https:` absolutas;
  `location.countryCode` ISO 3166-1 alfa-2.

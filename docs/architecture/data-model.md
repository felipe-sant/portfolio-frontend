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

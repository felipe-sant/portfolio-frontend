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

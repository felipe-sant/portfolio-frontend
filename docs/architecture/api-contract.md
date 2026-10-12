# Contrato esperado da API

Este documento descreve a API que o frontend espera do backend: endpoints, parâmetros, corpo,
respostas, erros e idioma. Ele é a **expectativa do frontend**: o backend ainda não existe, e o
contrato oficial passará a viver no repositório do backend quando ele existir. A partir daí, este
documento passa a apontar para lá e deixa de ser a fonte.

Na v1 não há backend (R1, NF-DA-01): uma camada local no frontend simula este contrato, com as
mesmas respostas, parâmetros e erros ([Camada local na v1](#camada-local-na-v1)), para a troca pela
API (#43) ser só a troca da origem. As entidades, os campos e as regras de cada campo estão em
[`data-model.md`](data-model.md); aqui ficam só as regras de cada endpoint.

## Convenções

- **Base:** todo caminho é relativo a `VITE_API_URL`, lida só em `src/services/http/apiUrl.ts`. O
  prefixo de versão, se o backend tiver um (`/v1`), fica dentro da variável, não nos caminhos.
- **Formato:** JSON em UTF-8 (`application/json; charset=utf-8`), salvo os documentos do projeto,
  em Markdown (`text/markdown; charset=utf-8`).
- **Idioma do conteúdo:** toda leitura exige `lang` (`pt-BR`, `en` ou `es`) na query, e a resposta
  traz o conteúdo só nesse idioma, com `Content-Language` igual a ele
  ([`data-model.md`](data-model.md#tradução-do-conteúdo)). `lang` ausente ou fora da lista responde
  `400 UNSUPPORTED_LANGUAGE`.
- **Idioma da mensagem de erro:** o cliente envia `Accept-Language` com o idioma ativo em toda
  requisição (`getLanguage()`, convenção do `.claude/CLAUDE.md`); ele só escolhe o idioma de
  `error.message`, e a resposta de erro traz `Content-Language` desse idioma.
- **Listas em envelope:** lista nunca é o corpo inteiro; vem num objeto (`{ "items": [...] }`). A
  lista paginada traz também `total`, `offset` e `limit` (`ProjectPage`).
- **Campo opcional sem valor fica ausente**, nunca `null` nem string vazia; lista vazia é `[]`.
- **Campo novo não quebra o cliente:** o cliente ignora campo que não conhece ([Evolução](#evolução)).
- **Acesso:** só leitura pública, sem autenticação nem cookie, mais o envio de contato. Edição de
  conteúdo fica fora deste contrato (DP03).
- **Cache:** as leituras são idempotentes e podem ser cacheadas por URL; como o idioma está na URL,
  não há `Vary: Accept-Language` no conteúdo.

## Formato de erro

Toda resposta de erro, salvo `503`, tem `Content-Type: application/json` e este corpo:

```json
{
    "error": {
        "code": "INVALID_PARAMETER",
        "message": "O parâmetro sort aceita recent, oldest ou title.",
        "fields": [
            {
                "field": "sort",
                "code": "INVALID_VALUE",
                "message": "Use recent, oldest ou title."
            }
        ]
    }
}
```

- `code`: código estável, em maiúsculas, que o cliente usa para decidir o que fazer.
- `message`: texto para pessoas, no idioma do `Accept-Language`. As telas de conteúdo nunca o
  mostram; ele existe para o formulário de contato da #44 e para diagnóstico.
- `fields`: só em `INVALID_PARAMETER` e `VALIDATION_FAILED`, um item por parâmetro ou campo
  inválido, com o nome, um código (`REQUIRED`, `INVALID_VALUE`, `INVALID_FORMAT`, `TOO_SHORT`,
  `TOO_LONG`) e a mensagem.

| Status | `code`                 | Quando                                                                                   |
| ------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou fora de `pt-BR`, `en`, `es`                                            |
| 400    | `INVALID_PARAMETER`    | Parâmetro de query com valor inválido ou repetido (com `fields`)                         |
| 400    | `INVALID_ID`           | `{id}` do caminho fora do formato UUID v7                                                |
| 400    | `VALIDATION_FAILED`    | Corpo inválido em `POST /contact-messages` (com `fields`)                                |
| 404    | `NOT_FOUND`            | Projeto inexistente, documento que o projeto não tem ou `{document}` fora do enum        |
| 429    | `RATE_LIMITED`         | Limite de envios excedido; o header `Retry-After` diz em quantos segundos tentar de novo |
| 500    | `INTERNAL_ERROR`       | Falha inesperada do servidor                                                             |
| 503    | —                      | Serviço indisponível; o corpo não é garantido                                            |

**Regra das telas:** uma tela de conteúdo distingue só **não encontrado** (`404`, que vira a página
não encontrada, RF-PROJECT-34) de **falha** (todo o resto, inclusive erro de rede e `400`, que vira
o estado de erro da tela com "Tentar novamente"). A mensagem do servidor nunca aparece numa tela de
conteúdo (R1, RF-PROJECTS-22, RF-PROJECT-30). Como as telas montam os parâmetros a partir de estado
válido e não pedem id fora do formato, um `400` em leitura indica defeito no cliente.

## Endpoints

| Endpoint                                                                | Devolve                                  | Quem usa                                                |
| ----------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `GET /profile?lang=`                                                    | `Profile`                                | Rodapé, Início, Informações, Contato                    |
| `GET /timeline?lang=`                                                   | `Timeline`                               | Informações                                             |
| `GET /timeline?lang=&current=true`                                      | `CurrentTimeline`                        | Início (status atual)                                   |
| `GET /projects?lang=&q=&type=&category=&featured=&sort=&offset=&limit=` | `ProjectPage`                            | Projetos, Início (destaques)                            |
| `GET /projects/{id}?lang=`                                              | `ProjectDetail`, com `related` expandido | Projeto e metadados das rotas do projeto                |
| `GET /projects/{id}/documents/{document}?lang=`                         | Markdown                                 | Documentos do projeto (D33)                             |
| `POST /contact-messages`                                                | `202` sem corpo                          | Formulário de Contato (#44; simulado e desligado na v1) |

Perfil e trajetória são endpoints separados porque Informações trata erro por fonte (RF-ABOUT-26) e
o Início trata perfil e status atual de forma diferente (RF-HOME-24). A stack do site fica dentro do
perfil: no Início, erro de perfil e de stack têm o mesmo tratamento.

Os exemplos abaixo usam dados fictícios, só para mostrar a forma.

### `GET /profile`

Perfil do autor no idioma pedido.

**Parâmetros**

| Nome   | Onde  | Tipo                | Obrigatório | Padrão | Regra              |
| ------ | ----- | ------------------- | ----------- | ------ | ------------------ |
| `lang` | query | `SupportedLanguage` | Sim         | —      | Idioma do conteúdo |

**Sucesso:** `200`, `application/json`, `Content-Language` igual a `lang`, corpo `Profile`.

`GET /profile?lang=pt-BR`

```json
{
    "role": "Desenvolvedor full stack",
    "homeIntro": "Trabalho em produtos web de ponta a ponta, do banco de dados à interface. Aqui estão os projetos que melhor mostram como resolvo problemas.",
    "summary": "Desenvolvedor full stack em TypeScript, estudante de Análise e Desenvolvimento de Sistemas na Fatec.",
    "location": {
        "city": "São José dos Campos",
        "region": "SP",
        "countryCode": "BR",
        "detail": "Remoto ou híbrido na região"
    },
    "availability": {
        "isAvailable": true,
        "label": "Disponível para projetos"
    },
    "photo": {
        "large": {
            "src": "images/profile/photo-large.webp",
            "width": 800,
            "height": 800
        },
        "small": {
            "src": "images/profile/photo-small.webp",
            "width": 320,
            "height": 320
        }
    },
    "aboutParagraphs": [
        "Comecei a programar no curso técnico e não parei mais.",
        "Hoje trabalho com React e Node.js em produtos de ponta a ponta."
    ],
    "workPrinciples": ["Escrevo o teste junto com o código", "Prefiro entregar pequeno e cedo"],
    "stack": [
        {
            "category": "frontend",
            "items": [{ "name": "TypeScript", "isPrimary": true }, { "name": "React" }]
        },
        {
            "category": "backend",
            "items": [{ "name": "Node.js" }, { "name": "PostgreSQL" }]
        },
        {
            "category": "tooling",
            "items": [{ "name": "Docker" }, { "name": "GitHub Actions" }]
        }
    ],
    "contact": {
        "email": "luiz@exemplo.com",
        "responseTime": {
            "label": "Em até 1 dia útil",
            "detail": "Fuso GMT-3"
        }
    },
    "links": {
        "github": "https://github.com/exemplo",
        "linkedin": "https://www.linkedin.com/in/exemplo"
    }
}
```

**Erros**

| Status | `code`                 | Quando                     |
| ------ | ---------------------- | -------------------------- |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou inválido |
| 500    | `INTERNAL_ERROR`       | Falha do servidor          |

**Quem usa:** rodapé (RF-LAY-21, RF-LAY-24), Início (RF-HOME-03, RF-HOME-05, RF-HOME-13),
Informações (RF-ABOUT-02 a RF-ABOUT-12) e Contato (RF-CONTACT-01, RF-CONTACT-04 a RF-CONTACT-07).

### `GET /timeline`

Trajetória do autor no idioma pedido, em duas formas: agrupada (padrão) ou só os itens em curso
(`current=true`).

**Parâmetros**

| Nome      | Onde  | Tipo                | Obrigatório | Padrão  | Regra                                                                               |
| --------- | ----- | ------------------- | ----------- | ------- | ----------------------------------------------------------------------------------- |
| `lang`    | query | `SupportedLanguage` | Sim         | —       | Idioma do conteúdo                                                                  |
| `current` | query | `true`              | Não         | ausente | Só `true` é aceito; com `true`, a resposta é `CurrentTimeline` em vez de `Timeline` |

**Regras da forma agrupada** (`Timeline`, D54):

- `groups` tem sempre os três grupos, nesta ordem: `experience`, `education`, `course`
  (RF-ABOUT-13). Grupo sem item vem com `items: []`; a tela o esconde (RF-ABOUT-27).
- Dentro de cada grupo, os itens vêm do mais recente para o mais antigo (RF-ABOUT-14): primeiro os
  em curso (sem `end`), do `start` mais recente para o mais antigo; depois os encerrados, do `end`
  mais recente para o mais antigo e, com o mesmo `end`, do `start` mais recente para o mais antigo;
  empate total mantém a ordem do conteúdo.
- `certificates` lista os certificados de todos os itens, percorrendo os grupos na ordem acima, os
  itens na ordem acima e os certificados na ordem de cada item, e mantém só a primeira ocorrência
  de cada `id` (D38, RF-ABOUT-11).
- Em cada item, `projects` traz `{ id, title }` de cada id de `projectIds`, na mesma ordem, com o
  título do projeto no `lang` pedido; `projectIds` não sai na resposta.

**Regras de `current=true`** (`CurrentTimeline`, D54, RF-HOME-11):

- Só entram itens em curso (sem `end`).
- O primeiro item é a experiência em curso de `start` mais recente; o segundo, a formação **ou** o
  curso em curso de `start` mais recente, entre os dois `kind` juntos. Empate de `start` vale o
  primeiro na ordem do conteúdo.
- Resultado com zero, um ou dois itens, sempre nessa ordem (experiência antes); item que não
  existe não vem, e a lista vazia esconde a seção do Início. A tela escolhe o card pelo `kind`.

**Sucesso:** `200`, `application/json`, `Content-Language` igual a `lang`.

`GET /timeline?lang=pt-BR` (sem curso cadastrado, então o grupo `course` vem vazio)

```json
{
    "groups": [
        {
            "kind": "experience",
            "items": [
                {
                    "id": "0192f1b2-3a4c-7d5e-8f60-718293a4b5c6",
                    "kind": "experience",
                    "title": "Desenvolvedor frontend",
                    "organization": "Empresa Exemplo",
                    "details": ["CLT"],
                    "start": "2024-06",
                    "summary": "Desenvolvo e mantenho a interface do produto principal.",
                    "responsibilities": ["Implementar telas a partir do design", "Revisar pull requests"],
                    "disciplines": [],
                    "technologies": ["React", "TypeScript"],
                    "certificates": [],
                    "projects": [
                        {
                            "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
                            "title": "Maps"
                        }
                    ]
                }
            ]
        },
        {
            "kind": "education",
            "items": [
                {
                    "id": "0192f1b2-5b6d-7e8f-9a01-b2c3d4e5f607",
                    "kind": "education",
                    "title": "Análise e Desenvolvimento de Sistemas",
                    "organization": "Fatec",
                    "stage": "6º semestre",
                    "details": ["Faculdade"],
                    "start": "2023-02",
                    "summary": "Graduação tecnológica com foco em engenharia de software.",
                    "responsibilities": [],
                    "disciplines": ["Engenharia de software", "Banco de dados"],
                    "technologies": ["Java", "PostgreSQL"],
                    "certificates": [],
                    "projects": []
                },
                {
                    "id": "0192f1b2-7c8e-7f90-a1b2-c3d4e5f60718",
                    "kind": "education",
                    "title": "Técnico em Informática para Internet",
                    "organization": "Escola Técnica Exemplo",
                    "details": ["Curso técnico"],
                    "start": "2019-02",
                    "end": "2021-12",
                    "summary": "Curso técnico integrado ao ensino médio.",
                    "responsibilities": [],
                    "disciplines": ["Programação web", "Redes"],
                    "technologies": ["HTML", "CSS", "JavaScript"],
                    "certificates": [
                        {
                            "id": "0192f1c4-1a2b-7c3d-8e4f-5a6b7c8d9e0f",
                            "name": "Técnico em Informática para Internet",
                            "issuer": "Escola Técnica Exemplo"
                        }
                    ],
                    "projects": []
                }
            ]
        },
        {
            "kind": "course",
            "items": []
        }
    ],
    "certificates": [
        {
            "id": "0192f1c4-1a2b-7c3d-8e4f-5a6b7c8d9e0f",
            "name": "Técnico em Informática para Internet",
            "issuer": "Escola Técnica Exemplo"
        }
    ]
}
```

`GET /timeline?lang=pt-BR&current=true`

```json
{
    "items": [
        {
            "id": "0192f1b2-3a4c-7d5e-8f60-718293a4b5c6",
            "kind": "experience",
            "title": "Desenvolvedor frontend",
            "organization": "Empresa Exemplo",
            "details": ["CLT"],
            "start": "2024-06",
            "summary": "Desenvolvo e mantenho a interface do produto principal.",
            "responsibilities": ["Implementar telas a partir do design", "Revisar pull requests"],
            "disciplines": [],
            "technologies": ["React", "TypeScript"],
            "certificates": [],
            "projects": [
                {
                    "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
                    "title": "Maps"
                }
            ]
        },
        {
            "id": "0192f1b2-5b6d-7e8f-9a01-b2c3d4e5f607",
            "kind": "education",
            "title": "Análise e Desenvolvimento de Sistemas",
            "organization": "Fatec",
            "stage": "6º semestre",
            "details": ["Faculdade"],
            "start": "2023-02",
            "summary": "Graduação tecnológica com foco em engenharia de software.",
            "responsibilities": [],
            "disciplines": ["Engenharia de software", "Banco de dados"],
            "technologies": ["Java", "PostgreSQL"],
            "certificates": [],
            "projects": []
        }
    ]
}
```

**Erros**

| Status | `code`                 | Quando                                  |
| ------ | ---------------------- | --------------------------------------- |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou inválido              |
| 400    | `INVALID_PARAMETER`    | `current` com valor diferente de `true` |
| 500    | `INTERNAL_ERROR`       | Falha do servidor                       |

**Quem usa:** Informações (trajetória, modal e "Certificados": RF-ABOUT-11, RF-ABOUT-13 a
RF-ABOUT-19) e Início (status atual com `current=true`: RF-HOME-08 a RF-HOME-11).

### `GET /projects`

Lista paginada de projetos no idioma pedido, com busca, filtros e ordenação aplicados pela API
(D51).

**Parâmetros**

| Nome       | Onde  | Tipo                | Obrigatório | Padrão   | Regra                                                                            |
| ---------- | ----- | ------------------- | ----------- | -------- | -------------------------------------------------------------------------------- |
| `lang`     | query | `SupportedLanguage` | Sim         | —        | Idioma do conteúdo, da busca e da ordenação                                      |
| `q`        | query | `string`            | Não         | ausente  | Texto de busca, até 100 caracteres; ver "Busca"                                  |
| `type`     | query | `ProjectType`       | Não         | ausente  | Um código; casa se algum dos `types` do projeto for ele (RF-PROJECTS-05)         |
| `category` | query | `ProjectCategory`   | Não         | ausente  | Um código (RF-PROJECTS-06)                                                       |
| `featured` | query | `true`              | Não         | ausente  | Só `true` é aceito; com `true`, só projetos com `featured` (destaques do Início) |
| `sort`     | query | `ProjectSort`       | Não         | `recent` | Ver "Ordenação"                                                                  |
| `offset`   | query | inteiro ≥ 0         | Não         | `0`      | Quantos itens pular                                                              |
| `limit`    | query | inteiro de 1 a 50   | Não         | `9`      | Tamanho da página; o lote de 9 de RF-PROJECTS-12 é o padrão                      |

Parâmetro ausente não restringe; os filtros presentes combinam por **e** (RF-PROJECTS-07).
Parâmetro desconhecido é ignorado. Valor inválido ou parâmetro repetido responde
`400 INVALID_PARAMETER` com `fields`; a tela de Projetos ignora valor inválido da URL antes de
pedir (Validações de [`projects.md`](../screens/projects.md)), então nunca o envia.

**Busca** (`q`, RF-PROJECTS-03):

- Campos: o `title` e todas as `technologies` do projeto (não só as do card), no `lang` pedido; o
  `summary` não entra.
- Normalização, igual para o termo e para o texto: decomposição NFD, remoção das marcas
  diacríticas e minúsculas pelas regras do `lang` (`"Catálogo"` vira `"catalogo"`).
- O termo é aparado e dividido por espaços; termo só com espaços vale como sem busca. Cada palavra
  precisa aparecer como trecho no título ou em alguma tecnologia, e palavras diferentes podem casar
  em campos diferentes (as palavras combinam por **e**).
- Texto literal: `.`, `+`, `#` e `(` não são padrão (`c#` e `node.js` casam o texto como escrito).
- Exemplos: `react postgis` casa um projeto com React e PostGIS na stack; `catalogo` casa
  "Catálogo de componentes"; `blockchain` sem projeto que o tenha dá resultado vazio.

**Ordenação** (`sort`, RF-PROJECTS-09):

| `sort`   | Critério principal | Desempate                                             |
| -------- | ------------------ | ----------------------------------------------------- |
| `recent` | `date` decrescente | Título A–Z; por fim, `id` em ordem crescente de texto |
| `oldest` | `date` crescente   | Título A–Z; por fim, `id` em ordem crescente de texto |
| `title`  | Título A–Z         | `date` decrescente; por fim, `id` crescente           |

Título A–Z é a colação do `lang` com sensibilidade de base e comparação numérica (o equivalente a
`Intl.Collator(lang, { sensitivity: "base", numeric: true })`).

**Destaques do Início:** `featured=true&sort=recent&limit=4`. O desempate entre destaques do mesmo
mês é o de `sort=recent` (título A–Z, depois `id`), que substitui a "ordem do conteúdo" de D43
(D53). O conteúdo tem no máximo quatro destaques (D43), barrado pelo teste de conteúdo da #13.

**Resposta** (`ProjectPage`):

- `items`: a página pedida, depois de busca, filtros e ordenação, com cada projeto na forma
  `ProjectSummary`.
- `total`: quantos projetos casam busca e filtros, sem contar a paginação (a contagem
  "`<mostrados>` de `<total>`" de RF-PROJECTS-10).
- `offset` e `limit`: os valores aplicados.
- `availableTypes`: os tipos presentes em pelo menos um projeto publicado do `lang`, na ordem do
  enum, **sem** aplicar busca, filtros nem `featured` (os botões do filtro de tipo não podem
  depender da página, RF-PROJECTS-05).
- Sem resultado: `200` com `items: []` e `total: 0`. `offset` além do fim: `200` com `items: []` e
  o `total` real.

**Paginação:** por `offset` e `limit`, não por cursor. O "Carregar mais" de Projetos pede
`offset` igual à quantidade já mostrada; voltar pelo histórico refaz as mesmas páginas, com cache
do RTK Query (RF-PROJECTS-25); a coleção é pequena (dezenas de projetos). Consumidores de build que
precisam de todos os projetos (pré-renderização #49, `sitemap.xml` e `llms.txt` #51, `ItemList` do
JSON-LD de `/projects` #52) pedem páginas com `limit=50` até `total`.

**Sucesso:** `200`, `application/json`, `Content-Language` igual a `lang`, corpo `ProjectPage`.

Lista padrão, primeira página: `GET /projects?lang=pt-BR`

```json
{
    "items": [
        {
            "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
            "title": "Maps",
            "summary": "Mapa colaborativo de pontos de interesse da cidade, com rotas e filtros por categoria.",
            "date": "2026-03",
            "types": ["web", "api"],
            "category": "personal",
            "featured": true,
            "technologies": ["React", "TypeScript", "Node.js", "PostGIS", "Docker"],
            "cardTechnologies": ["React", "PostGIS", "Node.js"],
            "cover": {
                "large": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-large.webp",
                    "width": 1600,
                    "height": 900
                },
                "small": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-small.webp",
                    "width": 640,
                    "height": 360
                }
            }
        },
        {
            "id": "0192f1a0-9e44-7c08-a1b2-5d7e8f9a0b11",
            "title": "Catálogo de componentes",
            "summary": "Biblioteca de componentes de interface com documentação viva.",
            "date": "2025-11",
            "types": ["library"],
            "category": "academic",
            "featured": false,
            "technologies": ["React", "TypeScript", "Storybook"],
            "cardTechnologies": ["React", "Storybook"]
        }
    ],
    "total": 12,
    "offset": 0,
    "limit": 9,
    "availableTypes": ["web", "mobile", "api", "library"]
}
```

O segundo projeto não tem `cover` porque não tem captura (`images: []`): o card mostra o
placeholder. O exemplo mostra só dois dos nove itens da página.

Busca com filtro: `GET /projects?lang=pt-BR&q=react&type=web&sort=title`

```json
{
    "items": [
        {
            "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
            "title": "Maps",
            "summary": "Mapa colaborativo de pontos de interesse da cidade, com rotas e filtros por categoria.",
            "date": "2026-03",
            "types": ["web", "api"],
            "category": "personal",
            "featured": true,
            "technologies": ["React", "TypeScript", "Node.js", "PostGIS", "Docker"],
            "cardTechnologies": ["React", "PostGIS", "Node.js"],
            "cover": {
                "large": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-large.webp",
                    "width": 1600,
                    "height": 900
                },
                "small": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-small.webp",
                    "width": 640,
                    "height": 360
                }
            }
        }
    ],
    "total": 1,
    "offset": 0,
    "limit": 9,
    "availableTypes": ["web", "mobile", "api", "library"]
}
```

`availableTypes` é o mesmo da lista padrão: busca e filtros não o mudam.

Destaques do Início: `GET /projects?lang=pt-BR&featured=true&sort=recent&limit=4`

```json
{
    "items": [
        {
            "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
            "title": "Maps",
            "summary": "Mapa colaborativo de pontos de interesse da cidade, com rotas e filtros por categoria.",
            "date": "2026-03",
            "types": ["web", "api"],
            "category": "personal",
            "featured": true,
            "technologies": ["React", "TypeScript", "Node.js", "PostGIS", "Docker"],
            "cardTechnologies": ["React", "PostGIS", "Node.js"],
            "cover": {
                "large": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-large.webp",
                    "width": 1600,
                    "height": 900
                },
                "small": {
                    "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-small.webp",
                    "width": 640,
                    "height": 360
                }
            }
        },
        {
            "id": "0193087b-1d2a-7e6f-9b3c-4a5d6e7f8091",
            "title": "Check-in de eventos",
            "summary": "Aplicativo de check-in por QR code para eventos acadêmicos.",
            "date": "2025-09",
            "types": ["mobile", "api"],
            "category": "academic",
            "featured": true,
            "technologies": ["React Native", "TypeScript", "Node.js"],
            "cardTechnologies": ["React Native", "Node.js"]
        }
    ],
    "total": 2,
    "offset": 0,
    "limit": 4,
    "availableTypes": ["web", "mobile", "api", "library"]
}
```

**Erros**

| Status | `code`                 | Quando                                                                                                                                           |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou inválido                                                                                                                       |
| 400    | `INVALID_PARAMETER`    | `q` com mais de 100 caracteres; `type`, `category`, `featured` ou `sort` fora dos valores; `offset` ou `limit` fora da faixa; parâmetro repetido |
| 500    | `INTERNAL_ERROR`       | Falha do servidor                                                                                                                                |

**Quem usa:** Projetos (RF-PROJECTS-03 a RF-PROJECTS-13, RF-PROJECTS-26) e Início (destaques,
RF-HOME-17 a RF-HOME-21).

### `GET /projects/{id}`

O projeto inteiro, no idioma pedido, com os relacionados expandidos.

**Parâmetros**

| Nome   | Onde    | Tipo                | Obrigatório | Padrão | Regra                    |
| ------ | ------- | ------------------- | ----------- | ------ | ------------------------ |
| `id`   | caminho | `string`            | Sim         | —      | UUID v7 do projeto (D32) |
| `lang` | query   | `SupportedLanguage` | Sim         | —      | Idioma do conteúdo       |

**Regras:**

- `related` vem expandido: cada item é `{ reason, project }`, com `project` na forma
  `ProjectSummary` no `lang` pedido, na ordem do conteúdo (até três, RF-PROJECT-28). A tela não pede
  a lista de projetos para montar os relacionados (D51).
- `technologies` e `cover` são montados de `stack` e de `images[0]`, como em `GET /projects`.
- `documents` lista os documentos que o projeto tem, na ordem do enum; o conteúdo de cada um vem de
  [`GET /projects/{id}/documents/{document}`](#get-projectsiddocumentsdocument).

**Sucesso:** `200`, `application/json`, `Content-Language` igual a `lang`, corpo `ProjectDetail`.

`GET /projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50?lang=pt-BR`

```json
{
    "id": "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50",
    "title": "Maps",
    "summary": "Mapa colaborativo de pontos de interesse da cidade, com rotas e filtros por categoria.",
    "date": "2026-03",
    "types": ["web", "api"],
    "category": "personal",
    "featured": true,
    "technologies": ["React", "TypeScript", "Node.js", "PostGIS", "Docker"],
    "cardTechnologies": ["React", "PostGIS", "Node.js"],
    "cover": {
        "large": {
            "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-large.webp",
            "width": 1600,
            "height": 900
        },
        "small": {
            "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-small.webp",
            "width": 640,
            "height": 360
        }
    },
    "role": "Full stack",
    "duration": "4 meses",
    "team": "Sozinho",
    "status": "inDevelopment",
    "stack": [
        {
            "category": "frontend",
            "items": [{ "name": "React" }, { "name": "TypeScript", "isProgrammingLanguage": true }]
        },
        {
            "category": "backend",
            "items": [{ "name": "Node.js" }, { "name": "PostGIS" }]
        },
        {
            "category": "tooling",
            "items": [{ "name": "Docker" }]
        }
    ],
    "demoUrl": "https://maps.exemplo.com",
    "repositoryUrl": "https://github.com/exemplo/maps",
    "images": [
        {
            "large": {
                "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-large.webp",
                "width": 1600,
                "height": 900
            },
            "small": {
                "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/1-small.webp",
                "width": 640,
                "height": 360
            },
            "alt": "Mapa da cidade com pontos de interesse e o painel de filtros aberto à esquerda",
            "caption": "Visão geral"
        },
        {
            "large": {
                "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/2-large.webp",
                "width": 1600,
                "height": 900
            },
            "small": {
                "src": "images/projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/2-small.webp",
                "width": 640,
                "height": 360
            },
            "alt": "Rota traçada entre dois pontos, com tempo e distância estimados"
        }
    ],
    "documents": ["readme", "architecture"],
    "related": [
        {
            "reason": "Mesma stack",
            "project": {
                "id": "0193087b-1d2a-7e6f-9b3c-4a5d6e7f8091",
                "title": "Check-in de eventos",
                "summary": "Aplicativo de check-in por QR code para eventos acadêmicos.",
                "date": "2025-09",
                "types": ["mobile", "api"],
                "category": "academic",
                "featured": true,
                "technologies": ["React Native", "TypeScript", "Node.js"],
                "cardTechnologies": ["React Native", "Node.js"]
            }
        }
    ],
    "updatedAt": "2026-09-30"
}
```

**Erros**

| Status | `code`                 | Quando                           |
| ------ | ---------------------- | -------------------------------- |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou inválido       |
| 400    | `INVALID_ID`           | `id` fora do formato UUID v7     |
| 404    | `NOT_FOUND`            | Não existe projeto com esse `id` |
| 500    | `INTERNAL_ERROR`       | Falha do servidor                |

A tela de Projeto não pede `id` fora do formato: ela mostra a página não encontrada sem buscar dado
(RF-PROJECT-34). `404` vira a página não encontrada; o resto vira o erro do projeto (RF-PROJECT-30).

**Quem usa:** Projeto (RF-PROJECT-02 a RF-PROJECT-16, RF-PROJECT-28, RF-PROJECT-36), metadados e
JSON-LD das rotas do projeto, pré-renderização (#49).

### `GET /projects/{id}/documents/{document}`

Um documento do projeto, em Markdown, no idioma pedido (D33).

**Parâmetros**

| Nome       | Onde    | Tipo                | Obrigatório | Padrão | Regra                                            |
| ---------- | ------- | ------------------- | ----------- | ------ | ------------------------------------------------ |
| `id`       | caminho | `string`            | Sim         | —      | UUID v7 do projeto                               |
| `document` | caminho | `ProjectDocument`   | Sim         | —      | `readme`, `architecture`, `setup` ou `changelog` |
| `lang`     | query   | `SupportedLanguage` | Sim         | —      | Idioma do conteúdo                               |

**Sucesso:** `200`, `text/markdown; charset=utf-8`, `Content-Language` igual a `lang`. O corpo é o
documento em GFM (D50), começando em `##`, sem HTML, imagem nem nota de rodapé, com links entre
projetos por `project:<id>` (D33); as regras de conteúdo estão em
[`project.md`](../screens/project.md) (RF-PROJECT-21 a RF-PROJECT-27).

`GET /projects/0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50/documents/readme?lang=pt-BR`

```markdown
## Contexto

A prefeitura não tinha um mapa público dos pontos de interesse da cidade.

## Meu papel

Fiz o projeto sozinho, do banco de dados à interface.

## Solução

Uma aplicação web com mapa interativo e uma API que calcula rotas com PostGIS.

## Decisões técnicas

| Decisão  | Motivo                                       |
| -------- | -------------------------------------------- |
| PostGIS  | Consultas espaciais no próprio banco         |
| Vite     | Build rápido e configuração mínima           |

## Resultado

O mapa está publicado e recebe novos pontos toda semana.
```

**Erros**

| Status | `code`                 | Quando                                                                          |
| ------ | ---------------------- | ------------------------------------------------------------------------------- |
| 400    | `UNSUPPORTED_LANGUAGE` | `lang` ausente ou inválido                                                      |
| 400    | `INVALID_ID`           | `id` fora do formato UUID v7                                                    |
| 404    | `NOT_FOUND`            | Projeto inexistente, `document` fora do enum ou documento que o projeto não tem |
| 500    | `INTERNAL_ERROR`       | Falha do servidor                                                               |

`404` vira a página não encontrada (RF-PROJECT-34); o resto vira o erro parcial do documento
(RF-PROJECT-31).

**Quem usa:** Projeto (documentos, RF-PROJECT-15 a RF-PROJECT-27), pré-renderização de cada
documento (#49) e `llms-full*.txt` (#51).

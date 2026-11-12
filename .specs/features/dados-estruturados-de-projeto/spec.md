# Spec: dados-estruturados-de-projeto

> **Tipo:** `feature` <br />
> **Status:** `implementada` <br />
> **Issue:** `#201` e `#208` (uma feature só, um PR) <br />
> **Criado em:** `11-11-2026`

## Problema

- **#201:** nenhuma página tem `BreadcrumbList`. Projetos, Projeto e o documento do projeto são as páginas internas que mais se beneficiam do caminho Início > Projetos > Projeto (auditoria de SEO do claude-seo, 10/11/2026).
- **#208:** a auditoria disse que as páginas de projeto não declaram `SoftwareSourceCode` nem `CreativeWork`, mas só olhou uma das seis. O código da branch `staging` já faz isso: `buildProjectJsonLd` (`src/utils/buildProjectJsonLd.ts`) emite `SoftwareSourceCode` (com repositório) ou `CreativeWork` (sem), com `name`, `description`, `url`, `inLanguage`, `author` (`{ "@id": buildPersonId() }`, id da #200, já mergeada), `codeRepository` e `programmingLanguage`. O que falta é registrar o que cada página declara hoje e travar com teste cada campo nos três idiomas e nos seis projetos.

Tela: **sim**, mas só metadados no `<head>`/`<script>`; nenhuma mudança visual (o `qa` não precisa de verificação visual, só do JSON-LD no HTML).

## Objetivo

1. As páginas de Projetos, Projeto e documento do projeto (sem ser o README) emitem um `BreadcrumbList` com URLs absolutas, nomes por chave de tradução (`pt-BR`, `en`, `es`) ou dos dados, e itens na ordem do caminho.
2. As seis páginas de projeto têm a auditoria registrada nesta spec e cada campo exigido do `SoftwareSourceCode`/`CreativeWork` tem teste nos três idiomas; só o que a auditoria apontar como lacuna é implementado.

## Fora de escopo

- `BreadcrumbList` em Início, Informações, Contato e não encontrada (a issue pede só as três páginas acima).
- Breadcrumb visível na interface (migalhas na tela): só dados estruturados.
- Mudar `SoftwareSourceCode`/`CreativeWork`, `TechArticle` ou `CollectionPage` além do que a lacuna real exigir; `@id` de pessoa é da #200.
- Backend e dados novos nos JSON de `public/content/` (R1; os dados já têm repositório e linguagem).

## Auditoria do JSON-LD das seis páginas de projeto (#208)

Feita lendo `public/content/{pt-BR,en,es}/projects.json` e o construtor (sem build; o JSON-LD é gerado do mesmo dado, NF-IA-09). Resultado em `staging` (`09390d5`):

| Projeto (`id` termina em)               | Repositório                                | Linguagens de programação (stack, sem repetição) | `@type` emitido      | Páginas (README + documentos)        |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------ | -------------------- | ------------------------------------ |
| Maps (`1d497b`)                         | `felipe-sant/maps`                         | TypeScript                                       | `SoftwareSourceCode` | README, SETUP, LICENSE               |
| MNIST Classifier (`e47a7a`)             | `felipe-sant/mnist-classifier`             | TypeScript, Python                               | `SoftwareSourceCode` | README, ARCHITECTURE, SETUP, LICENSE |
| Pedido de Namoro Irrecusável (`57d251`) | `felipe-sant/pedido-de-namoro`             | TypeScript                                       | `SoftwareSourceCode` | README, LICENSE                      |
| Controle de Despesas (`6ec9a5`)         | `felipe-sant/controle-despesas`            | TypeScript                                       | `SoftwareSourceCode` | README, SETUP, LICENSE               |
| Conversor de Unidades (`57f6ad`)        | `felipe-sant/conversor-de-unidades`        | TypeScript                                       | `SoftwareSourceCode` | README, LICENSE                      |
| Player Profile Clustering (`0ee193`)    | `felipe-sant/player-profile-clustering-ai` | TypeScript, Python                               | `SoftwareSourceCode` | README, ARCHITECTURE, SETUP, LICENSE |

Em todas: `name` = título do idioma, `description` = `summary` do idioma, `url` e `@id` absolutos por `buildAbsoluteUrl` com o idioma da página, `inLanguage` = idioma, `author` = `{ "@id": "<site>/#person" }`, `codeRepository` = `repositoryUrl`, `programmingLanguage` sem repetição (`TypeScript` aparece duas vezes na stack de Maps, MNIST e Controle de Despesas e sai uma vez). Páginas de documento (não README) emitem, além disso, o `TechArticle` com `about` apontando para o `#project`. Nenhum dos seis cai em `CreativeWork`; esse ramo existe para projeto sem `repositoryUrl` e continua coberto.

**Lacunas reais contra o critério de aceite** (o código está correto; falta prova):

1. Os testes de `buildProjectJsonLd` provam `name`, `description` e `url` só em `pt-BR`/`en` num único `it`; não há teste de `es` nem teste por campo (nome, descrição, linguagem, repositório, autor, URL) nos três idiomas.
2. Nenhum teste percorre os dados reais (seis projetos x três idiomas) para garantir que todo projeto traz repositório, ao menos uma linguagem de programação e resumo; um projeto novo sem isso viraria `CreativeWork` ou sairia sem `programmingLanguage` sem aviso.
3. Não há teste de página (`Project.page.test.tsx`) que confira o `SoftwareSourceCode` emitido com os campos do critério; o teste de SEO só conta scripts e confere o `TechArticle`.

Nada precisa mudar em `buildProjectJsonLd` salvo se algum teste novo falhar por defeito real (nesse caso, o executor corrige e registra a causa em "Notas").

## Critérios de aceite

- [x] **CA1 (#201)** Em `/<idioma>/projects`, o HTML traz um `BreadcrumbList` com 2 itens, na ordem: Início (`/<idioma>`) e Projetos (`/<idioma>/projects`), com `position` 1 e 2 e URLs absolutas.
- [x] **CA2 (#201)** Em `/<idioma>/projects/:id`, o `BreadcrumbList` tem 3 itens: Início, Projetos e o título do projeto (`/<idioma>/projects/:id`).
- [x] **CA3 (#201)** Em `/<idioma>/projects/:id/docs/:name` (documento que não é o README), o `BreadcrumbList` tem 4 itens: Início, Projetos, título do projeto e o nome exato do documento (`/<idioma>/projects/:id/docs/:name`).
- [x] **CA4 (#201)** Os nomes de Início e Projetos vêm de `common:navigation.home` e `common:navigation.projects` e mudam com o idioma (`Início`/`Projetos`, `Home`/`Projects`, `Inicio`/`Proyectos`); título do projeto e nome do documento vêm dos dados.
- [x] **CA5 (#201)** O construtor de breadcrumb fica em `src/utils/` e tem teste que confere itens, ordem, `position` e URLs absolutas (inclusive com o prefixo de `BASE_URL` do GitHub Pages).
- [x] **CA6 (#201)** Estados sem página real (carregando, erro, projeto ou documento inexistente) não emitem `BreadcrumbList`, igual ao JSON-LD atual (`Project.page.test.tsx`, "não declara canônica, Open Graph nem JSON-LD em %s").
- [x] **CA7 (#208)** Esta spec registra o que as seis páginas declaram hoje (seção "Auditoria").
- [x] **CA8 (#208)** Para cada idioma (`pt-BR`, `en`, `es`), `buildProjectJsonLd` tem teste de cada campo: nome, descrição, linguagem de programação, repositório, autor (mesmo `@id` de `buildPersonId()`) e URL absoluta.
- [x] **CA9 (#208)** Um teste percorre os seis projetos reais nos três idiomas e exige `SoftwareSourceCode` com os seis campos preenchidos.
- [x] **CA10 (#208)** Projeto sem repositório continua `CreativeWork` sem `codeRepository` e sem `programmingLanguage` (já coberto; não pode regredir).
- [x] **CA11** `<` continua escapado em todo JSON-LD novo (NF-IA-09).

## Casos de borda

- QUANDO o `BASE_URL` tem prefixo (GitHub Pages) ENTÃO as URLs do breadcrumb DEVEM incluí-lo, como as demais (`buildAbsoluteUrl`).
- QUANDO o título do projeto ou o nome do documento contém `</script>` ENTÃO o JSON serializado DEVE escapar o `<`.
- QUANDO a página de projeto abre o README (`/docs/README.md` ou sem `/docs`) ENTÃO o breadcrumb DEVE ter 3 itens, não 4 (o README é a própria página do projeto).
- QUANDO o nome do documento vem em outra caixa na URL ENTÃO o item usa o nome exato do documento (`documentEntry.name`), e a URL a forma canônica, como o `PageMeta`.
- QUANDO a lista da página de Projetos está carregando ENTÃO nenhum JSON-LD dela é emitido (o breadcrumb segue o mesmo critério do `jsonLd` atual).

## Estratégia de validação

- **Checagens automatizadas:** testes de util (`src/utils/test/`), de página (`src/pages/test/Projects.page.test.tsx`, `Project.page.test.tsx`) e E2E (`e2e/projects.spec.ts`, `e2e/project.spec.ts`, `e2e/project-documents.spec.ts`); axe não muda (sem marcação visível).
- **Checagens manuais:** abrir `/pt-BR/projects`, `/en/projects/<id>` e `/es/projects/<id>/docs/SETUP.md` e conferir o `<script type="application/ld+json">` no código-fonte (ou no HTML pré-renderizado); opcional: Rich Results Test após o deploy.
- **Rollback / mitigação:** o breadcrumb é um nó extra e independente; remover o `<JsonLd>` novo reverte sem tocar nos demais.

## Questões em aberto

- **QA1:** nas páginas de projeto o último item (o projeto ou o documento) leva `item` (URL) ou só `name`? Proposta: leva `item`, pois a issue pede URLs absolutas e o Google aceita; o CA2 e CA3 já assumem isso.
- **QA2:** o item do documento usa só o nome (`SETUP.md`) ou o mesmo formato do `TechArticle` (`SETUP.md · Maps`)? Proposta: só o nome do documento, porque o item anterior já nomeia o projeto.
- **QA3:** o breadcrumb da página de documento sai como nó separado (`BreadcrumbList`) ao lado do `TechArticle`, em vez de ligado por `breadcrumb` no `TechArticle`? Proposta: nó separado, mais simples e aceito pelo Google.

## Notas / decisões

- **Construtor novo, não embutido (#201).** Cria-se `src/utils/buildBreadcrumbJsonLd.ts` (`export default`, um símbolo por arquivo) com `buildBreadcrumbJsonLd(language, items)`, `items: { name: string; path: string; params?: Record<string, string> }[]`, usando `buildAbsoluteUrl` por item. Motivo: o mesmo nó serve às três páginas (e a futuras); embutir em `buildProjectsJsonLd`/`buildProjectJsonLd` misturaria dois tipos num retorno de nó único (o `JsonLdNode` é um objeto, não um `@graph`) e obrigaria a mudar o contrato dos testes atuais. Cada página emite seu `<JsonLd>` próprio, depois dos existentes (os E2E de `projects.spec.ts` leem `.first()`, então a `CollectionPage` continua primeiro).
- **Nomes por tradução:** os rótulos vêm de `common:navigation.home` e `common:navigation.projects`, que já existem nos três idiomas (R2); não há chave nova, logo nenhum JSON de `src/locales/` muda. Em Projetos, o hook `useProjects` monta a lista de itens; em Projeto e documento, o construtor puro `buildProjectBreadcrumbItems` (`src/utils/`) monta a lista e a página só o chama e passa o resultado a `buildBreadcrumbJsonLd`. O tipo do item fica em `src/types/seo/BreadcrumbItem.types.ts`.
- **Sem dependência nova.** Sem backend (R1). Referências: NF-IA-08, NF-IA-09; D-IDs de design não se aplicam (sem UI).
- **`/docs/README.md` não é página de projeto:** a rota responde não encontrada (já coberto em `Project.page.test.tsx`), então o README só existe em `/projects/:id` e o breadcrumb dele tem sempre 3 itens.
- **#208 sem implementação de campo:** a auditoria mostra os campos todos presentes; o trabalho é prova (testes) e registro.

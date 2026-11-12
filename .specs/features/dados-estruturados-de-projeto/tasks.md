# Tasks: dados-estruturados-de-projeto

> Spec: `./spec.md`

## Plano de execução

```
Fase 1 (T1 [P], T2 [P])  →  Fase 2 (T3)  →  Fase 3 (T4 [P], T5 [P])  →  Fase 4 (T6)  →  Fase 5 (T7)
```

T1 e T2 não editam o mesmo arquivo. Vitest sempre com `--maxWorkers=2` e conferir `uptime` antes; build e E2E só no CI do PR.

## Tarefas

- [x] T1 [P] — Provar cada campo do JSON-LD de projeto nos três idiomas (#208, auditoria)
    - **Arquivo(s):** `src/utils/test/buildProjectJsonLd.test.ts`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** (um `it.each` sobre `pt-BR`, `en`, `es`, fixture de `buildProjectDetailFixture` com repositório)
        - `projeto sem repositório continua CreativeWork, sem codeRepository nem programmingLanguage` (borda; CA10)
        - `programmingLanguage vazio com repositório e sem linguagem na stack sai undefined` (borda; CA8)
        - `name e description são o título e o resumo recebidos, em cada idioma` (CA8)
        - `url e @id são absolutos com o idioma da página` (CA8)
        - `author é { "@id": buildPersonId() } em cada idioma` (CA8)
        - `codeRepository é o repositoryUrl e programmingLanguage só traz linguagens, sem repetição` (CA8)
          Se algum falhar por defeito real (hoje não se espera), corrigir `src/utils/buildProjectJsonLd.ts` e registrar a causa em "Notas" da spec.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/buildProjectJsonLd.test.ts`
    - **Feito quando:** o gate passa e cada teste listado existe com o ID do critério
    - **Evidência:** `src/utils/test/buildProjectJsonLd.test.ts:17-110` (`describe.each` em pt-BR/en/es, 6 `it`); gate verde (typecheck, lint, 32 testes dos dois arquivos); commit b02c0e3.

- [x] T2 [P] — Teste sobre os dados reais: seis projetos x três idiomas (#208)
    - **Arquivo(s):** `src/utils/test/buildProjectJsonLd.test.ts` (ou arquivo novo `src/utils/test/buildProjectJsonLd.content.test.ts` se o primeiro ficar grande), lendo `public/content/<idioma>/projects.json` com os utilitários de `src/testUtils/` (`readContentSnapshot`/`projectsOf`; conferir o que expõe antes)
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - `todo projeto real, nos três idiomas, vira SoftwareSourceCode com name, description, url absoluta, author, codeRepository e ao menos uma programmingLanguage` (CA9)
        - `são seis projetos por idioma` (CA7/CA9; protege contra projeto novo sem repositório passar calado)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/buildProjectJsonLd.test.ts`
    - **Feito quando:** o gate passa e o teste percorre 18 combinações
    - **Evidência:** `src/utils/test/buildProjectJsonLd.content.test.ts` (6 projetos e SoftwareSourceCode x 3 idiomas = 18 combinações via `readContentSnapshot`/`projectsOf`); gate verde; commit a13bd67.

- [x] T3 — Construtor `buildBreadcrumbJsonLd` (#201)
    - **Arquivo(s):** `src/utils/buildBreadcrumbJsonLd.ts`, `src/utils/test/buildBreadcrumbJsonLd.test.ts`
    - **Depende de:** nenhuma (fase 2: segue após T1/T2 só para manter a suíte leve)
    - **Testes (escritos antes, RED):**
        - `lista vazia devolve BreadcrumbList com itemListElement vazio` (borda; CA5)
        - `um item por entrada, na ordem recebida, com position a partir de 1` (CA5)
        - `cada item é ListItem com name e item absoluto por buildAbsoluteUrl, com o idioma` (CA1; CA5)
        - `item com params (id, name) monta /<idioma>/projects/<id>/docs/<name>` (CA3)
        - `a URL respeita o prefixo de BASE_URL` (CA5; `vi.stubEnv`, restaurado no `afterEach`)
        - `escapa < ao serializar um nome com </script>` (CA11)
          Assinatura: `buildBreadcrumbJsonLd(language, items: { name: string; path: string; params?: Record<string, string> }[]): JsonLdNode`; `export default` no fim; tipo do item local (não exportado).
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/utils/test/buildBreadcrumbJsonLd.test.ts`
    - **Feito quando:** o gate passa e cada teste listado existe
    - **Evidência:** `src/utils/test/buildBreadcrumbJsonLd.test.ts` (8 testes: vazio, ordem/position, 3 idiomas, docs, BASE_URL `/portfolio/`, escape de `<`); gate verde; commit 10d95da.

- [x] T4 [P] — Breadcrumb na página de Projetos (#201)
    - **Arquivo(s):** `src/pages/hooks/useProjects.ts`, `src/pages/Projects.page.tsx`, `src/pages/test/Projects.page.test.tsx`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):**
        - `emite BreadcrumbList com Início e Projetos, nessa ordem, com URLs absolutas` (CA1)
        - `os nomes mudam com o idioma: Início/Projetos, Home/Projects, Inicio/Proyectos` (CA4; `setLanguage` dentro do `it`)
        - `a CollectionPage continua sendo o primeiro JSON-LD` (regressão; E2E usa `.first()`)
        - `sem dados carregados não emite o breadcrumb` (borda; casa com o gate do `jsonLd`)
          O hook expõe `breadcrumbJsonLd` (ou lista de itens) com `t("common:navigation.home")`/`t("common:navigation.projects")`; o `.page.tsx` só renderiza `<JsonLd>` depois do existente.
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/test/Projects.page.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado existe
    - **Evidência:** `src/pages/test/Projects.page.test.tsx` (breadcrumb 2 itens, 3 idiomas, CollectionPage primeiro, sem dados sem breadcrumb); RED visto antes do código; arquivo inteiro 85/85 verde.

- [x] T5 [P] — Breadcrumb nas páginas de Projeto e de documento (#201) e prova do `SoftwareSourceCode` na página (#208)
    - **Arquivo(s):** `src/pages/Project.page.tsx` (e o hook da página, se a lista de itens for montada fora do JSX), `src/pages/test/Project.page.test.tsx`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):**
        - `README tem BreadcrumbList com 3 itens: Início, Projetos, título do projeto` (CA2; borda: README não vira 4º item)
        - `documento além do README tem 4 itens, o último com o nome exato do documento e a URL canônica` (CA3; também com a URL em outra caixa)
        - `nomes de Início e Projetos mudam nos três idiomas` (CA4)
        - `título com </script> não quebra o script (< escapado)` (CA11)
        - `carregando, erro e documento inexistente não emitem nenhum JSON-LD` (CA6; atualizar o teste existente sem enfraquecê-lo)
        - `o SoftwareSourceCode da página traz name, description, url, author, codeRepository e programmingLanguage` (lacuna 3 da auditoria; CA8)
        - ajustar as contagens dos testes atuais ("README tem um JSON-LD…" passa a 2 scripts; documento passa a 3), mantendo os dois nós antigos
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 src/pages/test/Project.page.test.tsx`
    - **Feito quando:** o gate passa e cada teste listado existe
    - **Evidência:** `src/pages/test/Project.page.test.tsx` (README 3 itens, SETUP e setup.md 4 itens, 3 idiomas, escape de `<`, SoftwareSourceCode com os campos, contagens 2 e 3; o caso carregando/erro/inexistente já existente segue verde); arquivo inteiro 56/56 verde. Desvio: o teste "README em /docs/README.md tem 3 itens" não existe, pois essa URL é a não encontrada no app (teste existente em `Project.page.test.tsx`).

- [x] T6 — E2E dos breadcrumbs (#201)
    - **Arquivo(s):** `e2e/projects.spec.ts`, `e2e/project.spec.ts`, `e2e/project-documents.spec.ts` (estender specs existentes; já estão classificadas em `e2e/support/specClassification.ts`, sem spec novo)
    - **Depende de:** T4, T5
    - **Testes (escritos antes, RED):** (ID do requisito no título; esperar por estado, nunca por tempo)
        - `Projetos emite BreadcrumbList com 2 itens em pt-BR, en e es` (CA1, CA4)
        - `Projeto emite BreadcrumbList com 3 itens` (CA2)
        - `documento do projeto emite BreadcrumbList com 4 itens e URL absoluta do documento` (CA3)
        - `HTML sem JavaScript (pré-renderizado) já traz o BreadcrumbList` (CA1 a CA3; usar o padrão de `e2e/no-javascript.spec.ts`/`machine-files.spec.ts`)
          Conferir que as leituras `.first()` de `projects.spec.ts` continuam pegando a `CollectionPage`.
    - **Gate:** `npm run typecheck && npm run lint` (E2E roda só no CI do PR; `npm run test:e2e` exige `npm run build:fatec`)
    - **Feito quando:** typecheck e lint passam e os fluxos acima têm teste com ID do requisito no título
    - **Evidência:** `e2e/projects.spec.ts`, `e2e/project.spec.ts`, `e2e/project-documents.spec.ts` (NF-IA-08 no título, helper `e2e/support/readBreadcrumb.ts`); typecheck e lint verdes; E2E não executados aqui (rodam no CI).

- [x] T7 — Documentação e changeset
    - **Arquivo(s):** `docs/screens/projects.md`, `docs/screens/project.md` (seção "Metadados e JSON-LD": acrescentar o `BreadcrumbList`; marcar o critério de NF-IA-08 se for o caso), `docs/architecture/code-structure.md` ou `frontend.md` só se listarem os construtores de JSON-LD; changeset do PR (`npm run changeset`, `minor` pela funcionalidade nova)
    - **Depende de:** T6
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run lint`
    - **Feito quando:** as docs citam o `BreadcrumbList` das três páginas e o changeset existe
    - **Evidência:** `docs/screens/projects.md`, `docs/screens/project.md`, `docs/architecture/frontend.md`, `.changeset/structured-breadcrumbs-projects.md` (minor); lint verde.

- [ ] T8 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run test:cov` (única rodada pesada da feature; com `--maxWorkers=2` no Vitest e `uptime` conferido)
    - **Feito quando:** o gate passa
    - **Evidência:** Não executada pelo executor (build e cobertura completa ficam para o CI/orquestrador).

## Verificação manual (feature com tela, só metadados)

- Subir `npm run dev -- --port <porta> --strictPort` e abrir `/pt-BR/projects`, `/en/projects/<id>` e `/es/projects/<id>/docs/SETUP.md`; ver no código-fonte os `<script type="application/ld+json">` e confirmar itens, ordem e URLs absolutas. Nenhuma mudança visual esperada.

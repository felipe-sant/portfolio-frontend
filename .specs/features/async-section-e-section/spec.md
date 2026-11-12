# Spec: AsyncSection e Section para o padrão carregando, erro e dados

> **Tipo:** `feature` <br />
> **Status:** `aprovada` <br />
> **Issue:** `#164` <br />
> **Criado em:** `12-11-2026`

## Problema

`About.page.tsx` tem 353 linhas e repete sete vezes o mesmo bloco: `SkeletonSwap` com o esqueleto escrito na hora, `PartError` (um `LoadError` com as mesmas chaves) e o conteúdo. A seção com `<section aria-labelledby>`, `Reveal`, contêiner e `h2` também se repete (Sobre mim, Trajetória, Stack). Início (`Home.page.tsx`, quatro `SkeletonSwap`, um deles com `LoadError`) e Projetos (`Projects.page.tsx`, um `SkeletonSwap` com `LoadError`) repetem o desenho do carregando, erro e dados. Duplicação é o primeiro sinal que um revisor de Pleno procura (achado C-03 da revisão de 08/11/2026).

## Objetivo

1. `AsyncSection` em `src/components/AsyncSection.tsx`: recebe `isLoading`, `isError`, o esqueleto, os dados do erro (`title`, `description?`, `retryLabel`, `onRetry`, `id?`, `announce?`) e os filhos. Renderiza `SkeletonSwap` e, dentro dele, o `LoadError` quando `isError` e depois os filhos, na mesma ordem do HTML de hoje (a decisão do que mostrar com erro continua dos filhos, como em `Home` e `Projects`).
2. `Section` em `src/components/Section.tsx` com CSS Module: `<section aria-labelledby>` com contêiner e `h2` (`id`, texto, foco programático opcional por `tabIndex={-1}`), `Reveal` opcional e `className` para o que é de cada seção (fundo e espaçamento vertical); aceita a dica opcional abaixo do título (Trajetória).
3. `About.page.tsx` dividida em partes que usam os dois componentes: apresentação (`AboutHero`), Sobre mim (`AboutMeSection`), trajetória (`AboutTrajectory`), stack (`AboutStack`) e complementos (`AboutComplements`), em `src/components/`, sem rota própria. A página só chama `useAbout()`, monta o `<title>`, `PageMeta`, `JsonLd` e passa os dados às partes.
4. `Home.page.tsx` e `Projects.page.tsx` trocam seus blocos `SkeletonSwap` + `LoadError` por `AsyncSection` onde o padrão se repete. `Section` fica só no Informações (no Início e em Projetos a marcação das seções difere; forçar o componente ali mudaria o HTML).
5. Sem mudança visual nem de acessibilidade: o HTML renderizado de cada tela, as classes de estilo (valores iguais, só movidas), os papéis `alert`/`status`, os `id` de foco depois do retry e a ordem de `h1`/`h2` ficam iguais.

## Fora de escopo

- Fatiar `useAbout` e `useProjects` (é a #165, que vem depois desta).
- `LoadError` em `Contact.page.tsx`, `ProjectDocumentSection.tsx` e no erro de "carregar mais" de Projetos (não são `SkeletonSwap`).
- Mudar `SkeletonSwap`, `LoadError`, `Skeleton`, texto de UI, chaves de tradução, rotas, dados, pré-renderização ou E2E.
- Memoização, `React.lazy` ou qualquer otimização.

## Casos de borda

- QUANDO `isLoading` é verdadeiro ENTÃO `AsyncSection` DEVE mostrar só o esqueleto (sem `LoadError` nem filhos), como o `SkeletonSwap` faz hoje.
- QUANDO `isError` é verdadeiro e `isLoading` falso ENTÃO DEVE mostrar o `LoadError` antes dos filhos; `announce` ausente vale `true` (`role="alert"`) e `announce={false}` não põe `role`; o `id` é repassado (foco depois do retry em `useAbout` e `useHome`).
- QUANDO a movimentação é reduzida ENTÃO o comportamento da troca esqueleto-conteúdo segue o do `SkeletonSwap` (sem sobreposição), sem lógica nova em `AsyncSection`.
- QUANDO o idioma muda ENTÃO os textos de erro continuam vindo de `t()` do namespace de cada tela (as partes recebem o texto pronto ou chamam `useTranslation` com o mesmo namespace de hoje).
- QUANDO `Section` recebe `reveal` ENTÃO o elemento com `useReveal` DEVE manter `suppressHydrationWarning` (regra de `Reveal`, já existente).

## Critérios de aceite

- [ ] CA1: `AsyncSection` cobre carregando, erro (com e sem `announce`, com `id`) e dados, e passa em `expectNoAxeViolations`. Teste: `src/components/test/AsyncSection.test.tsx`.
- [ ] CA2: `Section` rende `<section>` rotulada pelo `h2` (`aria-labelledby`), com e sem `reveal`, com e sem dica, com `h2` focável; passa em `expectNoAxeViolations`. Teste: `src/components/test/Section.test.tsx`.
- [ ] CA3: as cinco partes de Informações existem como componentes, cada uma com teste de renderização dos três estados e axe; `About.page.tsx` fica sem `SkeletonSwap` nem `LoadError` diretos e abaixo de 120 linhas. Testes: `src/components/test/About*.test.tsx` e `src/pages/test/About.page.test.tsx` (inalterado, verde).
- [ ] CA4: `Home.page.tsx` e `Projects.page.tsx` usam `AsyncSection` onde havia `SkeletonSwap` com `LoadError`; `SkeletonSwap` sozinho (sem erro) permanece onde é só troca de esqueleto. Testes: `src/pages/test/Home.page.test.tsx` e `Projects.page.test.tsx`, inalterados e verdes.
- [ ] CA5 (sem regressão visual nem de a11y): testes de unidade, `npm run test:e2e` (axe incluso) e a pré-renderização verdes, sem edição de asserção; o HTML pré-renderizado de `/pt-BR/about` é igual ao de antes (comparado no CI/ensaio local por `npm run build`).
- [ ] CA6: nenhuma classe usada como `css.x` falta no módulo importado; `about.module.css` perde só o que migrou para `section.module.css` (`.container`, `.sectionHeading`, `.hint` se for o caso), com os mesmos valores.
- [ ] CA7: `docs/architecture/components.md` lista `AsyncSection`, `Section` e as cinco partes.

## Estratégia de validação

- **Checagens automatizadas:** testes dos CA1 a CA4 com `npm test -- --run --maxWorkers=2 <arquivo>`; `npm run typecheck`; `npm run lint`. Build e E2E no CI do PR e na "Verificação completa".
- **Checagens manuais:** `npm run dev`, abrir `/pt-BR/about`, `/pt-BR` e `/pt-BR/projects` em tema claro e escuro, com a rede lenta (esqueleto), com falha forçada do dado (erro e "Tentar de novo") e com movimento reduzido; comparar com a `staging`.
- **Rollback / mitigação:** `git revert` do PR; nenhum dado nem contrato muda.

## Ordem com a #165 e arquivos que ela toca

A #165 (fatiar `useProjects` e `useAbout`) mexe nas mesmas páginas e vem **depois**: uma issue de cada vez, #164 primeiro, e a #165 parte da `staging` já com esta mesclada. Esta spec fixa os pontos em comum para a #165 não refazer trabalho:

- As partes de Informações recebem como props os mesmos grupos que `useAbout()` já devolve (`profile`, `timeline`, `ids`, `show`, e assim por diante), sem remodelar o hook: a #165 só troca a origem desses subobjetos.
- Arquivos desta spec que a #165 também toca: `src/pages/About.page.tsx`, `src/pages/Projects.page.tsx`, `src/pages/hooks/useAbout.ts` (esta spec **não** o altera) e `src/pages/hooks/useProjects.ts` (idem), mais `src/pages/test/About.page.test.tsx`, `src/pages/test/Projects.page.test.tsx` e os testes de hook em `src/pages/hooks/test/`.
- Arquivos só da #164: `src/components/AsyncSection.tsx`, `Section.tsx`, `AboutHero.tsx`, `AboutMeSection.tsx`, `AboutTrajectory.tsx`, `AboutStack.tsx`, `AboutComplements.tsx`, `src/styles/components/section.module.css` (e os de cada parte, se preciso), `src/styles/pages/about.module.css`, `src/pages/Home.page.tsx`, `docs/architecture/components.md`, os testes novos em `src/components/test/`.

## Questões em aberto (para o PO)

1. **Alcance.** Proposta: `AsyncSection` em Informações, Início e Projetos; `Section` só em Informações. Alternativa: só Informações (critério de aceite literal da issue) e Início e Projetos ficam para outra issue. Recomendo a proposta: a descrição da issue cita as três telas, e o risco no Início e em Projetos é baixo (o HTML não muda).
2. **Nome e lugar das partes.** Proposta: `AboutHero`, `AboutMeSection`, `AboutTrajectory`, `AboutStack`, `AboutComplements` em `src/components/` (convenção do repositório: componente de tela fica em `components/`, a página só monta). Alternativa: subpasta `src/pages/about/`, que o repositório hoje não usa. Recomendo a proposta.
3. **Mensagem de erro por parte.** Hoje `PartError` repete `loadError.message` e `loadError.retry` de `about`. Proposta: as partes de Informações montam `error` de `AsyncSection` com essas duas chaves (sem texto novo, sem chave nova). Confirma que nenhuma chave muda?

## Notas / decisões

- **`AsyncSection` sem CSS Module.** Ela só compõe `SkeletonSwap` e `LoadError`, que já têm estilo; não há classe para criar. A convenção de módulo por componente vale quando o componente tem estilo próprio (`Section` tem).
- **Por que o erro e os filhos continuam juntos.** Hoje, com erro, alguns blocos mostram o `LoadError` e também os filhos (listas vazias na trajetória; `StackGroupList` na stack) e outros escondem os filhos (Início usa `!status.isError`). Mudar isso mudaria o HTML e a pré-renderização; `AsyncSection` repete o comportamento atual e deixa a decisão aos filhos.
- **Sem dependência nova.** Só componentes e CSS do próprio repositório.
- **R1, R2 e R3.** Sem texto de UI novo (R2 não se aplica além de manter as chaves), sem tela nova e sem decisão de design aplicável: é refatoração com o resultado visual idêntico (R3: convenções do repositório).
- **Natureza.** Refatoração: tipo `Refactor :recycle:`; documentação do catálogo em `Docs :bulb:`. Changeset: `npm run changeset -- --empty` (não altera o comportamento do site).

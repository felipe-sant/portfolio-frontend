# Spec: Testes instáveis de "Limpar filtros" e do cliente HTTP com BASE_URL

> **Tipo:** `bug` <br />
> **Status:** `implementada` <br />
> **Issue:** `#247` <br />
> **Criado em:** `12-11-2026`

## Problema

Dois testes de unidade falham de forma intermitente no CI e atrapalham outras entregas:

- `src/pages/test/Projects.page.test.tsx`, "mostra Limpar filtros só com busca, tipo ou categoria e o zera mantendo a ordenação": esperava 10 cards e veio 9 depois de 5125 ms (o `waitFor` esgotou).
- Os testes que trocam `BASE_URL` e recarregam módulos com `vi.resetModules()` + `import()` dinâmico: `src/store/api/test/profile.api.test.tsx` e `src/store/api/test/projects.api.test.tsx` ("pede o arquivo(s) com o prefixo do GitHub Pages e não chama a API"), além de `src/services/content/test/loadProjectRecords.test.ts`, `src/testUtils/test/stubContentFetch.test.ts` e `src/prerender/test/mountClient.test.tsx`. Todos restauram o ambiente em `afterEach` com `vi.unstubAllEnvs()`, então o suspeito não é vazamento de valor, e sim tempo e ordem.

## Causas prováveis (a confirmar pela reprodução, tarefa T1)

1. **Limpar filtros:** o teste clica no filtro "Web" e, sem esperar o filtro ser aplicado, clica em "Carregar mais" (botão que ainda pertence à lista sem filtro). Quando o filtro chega depois do clique, as páginas são reiniciadas e a lista volta a 9 cards, nunca chegando a 10. Falta esperar o estado resultante do filtro (endereço com o tipo e contagem "9 de 10 projetos") antes de pedir mais.
2. **BASE_URL:** a importação dinâmica depois de `vi.resetModules()` recarrega a árvore inteira (store, React, testUtils) dentro do tempo padrão de 5 s do teste; sob carga estoura o timeout, e a espera por `findByText` usa o limite de 5 s sem relação com o carregamento do módulo.

## Objetivo

Os dois grupos de teste passam de forma estável em execuções repetidas e com a máquina carregada, esperando por estado (nunca por tempo) e sem aumentar timeout.

## Fora de escopo

- Testes E2E de Projetos (#239).
- Alterar código de produção, salvo se a reprodução provar defeito real (nesse caso volta para revisão da spec).
- Subir `testTimeout`, `asyncUtilTimeout` ou usar `setTimeout`/sleep como solução.

## Critérios de aceite

- [x] O teste de "Limpar filtros" espera o filtro de tipo ser aplicado (endereço e contagem) antes de clicar em "Carregar mais".
- [x] O teste passa em execuções repetidas (4 rodadas completas registradas) do arquivo com `--maxWorkers=2` e carga artificial na máquina.
- [ ] Parte 2 (`BASE_URL`): **não reproduzida**. Decisão do PO: a issue fecha só com a parte 1; se a falha voltar no CI, abrir nova issue com o log.
- [x] Nenhum timeout aumentado e nenhum comentário no código.

## Parte 2: não reproduzida (evidência)

Onde procurei, sob carga artificial (4 a 8 laços de CPU, load de 9 a 36) e com `--maxWorkers=2`:

- `src/store/api/test/profile.api.test.tsx` e `projects.api.test.tsx` (import dinâmico após `vi.resetModules()`): 189 ms o teste de `BASE_URL`, 1181 ms o primeiro teste do arquivo.
- `src/services/http/test/` (21 testes): nenhum acima de 100 ms.
- `src/prerender/test/mountClient.test.tsx` (indicado pelo Reviewer), 6 rodadas completas, 26 de 26 verdes em todas: o mais lento é "renderiza no cliente usando o BASE_URL como basename", com 1075 a 4750 ms (primeiro teste do arquivo, que carrega o app inteiro); os demais ficam em 0,2 a 3,6 s. O limite efetivo é de 30 s por teste (`testTimeout`) e 10 s por espera do Testing Library, então a margem existe.
- Todos os arquivos que usam `vi.stubEnv("BASE_URL")` restauram com `vi.unstubAllEnvs()` no `afterEach`; não há vazamento de valor.

## Estratégia de validação

- **Checagens automatizadas:** `npm run typecheck`, `npm run lint`, `npx vitest --run --maxWorkers=2` nos arquivos afetados, repetidos em laço sob carga; o CI do PR roda build e E2E.
- **Reprodução antes da correção:** atrasar a resposta do conteúdo depois do clique no filtro (`holdFetchAfter`) torna a corrida do item 1 determinística; para o item 2, medir a duração do `import()` sob carga.
- **Rollback:** reverter o commit de teste.

# Spec: executor-so-gate-leve

> **Tipo:** `feature` (Perf na branch e no commit) <br />
> **Status:** `implementada` <br />
> **Issue:** `#218` <br />
> **Criado em:** `11-11-2026`

Feature sem tela: só documentação do fluxo de agentes (`.claude/`). O `qa` não se aplica.

## Problema

O `executor` roda a compilação completa e a suíte inteira depois de cada tarefa. Em `.claude/agents/executor.md`, a seção "Verificação" manda rodar, "depois de cada tarefa relevante", `npm run typecheck`, `npm run build`, `npm test -- --run` e `npm run lint`. Isso custa de 20 a 60 minutos por feature, em uma máquina compartilhada com outros projetos, e o resultado dessas rodadas é repetido pelo `tester` no fim (`npm run test:cov`). A skill `tdd-patterns` (seção 2, passo 5) já diz "typecheck, lint e testes afetados; `test:cov` no fim da feature", então o `executor.md` contradiz a skill.

## Objetivo

Deixar explícita, nas instruções do agente, a ordem de verificação:

1. Por tarefa: só `npm run typecheck`, `npm run lint` e `npm test -- --run <arquivo de teste alterado>`.
2. Uma única vez, no fim da feature (depois da última tarefa do `tasks.md`, antes de chamar o `reviewer` ou fechar): `npm run build` e `npm run test:cov`.

## Fora de escopo

- Mudar o `reviewer`, o `qa` e o `tester` (o `tester` já roda `test:cov` no fim; o `reviewer` roda a verificação por conta própria).
- Mudar CI, Husky, scripts do `package.json` ou o threshold de cobertura.
- Reescrever a seção de versionamento de specs do `executor.md` (é da #217).
- Teste automatizado sobre o texto dos arquivos de `.claude/` (ver "Notas / decisões").

## Casos de borda

- QUANDO uma tarefa não muda comportamento (documentação, config) ENTÃO o gate por tarefa continua sendo `typecheck` e `lint`, sem teste, e o `build` continua só no fim.
- QUANDO uma tarefa altera um arquivo compartilhado cujos testes estão em outros arquivos ENTÃO o `tasks.md` lista esses arquivos de teste no gate da tarefa; a suíte inteira não entra por tarefa.
- QUANDO o `build` ou o `test:cov` falhar no fim ENTÃO o executor corrige em commit atômico novo e repete só o que falhou, mais o gate leve da área tocada.

## Critérios de aceite

- [x] CA1 (issue 1): a seção "Verificação" de `.claude/agents/executor.md` lista por tarefa apenas `npm run typecheck`, `npm run lint` e `npm test -- --run <arquivo de teste alterado>`, e proíbe `npm run build` e a suíte completa por tarefa.
- [x] CA2 (issue 2): a mesma seção tem um bloco "No fim da feature" com `npm run build` e `npm run test:cov`, rodados uma vez, depois da última tarefa e antes do `reviewer` ou do fechamento, e diz o que fazer se falharem.
- [x] CA3 (issue 3): a linha "rode o Gate" do item "Implemente em TDD" e o texto de "Fluxo" do `executor.md` são coerentes com CA1 e CA2 (o Gate é o gate leve; a verificação completa roda uma vez no fim).
- [x] CA4: `grep -n "npm run build\|test:cov" .claude/agents/executor.md` retorna apenas linhas do bloco "No fim da feature" (ou da proibição por tarefa).
- [x] CA5: as listas de conferência das skills de scaffold (`react-component-scaffold`, `react-page-scaffold`, `redux-store-scaffold`, `rtk-query-endpoint-scaffold`, `vitest-specialist`) não mandam rodar `npm run build` nem a suíte completa por tarefa.
- [x] CA6: o `.specs/_template/tasks.md` e o `sdd.md` deixam o executor chegar à verificação completa: o template traz uma tarefa final de exemplo "Verificação completa" com `npm run build` e `npm run test:cov`, e o `sdd.md` manda incluí-la como última tarefa de toda feature.
- [x] CA7: `npm run lint` e `npm run typecheck` passam e `npm test -- --run scripts/test/contributingTypesTable.test.ts` continua verde (nenhum arquivo versionado quebra).

## Estratégia de validação

- **Checagens automatizadas:** `npm run typecheck`, `npm run lint` e o teste de `scripts/test/contributingTypesTable.test.ts` (o `CLAUDE.md` não deve ser tocado, ou a tabela de tipos precisa seguir igual).
- **Checagens manuais:** leitura do diff de `executor.md` e `grep` dos CA4 e CA5.
- **Rollback / mitigação:** reverter o commit; é só texto.

## Pré-condição de execução e conflito com a #217

- **Depende da #217** (versionamento das specs, branch `chore/217-versiona-specs-na-branch`): as duas editam `.claude/agents/executor.md`. Hoje o `executor.md` diz que `.specs/features/<slug>/` é gitignored e não é commitado; a #217 muda isso.
- **Esta branch será refeita (rebase ou recriação) sobre a da #217 quando ela estiver pronta.** O executor só começa depois disso; antes, a spec fica em `em-revisao`/`aprovada` sem execução.
- Para minimizar o conflito, as tarefas editam só a seção "Verificação" e as linhas diretamente ligadas ao gate (a linha "rode o Gate" e o parágrafo de "Fluxo"). Não tocam nas linhas de "Commits e PR" sobre versionamento de specs.
- Risco: se a #217 reescrever a seção "Verificação" ou "Fluxo", o executor resolve o conflito mantendo as duas intenções (a dela e a ordem de verificação desta spec) e relata.

## Questões em aberto

- `test:cov` existe (`"test:cov": "vitest run --coverage"`, `package.json` linha 39), então não há decisão pendente sobre o comando.
- Os arquivos de scaffold (CA5) devem ser ajustados nesta issue ou numa separada? Proposta: aqui, porque mandam o `build` por tarefa e contradizem a ordem pedida. Se o PO preferir separar, cortar T3.
- O `reviewer` roda `npm run build` e `npm test -- --run` (linha 19 de `reviewer.md`) mais uma vez; manter, pois é revisão independente? Proposta: fora de escopo.
- O `build` falhar só no fim pode esconder um erro de pré-renderização descoberto tarde. Aceito como custo do ganho; o `typecheck` por tarefa cobre a parte de tipos do `build`.

## Notas / decisões

- **Teste de script não se aplica.** O padrão `scripts/test/contributingTypesTable.test.ts` existe porque o `CLAUDE.md` e o `CONTRIBUTING.md` guardam uma tabela estruturada que precisa ficar igual. Aqui o conteúdo é prosa de instrução; um teste que afirmasse trechos de texto seria frágil e travaria edição legítima. A verificação é por leitura e `grep` (CA4 e CA5). Os campos "Testes" das tarefas ficam `não se aplica`.
- **`tdd-patterns`: sem mudança.** O passo 5 da seção 2 já diz o gate leve por tarefa e `test:cov` no fim da feature; não há o que acrescentar sem inflar.
- **Template e `sdd.md`: o mínimo é a tarefa final.** O gate de exemplo do template já é leve; o que falta é a tarefa que roda o pesado uma vez. Uma tarefa final no template e uma linha no `sdd.md` resolvem; nada além.
- Decisões de design (`Dnn`, `PIn`): nenhuma se aplica (sem tela, texto de UI ou dado).
- **Aprovação (11/11/2026):** o Felipe aprovou a spec com as propostas: (a) ajustar as cinco skills de scaffold nesta issue (T3 fica); (b) `reviewer.md` fora do escopo; (c) aceitar que erro de pré-renderização só apareça no fim da feature. O `executor` só começa depois que a #217 terminar e esta branch for refeita sobre ela.

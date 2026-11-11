# Desempenho do E2E no CI

Registro da medição, da classificação dos specs e das decisões que reduzem o tempo do check `E2E` (issue #123). A meta é a média de até 6 min em `push`, em 5 execuções.

## Como medir

```bash
npm run build:fatec && npm run build:fatec:form
npm run test:e2e:timings
npm run e2e:rank
```

`test:e2e:timings` roda a suíte com os reporters `json` e `list` e grava `e2e-timings/report.json` (gitignored). `e2e:rank` lê esse arquivo (ou o caminho passado como argumento) e imprime os 20 testes mais lentos e o tempo somado por arquivo e por projeto; os retries de um mesmo teste são somados. No CI, rode com `CI=1` para usar `workers` e `retries` do CI.

## Linha de base

- CI em 08/11/2026, antes das mudanças: job `E2E` com cerca de 15 min, sendo ~14m25s no `npm run test:e2e` (2504 testes, 2 workers, `retries: 2`) e ~1 min de preparação (Chromium 22s, dois builds ~8s cada, `npm ci` 5s).
- Máquina local (12 núcleos, 6 workers, sem `fullyParallel`), antes das mudanças: 18m45s, 2459 passaram, 44 foram ignorados e 1 falhou (`navigation.spec.ts` "RF-LAY-08: voltar do navegador com o menu aberto fecha o painel", `mobile-dark`, falha única nesta execução). Os tempos por teste abaixo são locais e inflados pela concorrência de 6 workers com o `preview:fatec`; valem para comparar a proporção entre testes, não para prever o CI.

### 20 testes mais lentos (linha de base local)

| Duração | Projeto       | Arquivo                     | Teste                                                                                                                                                         |
| ------- | ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13.4 s  | desktop-dark  | `project-gallery.spec.ts`   | A11Y-G04, A11Y-G10: a galeria e a lightbox aberta não têm violações do axe                                                                                    |
| 10.8 s  | desktop-light | `resume.spec.ts`            | RF-HOME-07: abrir e fechar em seguida nos três idiomas não gera erro no console                                                                               |
| 10.6 s  | desktop-light | `resume.spec.ts`            | RF-HOME-07: enquanto o PDF carrega o modal mostra o estado de carregamento e os dois links                                                                    |
| 10.0 s  | desktop-light | `project-documents.spec.ts` | A11Y-G04, A11Y-G10, A11Y-PJ08: um documento com blocos de código de nomes distintos e uma tabela não tem violações do axe, com contraste                      |
| 9.7 s   | desktop-dark  | `projects-filters.spec.ts`  | RF-PROJECTS-30, A11Y-PS09: o Tab e o Shift+Tab circulam só dentro do modal                                                                                    |
| 9.4 s   | desktop-dark  | `projects-filters.spec.ts`  | RF-PROJECTS-31, A11Y-PS11: as tecnologias do perfil sem projeto aparecem desabilitadas em es, fora do Tab e sem marcar, e as com projeto ficam habilitadas    |
| 9.3 s   | desktop-dark  | `project-documents.spec.ts` | A11Y-G04, A11Y-G10, A11Y-PJ08: um documento com blocos de código de nomes distintos e uma tabela não tem violações do axe, com contraste                      |
| 9.3 s   | desktop-dark  | `resume.spec.ts`            | RF-HOME-07: o modal aberto não tem violações do axe                                                                                                           |
| 9.2 s   | desktop-light | `project-gallery.spec.ts`   | A11Y-G04, A11Y-G10: a galeria e a lightbox aberta não têm violações do axe                                                                                    |
| 8.9 s   | mobile-dark   | `project-gallery.spec.ts`   | A11Y-G04, A11Y-G10: a galeria e a lightbox aberta não têm violações do axe                                                                                    |
| 8.8 s   | mobile-light  | `accessibility.spec.ts`     | /pt-BR não tem violações do axe                                                                                                                               |
| 8.7 s   | desktop-dark  | `accessibility.spec.ts`     | /es/projects/01a131df-93ee-72f3-8c7a-f67501e47a7a não tem violações do axe                                                                                    |
| 8.6 s   | mobile-dark   | `accessibility.spec.ts`     | /es/about não tem violações do axe                                                                                                                            |
| 8.4 s   | desktop-dark  | `projects-filters.spec.ts`  | RF-PROJECTS-31, A11Y-PS11: as tecnologias do perfil sem projeto aparecem desabilitadas em en, fora do Tab e sem marcar, e as com projeto ficam habilitadas    |
| 8.3 s   | desktop-light | `resume.spec.ts`            | RF-HOME-07: o modal aberto não tem violações do axe                                                                                                           |
| 8.3 s   | desktop-dark  | `projects-filters.spec.ts`  | RF-PROJECTS-31, A11Y-PS11: as tecnologias do perfil sem projeto aparecem desabilitadas em pt-BR, fora do Tab e sem marcar, e as com projeto ficam habilitadas |
| 8.2 s   | mobile-dark   | `projects-filters.spec.ts`  | RF-PROJECTS-30, A11Y-PS09: o Tab e o Shift+Tab circulam só dentro do modal                                                                                    |
| 8.2 s   | mobile-light  | `resume.spec.ts`            | RF-HOME-07: abrir e fechar em seguida nos três idiomas não gera erro no console                                                                               |
| 8.2 s   | desktop-light | `resume.spec.ts`            | RF-LAY-27: o modal aberto não tem violações do axe                                                                                                            |
| 8.1 s   | desktop-dark  | `language.spec.ts`          | RF-LAY-14: a troca de idioma por clique preserva a posição de rolagem                                                                                         |

### Tempo por arquivo (linha de base local)

| Arquivo                     | Testes | Tempo somado |
| --------------------------- | ------ | ------------ |
| `resume.spec.ts`            | 360    | 978.4 s      |
| `projects-filters.spec.ts`  | 168    | 598.4 s      |
| `projects.spec.ts`          | 248    | 596.2 s      |
| `accessibility.spec.ts`     | 92     | 537.8 s      |
| `contact-form.spec.ts`      | 164    | 491.4 s      |
| `project-documents.spec.ts` | 152    | 375.8 s      |
| `about.spec.ts`             | 164    | 367.0 s      |
| `project.spec.ts`           | 160    | 355.9 s      |
| `project-gallery.spec.ts`   | 96     | 278.9 s      |
| `home-flows.spec.ts`        | 120    | 265.9 s      |
| `contact.spec.ts`           | 140    | 222.4 s      |
| `no-javascript.spec.ts`     | 208    | 206.9 s      |
| `navigation.spec.ts`        | 80     | 161.4 s      |
| `language.spec.ts`          | 68     | 153.2 s      |
| `home.spec.ts`              | 64     | 118.9 s      |
| `footer.spec.ts`            | 52     | 104.1 s      |
| `not-found.spec.ts`         | 48     | 83.4 s       |
| `motion.spec.ts`            | 28     | 78.0 s       |
| `theme.spec.ts`             | 24     | 55.9 s       |
| `keyboard.spec.ts`          | 12     | 45.4 s       |
| `machine-files.spec.ts`     | 56     | 25.7 s       |

### Tempo por projeto (linha de base local)

| Projeto                      | Testes | Tempo somado |
| ---------------------------- | ------ | ------------ |
| `desktop-dark`               | 585    | 1533.1 s     |
| `desktop-light`              | 585    | 1440.5 s     |
| `mobile-dark`                | 585    | 1416.0 s     |
| `mobile-light`               | 585    | 1220.0 s     |
| `contact-form-mobile-light`  | 41     | 133.7 s      |
| `contact-form-mobile-dark`   | 41     | 131.1 s      |
| `contact-form-desktop-light` | 41     | 127.5 s      |
| `contact-form-desktop-dark`  | 41     | 99.1 s       |

## Medição da #171 (enxugar testes)

A #171 reduziu a suíte do Vitest; o E2E ficou como estava (a redução dos specs de E2E ficou fora do escopo por decisão do PO). Máquina local de 12 núcleos, com carga alta e variável de outros processos (`load average` entre 8 e 15 durante as medições finais), então o tempo de parede vale como ordem de grandeza e a contagem de testes é o resultado confiável.

| Medida                    | Antes     | Depois    |
| ------------------------- | --------- | --------- |
| Vitest, arquivos de teste | 318       | 310       |
| Vitest, testes            | 2802      | 2704      |
| Cobertura, statements     | 98,97     | 98,94     |
| Cobertura, branches       | 94,92     | 94,88     |
| Cobertura, functions      | 99,32     | 99,23     |
| Cobertura, lines          | 98,95     | 98,92     |
| E2E, testes (`--list`)    | 2306      | 2306      |
| E2E, passaram e ignorados | 2262 e 44 | 2262 e 44 |

O E2E levou 13m43s na linha de base e 16m30s na medição final, com a mesma lista de testes: a diferença é a carga da máquina, não a suíte. Os IDs de requisito dos títulos de `home`, `keyboard` e `resume` mudaram e os testes passaram.

## Paralelismo

`playwright.config.ts` liga `fullyParallel: true` (qualquer ambiente) e fixa `workers` em 4 no CI (o runner `ubuntu-latest` tem 4 vCPU); fora do CI `workers` fica `undefined`, o padrão do Playwright.

### Dependência de ordem

Varredura de `e2e/` (specs e `e2e/support/`) por `describe.serial`, `describe.configure`, `beforeAll`, `afterAll`, variável de módulo mutável (`let` e `var` no topo), `writeFile`/`appendFile` e estado compartilhado:

- Nenhuma ocorrência de `describe.serial`, `describe.configure`, `beforeAll`, `afterAll`, `let`/`var` de módulo nem escrita em arquivo.
- `localStorage` e `sessionStorage` aparecem só em `contact-form`, `language` e `theme`, sempre dentro do contexto do próprio teste (o Playwright cria um contexto de navegador novo por teste), nunca entre testes.
- O único estado externo compartilhado é o servidor `preview:fatec` (somente leitura do `dist/`).

Conclusão: nenhum teste depende de ordem, e nenhum spec precisou de correção.

### Medição de `workers`

A escolha de `workers` (3, 4 ou 6) precisa do runner de 4 vCPU do CI; uma máquina local não reproduz a contenção (a máquina local de 12 núcleos roda com carga de outros processos e dá tempos que não se comparam com o CI). Procedimento, rodado no CI com `CI=1 npm run test:e2e:timings` e o valor trocado em `playwright.config.ts`: registrar a duração do passo e os testes instáveis (`flaky` no JSON) de 3 execuções seguidas por valor e ficar com o menor valor que bate a meta sem teste instável.

| `workers` | Duração do passo `test:e2e` | Instáveis | Escolha |
| --------- | --------------------------- | --------- | ------- |
| 3         | pendente (CI)               |           |         |
| 4         | pendente (CI)               |           |         |
| 6         | pendente (CI)               |           |         |

Valor provisório no código: 4.

Execução local de verificação (após as tarefas de classificação e de projetos, `CI=1`, `taskset -c 0-3`, 4 workers, `retries: 2` na ocasião, máquina com carga de outros processos): 2180 testes, 2131 passaram, 44 ignorados, 5 instáveis (passaram no retry), 0 falhas, 22m54s. Os instáveis:

- `accessibility.spec.ts`, `/pt-BR` e `/es` em `desktop-light`: `scrollable-region-focusable` na faixa de stack (`StackMarquee`), dependente de tempo.
- `project-documents.spec.ts`: dois testes de âncora (`mobile-light`, `mobile-dark`) e o axe do documento (`mobile-dark`).

Esses instáveis já podiam existir antes (a linha de base local, sem retries, teve uma falha de outro teste), e a CA6 exige zero teste que passe só por retry: ver a seção "Pendências" no fim.

## Classificação dos specs

Cada `e2e/*.spec.ts` está em exatamente uma lista de `e2e/support/specClassification.ts`. `scripts/test/specClassification.test.ts` falha com spec fora das listas, com arquivo inexistente na lista, com os specs obrigatórios (`accessibility`, `theme`, `navigation`, `contact-form`, `resume`, `projects-filters`, `project-gallery`) fora de `perEnvironmentSpecs` e com spec que usa `expectNoAxeViolations`, `emulateMedia`, `setViewportSize`, `viewportSize`, `testInfo`, `test.skip(` ou `test.fail(` fora dela.

| Spec                | Classe       | Motivo                                                                                             |
| ------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `about`             | por ambiente | `setViewportSize` e `testInfo.project.name` (tema escuro)                                          |
| `accessibility`     | por ambiente | axe com `color-contrast` nos quatro ambientes                                                      |
| `contact-form`      | por ambiente | roda nos quatro projetos `contact-form-*` (servidor `dist-form`), tem axe e viewport               |
| `contact`           | por ambiente | `setViewportSize` e layout por largura                                                             |
| `footer`            | independente | conteúdo do rodapé, sem viewport, tema, movimento nem axe                                          |
| `home-flows`        | por ambiente | fluxos que ramificam por largura (menu mobile e desktop)                                           |
| `home`              | por ambiente | movimento pleno e reduzido, `viewportSize` com asserção por ponto de quebra                        |
| `keyboard`          | por ambiente | `test.skip` por largura: o menu existe só no mobile, então no projeto desktop tudo seria pulado    |
| `language`          | por ambiente | `viewportSize` escolhe o caminho do menu e `test.fail(` torna RF-LAY-14 asserção real só no mobile |
| `machine-files`     | independente | `robots.txt`, `sitemap.xml`, `llms*.txt`, sem navegador de layout                                  |
| `motion`            | independente | define o próprio `reducedMotion` por `test.use`, sem axe, viewport nem tema                        |
| `navigation`        | por ambiente | `setViewportSize`, menu mobile e desktop                                                           |
| `no-javascript`     | independente | HTML pré-renderizado com `javaScriptEnabled: false`, sem viewport nem tema                         |
| `not-found`         | por ambiente | `clickHomeInNavigation` ramifica entre o menu mobile e a navegação desktop                         |
| `project-documents` | por ambiente | axe do documento, movimento pleno e `setViewportSize`                                              |
| `project-gallery`   | por ambiente | axe da galeria e da lightbox, movimento                                                            |
| `project`           | por ambiente | `setViewportSize` (320 px) e ficha por largura                                                     |
| `projects-filters`  | por ambiente | modal em tela cheia no mobile, axe e movimento                                                     |
| `projects`          | por ambiente | layout em grade por largura, movimento e axe                                                       |
| `resume`            | por ambiente | modo canvas em toque e modo nativo em desktop, axe                                                 |
| `theme`             | por ambiente | tema claro e escuro                                                                                |

Divergências em relação à proposta inicial da #123: `project` e `keyboard` ficam por ambiente. `project.spec.ts` chama `setViewportSize({ width: 320 })` e `keyboard.spec.ts` pula todos os testes acima do mobile, então no projeto único (desktop) os testes de teclado do menu nunca rodariam. `language` e `not-found` também ficam por ambiente: `language.spec.ts` lê `viewportSize()` para escolher o caminho do menu e marca `test.fail(` no desktop (RF-LAY-14 só é asserção real no mobile), e `not-found.spec.ts` tem ramo do menu mobile; no projeto `independent` (1280 px) a cobertura mobile se perderia. Independentes ficam quatro specs (`footer`, `machine-files`, `motion`, `no-javascript`); `motion` define o próprio `reducedMotion` com `test.use` e não usa axe, viewport, `emulateMedia` nem `testInfo`.

## Projetos do Playwright

- `mobile-light`, `mobile-dark`, `desktop-light` e `desktop-dark` rodam só `perEnvironmentSpecs` (sem `contact-form`, que tem os próprios projetos).
- `independent` (1280x800, tema claro, `reducedMotion: "reduce"`) roda `independentSpecs` uma vez. O nome do projeto não afeta o ruleset, que exige só o job `E2E`.
- `contact-form-*` (quatro projetos, porta 4174) seguem iguais.

`npx playwright test --list`: 2254 testes, contra 2504 antes da classificação. Os testes dos quatro specs independentes, que rodavam uma vez por projeto de ambiente (4 vezes), rodam uma só no projeto `independent`; cada teste por ambiente continua rodando 4 vezes. O `motion` roda 0/70 em 10 repetições a 2 núcleos com `--retries=0`.

Mutação de verificação: mover `accessibility.spec.ts` para `independentSpecs` faz `specClassification.test.ts` falhar ("não deixa spec que depende do ambiente na lista de independentes" e "coloca todo spec em exatamente uma lista" quando ele sai de uma lista); removê-lo de `perEnvironmentSpecs` falha o teste dos obrigatórios. Mutações desfeitas.

## Ganhos menores no CI

- `retries` do CI vai de 2 para 1: o teste instável ainda passa no retry, mas custa metade. Fora do CI continua 0.
- `actions/cache` guarda `~/.cache/ms-playwright` com a chave `playwright-chromium-<SO>-<versão do @playwright/test>`; o `npm run playwright:install` (`scripts/installChromium.ts`) continua depois, porque instala as dependências do sistema e só baixa o navegador sem cache. Ele roda `npx playwright install --with-deps chromium` com até 3 tentativas, esperando 30 s e depois 90 s entre elas, só quando a instalação falha (qualquer código de saída diferente de 0); o código da última falha reprova o passo. Cada tentativa tem limite de 4 minutos: ao estourar, o grupo de processos inteiro (`npx` e `apt`) é encerrado, o log avisa o tempo excedido, a tentativa conta como falha com o código 124 e a próxima começa. As esperas somam 2 minutos, mas o pior caso de uma falha real é 3 × 4 min + 30 s + 90 s = 14 minutos (sem o limite, com o `apt` travado cerca de 10 minutos por tentativa, seriam cerca de 32 minutos). Só a instalação passa por ele; uma queda de rede de 10 minutos inteira continua não coberta.
- Os dois builds (`build:fatec` e `build:fatec:form`) seguem em passos separados: ganho de ~8 s não compensa a complicação do passo.

| Execução     | Passo `Install Chromium` | Observação                                                |
| ------------ | ------------------------ | --------------------------------------------------------- |
| Cache frio   | pendente (CI)            | referência anterior: ~22 s                                |
| Cache quente | pendente (CI)            | se o ganho for menor que 5 s, remover o cache e registrar |

## Como classificar um spec novo

1. Crie `e2e/<tema>.spec.ts` e acrescente o nome do arquivo a uma lista de `e2e/support/specClassification.ts`.
2. `perEnvironmentSpecs` se o spec usa `expectNoAxeViolations`, `emulateMedia`, `setViewportSize`, `viewportSize`, `testInfo`, `test.skip(` ou `test.fail(` por tamanho, ou se afirma algo que muda com viewport, tema ou movimento.
3. `independentSpecs` só para conteúdo, arquivos de máquina e HTML sem JavaScript, que dão o mesmo resultado em qualquer ambiente.
4. `npm test -- --run scripts/test/specClassification.test.ts` confere.

## Sharding

Decisão do PO na #123: com `workers: 4` o `ubuntu-latest` (4 vCPU) já está no limite e o E2E levou 12m0s num único runner, então a meta só se alcança dividindo a suíte entre runners.

- **N = 4.** Com ~11 min de testes, N=3 deixa ~3,7 min por fatia mais ~1 min de preparação (margem curta, porque o `--shard` divide por contagem de testes, não por duração); N=4 dá ~2,75 + ~1 = ~3,8 min. O custo em minutos de runner é parecido (~14 min contra ~15 min por execução completa); N=5 ou mais piora, porque a preparação de ~1 min por runner passa a dominar. O número está na constante `SHARD_TOTAL` do passo `Decide E2E scope`.
- **Build por fatia.** Cada fatia faz checkout, `npm ci`, Chromium (em cache) e os dois builds (`build:fatec` e `build:fatec:form`): são ~20 s e evitam artefato compartilhado entre jobs.
- **Jobs.** `E2E scope` (`name: E2E scope`) mantém a decisão de escopo por diff e emite `mode`, `specs` e `matrix`: `full` gera 4 entradas `{index,total}`, `changed` uma só (`1/1`), `none` nenhuma fatia roda. `E2E shard i/4` (`e2e-shard`, `fail-fast: false`) roda `--shard=i/N` e sobe o blob em `blob-report-i`. `E2E` é o agregador: `needs: [scope, e2e-shard]` e `if: always()`; falha se o escopo não terminou com sucesso ou, fora do `none`, se alguma fatia não terminou com `success`; passa no `none` com as fatias puladas. Só ele se chama `E2E`, o check obrigatório do ruleset.
- **Relatório.** O reporter do CI é `list` + `blob`. O agregador baixa os blobs, junta com `PLAYWRIGHT_JSON_OUTPUT_NAME=merged-report.json npx playwright merge-reports --reporter=html,json ./all-blob-reports` e sobe `playwright-report` quando falha; a duração de cada fatia aparece no nome do job e na tabela do `GITHUB_STEP_SUMMARY` do agregador. O passo `Warn about flaky tests` lê o `merged-report.json` (`npm run e2e:flaky`, `scripts/e2e/listFlakyTests.ts`) e, só quando há teste `flaky` e o escopo não é `none`, escreve o aviso e a lista no mesmo resumo, sem falhar o check (decisão do PO na #123: só avisar; reavaliar a falha obrigatória depois de 3 execuções sem `flaky`). `retries` continua 1 no CI (decisão do PO na #123): a recomendação, com os dados abaixo, é voltar a 0 quando a suíte ficar estável, para todo instável virar falha visível.
- **Conferência.** `npm run e2e:check-shards` roda `playwright test --list --reporter=json` sem shard e com cada `--shard=i/4`, e falha se algum teste (projeto, arquivo, linha e título com os `describe`) sumiu ou repetiu. Roda no agregador só no `full` e localmente sem build.
- **Medir.** Tempo total do check `E2E`: do início da primeira fatia ao fim do agregador. Soma de minutos de runner: fatias + `E2E scope` + agregador, vistos em `gh run view <id> --json jobs` (`startedAt`, `completedAt` de cada job).

## Testes instáveis

Levantamento da #123 por repetição, não por lembrança dos runs. Condição de carga: o `ubuntu-latest` de repositório público tem 4 vCPU e roda `workers: 4`, mas instável de CI quase não aparece com folga de CPU, então as repetições locais ficaram presas a poucos núcleos com `taskset` (`CI=1 taskset -c 0,1 npx playwright test e2e/<spec>.spec.ts --repeat-each=5 --retries=0 --workers=4`) e, para provar correção, a 2 núcleos (`-c 8,9`) com `--repeat-each=15` ou `30`. Sem fixar núcleos (12 núcleos, `--workers=6`, `--repeat-each=10`), `project-documents.spec.ts` deu 0 falha em 1520 execuções; presos a 2 núcleos, 4 falhas em 760. Rodar as repetições uma por vez: cada execução sobe o próprio `preview:fatec` nas portas 4173 e 4174, e duas execuções ao mesmo tempo dão `EADDRINUSE` e falsas falhas de conexão.

| Teste (arquivo:linha na descoberta)                                                               | Projeto                        | Taxa                                                                                     | Mensagem                                                                                                       | Causa raiz                                                                                                                                                                                                                                                                                                                                                                                | Correção                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `project-documents.spec.ts:245` RF-PROJECT-18, RF-LAY-32 (voltar para documento rolado)           | os quatro                      | 1/5 em cada projeto (4/20) a 2 núcleos; 1 em 3 execuções de CI; 0/1520 sem fixar núcleos | `expect(received).toBeLessThan(60)`, recebido 615                                                              | `activateDocument` voltava quando o título ganhava foco, ainda com o esqueleto do documento. `scrollToTitleOf` media a posição natural com o esqueleto (documento curto), a rolagem era depois corrigida pelo foco do link, e a posição esperada divergia da restaurada (log de `scroll` e `popstate` mostrou 2288 contra 1673). Defeito do teste; a restauração do produto estava certa. | `activateDocument` espera o `role="status"` do esqueleto sair do corpo do documento antes de medir. 0/1140 em `desktop-light` e `mobile-light` (15 repetições cada, 2 núcleos, `--retries=0`).                                                                                                                                                                                       |
| `project-documents.spec.ts:298` RF-PROJECT-25 (link `project:` com âncora)                        | `mobile-light`                 | 0/80 local (4 núcleos), 0/360 depois do ajuste; 1 em 3 execuções de CI                   | passou na nova tentativa (`flaky`)                                                                             | Não reproduzido localmente. A posição do título era lida uma vez, logo depois de `toBeInViewport`, sem esperar a rolagem assentar. Causa provável: leitura única de posição durante o assentamento do layout.                                                                                                                                                                             | As asserções de posição das âncoras usam `expect.poll` (`expectBelowNav`). 0/360 em `mobile-light` e `mobile-dark` (30 repetições, 2 núcleos). A causa só o CI confirma.                                                                                                                                                                                                             |
| `accessibility.spec.ts` `scrollable-region-focusable` na faixa `StackMarquee` em `/pt-BR` e `/es` | `desktop-light`                | 0/920 a 4 núcleos; falha determinística com o JavaScript atrasado; 1 vez no CI           | `scrollable-region-focusable: ._band_...`                                                                      | O teste esperava só o `h1` do HTML pré-renderizado. Com movimento reduzido a faixa já rola (CSS), mas o `tabindex` só chega depois da hidratação (o servidor assume movimento pleno), então o axe podia rodar antes. Reproduzido com `page.route` atrasando os `.js` em 1,5 s: 3 de 3 falhas.                                                                                             | `expectNoAxeViolations` espera, por estado (`expect.poll`, 15 s), nenhuma região rolável sem foco antes do axe; teste novo com a hidratação atrasada. Residual de produto: sem JavaScript, a faixa fica rolável sem `tabindex` quando o visitante usa movimento reduzido.                                                                                                            |
| `navigation.spec.ts:191` RF-LAY-08 (voltar do navegador com o menu aberto)                        | `mobile-dark`                  | 2/60 a 2 núcleos (0/60 em `mobile-light`); 0/720 a 4 núcleos                             | `aria-expanded` esperado `true`, recebido `false` depois do clique no Menu                                     | O teste abria o menu assim que a URL mudava. A troca de rota é uma transição do React Router: a URL muda antes da renderização, e o fechamento do menu por mudança de caminho engolia o clique.                                                                                                                                                                                           | Espera o `h1` da nova página ter foco (a rota assentou) antes de clicar no Menu. 0/120 em `mobile-dark` a 2 núcleos.                                                                                                                                                                                                                                                                 |
| `scripts/test/generateResumePdfs.test.ts` (Vitest, só no CI)                                      | Vitest                         | 1 falha em 3 execuções de CI; 0/20 execuções locais da suíte inteira                     | `Requiring @playwright/test second time`                                                                       | O `vmThreads` reaproveita o worker; `playwrightConfig.test.ts` recarregava o Playwright de verdade com `vi.resetModules()` depois de o `generateResumePdfs` já tê-lo carregado.                                                                                                                                                                                                           | `vi.mock("@playwright/test")` no `playwrightConfig.test.ts` (commit anterior da #123). Mutação desfeita (tirar o mock): 11 falhas nesta ordem. 30/30 com `--maxWorkers=1` nos dois arquivos.                                                                                                                                                                                         |
| `projects-filters.spec.ts:467` (geometria do modal) e `:845` (estado sem resultado)               | `mobile-dark` e `mobile-light` | 1/21 e 1/1260 a 2 núcleos                                                                | `toBeVisible` do `dialog`; `toHaveText` de `0 projetos` recebeu `6 de 6 projetos`; geometria `y` 8 em vez de 0 | O teste agia no botão de filtros e no campo de busca assim que o `h1` aparecia, antes de o React hidratar os controles: o clique e o `fill` se perdiam. A medida do modal era lida durante a animação de entrada.                                                                                                                                                                         | `waitForHydration` agora exige o `__reactProps` de todo controle de `main` e `openProjects` o chama; a geometria usa `getSettledBox` (`expect.poll` até duas leituras iguais); teste novo com a hidratação atrasada (RED 3/3, GREEN 3/3). 0/1290 em `mobile-dark` (30 repetições, 4 núcleos, 4 workers, `--retries=0`); 0/1560 em `project-documents` e `project` com o helper novo. |

Observação: a 2 núcleos com 4 workers (carga acima da do CI) ainda saem falhas raras de 5 s por falta de CPU em `projects-filters` (4 em 1720, texto de contagem ausente ou teste de 30 s), sem causa de teste; a 4 núcleos, a condição do CI, o spec deu 0/1290.

Sem instabilidade (0 falha, `--retries=0`, a 2 núcleos, `--workers=4`, 5 repetições por projeto, salvo onde indicado): Vitest, suíte inteira, 10 execuções e 10 com `--maxWorkers=1` (2664 testes, 299 arquivos cada, com o E2E rodando ao mesmo tempo); `accessibility`, 0/920 a 4 núcleos e, depois da correção, 0/720 em `desktop-light` (30 repetições); `navigation`, 0/720 a 4 núcleos; `project`, 0/780; `projects`, 0/1130; `home-flows`, 0/600; `no-javascript`, 0/260; `machine-files`, 0/70; `footer`, 0/65; `not-found`, 0/240; `about`, 0/820; `contact`, 0/690; `contact-form`, 0/820; `home`, 0/310; `theme`, 0/120; `motion`, 0/140; `project-gallery`, 0/480; `keyboard`, 0/50; `resume`, 0/1800; `language`, 0 falha inesperada em 340 (o `language.spec.ts:179` é um `test.fail` conhecido do #100, esperado e fora desta tarefa). Todos os specs foram repetidos; nenhum ficou de fora.

### Como escrever teste sem instabilidade

- Espere por estado, nunca por tempo: auto-wait do Playwright, `expect(...).toBeFocused()`, `expect.poll` ou `toPass` com `timeout` e `intervals`; `waitForTimeout` é proibido.
- A URL mudar não é a página assentar: depois de navegar, espere o foco do `h1` (o `useRouteFocus` o move quando a rota assenta) antes de interagir.
- Documento e esqueleto: espere o `role="status"` do esqueleto sair antes de medir posição ou rolar.
- Posição de rolagem lida logo depois de um evento: leia com `expect.poll` até assentar.
- Axe roda sobre a página hidratada: `expectNoAxeViolations` já espera a região rolável ficar focável.
- Não aumente `retries` nem desligue regra do axe para esconder instável; repita com `--repeat-each=30 --retries=0` presa a poucos núcleos (`taskset -c 0,1`) antes de abrir o PR.
- No Vitest, `findBy*`/`waitFor` com condição no lugar de `setTimeout`, e `vi.unstubAllGlobals()`/`vi.unstubAllEnvs()` no `afterEach`, porque o `vmThreads` reaproveita o worker.

## Pendências (execução no CI)

Dependem de `push` e ficam para depois do PR/branch no remoto:

1. Medir `workers` 3, 4 e 6 (tabela acima), 3 execuções seguidas cada, e fixar o menor valor sem instabilidade.
2. Tempos do passo `Install Chromium` com cache frio e quente.
3. 5 execuções de `push` com a média do check `E2E` (meta: até 6 min) e 3 execuções seguidas verdes sem teste instável; se a média passar de 6 min, parar e levantar ao PO (N=5 ou balanceamento por duração é nova decisão dele).

| Execução | Duração do check `E2E` | Resultado | Instáveis |
| -------- | ---------------------- | --------- | --------- |
| 1        | pendente               |           |           |
| 2        | pendente               |           |           |
| 3        | pendente               |           |           |
| 4        | pendente               |           |           |
| 5        | pendente               |           |           |

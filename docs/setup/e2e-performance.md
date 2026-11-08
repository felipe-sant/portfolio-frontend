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

## Paralelismo

`playwright.config.ts` liga `fullyParallel: true` (qualquer ambiente) e fixa `workers` em 4 no CI (o runner `ubuntu-latest` tem 4 vCPU); fora do CI `workers` fica `undefined`, o padrão do Playwright.

### Dependência de ordem

Varredura de `e2e/` (specs e `e2e/support/`) por `describe.serial`, `describe.configure`, `beforeAll`, `afterAll`, variável de módulo mutável (`let` e `var` no topo), `writeFile`/`appendFile` e estado compartilhado:

- Nenhuma ocorrência de `describe.serial`, `describe.configure`, `beforeAll`, `afterAll`, `let`/`var` de módulo nem escrita em arquivo.
- `localStorage` e `sessionStorage` aparecem só em `contact-form`, `language` e `theme`, sempre dentro do contexto do próprio teste (o Playwright cria um contexto de navegador novo por teste), nunca entre testes.
- O único estado externo compartilhado é o servidor `preview:fatec` (somente leitura do `dist/`).

Conclusão: nenhum teste depende de ordem, e nenhum spec precisou de correção.

### Medição de `workers`

A escolha de `workers` (3, 4 ou 6, QA2) precisa do runner de 4 vCPU do CI; uma máquina local não reproduz a contenção (a máquina local de 12 núcleos roda com carga de outros processos e dá tempos que não se comparam com o CI). Procedimento, rodado no CI com `CI=1 npm run test:e2e:timings` e o valor trocado em `playwright.config.ts`: registrar a duração do passo e os testes instáveis (`flaky` no JSON) de 3 execuções seguidas por valor e ficar com o menor valor que bate a meta sem teste instável.

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

Cada `e2e/*.spec.ts` está em exatamente uma lista de `e2e/support/specClassification.ts`. `scripts/test/specClassification.test.ts` falha com spec fora das listas, com arquivo inexistente na lista, com os specs obrigatórios (`accessibility`, `theme`, `motion`, `navigation`, `contact-form`, `resume`, `projects-filters`, `project-gallery`) fora de `perEnvironmentSpecs` e com spec que usa `expectNoAxeViolations`, `emulateMedia`, `setViewportSize`, `testInfo` ou `test.skip(` fora dela.

| Spec                | Classe       | Motivo                                                                                          |
| ------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `about`             | por ambiente | `setViewportSize` e `testInfo.project.name` (tema escuro)                                       |
| `accessibility`     | por ambiente | axe com `color-contrast` nos quatro ambientes                                                   |
| `contact-form`      | por ambiente | roda nos quatro projetos `contact-form-*` (servidor `dist-form`), tem axe e viewport            |
| `contact`           | por ambiente | `setViewportSize` e layout por largura                                                          |
| `footer`            | independente | conteúdo do rodapé, sem viewport, tema, movimento nem axe                                       |
| `home-flows`        | por ambiente | fluxos que ramificam por largura (menu mobile e desktop)                                        |
| `home`              | por ambiente | movimento pleno e reduzido, `viewportSize` com asserção por ponto de quebra                     |
| `keyboard`          | por ambiente | `test.skip` por largura: o menu existe só no mobile, então no projeto desktop tudo seria pulado |
| `language`          | independente | troca de idioma, `localStorage` e rotas; só usa `viewportSize` para escolher o caminho do menu  |
| `machine-files`     | independente | `robots.txt`, `sitemap.xml`, `llms*.txt`, sem navegador de layout                               |
| `motion`            | por ambiente | movimento pleno e reduzido                                                                      |
| `navigation`        | por ambiente | `setViewportSize`, menu mobile e desktop                                                        |
| `no-javascript`     | independente | HTML pré-renderizado com `javaScriptEnabled: false`, sem viewport nem tema                      |
| `not-found`         | independente | conteúdo da página não encontrada; só usa `viewportSize` para escolher o caminho do menu        |
| `project-documents` | por ambiente | axe do documento, movimento pleno e `setViewportSize`                                           |
| `project-gallery`   | por ambiente | axe da galeria e da lightbox, movimento                                                         |
| `project`           | por ambiente | `setViewportSize` (320 px) e ficha por largura                                                  |
| `projects-filters`  | por ambiente | modal em tela cheia no mobile, axe e movimento                                                  |
| `projects`          | por ambiente | layout em grade por largura, movimento e axe                                                    |
| `resume`            | por ambiente | modo canvas em toque e modo nativo em desktop, axe                                              |
| `theme`             | por ambiente | tema claro e escuro                                                                             |

Divergências em relação à proposta da QA1: `project` e `keyboard` ficam por ambiente. `project.spec.ts` chama `setViewportSize({ width: 320 })` e `keyboard.spec.ts` pula todos os testes acima do mobile, então no projeto único (desktop) os testes de teclado do menu nunca rodariam. Independentes ficam cinco specs (`footer`, `language`, `machine-files`, `no-javascript`, `not-found`).

# Tasks: reduzir as fontes da primeira carga para até 160 KB

> Spec: `./spec.md`

## Plano de execução

```
T0 → T1 → T2 → T3 → T4
```

## Tarefas

- [ ] T0 — Conferir a dependência da #266 e a aprovação
    - **Arquivo(s):** nenhum
    - **Depende de:** spec aprovada (só humano) e PR da #266 mergeado
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `gh pr view <número da #266> --json state --jq .state` retorna `MERGED`; `git fetch origin && git merge origin/staging` sem conflito (conflito possível só em `src/styles/global.css`, `scripts/test/fontWeights.test.ts`); `npm ci`
    - **Feito quando:** a #266 está `MERGED`, a branch tem a staging e `npm run typecheck && npm test -- --run --maxWorkers=2 scripts/test/fontWeights.test.ts` passa antes de qualquer edição. Se não estiver mergeada, parar e avisar.
    - **Evidência:**

- [ ] T1 — Medir a primeira carga por rota, antes
    - **Arquivo(s):** nenhum (só medição)
    - **Depende de:** T0
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `uptime` (load ≤ 14), `npm run build:fatec` e `PREVIEW_PORT=<porta própria> npm run preview:fatec` (nunca 4173 nem 5173); Chromium soma os `woff2` pedidos em `/pt-BR`, `/en`, `/es`, `/<idioma>/projects`, `/projects/<id>`, `/about` e `/contact`
    - **Feito quando:** tabela "antes" por rota e por arquivo no PR (e a confirmação de que `/pt-BR` soma 177.508 B); anotar a largura de um texto de referência nas fontes finais para conferir o `size-adjust` da #266 depois.
    - **Evidência:**

- [ ] T2 — Teste dos caracteres e fontes reduzidas (TDD)
    - **Arquivo(s):** `scripts/test/fontCoverage.test.ts` (novo), `public/fonts/*.woff2`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - todo caractere de `src/locales/**/*.json`, `public/content/**/*.json` e `public/cv/*.md` está no `cmap` de cada `woff2` carregado na primeira carga (CA3); fica vermelho se um caractere sair do conjunto e passa nas fontes atuais
        - a soma dos `woff2` de `/pt-BR` (os 6 da primeira carga) é ≤ 160.000 B (CA1); fica vermelho com as fontes atuais (177.508 B)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --maxWorkers=2 scripts/test/fontCoverage.test.ts scripts/test/fontWeights.test.ts`
    - **Feito quando:** o segundo teste vermelho passa depois de gerar as fontes: Bricolage com `wght` 600–800 (`fonttools varLib.instancer`) e as seis fontes reduzidas ao conjunto da spec (`pyftsubset --unicodes=... --layout-features='*' --flavor=woff2`, via `uv`, fora do `package.json`), com os mesmos nomes de arquivo; arquivos `*-OFL.txt` conferidos (nome reservado).
    - **Evidência:**

- [ ] T3 — Medir depois, conferir aparência e CLS
    - **Arquivo(s):** nenhum (só medição)
    - **Depende de:** T2
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** mesmo procedimento de T1 (porta própria); capturas de `/pt-BR`, `/en/projects` e `/es/contact` em claro e escuro (393 px) contra a staging; CLS de `/pt-BR/contact`, `/en/contact` e `/es/contact` pela medida da #266
    - **Feito quando:** toda rota ≤ 160 KB com no máximo 2 `preload`; aparência igual; CLS do Contato não pior que o da #266; tabela "depois" no PR. Se alguma rota passar de 160 KB, parar e propor a opção C ou pedir decisão de D08.
    - **Evidência:**

- [ ] T4 — Docs e verificação completa
    - **Arquivo(s):** `docs/setup/` ou `docs/design/design-system.md` (como reduzir as fontes: comando e conjunto de caracteres), `docs/product/non-functional-requirements.md` só se a nota de `NF-DE-11` precisar; `.claude/CLAUDE.md` conferido (sem mudança esperada); changeset `patch`
    - **Depende de:** T3
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run typecheck && npm run lint && npm run test:cov -- --maxWorkers=2` (uma rodada) e, no PR, `gh pr checks`; `docs/product/v1-verification.md` não é tocado
    - **Feito quando:** tudo verde, checks do PR verdes (build, E2E), PR com "Relacionada à #41" e `Closes #267`.
    - **Evidência:**

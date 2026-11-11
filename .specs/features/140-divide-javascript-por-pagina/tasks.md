# Tasks: 140-divide-javascript-por-pagina

> Spec: `./spec.md`

## Plano de execução

As três mudanças de código (hidratação em transição, modal sob demanda, textos por idioma) atendem a requisitos independentes, mas T1, T3 e T5 tocam `src/prerender/test/mountClient.test.tsx`, então a ordem é sequencial. Cada tarefa vira um commit próprio (`Perf :zap: [#140] ...`). T1 pode ser revertida depois com um conflito pequeno em `mountClient.tsx`, que T5 também altera.

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8
```

Regras para o `executor`: nenhum comentário em código (nem `//`, `/* */`, JSDoc ou `{/* */}`); identificadores em inglês; nenhum texto de UI novo; nenhum estado vermelho commitado.

## Tarefas

- [x] T1 — Hidratar dentro de `startTransition` em `mountClient`
    - **Arquivo(s):** `src/prerender/mountClient.tsx`, `src/prerender/test/mountClient.test.tsx`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):**
        - PERF-140-01: com HTML pré-renderizado, `hydrateRoot` é chamado dentro do callback de `startTransition`. O teste faz mock parcial de `react` com `vi.mock("react", ...)` e `importOriginal`, com `startTransition` como espião que repassa ao original, e afirma que o espião foi chamado e que `hydrateRoot` rodou durante o callback. Arquivo: `src/prerender/test/mountClient.test.tsx`
        - PERF-140-01: o valor devolvido por `mountClient` continua sendo o `Root` da hidratação (o `unmount` dos testes existentes funciona). Arquivo: `src/prerender/test/mountClient.test.tsx`
        - PERF-140-01 (borda): sem HTML pré-renderizado (`createRoot`), `startTransition` não é chamado. Arquivo: `src/prerender/test/mountClient.test.tsx`
        - PERF-140-02: os testes existentes de hidratação sem divergência e sem `console.error` continuam passando sem mudar a expectativa. Arquivo: `src/prerender/test/mountClient.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run --project prerender`
    - **Feito quando:** o gate passa, e a ramificação `createRoot` não mudou.
    - **Evidência:** gate verde (typecheck, lint, projeto `prerender` com 21 testes). RED visto: `expected "vi.fn()" to be called 1 times, but got 0 times`.

        | Critério                                                           | `arquivo:linha` e asserção                                                                                                                                              | Coberto? |
        | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
        | PERF-140-01: `hydrateRoot` dentro do callback de `startTransition` | `src/prerender/test/mountClient.test.tsx:207` `expect(startTransition).toHaveBeenCalledTimes(1)`; `:208` `expect(transitionState.hydratedInTransition).toEqual([true])` | sim      |
        | PERF-140-01: devolve o `Root` da hidratação                        | `src/prerender/test/mountClient.test.tsx:209` `expect(mountedRoots).toEqual([vi.mocked(hydrateRoot).mock.results[0]?.value])`                                           | sim      |
        | PERF-140-01 (borda): `createRoot` sem `startTransition`            | `src/prerender/test/mountClient.test.tsx:180` `expect(startTransition).not.toHaveBeenCalled()`                                                                          | sim      |
        | PERF-140-02: hidratação sem erro nem aviso                         | testes existentes do arquivo, sem mudança de expectativa (`expect(consoleSpies.error).not.toHaveBeenCalled()`)                                                          | sim      |

        Veredito: necessários e suficientes.

- [x] T2 — Criar `LazyResumeModal`, que importa o `ResumeModal` só na primeira abertura
    - **Arquivo(s):** `src/components/LazyResumeModal.tsx`, `src/components/test/LazyResumeModal.test.tsx`
    - **Depende de:** T1
    - **Testes (escritos antes, RED):**
        - PERF-140-03 (borda): com `isOpen={false}` desde o início, nada é renderizado, e o módulo `@/components/ResumeModal` não é importado. O teste usa `vi.mock("@/components/ResumeModal", ...)` com uma fábrica que marca uma flag ao ser avaliada. Arquivo: `src/components/test/LazyResumeModal.test.tsx`
        - PERF-140-03: ao mudar `isOpen` para `true`, o diálogo "Currículo" aparece (`findByRole("dialog")`). Arquivo: `src/components/test/LazyResumeModal.test.tsx`
        - PERF-140-03: abrir, fechar e abrir de novo importa o módulo uma vez só, e o diálogo some ao fechar. Arquivo: `src/components/test/LazyResumeModal.test.tsx`
        - PERF-140-04: enquanto o módulo carrega, o conteúdo irmão do componente continua no documento (o `Suspense` é local). Arquivo: `src/components/test/LazyResumeModal.test.tsx`
        - Acessibilidade: `expectNoAxeViolations(container)` com o modal aberto. Arquivo: `src/components/test/LazyResumeModal.test.tsx`
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/components/test/LazyResumeModal.test.tsx`
    - **Feito quando:** o gate passa. As props são `LazyResumeModalProps` (`isOpen`, `onClose`), o `lazy` e o `<Suspense fallback={null}>` ficam dentro do componente, "já aberto" fica em estado atualizado no render (sem `useEffect`), com `export default` no fim.
    - **Evidência:** gate verde (typecheck, lint, 5 testes). RED visto: `Failed to resolve import "@/components/LazyResumeModal"`. Sensor: sem o `<Suspense>` local, o teste de PERF-140-04 falha.

        | Critério                                                           | `arquivo:linha` e asserção                                                                                                                                                             | Coberto? |
        | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
        | PERF-140-03 (borda): fechado não renderiza nem importa             | `src/components/test/LazyResumeModal.test.tsx:34` `expect(screen.queryByRole("dialog")).not.toBeInTheDocument()`; `:35` `expect(moduleState.evaluations).toBe(0)`                      | sim      |
        | PERF-140-03: `isOpen` para `true` mostra o diálogo                 | `src/components/test/LazyResumeModal.test.tsx:58` `expect(await screen.findByRole("dialog", { name: "Currículo" })).toBeInTheDocument()`                                               | sim      |
        | PERF-140-03: abrir, fechar, abrir importa uma vez e some ao fechar | `src/components/test/LazyResumeModal.test.tsx:68` `expect(screen.queryByRole("dialog")).not.toBeInTheDocument()`; `:72` `expect(moduleState.evaluations).toBe(1)`                      | sim      |
        | PERF-140-04: irmão visível durante a carga                         | `src/components/test/LazyResumeModal.test.tsx:41` `expect(screen.getByText("Conteúdo da página")).toBeVisible()`; `:42` `expect(screen.queryByRole("dialog")).not.toBeInTheDocument()` | sim      |
        | Acessibilidade com o modal aberto                                  | `src/components/test/LazyResumeModal.test.tsx:80` `await expectNoAxeViolations(container)`                                                                                             | sim      |

        Veredito: necessários e suficientes.

- [x] T3 — Trocar `ResumeModal` por `LazyResumeModal` nos quatro pontos de uso
    - **Arquivo(s):** `src/components/Footer.tsx`, `src/components/ContactChannels.tsx`, `src/pages/Home.page.tsx`, `src/pages/About.page.tsx`. Testes que abrem o modal e talvez precisem passar a esperar por estado (`findBy*` no lugar de `getBy*` logo após o clique): `src/components/test/Footer.test.tsx`, `src/components/test/ContactChannels.test.tsx`, `src/components/test/ResumeLink.test.tsx`, `src/pages/test/Home.page.test.tsx`, `src/pages/test/About.page.test.tsx`
    - **Depende de:** T2
    - **Testes (escritos antes, RED):**
        - PERF-140-03: nenhum arquivo de `src/` fora de `LazyResumeModal.tsx` e dos testes importa `@/components/ResumeModal`. Arquivo: `src/components/test/LazyResumeModal.test.tsx` (lê os fontes de `src/` com `node:fs` e procura o import)
        - PERF-140-05: os testes existentes que abrem o currículo pelo rodapé, pela Início, por Informações e por Contato continuam afirmando o mesmo comportamento (diálogo, foco no título, fechar devolve o foco). A única mudança permitida é esperar por estado. Arquivos: os cinco listados acima
        - PERF-140-02: a hidratação das páginas com rodapé continua sem divergência com o modal fechado. Arquivo: `src/prerender/test/mountClient.test.tsx` (testes existentes)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/components/test/Footer.test.tsx src/components/test/ContactChannels.test.tsx src/components/test/ResumeLink.test.tsx src/components/test/LazyResumeModal.test.tsx src/pages/test/Home.page.test.tsx src/pages/test/About.page.test.tsx && npm test -- --run --project prerender`
    - **Feito quando:** o gate passa e nenhum chamador renderiza `ResumeModal` direto.
    - **Evidência:** gate verde (typecheck, lint, 117 testes dos seis arquivos, 21 do projeto `prerender`). RED visto: a busca achou `ContactChannels.tsx`, `Footer.tsx`, `About.page.tsx` e `Home.page.tsx`. Depois da troca, quatro testes (`Footer`, `ContactChannels`, `Home.page`, `About.page`) passaram a esperar o diálogo por estado (`findByRole` no lugar de `getByRole`), sem mudar a expectativa; `ResumeLink.test.tsx` renderiza o `ResumeModal` direto e não mudou.

        | Critério                                                    | `arquivo:linha` e asserção                                                                                                                                                                                                                    | Coberto? |
        | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
        | PERF-140-03: só o `LazyResumeModal` importa o `ResumeModal` | `src/components/test/LazyResumeModal.test.tsx:104` `expect(importers).toEqual(["components/LazyResumeModal.tsx"])`                                                                                                                            | sim      |
        | PERF-140-05: abrir o currículo pelos quatro pontos          | `src/components/test/Footer.test.tsx`, `ContactChannels.test.tsx`, `src/pages/test/Home.page.test.tsx`, `About.page.test.tsx`: `const dialog = await screen.findByRole("dialog", { name: "Currículo" })` e a mesma asserção do `title` do PDF | sim      |
        | PERF-140-02: hidratação com o modal fechado                 | testes existentes de `src/prerender/test/mountClient.test.tsx` (`expect(consoleSpies.error).not.toHaveBeenCalled()`)                                                                                                                          | sim      |

        Veredito: necessários e suficientes.

- [ ] T4 — Separar os textos por idioma e criar `loadLanguage` (só acréscimo, sem trocar o carregamento ainda)
    - **Arquivo(s):** `src/i18n/languageBundles/ptBR.ts`, `src/i18n/languageBundles/en.ts`, `src/i18n/languageBundles/es.ts`, `src/i18n/resources.ts`, `src/i18n/loadLanguage.ts`, `src/i18n/test/loadLanguage.test.ts`, `src/i18n/test/resources.test.ts`, e o tipo do conjunto de um idioma em `src/types/i18n/LanguageResources.types.ts` se mais de um arquivo precisar dele
    - **Depende de:** T3
    - **Testes (escritos antes, RED):**
        - PERF-140-06 (borda): depois de remover os pacotes de `es` da instância (`i18n.removeResourceBundle` para os oito namespaces), `loadLanguage("es")` deixa os oito namespaces de `es` disponíveis (`i18n.hasResourceBundle`). Arquivo: `src/i18n/test/loadLanguage.test.ts`
        - PERF-140-06: duas chamadas simultâneas de `loadLanguage("es")` devolvem a mesma promessa e importam o módulo uma vez. Arquivo: `src/i18n/test/loadLanguage.test.ts`
        - PERF-140-06: com os oito namespaces já presentes, `loadLanguage` resolve sem importar o módulo. Arquivo: `src/i18n/test/loadLanguage.test.ts`
        - Caso de borda (falha de rede): se a importação rejeita, a promessa rejeita e a chamada seguinte tenta de novo. O teste usa `vi.doMock` do módulo do idioma, e quem usar `vi.stubGlobal` restaura no `afterEach`. Arquivo: `src/i18n/test/loadLanguage.test.ts`
        - PERF-140-09: `resources` continua exportando `pt-BR`, `en` e `es` com os oito namespaces, agora compostos a partir de `languageBundles`. Arquivo: `src/i18n/test/resources.test.ts` (ajustado, sem perder a checagem de chaves iguais nos três idiomas, PERF-140-12)
        - PERF-140-12: `src/i18n/test/resumeModalTexts.test.ts` continua passando, ajustado só no import se for preciso. Arquivo: o próprio
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run src/i18n && npm test -- --run --project prerender`
    - **Feito quando:** o gate passa. `i18n.ts` continua com `resources` nesta tarefa (a troca é em T5), então o app segue funcionando igual e o commit não fica vermelho.
    - **Evidência:**

- [ ] T5 — Trocar o carregamento: `i18n.ts` sem recursos, idioma carregado antes de trocar (`createLanguageLoader`, `setLanguage`) e antes de montar (`mountClient`), recursos estáticos no servidor e pré-carga nos testes
    - **Arquivo(s):** `src/i18n/i18n.ts`, `src/entry-server.tsx`, `src/setupTests.ts`, `src/routers/createLanguageLoader.ts`, `src/i18n/setLanguage.ts`, `src/prerender/mountClient.tsx`, `src/routers/test/createLanguageLoader.test.ts`, `src/i18n/test/setLanguage.test.ts`, `src/i18n/test/i18n.server.test.ts`, `src/i18n/test/i18n.test.ts`, `src/prerender/test/mountClient.test.tsx`. Tudo num commit só: separar estas mudanças deixaria o app mostrando chaves entre um commit e outro.
    - **Depende de:** T4
    - **Testes (escritos antes, RED):**
        - PERF-140-07 (borda): com os pacotes de `es` removidos da instância, o loader de `createLanguageLoader("es")` termina com `i18n.resolvedLanguage === "es"`, e `i18n.t("common:resume.modal.title")` devolve o valor de `src/locales/es/common.json` (lido do JSON no teste). Arquivo: `src/routers/test/createLanguageLoader.test.ts`
        - PERF-140-07 (borda): com os pacotes de `en` removidos, `setLanguage("en")` termina com `getLanguage() === "en"`, `i18n.t("common:resume.modal.title")` igual ao valor de `src/locales/en/common.json`, e grava a escolha como hoje. Arquivo: `src/i18n/test/setLanguage.test.ts`
        - PERF-140-06: `setLanguage("es")` e o loader de `es` chamados juntos importam o idioma uma vez. Arquivo: `src/routers/test/createLanguageLoader.test.ts`
        - PERF-140-08 (borda): com os pacotes que não são `pt-BR` removidos e o HTML pré-renderizado de uma rota `/en`, `mountClient` hidrata sem divergência e com o texto em inglês, e `i18n.resolvedLanguage` é `en` antes de `hydrateRoot` (o espião de T1 confere a ordem). Arquivo: `src/prerender/test/mountClient.test.tsx`
        - PERF-140-08: sem HTML pré-renderizado e sem prefixo válido no caminho, `mountClient` carrega `en` antes de `createRoot`. Arquivo: `src/prerender/test/mountClient.test.tsx`
        - PERF-140-09: importar `@/i18n/i18n` sem `window` nem `document` funciona, e `getLanguage()` devolve `en`. Arquivo: `src/i18n/test/i18n.server.test.ts` (ajustado ao início sem recursos)
        - PERF-140-09: a pré-renderização das fixtures (`prerenderGlobalSetup`) continua gerando o HTML dos três idiomas (testes existentes do projeto `prerender`)
        - PERF-140-10: `t("common:missingKey")` com `// @ts-expect-error` continua sendo erro de tipo, e `src/types/i18next.d.ts` continua com `import type` tipando por `pt-BR`. Arquivo: `src/i18n/test/i18n.test.ts` (a diretiva de ferramenta é a exceção permitida à regra de comentários)
        - PERF-140-11: com o `setupTests.ts` novo, a instância tem os três idiomas antes de cada teste, e os testes de tela que chamam `setLanguage` dentro do `it` continuam passando (suíte inteira)
    - **Gate:** `npm run typecheck && npm run lint && npm test -- --run`. A suíte inteira roda aqui, uma exceção ao gate leve, porque `setupTests.ts` e o início do i18n são globais e afetam todo teste que troca idioma.
    - **Feito quando:** o gate passa, `i18n.ts` não importa `resources` nem JSON de `src/locales/`, todo `i18n.changeLanguage` do código de aplicação vem depois de `await loadLanguage(...)`, e `entry-server.tsx` adiciona `resources` estaticamente antes do primeiro render.
    - **Evidência:**

- [ ] T6 — Atualizar as regras e a documentação de i18n e do modal do currículo
    - **Arquivo(s):** `.claude/CLAUDE.md` (bullet **i18n** de "Onde fica cada coisa"), `docs/architecture/frontend.md` (seções "Módulo `src/i18n/`", "Módulo `src/locales/`", a entrada de servidor e o parágrafo do `mountClient`), `docs/architecture/components.md` (catálogo: `LazyResumeModal`), `docs/screens/contact.md#implementação` (parágrafo "CV (D52)": os quatro pontos renderizam `LazyResumeModal`)
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm test -- --run scripts/test/contributingTypesTable.test.ts && npx prettier --check .claude/CLAUDE.md docs/architecture/frontend.md docs/architecture/components.md docs/screens/contact.md`
    - **Feito quando:** a regra do `.claude/CLAUDE.md` diz que namespace novo entra nos três idiomas, no `languageBundles/<idioma>.ts` de cada idioma e no `ns` de `src/i18n/i18n.ts`, e que o código de cliente não importa `resources` nem JSON de `src/locales/` (só o servidor e os testes). `frontend.md` descreve `loadLanguage`, o carregamento em `mountClient`, `createLanguageLoader` e `setLanguage`, os recursos estáticos no `entry-server.tsx` e a hidratação em `startTransition`. Nenhum texto contradiz o `CONTRIBUTING.md`.
    - **Evidência:**

- [ ] T7 — Escrever o relatório do pacote de entrada
    - **Arquivo(s):** `docs/setup/entry-bundle-performance.md`, `docs/setup/development.md` (link na lista de documentos ou junto do `check:chunk`)
    - **Depende de:** T5
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build:fatec && npm run check:chunk && npx prettier --check docs/setup/entry-bundle-performance.md docs/setup/development.md`
    - **Por que um build aqui:** a tabela "depois" só se mede sobre o `dist/assets/` do `build:fatec`, o mesmo build da análise; é a única exceção ao gate leve além de T5 e T8.
    - **Feito quando:** o relatório tem (1) a tabela "antes" da análise de 11/11/2026 (`index` 68,0 KB, `api` 31,5 KB, `paths` 27,6 KB, `resolveSupportedLanguage` 17,1 KB, cerca de 145 KB brotli no total, com o conteúdo de cada um e a nota de que os nomes vêm do primeiro módulo); (2) a tabela "depois" medida neste build com o mesmo método (brotli do `zlib` do Node em qualidade padrão sobre os chunks de entrada de `dist/assets/`), mostrando o chunk do modal e os três chunks de idioma fora da entrada (CA4); (3) o que saiu e o que ficou, com o motivo; (4) a fonte Bricolage (77 KB, pré-carregada no `index.html`, `font-display: swap` em `src/styles/global.css`, sem efeito no TBT, subset do eixo `opsz` como recomendação); (5) a causa do TBT (hidratação) e a mudança para `startTransition`; (6) o método de medição do TBT da spec (CA2), incluindo a nota do WSL sobre subir o Chromium à parte com `--remote-debugging-port` e passar `--port` ao Lighthouse, e a exigência de máquina ociosa; (7) um espaço para o resultado do QA (antes e depois, mediana de pelo menos 5 rodadas alternadas).
    - **Evidência:**

- [ ] T8 — Verificação completa
    - **Arquivo(s):** nenhum (só verificação)
    - **Depende de:** todas as tarefas anteriores
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** `npm run build && npm run check:chunk && npm run test:cov` (única rodada pesada da feature)
    - **Feito quando:** o gate passa (CA3, CA5, CA6 na parte de unidade).
    - **Evidência:**

## Fora do `executor`

- **`qa`:** `npm run build:fatec && npm run build:fatec:form && npm run test:e2e` verde, com atenção a `resume.spec.ts`, `keyboard.spec.ts`, `navigation.spec.ts`, `motion.spec.ts`, `theme.spec.ts` e `language.spec.ts` (PERF-140-05, CA6). Medição do TBT da Início e de Informações (CA2), com o método do relatório, a linha de base em `origin/staging` (`6c10b34`) e esta branch, rodadas alternadas e a máquina ociosa. O resultado entra no relatório de T7.
- **Felipe (manual, CA7):** `npm run build && npm run preview`. Nas cinco telas e nos três idiomas, conferir que nada pisca nem some na carga, ao trocar o idioma pelo seletor e ao trocar o tema, e que a primeira abertura do currículo (rodapé, Início, Informações, Contato) abre o modal sem esconder a página.

# Spec: 140-divide-javascript-por-pagina

> **Tipo:** `feature` (Perf na branch e no commit) <br />
> **Status:** `implementada` <br />
> **Aprovada por:** Felipe, em 11-11-2026 (registrada pelo Orc) <br />
> **Issue:** `#140` <br />
> **Criado em:** `11-11-2026`

Sem tela nova, mas a hidratação de todas as telas muda: o `qa` se aplica (E2E das cinco telas e medição do TBT). Nenhum texto de UI é criado ou alterado, então R2 não se aplica a esta spec; R1 continua valendo (nada depende de backend). Base: `origin/staging` em `6c10b34`, branch `perf/140-divide-javascript-por-pagina`.

## Problema

No Lighthouse do celular (CPU 4× mais lenta, simulado), a Início e Informações têm tempo de bloqueio (TBT) alto. A issue atribui o problema ao tamanho do script principal, mas a análise de 11/11/2026 (build `build:fatec`, Lighthouse 13.6) mostrou outra causa:

- As tarefas longas que somam no TBT estão no chunk `index`, por volta de 5,7 a 6,8 s da carga: são a **hidratação do React** (`hydrateRoot` em `src/prerender/mountClient.tsx`), com 300 a 740 ms por tarefa. O download dos pacotes não é o gargalo. Informações custa mais que a Início porque hidrata mais DOM.
- O pacote de entrada soma cerca de 145 KB brotli. Os nomes dos chunks da issue enganam: `resolveSupportedLanguage` (i18next, react, react-i18next) e `paths` (react-router) recebem o nome do primeiro módulo e não encolhem com divisão.
- Dentro da entrada há duas coisas que só uma parte das visitas usa: o `ResumeModal` com `Modal`, `usePdfPages`, `ResumePdfPages` e `useModalBehavior` (puxados pelo `Footer`, presente em toda página) e os textos dos três idiomas nos oito namespaces (cerca de 42 KB antes da minificação, em `src/i18n/resources.ts`), dos quais só um idioma é usado por página.

Origem: revisão do site de 07/11/2026, achado 6 (parte maior).

## Objetivo

1. **Hidratação em transição:** `mountClient` hidrata dentro de `startTransition`, para o React fatiar a hidratação em tarefas curtas e devolver o thread entre elas. Esse é o item que mais reduz o TBT (no protótipo local, o TBT mínimo caiu de 572 para 124 ms na Início e de 487 para 82 ms em Informações).
2. **Modal do currículo sob demanda:** o código do `ResumeModal` sai do pacote de entrada e só é baixado na primeira abertura. Com o modal fechado, o HTML do servidor e o do cliente continuam iguais.
3. **Textos por idioma:** o pacote de entrada não carrega os textos de nenhum idioma. O idioma da página é baixado num chunk próprio antes de hidratar, e os outros só quando o visitante troca de idioma. O build do servidor e a pré-renderização continuam com os três idiomas carregados de forma estática.
4. **Relatório** (critério 1 da issue): um documento em `docs/setup/entry-bundle-performance.md` com a composição do pacote de entrada antes e depois, o que saiu e o que ficou com o motivo, a fonte e o método de medição.

## Fora de escopo

- Namespaces por página (carregar só o namespace da tela): conflita com a #141 e mexe no Suspense do `useTranslation`.
- Troca de biblioteca (Redux Toolkit, react-router, i18next) ou divisão manual de vendors (`manualChunks`).
- Cache longo dos assets (#194).
- Subset da fonte Bricolage: fica como recomendação no relatório, sem tarefa.
- `<link rel="modulepreload">` do chunk do idioma no HTML pré-renderizado: só entra se a medição do QA mostrar piora (ver "Riscos").
- A ramificação `createRoot` do `mountClient` (página sem pré-renderização) continua com `root.render` fora de transição.
- Texto de UI, CSS, design e conteúdo.

## Requisitos

IDs desta spec, citados nos testes e nas tarefas.

- **PERF-140-01:** quando há HTML pré-renderizado, `mountClient` chama `hydrateRoot` dentro do callback de `startTransition` (de `react`) e continua devolvendo o `Root` criado.
- **PERF-140-02:** a hidratação continua sem erro de hidratação e sem `console.error` nas rotas já cobertas por `src/prerender/test/mountClient.test.tsx`.
- **PERF-140-03:** com o modal do currículo fechado, nenhuma página importa o módulo `@/components/ResumeModal`. Ele é importado na primeira vez que `isOpen` fica `true` e não é desmontado depois.
- **PERF-140-04:** a primeira abertura do modal não troca a página pelo esqueleto do layout nem esconde o conteúdo: o carregamento do módulo fica num `<Suspense fallback={null}>` local, e o resto da página continua visível.
- **PERF-140-05:** os comportamentos do currículo de `e2e/resume.spec.ts` (abrir, foco no título, Esc, fechar, baixar, canvas, troca de idioma, histórico) continuam passando sem alteração de expectativa. Ajuste de teste vale só para esperar por estado.
- **PERF-140-06:** o código do cliente não importa `@/i18n/resources` nem nenhum JSON de `src/locales/` de forma estática. Cada idioma vira um chunk próprio, carregado por uma função idempotente de `src/i18n/` que guarda a promessa em andamento: duas chamadas para o mesmo idioma fazem uma importação só, e um idioma que já tem os oito namespaces na instância (servidor, testes) não é importado de novo.
- **PERF-140-07:** `createLanguageLoader` e `setLanguage` carregam o idioma antes de chamar `i18n.changeLanguage`. Ao terminar, `i18n.resolvedLanguage` é o idioma pedido e `t()` devolve o texto desse idioma, mesmo que ele não estivesse carregado.
- **PERF-140-08:** `mountClient` carrega o idioma inicial (o do caminho, ou `en` sem prefixo válido) e o deixa como `resolvedLanguage` antes de `hydrateRoot`/`createRoot`. O HTML hidratado não mostra chave nem texto de outro idioma.
- **PERF-140-09:** `src/entry-server.tsx` (pré-renderização) tem os três idiomas carregados antes do primeiro render, sem depender de chunk dinâmico. `src/i18n/resources.ts` continua existindo para o servidor e para os testes.
- **PERF-140-10:** `src/types/i18next.d.ts` continua tipando as chaves pelos JSON de `pt-BR`, só com `import type`. Chave ou namespace faltando continua sem compilar.
- **PERF-140-11:** `src/setupTests.ts` pré-carrega os três idiomas antes de cada teste. Os testes que trocam idioma com `setLanguage` dentro do `it` continuam passando.
- **PERF-140-12:** a garantia de que os três idiomas têm os mesmos namespaces e chaves (`src/i18n/test/resources.test.ts`) continua valendo.

## Critérios de aceite

- [x] **CA1 (issue, critério 1):** `docs/setup/entry-bundle-performance.md` existe e traz a tabela de composição do pacote de entrada antes (da análise de 11/11/2026) e depois (medida no build desta branch com o mesmo método); o que saiu da entrada e o que ficou, com o motivo (react-dom, react-router, i18next, Redux Toolkit não encolhem com divisão); a fonte Bricolage (77 KB, pré-carregada no `index.html`, `font-display: swap` em `global.css`, subset do eixo `opsz` como recomendação); e o método de medição do TBT. Está ligado em `docs/setup/development.md`.
- [ ] **CA2 (issue, critério 2):** o TBT da Início (`/pt-BR`) e de Informações (`/pt-BR/about`) no Lighthouse mobile é menor nesta branch do que em `origin/staging` (`6c10b34`). A medição usa o método do relatório, roda com a máquina ociosa (sem build, E2E ou outro agente em paralelo) e compara a mediana de pelo menos 5 rodadas alternadas entre os dois builds. A linha de base é medida de novo na mesma sessão. Não valem como "atual" as medianas da análise (máquina carregada) nem os 730 e 1.140 ms da issue (outro site e outro método). Responsável: `qa`.
- [x] **CA3 (issue, critério 3):** `npm run check:chunk` passa depois de `npm run build`, com os orçamentos do markdown e do `pdfjs` inalterados e sem `react-markdown` na entrada.
- [x] **CA4:** o pacote de entrada desta branch não contém textos de locale de nenhum idioma nem o módulo do `ResumeModal`. Isso é conferido no build e registrado na tabela "depois" do relatório.
- [x] **CA5:** PERF-140-01 a PERF-140-12 cobertos pelos testes listados em `tasks.md`.
- [x] **CA6:** `npm run typecheck`, `npm run lint`, `npm run test:cov` e `npm run test:e2e` (depois de `npm run build:fatec` e `npm run build:fatec:form`) verdes.
- [ ] **CA7 (verificação manual do Felipe):** nas cinco telas (Início, Projetos, Projeto, Informações, Contato) e nos três idiomas, nada pisca nem some na carga, na troca de idioma (seletor do cabeçalho) e na troca de tema. A primeira abertura do modal do currículo (rodapé, Início, Informações, Contato) não esconde a página. Feito com `npm run build && npm run preview` (a hidratação só acontece no HTML pré-renderizado; o `npm run dev` não pré-renderiza).

## Casos de borda

- QUANDO o visitante troca de idioma pelo seletor ENTÃO `setLanguage` e o `loader` da nova rota pedem o mesmo idioma ao mesmo tempo, e a importação acontece uma vez só (PERF-140-06).
- QUANDO a importação de um idioma falha (rede) ENTÃO a promessa guardada é descartada, e a próxima chamada tenta de novo, sem ficar presa num erro. O `loader` propaga o erro para o `errorElement`, como hoje qualquer falha de loader.
- QUANDO o caminho não tem prefixo válido (não encontrada sem prefixo, raiz `/`) ENTÃO `mountClient` carrega `en` (o `fallbackLng`).
- QUANDO o modal é aberto, fechado e aberto de novo ENTÃO a segunda abertura não importa o módulo de novo.
- QUANDO o modal está fechado na pré-renderização ENTÃO o servidor e o cliente renderizam o mesmo HTML (nada no lugar do modal), sem aviso de hidratação.

## Estratégia de validação

- **Checagens automatizadas:** Vitest (projetos `ui` e `prerender`), `npm run check:chunk`, E2E completo.
- **Medição (QA):** o método do relatório, com a linha de base em `6c10b34` e a branch, rodadas alternadas e a máquina ociosa (CA2).
- **Checagens manuais:** CA7.
- **Rollback / mitigação:** cada mudança vai num commit próprio. Se a hidratação em transição quebrar foco ou revelação em algum E2E, o commit de T1 pode ser revertido sozinho, com um conflito pequeno em `mountClient.tsx` (que T5 também altera), sem perder o modal sob demanda nem os textos por idioma.

## Riscos

- **Tipagem:** `src/types/i18next.d.ts` usa `typeof resources["pt-BR"]`. O `import type` não traz código ao pacote, mas um import de valor de `resources` (ou de um JSON de `src/locales/`) em qualquer arquivo do cliente traz os três idiomas de volta para a entrada. Hoje, além de `i18n.ts` e `resources.ts`, só testes importam locales (`resources.test.ts`, `resumeModalTexts.test.ts`, `codeLanguages.test.ts`).
- **Testes:** muitos testes chamam `setLanguage` dentro do `it`. Sem o pré-carregamento em `setupTests.ts`, eles passariam a depender de import dinâmico. O pré-carregamento, por sua vez, esconde o caminho de carga do `mountClient`, e por isso o teste de PERF-140-08 remove os idiomas que não são `pt-BR` antes de montar.
- **`resolvedLanguage`:** o i18next só considera "resolvido" um idioma que tem recursos no momento do `changeLanguage`. Se o idioma for carregado depois, `getLanguage()` cai para `en` e afeta o JSON-LD, o caminho do PDF do currículo e o `lang` do documento. Por isso o carregamento sempre vem antes do `changeLanguage` (PERF-140-07, PERF-140-08).
- **Hidratação em transição:** um efeito que dependa de rodar logo após a montagem (foco do `h1` na troca de rota, `useReveal`, tema, `useResume`) pode mudar de ordem. Os E2E de foco (`keyboard.spec.ts`, `navigation.spec.ts`), de revelação (`motion.spec.ts`) e de tema (`theme.spec.ts`) precisam passar. Se algum falhar, corrija o código (não o teste) ou reverta só este item.
- **Uma requisição a mais antes de hidratar:** o chunk do idioma ativo não é pré-carregado no HTML, então a hidratação espera mais uma ida à rede. O conteúdo pré-renderizado já está na tela (LCP e CLS não mudam) e o TBT não deve piorar, mas o tempo até a página ficar interativa pode subir um pouco. A medição do QA decide: se houver piora, uma spec à parte trata do `modulepreload` em `scripts/prerender/composePage`.
- **Nomes de chunk:** `check:chunk` acha os pacotes do markdown e do `pdfjs` pelo nome (`/^pdf-.+\.js$/` em `scripts/pdfChunk/findPdfChunks.ts`), e `e2e/resume.spec.ts:474` filtra `/\/assets\/pdf[.-]/`. O novo chunk do modal e os chunks de idioma não podem casar com esses padrões, e o `vite.config.ts` não renomeia chunks.
- **Suspense local:** o `lazy` do modal dentro do `Footer` (fora do `<Outlet />`) ou de uma página, sem `<Suspense>` próprio, suspenderia até o layout ou a raiz e esconderia a página. O `<Suspense fallback={null}>` fica dentro do componente de carga sob demanda, como já fazem `ProjectDocumentSection` e o formulário de Contato.
- **Documentação:** a regra "Namespace novo entra… em `src/i18n/resources.ts` e no `ns` de `src/i18n/i18n.ts`" do `.claude/CLAUDE.md` e as seções de i18n de `docs/architecture/frontend.md` mudam com o novo carregamento.

## Notas / decisões

- **Modal sob demanda por um componente, não em cada chamador:** um componente `LazyResumeModal` (`src/components/LazyResumeModal.tsx`, mesmas props `isOpen` e `onClose`) guarda se o modal já foi aberto, faz o `lazy(() => import("@/components/ResumeModal"))` e o envolve num `<Suspense fallback={null}>`. Os quatro pontos de uso (`Footer`, `Home.page`, `About.page`, `ContactChannels`) trocam só o import e o nome do componente. O `ResumeModal` continua devolvendo `null` quando fechado e continua testado direto. A regra de "página sem `<Suspense>` próprio" fala de páginas, e este é um componente (mesmo caso do `ProjectDocumentSection`), então não abre exceção na regra.
- **"Já foi aberto" não se deriva das props:** o componente precisa lembrar disso depois que `isOpen` volta a `false`, para o modal não desmontar e o módulo não ser importado de novo. O estado se atualiza no render quando `isOpen` fica `true` (padrão de "ajustar estado quando a prop muda" do React), sem `useEffect`.
- **Um chunk por idioma, com os oito namespaces juntos:** um módulo por idioma em `src/i18n/languageBundles/<idioma>.ts` (`ptBR.ts`, `en.ts`, `es.ts`) junta os oito JSON do idioma. `src/i18n/resources.ts` passa a compor os três a partir deles (uso estático do servidor e dos testes). A função `src/i18n/loadLanguage.ts` (`loadLanguage(language): Promise<void>`) faz `import()` do módulo do idioma, chama `i18n.addResourceBundle` para cada namespace e guarda a promessa por idioma. `import.meta.glob` com um JSON por arquivo foi descartado porque geraria oito requisições por idioma.
- **`i18n.ts` sem recursos:** a instância inicia com `resources: {}`, `partialBundledLanguages: true`, o mesmo `ns`, `initAsync: false` e o mesmo `lng`. Os recursos chegam por `loadLanguage` (cliente) ou pelo `entry-server.tsx`, que importa `resources` estaticamente e os adiciona antes do primeiro render. O teste de `i18n.server.test.ts` ("fica no fallback en") se ajusta ao novo início sem recursos e continua afirmando que o import funciona sem `window` e `document`.
- **Por que não medir com a mediana da análise:** a máquina estava carregada (TBT de 82 a 12.056 ms na mesma página). O mínimo indicou queda de 4 a 6 vezes com a hidratação em transição, mas o aceite exige máquina ociosa e mediana (CA2).
- **Dependência nova:** nenhuma.
- **Decisões de design (`Dnn`, `PIn`):** nenhuma se aplica. A mudança é invisível e não altera tokens, componentes visuais, copy nem acessibilidade.

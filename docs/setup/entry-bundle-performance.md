# Desempenho do pacote de entrada

Registro da issue #140: o que compõe o JavaScript que toda página baixa antes de ficar interativa, o que saiu dele, o que ficou e por quê, e como medir o tempo de bloqueio (TBT) no Lighthouse do celular. Spec: [`.specs/features/140-divide-javascript-por-pagina/spec.md`](../../.specs/features/140-divide-javascript-por-pagina/spec.md).

## Resumo

- A causa do TBT alto na Início e em Informações não é o download: são as tarefas longas da **hidratação do React** (`hydrateRoot` em `src/prerender/mountClient.tsx`), de 300 a 740 ms cada uma, por volta de 5,7 a 6,8 s da carga. Informações custa mais porque hidrata mais DOM.
- A correção principal é **hidratar dentro de `startTransition`**: o React fatia a hidratação em tarefas curtas e devolve o thread entre elas.
- O pacote de entrada caiu de **145,0 KB** para **137,0 KB** brotli: os textos dos três idiomas e o modal do currículo saíram dele. O resto é biblioteca que não encolhe com divisão.

## Como medir o pacote

Sobre o `dist/assets/` do `npm run build:fatec`: os chunks de entrada são os `.js` que o `dist/index.html` referencia (`<script type="module">` e `<link rel="modulepreload">`). Cada um é comprimido com `brotliCompressSync` do `zlib` do Node, na qualidade padrão (11). KB é 1.000 bytes. O nome de um chunk é o do primeiro módulo que o Rolldown pôs nele, não descreve o conteúdo.

## Antes (`origin/staging`, `6c10b34`, análise de 11/11/2026)

| Chunk                      | Brotli (KB) | Conteúdo                                                                                                                                                                |
| -------------------------- | ----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`                    |        68,0 | código da aplicação: rotas, layout, cabeçalho, rodapé, `mountClient`, e o `ResumeModal` com `Modal`, `usePdfPages`, `ResumePdfPages` e `useModalBehavior` (pelo rodapé) |
| `api`                      |        31,5 | Redux Toolkit, RTK Query, a store e os textos dos três idiomas nos oito namespaces (`src/i18n/resources.ts`)                                                            |
| `paths`                    |        27,6 | `react-router`                                                                                                                                                          |
| `resolveSupportedLanguage` |        17,1 | `react`, `i18next` e `react-i18next`                                                                                                                                    |
| demais (4 chunks pequenos) |         0,8 | runtime do Rolldown, `VisuallyHidden`, `button.module`                                                                                                                  |
| **Total**                  |   **145,0** |                                                                                                                                                                         |

## Depois (esta branch sobre `origin/staging` em `6af713d`, mesmo método)

Inclui a leitura do bloco `prerender-data` (`readPrerenderData`, #163), que entrou na `staging` depois da linha de base.

| Chunk                      | Brotli (KB) | Conteúdo                                                                                                        |
| -------------------------- | ----------: | --------------------------------------------------------------------------------------------------------------- |
| `index`                    |        66,8 | código da aplicação, sem o modal do currículo; ganha `loadLanguage` e o carregamento do idioma no `mountClient` |
| `api`                      |        23,3 | Redux Toolkit, RTK Query e a store, sem texto de idioma                                                         |
| `paths`                    |        27,6 | `react-router` (igual)                                                                                          |
| `resolveSupportedLanguage` |        17,1 | `react`, `i18next` e `react-i18next` (igual)                                                                    |
| `Spinner`                  |         1,5 | `Spinner`, que antes ficava no `index` e agora é compartilhado com o chunk do modal                             |
| demais (4 chunks pequenos) |         0,7 | runtime do Rolldown, `VisuallyHidden`, `button.module`                                                          |
| **Total**                  |   **137,0** |                                                                                                                 |

Fora da entrada, baixados só quando usados:

| Chunk              | Brotli (KB) | Quando é baixado                                                    |
| ------------------ | ----------: | ------------------------------------------------------------------- |
| `ptBR`             |         3,4 | antes de montar uma página em `/pt-BR`, ou ao trocar para português |
| `en`               |         3,0 | antes de montar uma página em `/en` ou sem prefixo, ou ao trocar    |
| `es`               |         3,4 | antes de montar uma página em `/es`, ou ao trocar para espanhol     |
| `ResumeModal`      |         1,7 | na primeira abertura do currículo                                   |
| `Modal`            |         0,7 | junto com o primeiro modal (currículo, trajetória, filtros)         |
| `useModalBehavior` |         0,5 | junto com o primeiro modal                                          |

Conferido no build (CA4): nenhum chunk de entrada contém texto de locale de nenhum idioma nem o código do `ResumeModal` (`ResumePdfPages`, `pdfViewerEnabled` só aparecem no chunk `ResumeModal`). `npm run check:chunk` passa com os orçamentos do markdown e do `pdfjs` inalterados.

## O que saiu e o que ficou

- **Saiu: os textos dos idiomas** (cerca de 8 KB brotli). Cada página usa um idioma só, e os três iam na entrada. Agora cada idioma é um chunk (`src/i18n/languageBundles/<idioma>.ts`), baixado por `loadLanguage` antes de montar e antes de cada troca. O servidor (pré-renderização) e os testes continuam com os três carregados de forma estática.
- **Saiu: o modal do currículo.** O rodapé, presente em toda página, puxava o `ResumeModal` e as dependências dele. Agora o `LazyResumeModal` só importa o módulo na primeira abertura, num `<Suspense fallback={null}>` local que não esconde a página. O ganho na entrada é pequeno (cerca de 1,3 KB, porque parte do código ficou compartilhada), mas tira da hidratação um componente que quase ninguém abre.
- **Ficou: `react` e `react-dom`, `react-router`, `i18next` e `react-i18next`, Redux Toolkit e RTK Query.** Toda página usa todos eles antes do primeiro render, então dividir só troca um arquivo por vários sem reduzir o que se baixa. Trocar de biblioteca ou dividir vendors à mão (`manualChunks`) está fora do escopo.

## Fonte Bricolage Grotesque

O arquivo `public/fonts/bricolage-grotesque-latin-opsz-normal.woff2` tem 77 KB, é pré-carregado no `index.html` (`<link rel="preload" as="font">`) e declarado com `font-display: swap` em `src/styles/global.css`. Não entra no TBT: a fonte é baixada em paralelo e não roda JavaScript. O peso vem do eixo variável `opsz`; um subset que fixe o `opsz` usado pelos títulos reduziria o arquivo. Fica como recomendação, sem tarefa nesta issue.

## Causa do TBT e a hidratação em transição

`hydrateRoot` sem transição hidrata a árvore inteira de forma síncrona, numa tarefa só. Dentro de `startTransition` (`hydrateInTransition`, em `src/prerender/mountClient.tsx`), a hidratação tem prioridade de transição: o React a divide em pedaços e cede o thread entre eles, e cada pedaço fica abaixo dos 50 ms que contam para o TBT. No protótipo local, o TBT mínimo caiu de 572 para 124 ms na Início e de 487 para 82 ms em Informações. Esses números são mínimos de uma máquina carregada; o aceite é a mediana abaixo.

Efeito colateral: a página só hidrata depois de baixar o chunk do idioma, uma ida à rede a mais. O conteúdo pré-renderizado já está na tela, então LCP e CLS não mudam. Se a medição mostrar piora no tempo até ficar interativa, uma spec à parte trata do `<link rel="modulepreload">` do chunk do idioma no HTML pré-renderizado.

## Como medir o TBT

1. Gere os dois builds com `npm run build:fatec`: a linha de base em `origin/staging` (`6c10b34`) e esta branch, cada um no seu worktree. Sirva cada um com `npm run preview:fatec` (porta 4173), o segundo com `PREVIEW_PORT=<porta> npm run preview:fatec`.
2. Deixe a máquina ociosa: nenhum build, E2E, Vitest ou outro agente rodando. Confira com `uptime`. Com a máquina carregada, o TBT da mesma página variou de 82 a 12.056 ms na análise.
3. Rode o Lighthouse 13 no perfil mobile padrão (CPU 4× mais lenta e rede simuladas), só a categoria de desempenho, na Início (`/ra2581392423047/pt-BR`) e em Informações (`/ra2581392423047/pt-BR/about`).
4. Alterne as rodadas entre os dois builds (base, branch, base, branch…) e faça pelo menos 5 por página e por build. Compare a mediana do TBT.

No WSL, o Lighthouse não consegue subir o Chromium sozinho. Suba o Chromium do Playwright à parte e passe a porta:

```bash
"$(node -e 'console.log(require("playwright").chromium.executablePath())')" --headless=new --remote-debugging-port=9222 &
npx lighthouse http://localhost:4173/ra2581392423047/pt-BR --port=9222 --only-categories=performance --output=json --output-path=./lh-home.json
```

O TBT fica em `audits["total-blocking-time"].numericValue` do JSON.

## Resultado do QA

Medido em 11/11/2026 por `qa`, com a máquina ociosa (carga entre 1,3 e 1,9; só a última rodada de Informações passou de 2), Lighthouse 13.6.0 no perfil mobile padrão, uma instância do Chromium do Playwright e dois previews em portas próprias, rodadas alternadas (base, branch, base, branch…) na mesma sessão. A mediana é de 5 rodadas por página e por build.

| Página      | TBT base `6c10b34` (ms) | TBT branch (ms) | Rodadas |
| ----------- | ----------------------: | --------------: | ------: |
| Início      |                   270,5 |            60,0 |       5 |
| Informações |                   344,0 |            98,0 |       5 |

Rodadas, na ordem (base | branch), em ms:

| Página      | Base                                | Branch                         |
| ----------- | ----------------------------------- | ------------------------------ |
| Início      | 168,5; 127,5; 410,5; 529,0; 270,5   | 60,0; 48,5; 28,5; 107,5; 122,5 |
| Informações | 221,5; 344,0; 712,5; 255,0; 6.854,5 | 98,0; 279,8; 36,0; 2,5; 157,0  |

**Outlier:** a rodada 5 da base em Informações (6.854,5 ms) coincidiu com carga de 3,06 na máquina. Foi mantida na tabela e não afeta a mediana, que é a medida de aceite. O TBT da branch é menor que o da base nas duas páginas, em todas as rodadas da Início e em todas as de Informações; o CA2 passa.

## Peso do Zod (#162)

Os schemas de `src/services/content/schemas/` usam `zod/mini` e são carregados por `import()` dinâmico em `readJson`, em paralelo com a leitura do arquivo, para o Zod não entrar no pacote de entrada. Spec: [`.specs/features/162-valida-contrato-dos-json-com-zod/spec.md`](../../.specs/features/162-valida-contrato-dos-json-com-zod/spec.md).

Estimativa da spec (`zod/mini` dinâmico): 7,7 KB gzip e 7,0 KB brotli, fora da entrada; a entrada cresce só a chamada do `import()` (cerca de 0,06 KB).

Como medir, sobre o `dist/assets/` de `npm run build`:

1. Escolha um marcador do Zod que apareça só no chunk dos schemas (por exemplo o nome interno `ZodMiniType` ou a string `$ZodType`); confira com `grep -l` que ele existe num `.js` e anote qual.
2. Liste os `.js` que `dist/index.html` referencia (`<script type="module">` e `<link rel="modulepreload">`) e rode `grep -c <marcador>` neles: o esperado é zero em todos.
3. Comprima o chunk dos schemas com `gzipSync` e `brotliCompressSync` (qualidade 11) do `zlib` do Node, como no método acima, e some a entrada antes e depois.
4. Rode `npm run check:chunk`: continua passando, sem mudar nenhum teto.

| Medida                                | Valor                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Chunk dos schemas, gzip e brotli (KB) | 6,1 gzip e 5,6 brotli (`schemas-*.js`, 18,2 KB sem comprimir, marcador `$ZodType`) |
| Entrada (`index`), brotli (KB)        | 90,1 (`index-*.js`; sem o Zod, a chamada de `import()` é o único acréscimo)        |
| Marcador do Zod nos chunks de entrada | 0 ocorrências nos quatro `.js` que `dist/index.html` referencia                    |

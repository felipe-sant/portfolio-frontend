# Spec: 202-lastmod-e-licencas-fora-do-sitemap

> **Tipo:** `feature` (trilha H: #202 e #207 num PR só) <br />
> **Status:** `em-andamento` <br />
> **Issue:** `#202 e #207` <br />
> **Criado em:** `11-11-2026`

Tem tela: a página Informações passa a mostrar a data da última atualização, e as páginas de documentação de projeto ganham descrição própria e, no caso da `LICENSE`, `noindex`. O `qa` se aplica a essas duas telas (Informações e Projeto em `/docs/<nome>`) e ao E2E dos arquivos de máquina (`sitemap.xml`). Base: `origin/staging` em `75b0c15`. Sem dependência nova (nenhum pacote entra no `package.json`).

## Problema

Origem: auditoria de SEO do claude-seo em felipe-sant.vercel.app, 10-11-2026.

1. **#202.** O `sitemap.xml` tem 66 URLs e só 33 trazem `<lastmod>`. `findLastmod` (`scripts/seo/listSitemapEntries.ts`) só devolve data para `projects/:id` (`project.updatedAt`) e `projects/:id/docs/:name` (`document.updatedAt`). Início, Projetos, Informações e Contato (12 URLs) não têm fonte de data: `profile.json` e `timeline.json` não têm campo de atualização. Dos projetos e documentos, 2 projetos (`01a131df` e `01a131fc`) e 5 documentos (`ARCHITECTURE.md` e `SETUP.md` de `01a131df`, `SETUP.md` de `01a13216`, `ARCHITECTURE.md` e `SETUP.md` de `01a1323d`) não têm `updatedAt` (7 itens x 3 idiomas = 21 URLs; 12 + 21 = 33). A página Informações também não diz quando foi atualizada, e o JSON-LD `ProfilePage` não traz `dateModified`.
2. **#207.** 36 das 66 URLs são páginas de documentação (18 são `LICENSE`, 6 projetos x 3 idiomas). A `LICENSE` é o texto MIT padrão, igual nos três idiomas (documento `shared`, `translated: false`): conteúdo fino e duplicado, sem valor de busca. Além disso, todas as páginas de documentação (`SETUP.md`, `ARCHITECTURE.md`, `LICENSE`) usam o `project.summary` como `<meta name="description">` e como descrição do `PageMeta` (`src/pages/Project.page.tsx`), então o buscador vê a mesma descrição em páginas diferentes.

## Decisões do PO (11-11-2026)

Registrada pelo Orc como "D-10". Não confundir com `D10` de `docs/design/decisions.md`: a decisão entra lá com o próximo ID livre (T9; o último é `D72`, o Orc confirma o número antes do commit) e esta spec só a chama de "decisão desta trilha".

- **Manter as páginas de documentação indexáveis, cada uma com descrição própria; tirar só as de `LICENSE` do sitemap, com `noindex`.** Justificativa a registrar na spec e em `docs/`: a `LICENSE` é o texto MIT padrão, idêntico nos três idiomas e sem busca própria; `SETUP.md` e `ARCHITECTURE.md` são conteúdo original do projeto e continuam indexáveis. Uma página com `noindex` não deve constar no sitemap (sinais contraditórios), então as duas coisas andam juntas. A rota, a pré-renderização e o link do projeto para a `LICENSE` continuam existindo: só o rastreamento muda.

## Fonte da data das páginas fixas (comparação)

| Opção                                                  | Como                                                                                                                                | Contra                                                                                                                                                                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) `updatedAt` curado em `profile.json` (recomendada) | Um campo `AAAA-MM-DD` por idioma (mesmo valor nos três), validado, documentado; muda quando `profile.json` ou `timeline.json` mudam | Depende de o Felipe lembrar de atualizar; mitigado pela regra documentada em `data-model.md` e pela revisão de PR                                                                                                      |
| (b) Máximo entre profile, timeline e projetos          | Calculado                                                                                                                           | `profile.json` e `timeline.json` não têm data: o máximo ignoraria justamente o que Informações mostra, e a data só andaria quando um projeto muda                                                                      |
| (c) Data do último commit de cada arquivo (git)        | Lida no build                                                                                                                       | Clone raso no CI devolve a data do commit de checkout, o que equivale à data do build (proibido quando o conteúdo não mudou); um reformat muda a data sem mudar o conteúdo; build deixa de ser reprodutível sem `.git` |

**Recomendação: (a)**, com derivação só onde há dado real: `timeline.json` é `{ items }` sem campo de topo, então não ganha campo; a regra documentada é "mexeu em `profile.json` ou em `timeline.json`, atualize `profile.updatedAt`". Mapa de `lastmod` das páginas fixas, a partir do `profile.updatedAt` (`P`) e do maior `updatedAt` de projeto (`M`):

| Página           | `lastmod`                                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| Informações      | `P`                                                                            |
| Contato          | `P`                                                                            |
| Projetos (lista) | `M`                                                                            |
| Início           | maior entre `P` e `M` (mostra perfil, trajetória atual e projetos em destaque) |

Projetos e documentos do sitemap passam a ter `updatedAt` obrigatório no conteúdo (CA4): sem data real o critério "todas as URLs têm `<lastmod>`" não passa e não se inventa data. O único campo de data que o build não deriva é este; o build nunca usa a data de hoje.

## Objetivo

1. Toda URL do `sitemap.xml` tem `<lastmod>` derivado de dado do conteúdo (CA1 a CA4).
2. A página Informações mostra "Atualizado em MM/AAAA" nos três idiomas e o JSON-LD `ProfilePage` traz `dateModified` (CA5 a CA7).
3. As páginas de `LICENSE` saem do sitemap e ganham `noindex`; as outras páginas de documentação ficam indexáveis, cada uma com descrição própria derivada do conteúdo (CA8 a CA14).

Contagem esperada com o conteúdo atual (6 projetos; por idioma: 4 páginas fixas, 6 projetos e 6 documentos que não são `README.md` nem `LICENSE`, que são `SETUP.md` x4 e `ARCHITECTURE.md` x2): **sitemap de 66 para 48 URLs** (`16 x 3`); **18 saem** (as `LICENSE`, 6 projetos x 3 idiomas); **48 com `<lastmod>`**. Hoje 33 das 66 têm; das 48 que ficam, só 15 têm (4 projetos e 1 `SETUP.md`, x 3 idiomas), então **33 ganham `lastmod`**: 12 das páginas fixas (derivadas de `profile.updatedAt` e do maior `updatedAt` de projeto) e 21 de projetos e documentos que passam a ter data no conteúdo (Questão 1). O E2E e o teste com o dado real conferem esses números; o teste com fixture não depende do dado real.

## Fora de escopo

- Datas em `timeline.json` ou data própria por item da trajetória.
- Mostrar a data de atualização em Início, Projetos, Contato ou nas páginas de projeto (a data de documento continua sem exibição, `D55`).
- Qualquer mudança na rota, na pré-renderização ou no conteúdo da `LICENSE`; o `llms-full*.txt` já omite a `LICENSE` e não muda (confirmar na T6).
- Descrição própria da `README.md` (continua `project.summary`) e `dateModified`/descrição novos no JSON-LD `TechArticle`.
- Mudar `robots.txt`, `llms.txt` ou `.github/`.
- Usar a data de commit do git ou a data do build como fonte (opções (b) e (c) rejeitadas acima).

## Histórias de usuário

### P1: Datas de atualização e `lastmod` completo (#202) ⭐ MVP

**Como** buscador (e visitante), **quero** saber quando cada página mudou **para que** o rastreamento e a leitura usem datas verdadeiras.

**Critérios de aceite:**

1. **CA1.** QUANDO o sitemap é gerado com o conteúdo atual ENTÃO toda `<url>` DEVE ter `<lastmod>` no formato `AAAA-MM-DD` (48 de 48), vindo só de `updatedAt` do conteúdo (NF-IA-15).
2. **CA2.** QUANDO a entrada é Informações ou Contato ENTÃO o `lastmod` DEVE ser `profile.updatedAt` do idioma da entrada; Projetos, o maior `updatedAt` entre os projetos do idioma; Início, o maior entre os dois.
3. **CA3.** QUANDO a entrada é projeto ENTÃO o `lastmod` DEVE ser `project.updatedAt`; QUANDO é documento ENTÃO `document.updatedAt`. Nenhuma entrada usa a data do build ou de hoje (teste com relógio falso em data diferente do conteúdo).
4. **CA4.** QUANDO `profile.updatedAt` ou o `updatedAt` de um projeto ou documento listado falta ou não é `AAAA-MM-DD` válida ENTÃO a validação do conteúdo DEVE falhar em português apontando o arquivo e o campo (`npm run content:check`, que roda `src/services/content/test/content.test.ts`, e `validateContent`); `updatedAt` passa a ser obrigatório em `profile.json`, em todo projeto e em todo documento que não é `README.md`.
5. **CA5.** QUANDO o perfil está carregado em `/pt-BR/about` ENTÃO a página DEVE mostrar "Atualizado em MM/AAAA" (mês e ano de `profile.updatedAt`, `07/2026` para `2026-07-19`); em `/en/about`, "Updated MM/YYYY"; em `/es/about`, "Actualizado en MM/AAAA". O texto vem da chave `about:updatedAt` com `{{date}}`, nos três idiomas (R2), sem `new Date()` nem `toLocale*` (sem fuso e sem diferença de hidratação).
6. **CA6.** QUANDO o perfil ainda carrega ou falhou ENTÃO a linha DEVE não aparecer (sem texto vazio, sem chave).
7. **CA7.** O JSON-LD `ProfilePage` DEVE trazer `dateModified` igual a `profile.updatedAt`, e DEVE omiti-lo quando o perfil não está carregado.

**Teste independente:** `npm test -- --run scripts/test/listSitemapEntries.test.ts src/pages/test/About.page.test.tsx` e, no PR, o E2E de `machine-files.spec.ts` e `about.spec.ts`.

### P2: `LICENSE` fora do sitemap e descrição própria por documento (#207)

**Como** buscador, **quero** o sitemap sem páginas de licença e cada página de documentação com descrição própria **para que** o índice tenha conteúdo útil e distinto.

**Critérios de aceite:**

1. **CA8.** QUANDO o sitemap é gerado ENTÃO nenhuma `<url>` DEVE ser de documento chamado `LICENSE` (sem diferenciar maiúsculas e sem extensão, `LICENSE.md` e `license.txt` também), e as demais entradas DEVEM manter os quatro `xhtml:link` completos (alternates coerentes). Com o conteúdo atual: 48 URLs, 0 `LICENSE`, 18 a menos (NF-IA-15).
2. **CA9.** QUANDO a página é `/<idioma>/projects/:id/docs/LICENSE` ENTÃO ela DEVE emitir `<meta name="robots" content="noindex">` e o HTML pré-renderizado também; a rota continua respondendo 200 e a página continua igual (conteúdo, link e navegação entre documentos).
3. **CA10.** QUANDO o documento é `SETUP.md` ou `ARCHITECTURE.md` ENTÃO a página NÃO DEVE ter `noindex` e a URL DEVE continuar no sitemap.
4. **CA11.** QUANDO o conteúdo do documento está carregado ENTÃO a `<meta name="description">` e a descrição do `PageMeta` DEVEM ser a mesma, derivada do próprio documento por `buildDocumentDescription`: primeiro parágrafo útil, sem marcação Markdown, no máximo 155 caracteres, cortada em limite de palavra com `…` quando passa do limite; a `README.md` continua com `project.summary`.
5. **CA12.** QUANDO o conteúdo ainda carrega, falhou ou não tem parágrafo útil ENTÃO a descrição DEVE ser a chave `project:meta.documentDescription` com `{{document}}` e `{{project}}`, nos três idiomas (R2), nunca vazia e nunca `project.summary`.
6. **CA13.** QUANDO duas páginas de documentação são comparadas ENTÃO as descrições DEVEM ser diferentes entre si (teste com os `SETUP.md` e `ARCHITECTURE.md` reais dos 6 projetos, sem o texto de `project.summary`).
7. **CA14.** A descrição do HTML pré-renderizado DEVE ser igual à da primeira renderização no cliente (os dados vão serializados na store; sem erro de hidratação).
8. **CA15.** A regra de `LICENSE` DEVE existir num lugar só (`isLicenseDocument`, `src/utils/`), usado pela página e por `listSitemapEntries`; `isDocumentPage` e a regra do README não mudam.

**Teste independente:** `npm test -- --run src/utils/test/isLicenseDocument.test.ts src/utils/test/buildDocumentDescription.test.ts src/pages/test/Project.page.test.tsx scripts/test/listSitemapEntries.test.ts`.

## Casos de borda

- QUANDO o documento é só títulos, bloco de código, tabela ou HTML ENTÃO `buildDocumentDescription` DEVE devolver `undefined` e a página usa o fallback traduzido (CA12).
- QUANDO o parágrafo tem `[texto](url)`, `**negrito**`, `` `código` ``, imagem `![alt](src)` ou emblema ENTÃO só o texto fica; imagem e emblema são descartados.
- QUANDO o documento tem `format: "text"` ENTÃO vale o primeiro bloco de linhas não vazias.
- QUANDO o primeiro parágrafo passa de 155 caracteres ENTÃO o corte cai no último espaço antes do limite, sem deixar espaço ou pontuação solta antes do `…`.
- QUANDO o projeto não tem documento além do README ENTÃO nenhuma URL de documento existe para ele no sitemap (como hoje).
- QUANDO só a `LICENSE` de um projeto muda de data ENTÃO nenhum `lastmod` do sitemap muda por causa dela (ela não é listada).

## Critérios de aceite

- [ ] CA1 a CA7 (P1) e CA8 a CA15 (P2) cumpridos, cada um com teste listado em `tasks.md`.
- [ ] Docs atualizados na própria entrega: NF-IA-15 (fórmula `(4 + projetos + documentos que não são README nem LICENSE) x 3`, `lastmod` obrigatório e derivado), NF-IA-02 (a `LICENSE` não está no sitemap), `docs/architecture/frontend.md` (linha do `sitemap.xml`), `docs/architecture/data-model.md` e `api-contract.md` (`Profile.updatedAt`), `docs/screens/about.md` (data de atualização, `RF-ABOUT-31`) e `docs/screens/project.md` (descrição e `noindex`, `RF-PROJECT-40`), `docs/design/decisions.md` (decisão nova com a justificativa da `LICENSE`).
- [ ] E2E atualizados (T10), com ID do requisito no título.
- [ ] Verificação visual de Informações pelo PO (posição e estilo da linha de data).

## Estratégia de validação

- **Checagens automatizadas:** testes de unidade por tarefa (gate leve); no fim, `npm run test:cov -- --maxWorkers=2`. `npm run build` e o E2E **não** rodam localmente: rodam no CI do PR e a última tarefa confere `gh pr checks`.
- **Checagens manuais:** `npm run dev -- --port <porta> --strictPort` em `/pt-BR/about` (linha de data, nos três idiomas e nos dois temas), `/pt-BR/projects/<id>/docs/SETUP.md` e `/docs/LICENSE` (ver `<head>` no DevTools). No `sitemap.xml` do preview do PR: 48 `<loc>`, 48 `<lastmod>`, nenhum `LICENSE`.
- **Rollback / mitigação:** reverter o PR devolve o sitemap anterior. Se o Google não aceitar o `lastmod` por idioma, o campo é só dica e não afeta a indexação.

## Questões em aberto

Nenhuma. Respondidas na aprovação da spec em 11-11-2026 (o PO aprovou e manteve as propostas do planejamento; o Felipe corrige no PR se discordar):

1. Datas de `updatedAt` dos 2 projetos e dos 5 documentos sem data: `git log -1 --format=%cs` do arquivo, registradas na Evidência de T5 e listadas no corpo do PR para conferência.
2. `profile.updatedAt` inicial: data do último commit que mudou `profile.json` ou `timeline.json`.
3. Linha "Atualizado em": parágrafo discreto abaixo do resumo do topo de Informações.
4. Rótulo em `en`: "Updated {{date}}".
5. Início reflete o maior `updatedAt`, incluindo o dos projetos.

## Notas / decisões

- **Fonte da data:** (a), ver a comparação acima. (b) e (c) descartadas.
- **Formato da data exibida por fatia de texto** (`formatMonthYear`): `"2026-07-19"` vira `07/2026` sem criar `Date`, para não depender de fuso nem diferir entre build e navegador.
- **Descrição do documento sem parser de Markdown:** `src/services/content/validation/parseMarkdown.ts` (remark) não pode ser importado por página e puxaria o parser para o chunk do Projeto (NF-DE-09, #140). `buildDocumentDescription` é por texto puro, leve, só para o primeiro parágrafo.
- **`isLicenseDocument` compara o nome sem extensão e sem diferenciar maiúsculas** (`LICENSE`, `license.md`, `License.txt`; `LICENSES` e `NOTICE` não contam); o sitemap filtra antes de agrupar os alternates, então os grupos continuam completos nos três idiomas.
- **`noindex` + fora do sitemap andam juntos** (sinal coerente para o buscador); o link do projeto para a `LICENSE` continua.
- **`updatedAt` de `README.md`** continua opcional: a URL do README é a do projeto e usa `project.updatedAt`.
- IDs de requisito novos: `RF-ABOUT-31`, `RF-PROJECT-40` e a ampliação de `NF-IA-15` (último ID livre conferido em `origin/staging`).

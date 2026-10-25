---
name: playwright-e2e
description: Como escrever, rodar e depurar teste E2E neste projeto com Playwright (Chromium) e axe, em e2e/. Use quando for criar, alterar ou depurar qualquer arquivo e2e/*.spec.ts, mexer em playwright.config.ts ou em e2e/support/, ou verificar uma tela no navegador real.
---

# Playwright E2E

Esta skill é dona dos arquivos de `e2e/`. Teste de unidade e de componente (Vitest, jsdom) está na skill `vitest-specialist`.

## 1. Como rodar

| Comando                                      | O que faz                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run build:fatec`                        | build com `BASE_PATH=/ra2581392423047/`; obrigatório antes do E2E, que não builda                                  |
| `npm run test:e2e`                           | todos os testes, nos quatro projetos                                                                               |
| `npm run test:e2e -- e2e/home.spec.ts`       | um arquivo                                                                                                         |
| `npm run test:e2e -- -g "texto do teste"`    | um teste por nome                                                                                                  |
| `npm run test:e2e -- --project=desktop-dark` | um projeto só                                                                                                      |
| `npm run preview:fatec`                      | servidor que imita o Pages em `http://localhost:4173/ra2581392423047/`; o `webServer` do Playwright o sobe sozinho |
| `npm run og:image`                           | regera a imagem Open Graph; não é teste                                                                            |

Código de produto mudou, rode `build:fatec` de novo: o E2E testa o `dist/`, não o `src/`. O relatório HTML fica em `playwright-report/` (gitignored).

## 2. Projetos e configuração

`playwright.config.ts`: `testDir: "e2e"`, Chromium, `baseURL` = `http://localhost:4173/ra2581392423047/`. Quatro projetos rodam cada teste: `mobile-light`, `mobile-dark` (390x844), `desktop-light`, `desktop-dark` (1280x800), todos com `reducedMotion: "reduce"` por padrão.

- Teste que precisa de movimento pleno usa `test.use({ reducedMotion: "no-preference" })` no `describe`.
- Teste que só vale num tamanho se pula com `test.skip(condição, "motivo")` (ex.: menu existe só no mobile, largura <= 480).
- Bug de produto conhecido se marca com `test.fail(condição, "motivo e número da issue")` só no teste que prova o comportamento quebrado: ele continua rodando e fica vermelho sozinho quando o bug for corrigido, forçando a remover a marca. Como `test.fail` passa com qualquer falha, as outras verificações (idioma, foco, navegação) ficam em teste separado, sem a marca. `test.skip` para esconder bug é proibido.
- Teste que depende do tema lê `colorScheme` do projeto, não clica no botão de tema, salvo se o assunto for o botão.

## 3. Convenções

- Arquivo `e2e/<tema>.spec.ts`, sufixo `.spec.ts`, fora do Vitest e da cobertura. Código de apoio em `e2e/support/`, um símbolo por arquivo com `export default`, import por caminho relativo ou `@scripts/*`.
- Seletor é `getByRole(papel, { name })` com o nome em português; `getByText` e `getByTestId` só quando não houver papel. Nunca CSS de classe de CSS Module (o nome é gerado).
- Rota abre sem barra inicial (`page.goto("pt-BR")`), relativa ao `baseURL`. Espere a tela com `await page.getByRole("heading", { level: 1 }).waitFor()`.
- Descrição de `test` e `describe` em português; identificadores em inglês; sem comentários.
- Sem `waitForTimeout`. Espere condição: `expect(locator).toBeVisible()`, `toHaveAttribute`, `toBeFocused`, `expect.poll`.
- Toda tela nova: caminho em `e2e/support/routesUnderTest.ts` (o `e2e/accessibility.spec.ts` roda o axe, com `color-contrast` ligada, em todos) e, se tiver teclado próprio, roteiro em `e2e/<tema>.spec.ts`.

## 4. Padrões prontos

Axe na página inteira (já existe, reaproveite): `import expectNoAxeViolations from "./support/expectNoAxeViolations"` e `await expectNoAxeViolations(page)`. Violação se corrige na marcação ou no CSS, nunca desligando regra.

Teclado:

```ts
await page.keyboard.press("Tab")
await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused()
```

Estado de componente:

```ts
const button = page.getByRole("button", { name: "Menu" })
await button.click()
await expect(button).toHaveAttribute("aria-expanded", "true")
```

Alvo de 44px:

```ts
const box = await target.boundingBox()
expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
```

Revelar ao rolar: `await locator.scrollIntoViewIfNeeded()` e depois `await expect(locator).toHaveAttribute("data-reveal", "visible")`.

Arrastar com o mouse: `page.mouse.move`, `page.mouse.down`, `page.mouse.move` em passos e `page.mouse.up`; confira `scrollLeft` com `locator.evaluate`.

Erro de console: registre com `page.on("console", ...)` e `page.on("pageerror", ...)` antes do `goto` e afirme lista vazia no fim.

Idioma: o idioma vem do caminho (`pt-BR`, `en`, `es`); teste de texto afirma a língua da rota. Troca de idioma pelo seletor muda o caminho, `<html lang>` e o `<title>`.

JavaScript desligado: `test.use({ javaScriptEnabled: false })` num `describe` verifica o HTML pré-renderizado (NF-CO-03).

## 5. Fluxos que toda tela entrega

Toda tela nova entrega os E2E dos próprios fluxos, no arquivo do tema (ou num arquivo novo `e2e/<tela>.spec.ts`), junto do axe e do teclado:

- clique e navegação: cada controle e link da tela leva ao destino com o idioma mantido, nos três idiomas;
- estados de carregamento e erro: alerta com "Tentar novamente", retry sem recarregar e devolvendo o foco, `role="status"` de carregando com o esqueleto `aria-hidden`;
- HTML sem JavaScript: `main`, `h1`, conteúdo principal, `lang`, `title` e `description` no HTML pré-renderizado.

A base atual: `theme`, `motion`, `language`, `navigation`, `footer`, `home-flows`, `not-found` e `no-javascript`.

Título de teste: `"<ID>: <comportamento em português>"`, com o ID do requisito (`RF-LAY-18`, `RF-HOME-24`, `A11Y-L07`, `NF-IN-09`); dois requisitos separados por vírgula. `describe` agrupa por tema. O requisito vai no título, nunca em comentário.

Helpers de `e2e/support/` (um símbolo por arquivo, `export default`, sem importar `src/`):

| Helper                       | Para quê                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `readContent(lang, file)`    | lê `public/content/<idioma>/<arquivo>.json` no Node (`unknown`)                                    |
| `readProfile(lang)`          | e-mail, GitHub, LinkedIn, disponibilidade, apresentação e itens da stack do perfil                 |
| `readFeaturedProjects(lang)` | destaques da Início na ordem da tela (`featured`, mais recentes primeiro, até 4), com `id`/`title` |
| `readAppVersion()`           | `version` do `package.json`                                                                        |
| `readStackOffset(page, h)`   | deslocamento horizontal da faixa de tecnologias (movimento)                                        |
| `openPreferences(page)`      | abre a engrenagem (desktop) ou o Menu (mobile) e devolve o painel com tema e movimento             |
| `uiTexts`                    | texto de UI por idioma que o teste afirma (copiado de `src/locales/`, nunca importado)             |

Dado de conteúdo que o teste afirma vem desses helpers, nunca digitado. Se o conteúdo vier vazio, o teste falha de propósito (`expect(lista.length).toBeGreaterThan(0)`), não pula.

Prova de mutação, por tarefa: depois de ver o teste passar, quebre o comportamento de propósito no working tree (inverta `aria-pressed`, troque a chave de armazenamento, remova `aria-current`, troque o destino de um link, remova o `role`), rode `npm run build:fatec` e o teste, veja falhar pelo motivo certo, desfaça (`git checkout -- <arquivo>`), refaça o build e veja passar. A mutação nunca é commitada. Mutação que sobrevive é teste fraco: reforce a asserção (mutante equivalente, que não muda comportamento observável, é registrado como tal). Mutação que quebra o typecheck do `build:fatec` não conta como prova.

Erro e carregando forçados: a primeira carga vem hidratada do HTML e não faz `fetch` dos JSON. Para forçar erro, troque o idioma pelo seletor (a consulta é por idioma) com `page.route("**/content/<idioma-destino>/<arquivo>.json", (route) => route.abort())` e, no retry, `page.unroute`. Para forçar carregando ou perfil ausente, abra `pt-BR/rota-inexistente` e vá à Início pelo cabeçalho (a consulta nasce do zero): retenha a resposta com uma promessa do teste (`Promise.withResolvers`, nunca por tempo). Página de erro: aborte o chunk lazy (`**/assets/Home.page-*.js`) e clique em "Início" no cabeçalho. O RTK Query mantém o dado do idioma anterior ao trocar de idioma, então a troca não mostra esqueleto.

## 6. Armadilhas

- `reducedMotion: "reduce"` é o padrão: animação, fade-in (`data-reveal`) e faixa de stack rodam no modo reduzido. Não afirme movimento sem trocar o projeto para `no-preference`.
- O Pages serve sob `/ra2581392423047/`: nunca escreva caminho absoluto (`/pt-BR`), ele sai do `base`.
- Elementos com `inert` ou fora da viewport não recebem clique: role até eles ou espere o estado.
- `getByRole("link", { name })` casa por substring sem `exact: true`; nomes curtos ("Ver") casam vários links. Use nome completo ou `exact`.
- Teste que depende de dado (projetos em destaque) usa o conteúdo real de `public/content/`; o dado vem dos helpers de `e2e/support/`, nunca digitado, e conteúdo vazio faz o teste falhar de propósito, não pular.
- Nome acessível muda por idioma (o botão "Menu" é "Menú" em `es`, a nav é "Main" em `en`): leia de `uiTexts`.
- `<noscript>` com JavaScript desligado: `toHaveText` e `getByText` não o enxergam; leia `locator("noscript").innerHTML()`.
- Clique que o Playwright faz pode rolar a página; para afirmar posição de rolagem, ative por teclado (`focus()` e `Enter`).
- Link para PDF de CV pode dar 404 até a #54: afirme que o link existe e o `href`, não que o arquivo baixa.
- Falha só no CI: abra o relatório HTML e o trace (`--trace on`); `retries` é 2 no CI e 0 local, então teste instável aparece local como falha única.

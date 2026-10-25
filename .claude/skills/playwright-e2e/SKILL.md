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

## 5. Armadilhas

- `reducedMotion: "reduce"` é o padrão: animação, fade-in (`data-reveal`) e faixa de stack rodam no modo reduzido. Não afirme movimento sem trocar o projeto para `no-preference`.
- O Pages serve sob `/ra2581392423047/`: nunca escreva caminho absoluto (`/pt-BR`), ele sai do `base`.
- Elementos com `inert` ou fora da viewport não recebem clique: role até eles ou espere o estado.
- `getByRole("link", { name })` casa por substring sem `exact: true`; nomes curtos ("Ver") casam vários links. Use nome completo ou `exact`.
- Teste que depende de dado (projetos em destaque) usa o conteúdo real de `public/content/`; se o conteúdo mudar, use contagem mínima ou `test.skip` com motivo, não valor fixo frágil.
- Link para PDF de CV pode dar 404 até a #54: afirme que o link existe e o `href`, não que o arquivo baixa.
- Falha só no CI: abra o relatório HTML e o trace (`--trace on`); `retries` é 2 no CI e 0 local, então teste instável aparece local como falha única.

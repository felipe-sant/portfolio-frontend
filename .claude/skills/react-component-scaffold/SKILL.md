---
name: react-component-scaffold
description: Como criar um componente reutilizável neste projeto React, seguindo a convenção Componente + CSS Module + teste em test/. Use quando for adicionar, alterar, renomear ou remover um componente em src/components/.
---

# React Component Scaffold

**Tem rota própria → é página** (use a skill `react-page-scaffold`). **É reaproveitado dentro de outras telas e não tem rota → é componente**, e esta skill é a certa. Estrutura de página compartilhada (header/footer em volta de um `<Outlet />`) é `src/layouts/`, que não é assunto desta skill.

Um componente é composto por **duas peças que precisam existir juntas** — mais o teste, que é obrigatório e está na terceira linha da tabela. O estilo **não** fica ao lado do componente; o teste fica em `src/components/test/`.

| Peça       | Caminho                                                           | Se faltar                                                                           |
| ---------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Componente | `src/components/<Nome>.tsx` (PascalCase, **sem sufixo** de papel) | —                                                                                   |
| Estilo     | `src/styles/components/<nome>.module.css` (camelCase)             | `css.<classe>` vira `undefined`, o elemento renderiza sem `class` e sem erro nenhum |
| Teste      | `src/components/test/<Nome>.test.tsx`                             | o `reviewer` bloqueia a revisão — a falta de teste é reprovação incondicional       |

Se `src/components/` não existir, crie a pasta no primeiro uso. Os trechos abaixo, com um `SaveButton` hipotético, ilustram o formato esperado das três peças.

## Passo a passo

### 1. Componente — `src/components/<Nome>.tsx`

Arquivo em PascalCase, **sem sufixo** de papel: `SaveButton.tsx`, não `SaveButton.component.tsx` (o sufixo existe para distinguir papéis dentro de uma pasta — `.page.tsx`, `.layout.tsx`, `.service.ts` —, e dentro de `components/` só há componentes). Componente `function <Nome>()` com `export default` no final do arquivo, não `export default function`.

```tsx
import css from "@/styles/components/saveButton.module.css"

interface SaveButtonProps {
    label: string
    onClick?: () => void
}

function SaveButton({ label, onClick }: SaveButtonProps) {
    return (
        <button type="button" className={css.saveButton} onClick={onClick}>
            {label}
        </button>
    )
}

export default SaveButton
```

Import interno sempre com o alias `@/`, nunca subindo de pasta com `../`.

O `SaveButton` não chama `t()`: o `label` muda a cada uso, então chega por prop **já traduzido** por quem renderiza o componente (ver "Consumindo o componente"). Texto fixo do componente, que é igual em todo uso, é o caso da seção 5.

### 2. Props — interface `<Nome>Props` local e sem `export`

A interface de props fica **no arquivo do componente, sem `export`**: tipo não exportado é local por padrão. Só se outro arquivo precisar importar o tipo ele deixa de ser local e vai para `src/types/<dominio>/<Nome>Props.types.ts`, em arquivo próprio com `export default` no final. Mover props para `src/types/` sem necessidade só adiciona um import e um lugar a mais para desatualizar. A regra está no `CLAUDE.md`.

- Prop opcional com `?` (`onClick?: () => void`), e o valor padrão no destructuring quando fizer sentido.
- `strict` está ativo: nada de `any` explícito nem de cast para calar o compilador. Se o tipo for difícil, use `unknown` com checagem.
- **Nome de prop em inglês, texto visível traduzido.** `<SaveButton label={t("profile.saveChanges")} />` é o exemplo canônico: `SaveButton`, `label` e a chave em inglês; o conteúdo que o usuário lê vem do valor da chave em `src/locales/<idioma>/`. Prop de texto é `string` e recebe o texto pronto — o componente não recebe chave de tradução nem traduz o que recebeu. Passar literal (`label="Salvar alterações"`) é acusado pelo lint `react/jsx-no-literals` fora de teste.

### 3. Composição em vez de mais uma prop booleana

Para um componente que embrulha conteúdo, receba `children`:

```tsx
import type { ReactNode } from "react"
import css from "@/styles/components/example.module.css"

interface ExampleProps {
    title: string
    children: ReactNode
}

function Example({ title, children }: ExampleProps) {
    return (
        <section className={css.example}>
            <h2>{title}</h2>
            {children}
        </section>
    )
}

export default Example
```

Quando a terceira prop booleana aparecer (`isCompact`, `hasBorder`, `withIcon`) e as combinações começarem a se excluir, o sinal é para expor um slot (`children`, ou uma prop de nó) em vez de somar mais um booleano.

Componente cuida de **renderização e interação**. Ele não busca dado nem guarda regra de negócio: acesso a dado externo vai para `src/services/` (como `src/services/http/get.ts`) e lógica reutilizável vira hook em `src/hooks/` (um `useDebounce`, por exemplo). Um componente que faz `fetch` direto não dá erro de compilação — dá trabalho de teste e de reuso.

### 4. Estilo — `src/styles/components/<nome>.module.css`

Nome do arquivo em camelCase, correspondendo ao componente (`SaveButton.tsx` → `saveButton.module.css`). O estilo **não** fica ao lado do componente: fica em `src/styles/components/`.

**Toda classe usada como `css.<algo>` no JSX precisa existir aqui.** `src/types/declarations.d.ts` tipa o módulo como `{ [key: string]: string }`, ou seja, qualquer chave compila — `css.missingClass` não é erro de tipo, é `undefined` em runtime e o elemento sai sem `class`. Um CSS Module vazio com `css.<classe>` em uso compila, builda e renderiza o componente sem estilo. Nem o `tsc` nem o teste pegam isso: confira o par JSX ↔ CSS a olho.

Use as custom properties de `src/styles/global.css` (cor, tipografia, espaçamento) em vez de valor hardcoded; confira os nomes no arquivo antes de usar. O `saveButton.module.css` hipotético, com os nomes como placeholder:

```css
.saveButton {
    font-family: var(--<token-de-fonte>);
    border: 1px solid var(--<token-de-cor-de-borda>);
    background-color: var(--<token-de-cor-de-fundo>);
    color: var(--<token-de-cor-de-texto>);
}
```

Token novo de cor ou fonte entra em `global.css`; o que é específico do componente fica no CSS Module dele. Não introduza estilo inline nem CSS global de escopo local.

### 5. Texto fixo — namespace `common`, chave `<componente>.<papel>`

Texto que é igual em todo uso do componente (o `aria-label` de um botão só com ícone, um "Fechar", um "Carregando...") não vira prop: o próprio componente traduz, com a chave `common:<componente>.<papel>` — componente em lowerCamelCase, papel em inglês (`common:saveButton.label`, `common:closeButton.label`). O namespace `common` é o `defaultNS`, então dentro do componente basta `useTranslation()` sem argumento e `t("closeButton.label")`, sem o prefixo `common:`.

O valor entra nos três arquivos, `pt-BR` primeiro — é a língua de referência, de onde sai o tipo das chaves:

- `src/locales/pt-BR/common.json` → `"closeButton": { "label": "Fechar" }`
- `src/locales/en/common.json` → `"closeButton": { "label": "Close" }`
- `src/locales/es/common.json` → `"closeButton": { "label": "Cerrar" }`

Chave em `pt-BR` que falta em `en` ou `es` quebra o `npm run typecheck`; chave escrita errado no `t()` também. Os JSON usam 4 espaços de indentação.

```tsx
import { useTranslation } from "react-i18next"
import css from "@/styles/components/closeButton.module.css"

interface CloseButtonProps {
    onClick: () => void
}

function CloseButton({ onClick }: CloseButtonProps) {
    const { t } = useTranslation()

    return (
        <button
            type="button"
            className={css.closeButton}
            aria-label={t("closeButton.label")}
            onClick={onClick}
        >
            <span className={css.icon} aria-hidden="true" />
        </button>
    )
}

export default CloseButton
```

`useTranslation()` faz o componente re-renderizar quando o idioma troca. O lint `react/jsx-no-literals` acusa, fora de `*.test.ts(x)`, texto literal como filho (`<p>Fechar</p>`, `<p>{"Fechar"}</p>`) e string literal nos atributos `aria-label`, `aria-description`, `title`, `alt`, `placeholder`, `label` e `content`. Atributo que não é texto de UI (`type="button"`, `aria-hidden="true"`) continua literal.

### 6. Acessibilidade mínima

É o que o `reviewer` audita, e o que faz `getByRole` funcionar no teste:

- **Elemento semântico certo.** `<button type="button">` para ação, nunca `<div onClick>` — a `div` não recebe foco, não responde a Enter/Espaço e não tem papel de botão. `type="button"` evita o submit implícito dentro de `<form>`.
- **Nome acessível.** O texto visível já serve (`{label}` dentro do `<button>`). Se o controle só tem ícone, ele precisa de `aria-label` traduzido — `aria-label={t("closeButton.label")}`, como no `CloseButton` da seção 5.
- **`alt` em toda imagem** — descritivo e traduzido (`alt={t("<componente>.<papel>")}`, ou vindo de prop quando varia por uso), ou `alt={""}` quando a imagem for puramente decorativa — escrito como expressão, porque `alt=""` é string literal num atributo restrito e o lint acusa.
- Navegação interna com `<Link to="...">`/`useNavigate` do `react-router-dom`, nunca `<a href>` para rota interna: a âncora crua força reload completo e descarta o estado da aplicação. Componente com `<Link>` dentro só renderiza sob um router — o teste dele precisa de `MemoryRouter` em volta.

### 7. Teste — `src/components/test/<Nome>.test.tsx`

Todo componente novo ou alterado precisa do teste em `src/components/test/`, no mesmo commit. Não é tarefa para depois: o `reviewer` trata a ausência como bloqueante incondicional.

**Como escrever e rodar o teste está na skill `vitest-specialist`** (`.claude/skills/vitest-specialist/SKILL.md`) — esta skill não repete a receita. A skill traz um trecho de teste de componente com render e clique.

O `src/setupTests.ts` volta o idioma para `pt-BR` antes de cada teste, então o teste afirma o texto em português: o texto fixo pelo valor de `pt-BR` (`getByRole("button", { name: "Fechar" })`) e o texto de prop pelo literal que o próprio teste passou (`<SaveButton label="Salvar alterações" />`). Literal em `*.test.tsx` é permitido — o `react/jsx-no-literals` fica desligado para teste.

## Consumindo o componente

Quem renderiza traduz o texto que varia por uso com o próprio `t()` e passa o resultado por prop. Numa página `Profile.page.tsx` hipotética, a chave vive no namespace da página (`profile:saveChanges`) e só a página sabe dela:

```tsx
import { useTranslation } from "react-i18next"
import SaveButton from "@/components/SaveButton"
import useProfile from "@/pages/hooks/useProfile"

function ProfilePage() {
    const { t } = useTranslation("profile")
    const { save } = useProfile()

    return <SaveButton label={t("saveChanges")} onClick={save} />
}

export default ProfilePage
```

Componente com texto fixo (seção 5) não pede nada de quem consome: `<CloseButton onClick={close} />`.

## Estado compartilhado

Componente reutilizável recebe dado por prop. Quando precisar ler a store, use `useAppSelector` com seletor estreito e `useAppDispatch` (skill `redux-store-scaffold`); dado do servidor entra por endpoint do RTK Query (skill `rtk-query-endpoint-scaffold`), de preferência consumido pela página e passado por prop. O teste usa `renderWithStore` (skill `vitest-specialist`).

## Checklist

- [ ] `src/components/<Nome>.tsx` criado, PascalCase e sem sufixo, com `export default` no final
- [ ] Interface `<Nome>Props` no próprio arquivo do componente, sem `export` e sem `any`
- [ ] Um único símbolo exportado (`export default` no final); tipo exportado só em `src/types/<dominio>/<Nome>.types.ts`
- [ ] Nome de prop e chave de tradução em inglês
- [ ] Texto que varia por uso chega por prop, já traduzido por quem chama com `t()`
- [ ] Texto fixo do componente via `t("<componente>.<papel>")` (namespace `common`), com o valor em `src/locales/pt-BR/common.json`, `en/common.json` e `es/common.json`
- [ ] Nenhum texto de UI literal no JSX, nem em `aria-label`, `title`, `alt`, `placeholder`, `label` ou `content` (`npm run lint` acusa)
- [ ] `src/styles/components/<nome>.module.css` criado, e **toda** classe usada como `css.<algo>` existe nele
- [ ] Cores e fonte vindas das custom properties de `global.css`
- [ ] Elemento semântico correto, com nome acessível traduzido (`aria-label={t(...)}` em controle só com ícone, `alt` em imagem)
- [ ] `src/components/test/<Nome>.test.tsx` criado, cobrindo render e interação e afirmando o texto em `pt-BR` (ver `vitest-specialist`)
- [ ] Sem comentário no código, import interno com `@/` e nunca `../`
- [ ] `npm run typecheck`, `npm run lint`, `npm test -- --run` e `npm run build` passando
- [ ] O componente foi visto renderizado (`npm run dev`) — o build passar não prova que o estilo foi aplicado

## Ao remover ou renomear um componente

Remova ou renomeie as três peças juntas — componente, CSS Module e teste — e só então procure quem importava:

```bash
grep -rn "components/<Nome>" src/
```

Um import órfão quebra o build e aparece logo. Um **CSS Module órfão não quebra nada** e fica esquecido no repositório; um **teste que ficou para trás** ou deixa de ser coletado (se o nome saiu da convenção) ou passa a testar um import morto e derruba o build. Ao renomear, o arquivo de estilo acompanha em camelCase (`Example.tsx` → `example.module.css`) e o teste em PascalCase (`src/components/test/Example.test.tsx`).

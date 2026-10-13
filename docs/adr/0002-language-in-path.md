# 0002. Idioma no caminho da URL

- **Status:** `aceita`
- **Data:** `12-10-2026`

## Contexto

Até aqui o idioma era decidido por `?lng=`, escolha salva, idioma do navegador e `en`, nessa ordem, com `i18next-browser-languagedetector`. A mesma URL abria em idiomas diferentes conforme quem pedia, o que impede cada idioma de ter URL própria, HTML pré-renderizado próprio (NF-IN-07) e `hreflang` (NF-IA-11). O PO decidiu pôr o idioma no caminho na v1 (`D31`) com caminhos em inglês numa tabela única (`D32`). Em 12-10-2026 decidiu também que todo idioma tem prefixo, inclusive `pt-BR`.

## Decisão

- Todo idioma tem prefixo: `/pt-BR`, `/en`, `/es`, numa única rota-pai repetida três vezes, sem caso por idioma.
- Nenhum caminho gerado pelo app termina em barra (`/en`, `/en/projects`).
- O idioma é lido do primeiro segmento do caminho por `getLanguageFromPath`; o `loader` de cada rota-pai chama `i18n.changeLanguage`, antes do render. `i18n.ts` inicia com o idioma do caminho.
- A raiz `/` só redireciona, nesta ordem: escolha salva, idioma do navegador, `en`. Um script inline no `<head>` do `index.html` faz isso antes da pintura; o `loader` da rota `/` faz o mesmo dentro do app quando o script não rodou.
- `/pt/...`, `/fr/...` e caminho sem prefixo (`/projects`) caem na página não encontrada, em inglês.
- `?lng=` e o detector do i18next são removidos; `setLanguage` continua salvando a escolha, que só a raiz lê.
- Todo link interno é montado por `buildPath`/`useLocalizedPath` a partir de `ROUTES`; `getEquivalentPath` devolve a URL equivalente em outro idioma, para o seletor da #33.

## Consequências

- Cada idioma tem URL própria, o que destrava a pré-renderização por idioma e o `hreflang` (#41, #49).
- `/` deixa de ser conteúdo e vira redirecionamento por JavaScript (sem 301 no GitHub Pages). A #49 decide se o `x-default` do `hreflang` aponta para `/` ou `/en`.
- O GitHub Pages só serve `/en` sem redirecionar para `/en/` se existir `en.html`; a pré-renderização (#41, #49) precisa emitir um `.html` por idioma e por rota. O código funciona no dev server sem isso.
- O script inline duplica a chave de `localStorage` e o mapa de idiomas; `src/i18n/test/rootRedirect.test.ts` compara o resultado com `getPreferredLanguage` para a duplicação não divergir.
- O `jsdom` reporta `en-US`: teste que abria `/` esperando `pt-BR` passa a abrir `/pt-BR`.
- O `base` do Vite é lido por `publicUrl` e usado como `basename` do roteador; o `pathname` das funções de caminho é sempre relativo a ele.

## Alternativas

- `:lang?` opcional: com prefixo obrigatório não há ambiguidade, mas validar o idioma viraria código extra; prefixos estáticos deixam o `react-router` rejeitar o desconhecido.
- Detector customizado do i18next lendo o caminho: o detector só roda em `init()` e em `changeLanguage()` sem argumento, e lê `window.location`, que não existe no `createMemoryRouter` dos testes.
- Decidir o idioma por `useParams` e `changeLanguage` em efeito: o primeiro render sairia no idioma errado; o `loader` roda antes do render.
- `/pt` redirecionando para `/pt-BR`: exigiria uma quarta rota-pai especial, criaria uma segunda URL por conteúdo e não tem consumidor.
- `pt-BR` sem prefixo: obrigaria um caso por idioma em `buildPath` e nas rotas.

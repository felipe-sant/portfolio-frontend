# Layout compartilhado

O layout é tudo que aparece em mais de uma tela: cabeçalho, menu mobile, seletor de idioma,
alternador de tema, rodapé (padrão e a variação de navegação em `/contact`), página não
encontrada, página de erro e metadados por rota e idioma. Quem o implementa é a issue C, com A
(tokens, tema e foco), B (componentes e ícones), W (idioma no caminho, função de URL equivalente e
redirecionamento da raiz) e V (canônica, Open Graph e JSON-LD). Este documento diz o
comportamento; não escolhe nome de componente nem de arquivo, além do namespace e da chave de
tradução.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`ProtoHeader`, `ProtoFooter`,
`prototipo-404` e `prototipo-erro`, em [`prototype/`](../design/prototype/README.md)),
[`accessibility.md`](../product/accessibility.md) e
[`non-functional-requirements.md`](../product/non-functional-requirements.md).

Cada requisito funcional tem um ID `RF-LAY-nn`, estável e nunca reaproveitado: item que deixa de
valer é riscado, não apagado nem renumerado (mesma regra de `accessibility.md`). O protótipo usa os
caminhos antigos (`/projetos`, `/contato`); valem os caminhos em inglês de `D32`.

## Objetivo

Dar a todas as telas a mesma moldura: quem é o autor (gato e nome, que levam ao início), para onde
ir (navegação com a tela atual marcada), em que idioma e tema ler e como falar com o autor
(rodapé), e dizer o que aparece quando a página não existe ou quebra.

## Estados

| Estado                                 | O que aparece                                                                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal, a partir de 640px              | Cabeçalho fixo no topo: gato e nome à esquerda; à direita, navegação (Início, Projetos, Informações, Contato), seletor `PT · EN · ES` e alternador de tema. Conteúdo da tela no `main`. Rodapé padrão (ou de navegação em `/contact`)                        |
| Normal, abaixo de 640px, menu fechado  | Cabeçalho com gato e nome e o botão de menu de 44px (ícone hambúrguer); navegação, seletor e alternador ficam no painel                                                                                                                                      |
| Menu aberto (abaixo de 640px)          | Painel em largura total abaixo do cabeçalho até o fim da tela, rolável por dentro: links em coluna de 52px, depois "Idioma" com três botões de 44px e "Tema" com o alternador. Botão mostra o ícone ×. Rolagem da página travada e o resto da página `inert` |
| Carregando a tela (código da rota)     | Cabeçalho e rodapé visíveis; no lugar do conteúdo, só o status "Carregando..." visualmente oculto em `role="status"` (A11Y-G13). O carregamento de dados de cada tela é da spec dela                                                                         |
| Carregando o conteúdo do rodapé        | O rodapé mostra só o que não depende do conteúdo: rótulo "Contato", link "Entrar em contato", barra inferior. Disponibilidade, localização, e-mail, "Copiar e-mail" e redes aparecem quando o conteúdo chega, sem skeleton (o rodapé fica abaixo da dobra)   |
| Conteúdo do rodapé indisponível (erro) | Igual a "carregando", sem mensagem de erro no rodapé: o erro de carregamento é anunciado pela tela (A11Y-G14), não pelo rodapé                                                                                                                               |
| E-mail copiado                         | O botão "Copiar e-mail" passa a "E-mail copiado" por 2,2 s e o resultado é anunciado em `role="status"` (A11Y-L11)                                                                                                                                           |
| Falha ao copiar                        | O botão passa a "Não foi possível copiar" por 2,2 s, anunciado no mesmo `role="status"`. O e-mail continua visível ao lado para cópia manual                                                                                                                 |
| `/contact` (D04, D21)                  | Rodapé de navegação: colunas "Navegação" (Início, Projetos, Informações) e "Redes" (GitHub, LinkedIn, "Currículo em PDF"), sem a chamada para contato, sem e-mail e sem "Copiar e-mail"; barra inferior igual                                                |
| Página não encontrada                  | Cabeçalho sem item ativo, rótulo "Erro 404", `h1` "Página não encontrada", texto, "Ver projetos" (primário) e "Voltar para o início"; rodapé padrão                                                                                                          |
| Página de erro                         | Cabeçalho sem item ativo, ícone de alerta, `h1` "Erro inesperado", texto, "Tentar novamente" (primário) e "Voltar para o início"; rodapé padrão. Nunca mostra a mensagem técnica do erro                                                                     |
| Sem JavaScript                         | O HTML pré-renderizado (S) tem cabeçalho, navegação, seletor de idioma (links reais, funcionam sem JS) e rodapé legíveis. Menu mobile, alternador de tema, "Copiar e-mail" e salvar a escolha de idioma precisam de JavaScript (NF-CO-03)                    |

O estado "Vazio" do molde não se aplica ao layout, que não tem lista própria.

## Validações

Não há campo de formulário no layout. Regras de entrada e o que acontece quando falham:

| Entrada                                 | Regra                                                                                                            | Quando falha                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Prefixo de idioma no caminho            | Só sem prefixo (`pt-BR`), `/en/` e `/es/` (NF-IN-06)                                                             | Prefixo desconhecido (`/fr/projects`) cai na página não encontrada, em `pt-BR` |
| `?lng=` na URL                          | Ignorado (NF-IN-08)                                                                                              | Nada muda; o caminho decide                                                    |
| Tema salvo no navegador                 | Só `light` ou `dark`                                                                                             | Valor ausente ou inválido é ignorado: vale `prefers-color-scheme` (NF-TE-02)   |
| Idioma salvo no navegador               | Só `pt-BR`, `en` ou `es`; só redireciona a raiz `/` (NF-IN-09, W)                                                | Valor inválido é ignorado                                                      |
| `?tema=` na URL                         | Não é recurso do produto (D35, RF-LAY-19)                                                                        | Ignorado                                                                       |
| Área de transferência ("Copiar e-mail") | `navigator.clipboard.writeText` precisa existir e resolver                                                       | "Não foi possível copiar" (ver Estados)                                        |
| Rota de tela, id de projeto, documento  | Só os caminhos de D32; id inexistente, documento opcional que o projeto não tem ou subcaminho desconhecido (D33) | Página não encontrada                                                          |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê e usa tudo do layout. Não há ação
restrita. A flag do formulário de contato (D05) não muda o layout: o link do rodapé leva a
`/contact` com a flag ligada ou desligada.

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Cabeçalho

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                          | Fonte                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `RF-LAY-01` | Fixo no topo (sticky) em todas as telas, inclusive não encontrada e erro, com fundo `--surface-chrome` e borda inferior `--border-chrome` (D04); altura mínima de 4rem; o foco nunca fica embaixo dele (`scroll-padding-top`, A11Y-L13)                                                                                                                                                        | Protótipo, D04          |
| `RF-LAY-02` | À esquerda, um link para o início do idioma atual com o gato (SVG inline, corpo `--neutral-500`, detalhe `--text-strong`, `aria-hidden`) e o nome "Luiz Felipe dos Santos" (Bricolage 700). O nome acessível do link é o nome do autor; o nome não é heading                                                                                                                                   | D02, `accessibility.md` |
| `RF-LAY-03` | Navegação principal em `nav` com nome "Principal": Início (`/`), Projetos (`/projects`), Informações (`/about`) e Contato (`/contact`), sempre com o prefixo do idioma atual (NF-IN-11)                                                                                                                                                                                                        | Protótipo, D32          |
| `RF-LAY-04` | Item ativo: Início só em `/` exato; Projetos em `/projects`, `/projects/:id` e nos documentos (`/architecture`, `/setup`, `/changelog`); Informações em `/about`; Contato em `/contact`; nenhum na página não encontrada e na de erro. O ativo tem `aria-current="page"`, peso 600, `--text-strong` e traço inferior de 2px em `--brand-variant` (no menu, traço de 2px à esquerda e peso 800) | Protótipo, A11Y-L04     |
| `RF-LAY-05` | A troca entre navegação completa e botão de menu é por media query no CSS (640px), não por largura lida em JavaScript: os dois existem no HTML pré-renderizado e a primeira renderização do cliente é igual a ele (NF-TE-04). Só um dos dois está visível e na árvore de acessibilidade de cada vez                                                                                            | NF-TE-04, NF-IA-01      |

### Menu mobile

| ID          | Regra                                                                                                                                                                                                                                                                                                                  | Fonte                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `RF-LAY-06` | Abaixo de 640px, botão de 44px com nome fixo "Menu", `aria-expanded` e `aria-controls` apontando o painel; ícone hambúrguer fechado e × aberto (`aria-hidden`). O protótipo troca o nome ("Abrir menu"/"Fechar menu"); vale o nome fixo, pelo mesmo motivo do alternador de tema (o estado já está em `aria-expanded`) | D01, A11Y-L08                                    |
| `RF-LAY-07` | O painel é disclosure, não diálogo: ao abrir, o foco vai para o primeiro link; Tab e Shift+Tab circulam entre o botão de menu e o painel; o resto da página fica `inert`; a rolagem da página trava                                                                                                                    | D01, PI1, achado de `accessibility.md`, A11Y-L09 |
| `RF-LAY-08` | Fecha por Esc (o foco volta ao botão), pelo botão, por clique num link de navegação, quando a rota muda por outro meio (voltar do navegador) e ao alargar a janela para 640px ou mais. Trocar de idioma ou de tema dentro do painel não fecha: o foco fica no controle usado                                           | D01, PI1                                         |
| `RF-LAY-09` | Conteúdo do painel: os quatro links (coluna de 52px), o rótulo "Idioma" com os três idiomas em alvos de 44px (ativo em `--bg-highlight` com borda `--brand-variant`) e o rótulo "Tema" com o alternador com texto visível "Tema escuro". Rótulos em caixa normal no JSON, caixa alta por CSS                           | D01, D12                                         |
| `RF-LAY-10` | Com `prefers-reduced-motion: reduce`, abrir e fechar o painel não anima (2.3.3)                                                                                                                                                                                                                                        | A11Y-G12                                         |

### Idioma

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                            | Fonte                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `RF-LAY-11` | O idioma da página vem do caminho: sem prefixo é `pt-BR`, `/en/` é `en`, `/es/` é `es`; `<html lang>` acompanha o caminho. O navegador e o `?lng=` não decidem; a única exceção é o redirecionamento da raiz `/` por escolha salva, que é de W                                                                                                                                                                   | NF-IN-05, NF-IN-06, NF-IN-08, NF-IN-09 |
| `RF-LAY-12` | Seletor `PT · EN · ES` entre a navegação e o alternador de tema, em grupo com nome "Idioma". Cada opção é um link (`<Link>`) para a URL equivalente no idioma de destino (mesma rota, mesmo id, mesmo documento, mesma query e mesma âncora), montada pela função de W, com `hreflang` e `lang` do destino; a ativa tem `aria-current="true"`, peso 600 e `--text-strong`. O separador `·` fica em `aria-hidden` | D12, D31, NF-IN-10, A11Y-L05           |
| `RF-LAY-13` | O nome acessível de cada opção começa pela sigla visível e traz o nome do idioma escrito nele mesmo ("PT Português", "EN English", "ES Español"), com a sigla visível e o nome em texto visualmente oculto; os valores são iguais nos três JSON                                                                                                                                                                  | `accessibility.md` (Idioma), 2.5.3     |
| `RF-LAY-14` | Escolher um idioma navega para a URL equivalente sem recarregar, salva a escolha por `setLanguage` (D31), atualiza `<html lang>` e `<title>`, preserva a posição de rolagem e devolve o foco à opção escolhida no seletor (exceção à regra de foco no `h1`)                                                                                                                                                      | D31, NF-IN-10, A11Y-L06                |
| `RF-LAY-15` | Todo link interno do layout (logo, navegação, rodapé, página não encontrada e página de erro) mantém o prefixo do idioma atual, montado a partir de `ROUTES` pela função única de W; nenhum caminho com prefixo é escrito à mão                                                                                                                                                                                  | NF-IN-11                               |

### Tema

| ID          | Regra                                                                                                                                                                                                                                                                                                            | Fonte                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `RF-LAY-16` | Claro e escuro por `data-theme` no `<html>`, com `color-scheme` correspondente; a primeira visita segue `prefers-color-scheme`; sem escolha salva, o tema acompanha o sistema inclusive quando ele muda com a página aberta; a escolha pelo alternador fica salva no navegador (chave definida em A) e prevalece | D22, NF-TE-01, NF-TE-02                |
| `RF-LAY-17` | Sem piscar o tema errado: o tema é aplicado antes da primeira pintura por script inline no `<head>`, e o `theme-color` acompanha o tema escolhido, não só o do sistema                                                                                                                                           | NF-TE-03 (implementado em A)           |
| `RF-LAY-18` | Alternador: botão de 44px com nome fixo "Tema escuro" e `aria-pressed="true"` no tema escuro; no cabeçalho é só ícone (lua no claro, sol no escuro, `aria-hidden`), no menu tem o texto visível "Tema escuro". Trocar não move o foco nem usa região de anúncio                                                  | Achado de `accessibility.md`, A11Y-L07 |
| `RF-LAY-19` | `?tema=` não é recurso do produto (D35): é ferramenta do protótipo para conferência; no produto, o tema vem só da escolha salva ou do sistema                                                                                                                                                                    | D22, D35                               |

### Rodapé padrão

Vale em todas as telas, menos `/contact`.

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Fonte                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `RF-LAY-20` | Linha superior de 2px em degradê horizontal (`#FFCC00` → `#F19100`) e fundo `--surface-chrome` (D04). Landmark `contentinfo`                                                                                                                                                                                                                                                                                                                                                    | D04, A11Y-L03           |
| `RF-LAY-21` | Bloco de contato: rótulo "Contato"; a frase de disponibilidade, a localização e o e-mail vêm do JSON de conteúdo (#10 define os campos do perfil e do contato, #13 preenche nos três idiomas), não de chave de tradução                                                                                                                                                                                                                                                         | #10, R1, NF-DA-02       |
| `RF-LAY-22` | Link primário para `/contact` com o rótulo "Entrar em contato", numa chave só, válida com o formulário ligado ou desligado (D05); a N não precisa mexer nela e a #6 reaproveita a mesma chave                                                                                                                                                                                                                                                                                   | Protótipo, D05, PO (Q1) |
| `RF-LAY-23` | Botão "Copiar e-mail" (ícone de cópia, `aria-hidden`): copia o e-mail do conteúdo, troca o rótulo por 2,2 s ("E-mail copiado" ou "Não foi possível copiar") e anuncia o resultado em `role="status"` que existe vazio desde a primeira renderização                                                                                                                                                                                                                             | Protótipo, A11Y-L11     |
| `RF-LAY-24` | Ícones de GitHub, LinkedIn e e-mail (`mailto:`), com alvos de 44px; as URLs e o e-mail vêm do conteúdo; os nomes acessíveis vêm de chave com o nome do autor ("GitHub de Luiz Felipe dos Santos (abre em nova aba)"). Rede sem URL no conteúdo não aparece. GitHub e LinkedIn abrem em nova aba (`target="_blank"`, `rel="noopener noreferrer"`), com o aviso no nome acessível; o `mailto:` não leva `target` (abre o cliente de e-mail, não uma aba) e o nome não fala em aba | D04, D21, D36, 2.4.9    |
| `RF-LAY-25` | Barra inferior separada por borda `--border-subtle`: "© `<ano>` · Luiz Felipe dos Santos" e "Feito em TypeScript". O ano é o do build: constante definida no `vite.config.ts` em tempo de build e interpolada em `footer.copyright`, igual no HTML pré-renderizado e na hidratação (NF-IA-03)                                                                                                                                                                                   | Protótipo, PO (Q2)      |

### Rodapé de navegação

Vale só em `/contact`.

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                            | Fonte                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| `RF-LAY-26` | No lugar do bloco de contato, duas colunas: "Navegação", um `nav` com nome "Rodapé" (A11Y-L12) e lista com Início, Projetos e Informações; e "Redes", lista com "GitHub ↗", "LinkedIn ↗" (URLs do conteúdo, em nova aba com o aviso no nome, D36) e "Currículo em PDF ↓". Sem chamada para contato, e-mail e "Copiar e-mail" (a tela já os mostra). Setas em `aria-hidden`. Barra inferior igual | D04, D21, D36             |
| `RF-LAY-27` | "Currículo em PDF" aponta para o PDF do idioma ativo (`cv/cv-pt-BR.pdf`, `cv/cv-en.pdf`, `cv/cv-es.pdf`, com `import.meta.env.BASE_URL`), mesmo antes de o arquivo existir (gerado por X); é download direto (atributo `download`, mesma origem), sem abrir aba e sem sair da página; o nome acessível diz o formato                                                                             | D14, D30, D36, roadmap M3 |

### Página não encontrada

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Fonte                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `RF-LAY-28` | Renderizada dentro do layout (cabeçalho e rodapé padrão) para toda URL sem rota, prefixo desconhecido, id inexistente e documento opcional ausente (D33), no idioma do prefixo. Rótulo "Erro 404" (caixa alta por CSS), `h1` "Página não encontrada", texto "O endereço pode ter mudado ou o projeto saiu do ar. A lista completa continua em Projetos.", link primário "Ver projetos" (`/projects`) e secundário "Voltar para o início" (`/`). Responde 404 no Pages (NF-IA-04) | `prototipo-404`, D33, A11Y-ER01 |

### Página de erro

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                        | Fonte                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `RF-LAY-29` | `errorElement` da rota do layout, renderizada sem o `MainLayout`: tem os próprios landmarks (cabeçalho, `main`, rodapé padrão) e o próprio "Pular para o conteúdo" (A11Y-ER02). Ícone de alerta em `--danger-ink` sobre `--danger-surface`, `h1` "Erro inesperado", texto "Algo quebrou do meu lado, não do seu. Tente de novo em alguns segundos.", botão primário "Tentar novamente" (recarrega a URL atual) e link "Voltar para o início" | `prototipo-erro`, A11Y-ER01, A11Y-ER02                      |
| `RF-LAY-30` | A mensagem técnica do erro nunca aparece (hoje a página mostra `error.message`, que é literal em português e técnico); a chave `error:unknown` sai. O protótipo diz "ERRO 500" e "Falha no servidor", que não descrevem um erro do cliente sem backend, e cita o e-mail, que vem do conteúdo e pode ser justamente o que falhou: a página não tem rótulo de código nem e-mail                                                                | R1, voz e copy ("dizem o que aconteceu e oferecem a saída") |

Um erro lançado pelo próprio cabeçalho ou rodapé também quebra a página de erro, que os renderiza;
nesse caso vale o comportamento padrão do React Router. Fica fora do escopo da C.

### Comum a todas as telas

| ID          | Regra                                                                                                                                                                                                                                                                                                                                | Fonte                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `RF-LAY-31` | "Pular para o conteúdo" é o primeiro elemento focável, visível ao receber foco, e leva ao `main` (`id` estável, `tabIndex={-1}`). O `main` é do layout, em volta do `<Outlet />`; as páginas deixam de renderizar o próprio `main` (a de erro mantém o seu)                                                                          | A11Y-L01, `accessibility.md` (Teclado e foco) |
| `RF-LAY-32` | Na navegação interna o foco vai para o `h1` da nova tela e o `<title>` muda; na primeira carga o foco não se move. A rolagem vai para o topo na navegação nova e é restaurada no voltar e avançar do navegador; com âncora na URL, vai para a âncora. Exceções: troca de idioma (RF-LAY-14) e troca de documento do projeto (D33, F) | A11Y-L02, D33                                 |
| `RF-LAY-33` | O favicon é o gato (D34): corpo `#7C7770` e detalhe por `<style>` interno com `@media (prefers-color-scheme: dark)` (`#202020` no claro, `#F2EEE7` no escuro), substituindo `public/favicon.svg`. Segue o tema do sistema, não o do site, porque o favicon não lê `data-theme`                                                       | D02, D34                                      |

### Abertura de links

Vale `D36` para todo link do layout: link interno navega na mesma aba, por `<Link>` do React Router
com o path de `ROUTES`; link externo (GitHub, LinkedIn) abre em nova aba com `target="_blank"` e
`rel="noopener noreferrer"`, com "(abre em nova aba)" no nome acessível; `mailto:` não leva
`target`; o CV em PDF é download direto.

## Navegação

Os caminhos são os de `D32`, sempre com o prefixo do idioma atual (sem prefixo em `pt-BR`, `/en/`,
`/es/`).

| De onde               | Ação                                       | Para onde                                                     |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------- |
| Qualquer tela         | Gato e nome                                | `/` do idioma atual                                           |
| Qualquer tela         | Início, Projetos, Informações, Contato     | `/`, `/projects`, `/about`, `/contact` do idioma atual        |
| Qualquer tela         | `PT`, `EN`, `ES`                           | A mesma URL no idioma escolhido (sem prefixo, `/en/`, `/es/`) |
| Qualquer tela         | Alternador de tema                         | Fica na mesma tela                                            |
| Rodapé padrão         | "Entrar em contato"                        | `/contact`                                                    |
| Rodapé padrão         | GitHub, LinkedIn                           | Perfis externos (URL do conteúdo), em nova aba (D36)          |
| Rodapé padrão         | Ícone de e-mail                            | `mailto:` com o e-mail do conteúdo                            |
| Rodapé de `/contact`  | Início, Projetos, Informações              | `/`, `/projects`, `/about` do idioma atual                    |
| Rodapé de `/contact`  | GitHub, LinkedIn                           | Perfis externos, em nova aba (D36)                            |
| Rodapé de `/contact`  | "Currículo em PDF"                         | Download do PDF do idioma ativo, sem sair da página (D36)     |
| Página não encontrada | "Ver projetos", "Voltar para o início"     | `/projects`, `/`                                              |
| Página de erro        | "Tentar novamente", "Voltar para o início" | A mesma URL (recarrega), `/`                                  |
| URL sem rota          | Abrir                                      | Página não encontrada                                         |
| Erro de renderização  | Abrir                                      | Página de erro                                                |

A primeira carga em `/` com escolha salva diferente de `pt-BR` redireciona para `/en/` ou `/es/`
(NF-IN-09, W); nenhuma outra rota redireciona por idioma.

## Textos fixos e chaves

Todo texto do layout vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e
`es` são escritos na implementação (C), com os mesmos namespaces e chaves (R2). Os nomes dos
idiomas ("Português", "English", "Español"), as siglas, "GitHub", "LinkedIn", "TypeScript" e os
símbolos são iguais nos três JSON.

O namespace é `common`, porque cabeçalho e rodapé são componentes de `src/components/` usados pelo
`MainLayout` e pela página de erro, que fica fora dele (convenção do `.claude/CLAUDE.md`: `common`
guarda texto fixo de componente). As chaves `mainLayout:brand` e `mainLayout:copyright` passam para
`common`, e o namespace `mainLayout` sai de `src/locales/`, de `resources.ts` e do `ns` de
`i18n.ts` se ficar vazio (R2: chave sem uso é removida).

| Namespace  | Chave                         | Valor em `pt-BR`                                                                           | Onde                                                                                   |
| ---------- | ----------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `common`   | `authorName`                  | Luiz Felipe dos Santos                                                                     | Nome no cabeçalho, nomes acessíveis, copyright (era `mainLayout:brand`, "Luiz Felipe") |
| `common`   | `loading`                     | Carregando... (existe)                                                                     | Status da tela carregando                                                              |
| `common`   | `backHome`                    | Voltar para o início (existe)                                                              | Página não encontrada e página de erro                                                 |
| `common`   | `skipToContent`               | Pular para o conteúdo                                                                      | Primeiro foco                                                                          |
| `common`   | `navigation.label`            | Principal                                                                                  | Nome do `nav` principal                                                                |
| `common`   | `navigation.home`             | Início                                                                                     | Cabeçalho, menu e rodapé de navegação                                                  |
| `common`   | `navigation.projects`         | Projetos                                                                                   | Idem                                                                                   |
| `common`   | `navigation.about`            | Informações                                                                                | Idem                                                                                   |
| `common`   | `navigation.contact`          | Contato                                                                                    | Cabeçalho e menu                                                                       |
| `common`   | `menu.toggle`                 | Menu                                                                                       | Nome do botão de menu                                                                  |
| `common`   | `menu.theme`                  | Tema                                                                                       | Rótulo no painel                                                                       |
| `common`   | `languageSelector.label`      | Idioma                                                                                     | Nome do grupo e rótulo no painel                                                       |
| `common`   | `languageSelector.ptBR.short` | PT                                                                                         | Sigla visível                                                                          |
| `common`   | `languageSelector.ptBR.name`  | Português                                                                                  | Parte oculta do nome acessível                                                         |
| `common`   | `languageSelector.en.short`   | EN                                                                                         | Sigla visível                                                                          |
| `common`   | `languageSelector.en.name`    | English                                                                                    | Parte oculta do nome acessível                                                         |
| `common`   | `languageSelector.es.short`   | ES                                                                                         | Sigla visível                                                                          |
| `common`   | `languageSelector.es.name`    | Español                                                                                    | Parte oculta do nome acessível                                                         |
| `common`   | `themeToggle.label`           | Tema escuro                                                                                | Nome fixo do alternador e texto no painel                                              |
| `common`   | `footer.contact.label`        | Contato                                                                                    | Rótulo do bloco de contato                                                             |
| `common`   | `footer.contact.cta`          | Entrar em contato                                                                          | Link para `/contact`                                                                   |
| `common`   | `footer.copyEmail.idle`       | Copiar e-mail                                                                              | Botão                                                                                  |
| `common`   | `footer.copyEmail.copied`     | E-mail copiado                                                                             | Botão e `role="status"`                                                                |
| `common`   | `footer.copyEmail.failed`     | Não foi possível copiar                                                                    | Botão e `role="status"`                                                                |
| `common`   | `footer.social.heading`       | Redes                                                                                      | Rótulo da coluna no rodapé de navegação                                                |
| `common`   | `footer.social.github`        | GitHub                                                                                     | Texto no rodapé de navegação                                                           |
| `common`   | `footer.social.githubName`    | GitHub de `{{name}}` (abre em nova aba)                                                    | Nome acessível                                                                         |
| `common`   | `footer.social.linkedin`      | LinkedIn                                                                                   | Texto no rodapé de navegação                                                           |
| `common`   | `footer.social.linkedinName`  | LinkedIn de `{{name}}` (abre em nova aba)                                                  | Nome acessível                                                                         |
| `common`   | `footer.social.emailName`     | Enviar e-mail para `{{name}}`                                                              | Nome do ícone de e-mail                                                                |
| `common`   | `footer.navigation.label`     | Rodapé                                                                                     | Nome do `nav` de `/contact`                                                            |
| `common`   | `footer.navigation.heading`   | Navegação                                                                                  | Rótulo da coluna                                                                       |
| `common`   | `footer.resume`               | Currículo em PDF                                                                           | Link do CV no rodapé de navegação                                                      |
| `common`   | `footer.copyright`            | © `{{year}}` · `{{name}}` (`year` do build)                                                | Barra inferior (era `mainLayout:copyright`)                                            |
| `common`   | `footer.madeWith`             | Feito em TypeScript                                                                        | Barra inferior                                                                         |
| `common`   | `symbols.external`            | ↗                                                                                          | Seta de link externo, em `aria-hidden`                                                 |
| `common`   | `symbols.download`            | ↓                                                                                          | Seta de download, em `aria-hidden`                                                     |
| `common`   | `symbols.separator`           | ·                                                                                          | Separador do seletor, em `aria-hidden`                                                 |
| `notFound` | `label`                       | Erro 404                                                                                   | Rótulo acima do `h1`                                                                   |
| `notFound` | `heading`                     | Página não encontrada (existe)                                                             | `h1`                                                                                   |
| `notFound` | `description`                 | O endereço pode ter mudado ou o projeto saiu do ar. A lista completa continua em Projetos. | Texto                                                                                  |
| `notFound` | `viewProjects`                | Ver projetos                                                                               | Link primário                                                                          |
| `error`    | `heading`                     | Erro inesperado (existe)                                                                   | `h1`                                                                                   |
| `error`    | `description`                 | Algo quebrou do meu lado, não do seu. Tente de novo em alguns segundos.                    | Texto                                                                                  |
| `error`    | `retry`                       | Tentar novamente                                                                           | Botão primário                                                                         |

Os símbolos ficam em chave porque `react/jsx-no-literals` acusa string literal em JSX. Saem
`error:unknown` (RF-LAY-30), `mainLayout:brand` e `mainLayout:copyright`. Os valores `en` de
`footer.contact.cta` são "Get in touch" e `es` "Ponerse en contacto" (resposta do PO).

### Vem do conteúdo, não de chave

O campo é definido na #10 e o valor é preenchido na #13, nos três idiomas quando é texto. Página e
componente leem esses dados pelos endpoints do RTK Query (NF-DA-02), nunca pelo JSON direto.

| Dado                       | Onde aparece                                          |
| -------------------------- | ----------------------------------------------------- |
| Frase de disponibilidade   | Bloco de contato do rodapé padrão                     |
| Localização                | Bloco de contato do rodapé padrão                     |
| E-mail                     | Rodapé padrão, "Copiar e-mail" e ícone `mailto:`      |
| URL do GitHub              | Ícone do rodapé padrão e rodapé de navegação          |
| URL do LinkedIn            | Ícone do rodapé padrão e rodapé de navegação          |
| Título e resumo do projeto | `<title>` e descrição de `/projects/:id` e documentos |

O nome do autor fica em chave (`common:authorName`), não no conteúdo, porque é usado no `<title>`
de toda tela, no logo e na página de erro, que precisam dele mesmo quando o conteúdo não carregou.

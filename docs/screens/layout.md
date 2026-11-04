# Layout compartilhado

O layout é tudo que aparece em mais de uma tela: cabeçalho, menu mobile, seletor de idioma,
alternador de tema, rodapé (padrão e a variação de navegação em `/contact`), página não
encontrada, página de erro e metadados por rota e idioma. Quem o implementa são as issues #33
(estrutura, cabeçalho, menu, idioma e tema) e #60 (rodapé, páginas de erro e metadados), com #31
(tokens, tema e foco), #32 (componentes e ícones), #53 (idioma no caminho, função de URL equivalente e
redirecionamento da raiz) e #52 (canônica, Open Graph e JSON-LD). Este documento diz o
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

| Estado                                 | O que aparece                                                                                                                                                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal, a partir de 640px              | Cabeçalho fixo no topo: gato e nome à esquerda; à direita, navegação (Início, Projetos, Informações, Contato), seletor `PT · EN · ES` e alternador de tema. Conteúdo da tela no `main`. Rodapé padrão (ou de navegação em `/contact`)                       |
| Normal, abaixo de 640px, menu fechado  | Cabeçalho com gato e nome e o botão de menu de 44px (ícone hambúrguer); navegação, seletor e alternador ficam no painel                                                                                                                                     |
| Menu aberto (abaixo de 640px)          | Painel em largura total abaixo do cabeçalho até o fim da tela, rolável por dentro: links em coluna de 52px, depois "Idioma" com três links de 44px e "Tema" com o alternador. Botão mostra o ícone ×. Rolagem da página travada e o resto da página `inert` |
| Carregando a tela (código da rota)     | Cabeçalho e rodapé visíveis; no lugar do conteúdo, só o status "Carregando..." visualmente oculto em `role="status"` (A11Y-G13). O carregamento de dados de cada tela é da spec dela                                                                        |
| Carregando o conteúdo do rodapé        | O rodapé mostra só o que não depende do conteúdo: rótulo "Contato", link "Entrar em contato", barra inferior. Disponibilidade, localização, e-mail, "Copiar e-mail" e redes aparecem quando o conteúdo chega, sem skeleton (o rodapé fica abaixo da dobra)  |
| Conteúdo do rodapé indisponível (erro) | Igual a "carregando", sem mensagem de erro no rodapé: o erro de carregamento é anunciado pela tela (A11Y-G14), não pelo rodapé                                                                                                                              |
| E-mail copiado                         | O botão "Copiar e-mail" passa a "E-mail copiado" por 2,2 s e o resultado é anunciado em `role="status"` (A11Y-L11)                                                                                                                                          |
| Falha ao copiar                        | O botão passa a "Não foi possível copiar" por 2,2 s, anunciado no mesmo `role="status"`. O e-mail continua visível ao lado para cópia manual                                                                                                                |
| `/contact` (D04, D21)                  | Rodapé de navegação: colunas "Navegação" (Início, Projetos, Informações) e "Redes" (GitHub, LinkedIn, "Currículo em PDF"), sem a chamada para contato, sem e-mail e sem "Copiar e-mail"; barra inferior igual                                               |
| Página não encontrada                  | Cabeçalho sem item ativo, rótulo "Erro 404", `h1` "Página não encontrada", texto, "Ver projetos" (primário) e "Voltar para o início"; rodapé padrão                                                                                                         |
| Página de erro                         | Cabeçalho sem item ativo, ícone de alerta, `h1` "Erro inesperado", texto, "Tentar novamente" (primário) e "Voltar para o início"; rodapé padrão. Nunca mostra a mensagem técnica do erro                                                                    |
| Sem JavaScript                         | O HTML pré-renderizado (#49) tem cabeçalho, navegação, seletor de idioma (links reais, funcionam sem JS) e rodapé legíveis. Menu mobile, alternador de tema, "Copiar e-mail" e salvar a escolha de idioma precisam de JavaScript (NF-CO-03)                 |

O estado "Vazio" do molde não se aplica ao layout, que não tem lista própria.

## Validações

Não há campo de formulário no layout. Regras de entrada e o que acontece quando falham:

| Entrada                                 | Regra                                                                                                                                 | Quando falha                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Prefixo de idioma no caminho            | Só `/pt-BR`, `/en` e `/es` (NF-IN-06)                                                                                                 | Prefixo desconhecido (`/fr/projects`) ou ausente (`/projects`) cai na página não encontrada, em inglês |
| `?lng=` na URL                          | Ignorado (NF-IN-08)                                                                                                                   | Nada muda; o caminho decide                                                                            |
| Tema salvo no navegador                 | Só `light` ou `dark`                                                                                                                  | Valor ausente ou inválido é ignorado: vale `prefers-color-scheme` (NF-TE-02)                           |
| Idioma salvo no navegador               | Só `pt-BR`, `en` ou `es`; só redireciona a raiz `/` (NF-IN-09, #53)                                                                   | Valor inválido é ignorado                                                                              |
| `?tema=` na URL                         | Não é recurso do produto (D35, RF-LAY-19)                                                                                             | Ignorado                                                                                               |
| Área de transferência ("Copiar e-mail") | `navigator.clipboard.writeText` precisa existir e resolver                                                                            | "Não foi possível copiar" (ver Estados)                                                                |
| Rota de tela, id de projeto, documento  | Só os caminhos de D32; id inexistente, documento que não está na lista do projeto, `/docs/README.md` ou subcaminho desconhecido (D55) | Página não encontrada                                                                                  |

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê e usa tudo do layout. Não há ação
restrita. A flag do formulário de contato (D05) não muda o layout: o link do rodapé leva a
`/contact` com a flag ligada ou desligada.

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Cabeçalho

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                              | Fonte                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `RF-LAY-01` | Fixo no topo (sticky) em todas as telas, inclusive não encontrada e erro, com fundo `--surface-chrome` e borda inferior `--border-chrome` (D04); altura mínima de 4rem; o foco nunca fica embaixo dele (`scroll-padding-top`, A11Y-L13)                                                                                                                                            | Protótipo, D04          |
| `RF-LAY-02` | À esquerda, um link para o início do idioma atual com o gato (SVG inline, corpo `--neutral-500`, detalhe `--text-strong`, `aria-hidden`) e o nome "Luiz Felipe dos Santos" (Bricolage 700). O nome acessível do link é o nome do autor; o nome não é heading                                                                                                                       | D02, `accessibility.md` |
| `RF-LAY-03` | Navegação principal em `nav` com nome "Principal": Início (`/`), Projetos (`/projects`), Informações (`/about`) e Contato (`/contact`), sempre com o prefixo do idioma atual (NF-IN-11)                                                                                                                                                                                            | Protótipo, D32          |
| `RF-LAY-04` | Item ativo: Início só em `/` exato; Projetos em `/projects`, `/projects/:id` e nos documentos (`/projects/:id/docs/<name>`); Informações em `/about`; Contato em `/contact`; nenhum na página não encontrada e na de erro. O ativo tem `aria-current="page"`, peso 600, `--text-strong` e traço inferior de 2px em `--brand-variant` (no menu, traço de 2px à esquerda e peso 800) | Protótipo, A11Y-L04     |
| `RF-LAY-05` | A troca entre navegação completa e botão de menu é por media query no CSS (640px), não por largura lida em JavaScript: os dois existem no HTML pré-renderizado e a primeira renderização do cliente é igual a ele (NF-TE-04). Só um dos dois está visível e na árvore de acessibilidade de cada vez                                                                                | NF-TE-04, NF-IA-01      |

### Menu mobile

| ID          | Regra                                                                                                                                                                                                                                                                                                                  | Fonte                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `RF-LAY-06` | Abaixo de 640px, botão de 44px com nome fixo "Menu", `aria-expanded` e `aria-controls` apontando o painel; ícone hambúrguer fechado e × aberto (`aria-hidden`). O protótipo troca o nome ("Abrir menu"/"Fechar menu"); vale o nome fixo, pelo mesmo motivo do alternador de tema (o estado já está em `aria-expanded`) | D01, A11Y-L08                                    |
| `RF-LAY-07` | O painel é disclosure, não diálogo: ao abrir, o foco vai para o primeiro link; Tab e Shift+Tab circulam entre o botão de menu e o painel; o resto da página fica `inert`; a rolagem da página trava                                                                                                                    | D01, PI1, achado de `accessibility.md`, A11Y-L09 |
| `RF-LAY-08` | Fecha por Esc (o foco volta ao botão), pelo botão, por clique num link de navegação, quando a rota muda por outro meio (voltar do navegador) e ao alargar a janela para 640px ou mais. Trocar de idioma ou de tema dentro do painel não fecha: o foco fica no controle usado                                           | D01, PI1                                         |
| `RF-LAY-09` | Conteúdo do painel: os quatro links (coluna de 52px), o rótulo "Idioma" com o seletor em dropdown (ativo em `--bg-highlight`), o rótulo "Tema" com o alternador com texto visível "Tema escuro" e o rótulo "Acessibilidade" com o botão "Reduzir movimento". Rótulos em caixa normal no JSON, caixa alta por CSS       | D01, D12                                         |
| `RF-LAY-10` | Com `prefers-reduced-motion: reduce`, abrir e fechar o painel não anima (2.3.3)                                                                                                                                                                                                                                        | A11Y-G12                                         |

### Idioma

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Fonte                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `RF-LAY-11` | O idioma da página vem do caminho: `/pt-BR` é `pt-BR`, `/en` é `en`, `/es` é `es`; `<html lang>` acompanha o caminho. O navegador e o `?lng=` não decidem; a única exceção é o redirecionamento da raiz `/` por escolha salva, que é de #53                                                                                                                                                                                                                                                                                                            | NF-IN-05, NF-IN-06, NF-IN-08, NF-IN-09 |
| `RF-LAY-12` | Seletor de idioma entre a navegação e o menu de configurações: um botão com a bandeira do idioma ativo e uma seta, com `aria-expanded`, que abre uma lista de links (`<Link>`) com bandeira e nome do idioma. Cada link aponta para a URL equivalente no idioma de destino (mesma rota, mesmo id, mesmo documento, mesma query e mesma âncora), montada pela função de #53, com `hreflang` e `lang` do destino; o ativo tem `aria-current="true"` e fundo de destaque. Esc, clique fora e foco fora fecham a lista, que entra e sai com animação curta | D12, D31, NF-IN-10, PI4, A11Y-L05      |
| `RF-LAY-13` | O nome acessível do botão é "Idioma: <nome do idioma ativo>" (`languageSelector.current`) e o de cada opção é o nome do idioma escrito nele mesmo ("Português", "English", "Español"); as bandeiras são `aria-hidden` e os valores são iguais nos três JSON                                                                                                                                                                                                                                                                                            | `accessibility.md` (Idioma), 2.5.3     |
| `RF-LAY-14` | Escolher um idioma navega para a URL equivalente sem recarregar, salva a escolha por `setLanguage` (D31), atualiza `<html lang>` e `<title>`, preserva a posição de rolagem, fecha a lista e devolve o foco ao botão do seletor (exceção à regra de foco no `h1`)                                                                                                                                                                                                                                                                                      | D31, NF-IN-10, A11Y-L06                |
| `RF-LAY-15` | Todo link interno do layout (logo, navegação, rodapé, página não encontrada e página de erro) mantém o prefixo do idioma atual, montado a partir de `ROUTES` pela função única de #53; nenhum caminho com prefixo é escrito à mão                                                                                                                                                                                                                                                                                                                      | NF-IN-11                               |

### Tema

| ID          | Regra                                                                                                                                                                                                                                                                                                                         | Fonte                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `RF-LAY-16` | Claro e escuro por `data-theme` no `<html>`, com `color-scheme` correspondente; a primeira visita segue `prefers-color-scheme`; sem escolha salva, o tema acompanha o sistema inclusive quando ele muda com a página aberta; a escolha pelo alternador fica salva no navegador (chave `portfolio-frontend:theme`) e prevalece | D22, NF-TE-01, NF-TE-02                |
| `RF-LAY-17` | Sem piscar o tema errado: o tema é aplicado antes da primeira pintura por script inline no `<head>`, e o `theme-color` acompanha o tema escolhido, não só o do sistema                                                                                                                                                        | NF-TE-03 (implementado em #31)         |
| `RF-LAY-18` | Alternador: botão com nome fixo "Tema escuro", texto visível e `aria-pressed="true"` no tema escuro, dentro do menu de configurações do cabeçalho (botão de engrenagem com `aria-expanded`) e no painel mobile. Trocar não move o foco, não fecha o menu e não usa região de anúncio                                          | Achado de `accessibility.md`, A11Y-L07 |
| `RF-LAY-19` | `?tema=` não é recurso do produto (D35): é ferramenta do protótipo para conferência; no produto, o tema vem só da escolha salva ou do sistema                                                                                                                                                                                 | D22, D35                               |

### Rodapé padrão

Vale em todas as telas, menos `/contact`.

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Fonte                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `RF-LAY-20` | Linha superior de 2px em degradê horizontal (`#FFCC00` → `#F19100`) e fundo `--surface-footer` (D04, D66). Landmark `contentinfo`                                                                                                                                                                                                                                                                                                                                               | D04, A11Y-L03           |
| `RF-LAY-21` | Bloco de contato: rótulo "Contato"; a frase de disponibilidade, a localização e o e-mail vêm do JSON de conteúdo (#10 define os campos do perfil e do contato, #58 e #59 preenchem nos três idiomas), não de chave de tradução                                                                                                                                                                                                                                                  | #10, R1, NF-DA-02       |
| `RF-LAY-22` | Link primário para `/contact` com o rótulo "Entrar em contato", numa chave só, válida com o formulário ligado ou desligado (D05); a #44 não precisa mexer nela e a #6 reaproveita a mesma chave                                                                                                                                                                                                                                                                                 | Protótipo, D05, PO (Q1) |
| `RF-LAY-23` | Botão "Copiar e-mail" (ícone de cópia, `aria-hidden`): copia o e-mail do conteúdo, troca o rótulo por 2,2 s ("E-mail copiado" ou "Não foi possível copiar") e anuncia o resultado em `role="status"` que existe vazio desde a primeira renderização                                                                                                                                                                                                                             | Protótipo, A11Y-L11     |
| `RF-LAY-24` | Ícones de GitHub, LinkedIn e e-mail (`mailto:`), com alvos de 44px; as URLs e o e-mail vêm do conteúdo; os nomes acessíveis vêm de chave com o nome do autor ("GitHub de Luiz Felipe dos Santos (abre em nova aba)"). Rede sem URL no conteúdo não aparece. GitHub e LinkedIn abrem em nova aba (`target="_blank"`, `rel="noopener noreferrer"`), com o aviso no nome acessível; o `mailto:` não leva `target` (abre o cliente de e-mail, não uma aba) e o nome não fala em aba | D04, D21, D36, 2.4.9    |
| `RF-LAY-25` | Barra inferior separada por borda `--border-subtle`: "© `<ano>` · Luiz Felipe dos Santos" e "Feito em TypeScript". O ano é o do build: constante definida no `vite.config.ts` em tempo de build e interpolada em `footer.copyright`, igual no HTML pré-renderizado e na hidratação (NF-IA-03)                                                                                                                                                                                   | Protótipo, PO (Q2)      |

### Rodapé de navegação

Vale só em `/contact`.

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fonte                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `RF-LAY-26` | No lugar do bloco de contato, duas colunas: "Navegação", um `nav` com nome "Rodapé" (A11Y-L12) e lista com Início, Projetos e Informações; e "Redes", lista com "GitHub ↗", "LinkedIn ↗" (URLs do conteúdo, em nova aba com o aviso no nome, D36) e "Currículo em PDF ↓". Sem chamada para contato, e-mail e "Copiar e-mail" (a tela já os mostra). Setas em `aria-hidden`. Barra inferior igual                                                                                                                                                                            | D04, D21, D36        |
| `RF-LAY-27` | "Currículo em PDF" aponta para o PDF do idioma ativo (`cv/cv-pt-BR.pdf`, `cv/cv-en.pdf`, `cv/cv-es.pdf`, com `import.meta.env.BASE_URL`), mesmo antes de o arquivo existir (gerado por #54); é um link real, sem `download` nem `target`: com JavaScript, o clique abre o modal de pré-visualização de D52, onde está o download, sem sair da página; sem JavaScript, abre o PDF. O nome acessível começa pelo texto visível e diz o formato e a abertura da pré-visualização: "Currículo em PDF, abre a pré-visualização" (`common:footer.resumeName`; `en` e `es` na #60) | D14, D52, roadmap M3 |

### Página não encontrada

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Fonte                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `RF-LAY-28` | Renderizada dentro do layout (cabeçalho e rodapé padrão) para toda URL sem rota, prefixo desconhecido, id inexistente e documento fora da lista do projeto (D55), no idioma do prefixo. Rótulo "Erro 404" (caixa alta por CSS), `h1` "Página não encontrada", texto "O endereço pode ter mudado ou o projeto saiu do ar. A lista completa continua em Projetos.", link primário "Ver projetos" (`/projects`) e secundário "Voltar para o início" (`/`). Responde 404 no Pages (NF-IA-04) | `prototipo-404`, D33, D55, A11Y-ER01 |

### Página de erro

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                        | Fonte                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `RF-LAY-29` | `errorElement` da rota do layout, renderizada sem o `MainLayout`: tem os próprios landmarks (cabeçalho, `main`, rodapé padrão) e o próprio "Pular para o conteúdo" (A11Y-ER02). Ícone de alerta em `--danger-ink` sobre `--danger-surface`, `h1` "Erro inesperado", texto "Algo quebrou do meu lado, não do seu. Tente de novo em alguns segundos.", botão primário "Tentar novamente" (recarrega a URL atual) e link "Voltar para o início" | `prototipo-erro`, A11Y-ER01, A11Y-ER02                      |
| `RF-LAY-30` | A mensagem técnica do erro nunca aparece (hoje a página mostra `error.message`, que é literal em português e técnico); a chave `error:unknown` sai. O protótipo diz "ERRO 500" e "Falha no servidor", que não descrevem um erro do cliente sem backend, e cita o e-mail, que vem do conteúdo e pode ser justamente o que falhou: a página não tem rótulo de código nem e-mail                                                                | R1, voz e copy ("dizem o que aconteceu e oferecem a saída") |

Um erro lançado pelo próprio cabeçalho ou rodapé também quebra a página de erro, que os renderiza;
nesse caso vale o comportamento padrão do React Router. Fica fora do escopo da #33 e da #60.

### Comum a todas as telas

| ID          | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Fonte                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `RF-LAY-31` | "Pular para o conteúdo" é o primeiro elemento focável, visível ao receber foco, e leva ao `main` (`id` estável, `tabIndex={-1}`). O `main` é do layout, em volta do `<Outlet />`; as páginas deixam de renderizar o próprio `main` (a de erro mantém o seu)                                                                                                                                                                                                               | A11Y-L01, `accessibility.md` (Teclado e foco) |
| `RF-LAY-32` | Na navegação interna o foco vai para o `h1` da nova tela e o `<title>` muda; na primeira carga o foco não se move. A rolagem vai para o topo na navegação nova e é restaurada no voltar e avançar do navegador; com âncora na URL, vai para a âncora. Exceções: troca de idioma (RF-LAY-14) e troca de documento do projeto (D33, #62)                                                                                                                                    | A11Y-L02, D33                                 |
| `RF-LAY-33` | O favicon é o gato (D34): corpo `#7C7770` e detalhe por `<style>` interno com `@media (prefers-color-scheme: dark)` (`#202020` no claro, `#F2EEE7` no escuro), substituindo `public/favicon.svg`. Segue o tema do sistema, não o do site, porque o favicon não lê `data-theme`                                                                                                                                                                                            | D02, D34                                      |
| `RF-LAY-34` | No desktop, a barra sob o item ativo da navegação é um único indicador que desliza até o item da nova página, animando posição e largura (`--dur-slow`, `--ease`); a primeira renderização não anima, a barra se reposiciona ao redimensionar e ao trocar de idioma e some sem item ativo. O painel mobile entra com fade curto                                                                                                                                           | NF-MO-01, A11Y-G12                            |
| `RF-LAY-35` | Botão "Reduzir movimento" no menu de configurações e no painel mobile (grupo "Acessibilidade"), com `aria-pressed="true"` quando reduzido. A escolha grava `portfolio-frontend:motion` (`full` ou `reduced`), vale mais que `prefers-reduced-motion`, e sem escolha o sistema decide, inclusive quando muda com a página aberta. `data-motion` no `<html>` zera os `--dur-*`, animações e transições; um script inline do `index.html` o aplica antes da primeira pintura | 2.3.3, NF-MO-01, A11Y-G12                     |
| `RF-LAY-36` | Com movimento pleno, a navegação por link do cabeçalho, logo e "Voltar ao início" (não encontrada e erro) usa View Transitions de `--dur-page` (150ms), pela prop `viewTransition`; sem suporte do navegador ou com movimento reduzido navega normal. Os links do `LanguageSelector` ficam sem transição (D58). O foco no `h1` (RF-LAY-32) não espera a transição                                                                                                         |
| `RF-LAY-37` | Ao trocar o tema, as cores fazem crossfade de `--dur-base` por `data-theme-transition` no `<html>`, ligado só durante a troca e nunca com movimento reduzido nem na primeira pintura (D60)                                                                                                                                                                                                                                                                                |
| `RF-LAY-38` | `Button`, `IconButton` e os links do cabeçalho reduzem a escala para `--press-scale` (0.97) enquanto pressionados; com movimento reduzido o token vale `1` (D59)                                                                                                                                                                                                                                                                                                          |

### Abertura de links

Vale `D36` para todo link do layout: link interno navega na mesma aba, por `<Link>` do React Router
com o path de `ROUTES`; link externo (GitHub, LinkedIn) abre em nova aba com `target="_blank"` e
`rel="noopener noreferrer"`, com "(abre em nova aba)" no nome acessível; `mailto:` não leva
`target`. O CV é a exceção (D52, que substitui D36 nesse ponto): link real para o PDF do idioma
ativo que, com JavaScript, abre o modal de pré-visualização, onde está o download.

## Navegação

Os caminhos são os de `D32`, sempre com o prefixo do idioma atual (`/pt-BR`, `/en`,
`/es`).

| De onde               | Ação                                       | Para onde                                                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Qualquer tela         | Gato e nome                                | `/` do idioma atual                                                                               |
| Qualquer tela         | Início, Projetos, Informações, Contato     | `/`, `/projects`, `/about`, `/contact` do idioma atual                                            |
| Qualquer tela         | `PT`, `EN`, `ES`                           | A mesma URL no idioma escolhido (`/pt-BR`, `/en`, `/es`)                                          |
| Qualquer tela         | Alternador de tema                         | Fica na mesma tela                                                                                |
| Rodapé padrão         | "Entrar em contato"                        | `/contact`                                                                                        |
| Rodapé padrão         | GitHub, LinkedIn                           | Perfis externos (URL do conteúdo), em nova aba (D36)                                              |
| Rodapé padrão         | Ícone de e-mail                            | `mailto:` com o e-mail do conteúdo                                                                |
| Rodapé de `/contact`  | Início, Projetos, Informações              | `/`, `/projects`, `/about` do idioma atual                                                        |
| Rodapé de `/contact`  | GitHub, LinkedIn                           | Perfis externos, em nova aba (D36)                                                                |
| Rodapé de `/contact`  | "Currículo em PDF"                         | Modal de pré-visualização do PDF do idioma ativo, sem sair da página; sem JavaScript, o PDF (D52) |
| Página não encontrada | "Ver projetos", "Voltar para o início"     | `/projects`, `/`                                                                                  |
| Página de erro        | "Tentar novamente", "Voltar para o início" | A mesma URL (recarrega), `/`                                                                      |
| URL sem rota          | Abrir                                      | Página não encontrada                                                                             |
| Erro de renderização  | Abrir                                      | Página de erro                                                                                    |

A carga em `/` redireciona para `/pt-BR`, `/en` ou `/es` (escolha salva, depois navegador, depois
`en`; NF-IN-09, #53); nenhuma outra rota redireciona por idioma.

## Textos fixos e chaves

Todo texto do layout vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e
`es` são escritos na implementação (#33 e #60), com os mesmos namespaces e chaves (R2). Os nomes dos
idiomas ("Português", "English", "Español"), as siglas, "GitHub", "LinkedIn", "TypeScript" e os
símbolos são iguais nos três JSON.

O namespace é `common`, porque cabeçalho e rodapé são componentes de `src/components/` usados pelo
`MainLayout` e pela página de erro, que fica fora dele (convenção do `.claude/CLAUDE.md`: `common`
guarda texto fixo de componente). As chaves `mainLayout:brand` e `mainLayout:copyright` passam para
`common`, e o namespace `mainLayout` sai de `src/locales/`, de `resources.ts` e do `ns` de
`i18n.ts` se ficar vazio (R2: chave sem uso é removida).

| Namespace  | Chave                        | Valor em `pt-BR`                                                                           | Onde                                                                                   |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `common`   | `authorName`                 | Luiz Felipe dos Santos                                                                     | Nome no cabeçalho, nomes acessíveis, copyright (era `mainLayout:brand`, "Luiz Felipe") |
| `common`   | `loading`                    | Carregando... (existe)                                                                     | Status da tela carregando                                                              |
| `common`   | `backHome`                   | Voltar para o início (existe)                                                              | Página não encontrada e página de erro                                                 |
| `common`   | `skipToContent`              | Pular para o conteúdo                                                                      | Primeiro foco                                                                          |
| `common`   | `navigation.label`           | Principal                                                                                  | Nome do `nav` principal                                                                |
| `common`   | `navigation.home`            | Início                                                                                     | Cabeçalho, menu e rodapé de navegação                                                  |
| `common`   | `navigation.projects`        | Projetos                                                                                   | Idem                                                                                   |
| `common`   | `navigation.about`           | Informações                                                                                | Idem                                                                                   |
| `common`   | `navigation.contact`         | Contato                                                                                    | Cabeçalho e menu                                                                       |
| `common`   | `menu.toggle`                | Menu                                                                                       | Nome do botão de menu                                                                  |
| `common`   | `menu.theme`                 | Tema                                                                                       | Rótulo no painel                                                                       |
| `common`   | `languageSelector.label`     | Idioma                                                                                     | Nome do grupo e rótulo no painel                                                       |
| `common`   | `languageSelector.ptBR.name` | Português                                                                                  | Parte oculta do nome acessível                                                         |
| `common`   | `languageSelector.en.name`   | English                                                                                    | Parte oculta do nome acessível                                                         |
| `common`   | `languageSelector.es.name`   | Español                                                                                    | Parte oculta do nome acessível                                                         |
| `common`   | `languageSelector.current`   | Idioma: {{name}}                                                                           | Nome acessível do botão do seletor                                                     |
| `common`   | `settings.label`             | Configurações                                                                              | Nome do botão do menu de configurações                                                 |
| `common`   | `menu.accessibility`         | Acessibilidade                                                                             | Rótulo do grupo no painel                                                              |
| `common`   | `motionToggle.label`         | Reduzir movimento                                                                          | Nome fixo do botão de movimento e texto no menu                                        |
| `common`   | `themeToggle.label`          | Tema escuro                                                                                | Nome fixo do alternador e texto no painel                                              |
| `common`   | `footer.contact.label`       | Contato                                                                                    | Rótulo do bloco de contato                                                             |
| `common`   | `footer.contact.cta`         | Entrar em contato                                                                          | Link para `/contact`                                                                   |
| `common`   | `footer.copyEmail.idle`      | Copiar e-mail                                                                              | Botão                                                                                  |
| `common`   | `footer.copyEmail.copied`    | E-mail copiado                                                                             | Botão e `role="status"`                                                                |
| `common`   | `footer.copyEmail.failed`    | Não foi possível copiar                                                                    | Botão e `role="status"`                                                                |
| `common`   | `footer.social.heading`      | Redes                                                                                      | Rótulo da coluna no rodapé de navegação                                                |
| `common`   | `footer.social.github`       | GitHub                                                                                     | Texto no rodapé de navegação                                                           |
| `common`   | `footer.social.githubName`   | GitHub de `{{name}}` (abre em nova aba)                                                    | Nome acessível                                                                         |
| `common`   | `footer.social.linkedin`     | LinkedIn                                                                                   | Texto no rodapé de navegação                                                           |
| `common`   | `footer.social.linkedinName` | LinkedIn de `{{name}}` (abre em nova aba)                                                  | Nome acessível                                                                         |
| `common`   | `footer.social.emailName`    | Enviar e-mail para `{{name}}`                                                              | Nome do ícone de e-mail                                                                |
| `common`   | `footer.navigation.label`    | Rodapé                                                                                     | Nome do `nav` de `/contact`                                                            |
| `common`   | `footer.navigation.heading`  | Navegação                                                                                  | Rótulo da coluna                                                                       |
| `common`   | `footer.resume`              | Currículo em PDF                                                                           | Link do CV no rodapé de navegação                                                      |
| `common`   | `footer.resumeName`          | Currículo em PDF, abre a pré-visualização                                                  | Nome acessível do link do CV no rodapé de navegação (D52)                              |
| `common`   | `footer.copyright`           | © `{{year}}` · `{{name}}` (`year` do build)                                                | Barra inferior (era `mainLayout:copyright`)                                            |
| `common`   | `footer.madeWith`            | Feito em TypeScript                                                                        | Barra inferior                                                                         |
| `common`   | `symbols.external`           | ↗                                                                                          | Seta de link externo, em `aria-hidden`                                                 |
| `common`   | `symbols.download`           | ↓                                                                                          | Seta de download, em `aria-hidden`                                                     |
| `notFound` | `label`                      | Erro 404                                                                                   | Rótulo acima do `h1`                                                                   |
| `notFound` | `heading`                    | Página não encontrada (existe)                                                             | `h1`                                                                                   |
| `notFound` | `description`                | O endereço pode ter mudado ou o projeto saiu do ar. A lista completa continua em Projetos. | Texto                                                                                  |
| `notFound` | `viewProjects`               | Ver projetos                                                                               | Link primário                                                                          |
| `error`    | `heading`                    | Erro inesperado (existe)                                                                   | `h1`                                                                                   |
| `error`    | `description`                | Algo quebrou do meu lado, não do seu. Tente de novo em alguns segundos.                    | Texto                                                                                  |
| `error`    | `retry`                      | Tentar novamente                                                                           | Botão primário                                                                         |

Os símbolos ficam em chave porque `react/jsx-no-literals` acusa string literal em JSX. Saem
`error:unknown` (RF-LAY-30), `mainLayout:brand` e `mainLayout:copyright`. Os valores `en` de
`footer.contact.cta` são "Get in touch" e `es` "Ponerse en contacto" (resposta do PO).

### Vem do conteúdo, não de chave

O campo é definido na #10 e o valor é preenchido na #58 e na #59, nos três idiomas quando é texto. Página e
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

## Metadados por rota e idioma

Regras:

- Cada tela declara `<title>` e `<meta name="description">` com as tags nativas do React 19, com
  texto de chave do namespace da tela (`<title>{t("meta.title")}</title>`). Formato do título:
  `<Tela> · Luiz Felipe dos Santos`, único por tela e traduzido (A11Y-G01); a exceção é `/`, cujo
  título é o próprio nome com o cargo.
- Em toda rota pública e idioma, pelo mecanismo de #52 (NF-IA-10, NF-IA-11): canônica absoluta e
  autorreferente do idioma (da variável de build de #52, sugestão `VITE_SITE_URL`, mais o `base`),
  `hreflang` recíproco para `pt-BR`, `en`, `es` e `x-default` (`en`), `og:title` e
  `og:description` iguais ao título e à descrição, `og:type`, `og:url` igual à canônica,
  `og:image` (a do site, 1200×630, ou a captura 16:9 do projeto quando houver, D26), `og:locale`
  do idioma com os outros dois em `og:locale:alternate`, e `twitter:card` `summary_large_image`.
  JSON-LD por tipo de página (NF-IA-08) é das telas #34 a #38, com o mecanismo de #52.
- Página não encontrada e página de erro: `<title>` e descrição próprios,
  `<meta name="robots" content="noindex">`, sem canônica, sem `hreflang`, sem Open Graph e sem
  JSON-LD.
- `theme-color` é global (acompanha o tema, RF-LAY-17), não por página.

Os namespaces das telas que ainda não existem são previstos e podem mudar de nome na spec da tela,
que também revisa o texto sem mudar a chave:

| Rota                        | Namespace             | `meta.title` (`pt-BR`)                                                                    | `meta.description` (`pt-BR`)                                                                                          |
| --------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`                         | `home` (existe)       | Portfólio · Luiz Felipe dos Santos (`pt-BR`), Portfolio · … (`en`), Portafolio · … (`es`) | Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato. (existe) |
| `/projects`                 | `projects` (previsto) | Projetos · Luiz Felipe dos Santos                                                         | Projetos de Luiz Felipe dos Santos, com busca por tipo, categoria e tecnologia.                                       |
| `/projects/:id`             | `project` (previsto)  | `{{project}}` · Luiz Felipe dos Santos                                                    | Resumo do projeto, do conteúdo (#10, #58), sem chave                                                                  |
| `/projects/:id/docs/<name>` | `project` (previsto)  | `{{document}}` · `{{project}}` · Luiz Felipe dos Santos (`meta.documentTitle`)            | Resumo do projeto, do conteúdo                                                                                        |
| `/about`                    | `about` (previsto)    | Informações · Luiz Felipe dos Santos                                                      | Quem é Luiz Felipe dos Santos: sobre mim, stack, trajetória e formação.                                               |
| `/contact`                  | `contact` (previsto)  | Contato · Luiz Felipe dos Santos                                                          | Como falar com Luiz Felipe dos Santos: e-mail e currículo.                                                            |
| Página não encontrada       | `notFound` (existe)   | Página não encontrada · Luiz Felipe dos Santos (existe)                                   | O endereço acessado não existe neste portfólio. (existe)                                                              |
| Página de erro              | `error` (existe)      | Erro inesperado · Luiz Felipe dos Santos (existe)                                         | Algo deu errado ao carregar esta página. (existe)                                                                     |

O `meta.title` de `home` é "Portfólio · Luiz Felipe dos Santos" em `pt-BR`, "Portfolio · …" em `en` e
"Portafolio · …" em `es`, decisão do PO (a raiz é a exceção ao formato `<Tela> · Luiz Felipe dos Santos`). `{{document}}` é o nome do
documento (`SETUP.md`, `LICENSE`, D55), igual nos três idiomas. Na página de
projeto, o `<title>` só existe depois que o conteúdo do projeto chega; na pré-renderização (#49) ele
já está no HTML.

## Critérios de aceite

Copiáveis para as issues #33 (`RF-LAY-01` a `RF-LAY-19` e `RF-LAY-31` a `RF-LAY-35`; `RF-LAY-36` a `RF-LAY-38` na #84) e #60 (`RF-LAY-20` a `RF-LAY-30` e metadados). Verificação entre colchetes, com a legenda de
[`accessibility.md`](../product/accessibility.md#checklist-por-tela) (`[teste]`, `[axe]`, `[lint]`,
`[teclado]`, `[leitor]`, `[navegador]`, `[e2e]` e `[medição]`) e mais `[review]` para o que só a
revisão do PR confere. Nos itens funcionais, `[teste]` usa Testing Library, `user-event` e
`createMemoryRouter`; `[e2e]` cobre o que o `jsdom` não mede (sticky, media query, `inert` real,
foco sob o cabeçalho); `[navegador]` cobre favicon, `theme-color` e movimento reduzido.

### Funcionais

- [ ] `RF-LAY-01` — Cabeçalho fixo em todas as telas, com `--surface-chrome`, `--border-chrome` e o foco nunca embaixo dele [e2e] [medição]
- [ ] `RF-LAY-02` — Logo com o gato em `aria-hidden` e o nome do autor, levando ao início do idioma atual, com o nome do autor como nome acessível [teste]
- [ ] `RF-LAY-03` — `nav` "Principal" com Início, Projetos, Informações e Contato, com o prefixo do idioma, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-LAY-04` — Item ativo por rota (Início só em `/`, Projetos também no detalhe e nos documentos, nenhum em 404 e erro), com `aria-current="page"` [teste]
- [ ] `RF-LAY-05` — Navegação completa e botão de menu trocados por media query, sem largura lida em JavaScript [teste] [e2e]
- [ ] `RF-LAY-06` — Botão de menu de 44px com nome fixo "Menu", `aria-expanded` e `aria-controls` [teste]
- [ ] `RF-LAY-07` — Painel como disclosure: foco no primeiro link ao abrir, Tab circula entre botão e painel, resto da página `inert` e rolagem travada [teste] [e2e]
- [ ] `RF-LAY-08` — Menu fecha por Esc (foco no botão), botão, link, mudança de rota e janela a partir de 640px; não fecha na troca de idioma ou tema [teste] [e2e]
- [ ] `RF-LAY-09` — Painel com os quatro links, "Idioma" com o seletor, "Tema" com o alternador e "Acessibilidade" com o botão de movimento, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-LAY-10` — Sem animação do painel com `prefers-reduced-motion: reduce` [navegador]
- [ ] `RF-LAY-11` — Idioma e `<html lang>` vêm do caminho; navegador e `?lng=` não decidem [teste]
- [ ] `RF-LAY-12` — Botão com a bandeira do idioma ativo que abre uma lista de links para a URL equivalente (rota, id, documento, query e âncora), com `hreflang`, `lang` e `aria-current="true"` no ativo; Esc, clique e foco fora fecham [teste]
- [ ] `RF-LAY-13` — Botão "Idioma: <nome>" e opções com o nome do idioma escrito nele mesmo, bandeiras `aria-hidden`, igual nos três JSON [teste]
- [ ] `RF-LAY-14` — Trocar de idioma navega sem recarregar, salva a escolha, atualiza `<html lang>` e `<title>`, preserva a rolagem e devolve o foco ao botão do seletor [teste] [e2e]
- [ ] `RF-LAY-15` — Todo link interno do layout mantém o prefixo do idioma, montado pela função de #53 [teste] [review]
- [ ] `RF-LAY-16` — Tema por `data-theme` e `color-scheme`, seguindo o sistema até haver escolha salva, que prevalece [teste]
- [ ] `RF-LAY-17` — Tema aplicado antes da primeira pintura e `theme-color` do tema escolhido [navegador]
- [ ] `RF-LAY-18` — Alternador de 44px com nome fixo "Tema escuro" e `aria-pressed`, sem mover o foco, nos três idiomas [teste]
- [ ] `RF-LAY-19` — `?tema=` ignorado [teste]
- [ ] `RF-LAY-20` — Rodapé padrão com linha em degradê, `--surface-footer` e landmark `contentinfo` [teste] [medição]
- [ ] `RF-LAY-21` — Disponibilidade, localização e e-mail vêm do conteúdo, não de chave [teste] [review]
- [ ] `RF-LAY-22` — Link "Entrar em contato" para `/contact`, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-LAY-23` — "Copiar e-mail" troca o rótulo por 2,2 s e anuncia sucesso ou falha em `role="status"` presente desde a primeira renderização [teste]
- [ ] `RF-LAY-24` — Ícones de GitHub e LinkedIn em nova aba com `rel="noopener noreferrer"` e aviso no nome; `mailto:` sem `target`; rede sem URL não aparece [teste]
- [ ] `RF-LAY-25` — Barra inferior com o ano do build e "Feito em TypeScript", igual no HTML pré-renderizado e na hidratação [teste]
- [ ] `RF-LAY-26` — Em `/contact`, rodapé de navegação com `nav` "Rodapé", Início, Projetos, Informações, GitHub, LinkedIn e "Currículo em PDF", sem e-mail nem chamada para contato [teste]
- [ ] `RF-LAY-27` — "Currículo em PDF" aponta para o PDF do idioma ativo, sem `download` nem `target`, abre a pré-visualização de D52 com JavaScript e tem o nome acessível "Currículo em PDF, abre a pré-visualização", nos três idiomas [teste]
- [ ] `RF-LAY-28` — Página não encontrada dentro do layout para URL sem rota, prefixo desconhecido, id inexistente e documento ausente, no idioma do prefixo, nos três idiomas [teste]
- [ ] `RF-LAY-29` — Página de erro com os próprios landmarks e "Pular para o conteúdo", "Tentar novamente" e "Voltar para o início", nos três idiomas [teste]
- [ ] `RF-LAY-30` — A mensagem técnica do erro nunca aparece; `error:unknown` removida [teste]
- [ ] `RF-LAY-31` — "Pular para o conteúdo" é o primeiro foco e leva ao `main` do layout; as páginas não renderizam o próprio `main` [teste]
- [ ] `RF-LAY-32` — Na navegação interna o foco vai ao `h1` e a rolagem ao topo (ou à âncora); restaurada no voltar e avançar; foco parado na primeira carga [teste] [e2e]
- [ ] `RF-LAY-33` — Favicon do gato com detalhe por `prefers-color-scheme` [navegador]
- [ ] `RF-LAY-34` — Indicador único desliza até o item ativo, sem animar na primeira renderização [teste] [navegador]
- [ ] `RF-LAY-35` — Botão de reduzir movimento grava a escolha, aplica `data-motion` antes da pintura e zera as animações [teste] [navegador]
- [ ] `RF-LAY-36` — View Transition de 150ms nos links de navegação, sem ela com movimento reduzido nem no seletor de idioma, e foco no `h1` mantido [teste] [navegador]
- [ ] `RF-LAY-37` — Crossfade de tema só durante a troca e desligado com movimento reduzido [teste] [navegador]
- [ ] `RF-LAY-38` — Escala de pressão em botões e links do cabeçalho, `1` com movimento reduzido [navegador]

### Acessibilidade

Copiados de [`accessibility.md`](../product/accessibility.md#checklist-por-tela), sem renumerar.

- [ ] `A11Y-G01` — Um `main`, um `h1` e um `<title>` próprio e traduzido [teste]
- [ ] `A11Y-G02` — `<html lang>` igual ao idioma da URL (`/pt-BR`, `/en`, `/es`) [teste]
- [ ] `A11Y-G03` — Nenhuma violação do axe em cada estado da tela [axe]
- [ ] `A11Y-G04` — Nenhuma violação do axe no navegador, nos dois temas [e2e]
- [ ] `A11Y-G05` — Ordem de foco igual à visual e foco visível em todo elemento focável [teclado]
- [ ] `A11Y-G06` — Contorno de foco de D27 com 2px, afastado, 3:1 em toda superfície e nunca cortado (2.4.13) [e2e] [medição]
- [ ] `A11Y-G07` — Todo link tem um nome que diz o destino sozinho (2.4.9) [teste]
- [ ] `A11Y-G08` — Controles e links isolados com alvo de 44px em todas as larguras (2.5.5) [e2e] [medição]
- [ ] `A11Y-G09` — Texto corrido com até 80 caracteres por linha, entrelinha de pelo menos 1,5 e sem justificar (1.4.8) [navegador]
- [ ] `A11Y-G10` — Contraste AA nos dois temas e em todos os estados [e2e] [medição]
- [ ] `A11Y-G11` — Sem rolagem horizontal a 320px e sem perda com texto a 200% [medição]
- [ ] `A11Y-G12` — Movimento reduzido respeitado, inclusive a animação disparada por interação (2.3.3) [navegador]
- [ ] `A11Y-G13` — Skeleton com `aria-hidden` e status "Carregando" visualmente oculto [teste]
- [ ] `A11Y-G14` — Erro de carregamento em `role="alert"`, com a saída [teste]
- [ ] `A11Y-G15` — Texto em `pt-BR`, `en` e `es`, inclusive os nomes acessíveis [teste]
- [ ] `A11Y-G16` — Nenhum erro de `jsx-a11y` [lint]

- [ ] `A11Y-L01` — "Pular para o conteúdo" é o primeiro Tab e leva ao `main` [teste] [e2e]
- [ ] `A11Y-L02` — A troca de rota põe o foco no `h1` da nova tela [teste]
- [ ] `A11Y-L03` — Landmarks `banner`, `navigation` "Principal" e `contentinfo` [teste]
- [ ] `A11Y-L04` — `aria-current="page"` no item da rota atual [teste]
- [ ] `A11Y-L05` — Seletor de idioma em grupo nomeado, com um link para a URL equivalente de cada idioma, `hreflang` e `lang` em cada link e `aria-current` no ativo [teste]
- [ ] `A11Y-L06` — Trocar de idioma navega para a URL equivalente, atualiza `<html lang>` e `<title>` e devolve o foco ao botão do seletor [teste] [e2e]
- [ ] `A11Y-L07` — Alternador de tema com nome fixo e `aria-pressed` [teste]
- [ ] `A11Y-L08` — Botão de menu com `aria-expanded` e `aria-controls` [teste]
- [ ] `A11Y-L09` — Menu aberto: foco preso, Esc fecha e devolve o foco ao botão, resto da página `inert` [teste] [e2e] [leitor]
- [ ] `A11Y-L10` — Logo e ícones com `aria-hidden` [teste]
- [ ] `A11Y-L11` — "Copiar e-mail" anuncia o resultado [teste]
- [ ] `A11Y-L12` — O rodapé de Contato é um `nav` com nome próprio [teste]
- [ ] `A11Y-L13` — O foco nunca fica embaixo do cabeçalho fixo [teclado] [e2e]

- [ ] `A11Y-ER01` — `h1` que diz o que aconteceu, `<title>` próprio e link para o início [teste]
- [ ] `A11Y-ER02` — A página de erro tem os próprios landmarks, por estar fora do layout [teste]

### Não funcionais

De [`non-functional-requirements.md`](../product/non-functional-requirements.md), com o momento de
verificação de lá.

- [ ] `NF-IN-03` — Nenhuma tela mostra chave no lugar de texto [CI; #41]
- [ ] `NF-IN-05` — `<html lang>` acompanha o idioma do caminho [CI; #49; #53]
- [ ] `NF-IN-06` — Idioma vem do caminho; prefixo desconhecido cai na página não encontrada [CI; #53]
- [ ] `NF-IN-08` — `?lng=` ignorado [CI; #53]
- [ ] `NF-IN-10` — Seletor navega para a URL equivalente e salva a escolha [CI; #53; #33]
- [ ] `NF-IN-11` — Todo link interno mantém o prefixo do idioma, montado por função única [CI; #53]
- [ ] `NF-TE-01` — Claro e escuro por `data-theme`, com `color-scheme` [CI; #31]
- [ ] `NF-TE-02` — Primeira visita segue o sistema; a escolha salva prevalece [CI; #31]
- [ ] `NF-TE-03` — Sem piscar o tema errado; `theme-color` acompanha o tema [#31; #49; #41]
- [ ] `NF-TE-04` — Estado lido do navegador não muda a primeira renderização do cliente [#49; #41]
- [ ] `NF-RE-03` — Sem rolagem horizontal em 360, 390, 768 e 1280px, inclusive com o menu aberto [#41]
- [ ] `NF-RE-04` — Decisão de layout por largura do menu (D01) [#33, #34 a #38; #41]
- [ ] `NF-MO-01` — `prefers-reduced-motion: reduce` desliga animação e transição [#41]
- [ ] `NF-IA-01` — Cabeçalho e rodapé no HTML pré-renderizado de cada rota e idioma, legíveis sem JavaScript [CI; #49; #41]
- [ ] `NF-IA-10` — `<title>`, descrição, Open Graph e `twitter:card` por página e idioma [CI; #52; #41]
- [ ] `NF-IA-11` — Canônica autorreferente e `hreflang` recíproco com `x-default` [CI; #52; #41]
- [ ] `NF-IA-16` — HTML semântico, com o conteúdo principal dentro do `main` [CI; #33, #34 a #38]
- [ ] `NF-CO-03` — Sem JavaScript, o layout é legível; menu, tema e idioma salvo precisam de JavaScript [#41]

### Gerais

- [ ] `npm run build`, `npm run lint` e `npm test -- --run` passam
- [ ] Textos novos em `pt-BR`, `en` e `es`, e chaves sem uso removidas (`error:unknown`, `mainLayout:brand`, `mainLayout:copyright`) (R2)

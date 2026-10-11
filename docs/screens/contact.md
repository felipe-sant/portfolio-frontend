# Contato

A tela Contato (`/contact`, também sob `/en/contact` e `/es/contact`, D32) é o fim da jornada de
quem quer falar com o autor: na v1 ela termina em copiar ou abrir o e-mail. Quem a implementa é a
issue H, com B (campo, chip, botão e spinner), C (rodapé de navegação e cópia de e-mail), I (botão
de CV), S (pré-renderização) e V (canônica, Open Graph e JSON-LD). Este documento diz o
comportamento; não escolhe nome de componente, hook nem arquivo, além do namespace, da chave de
tradução e do nome da variável de ambiente.

Fontes: [`decisions.md`](../design/decisions.md), o protótipo (`prototipo-contato`, com o
`ProtoFooter` no modo de navegação, em [`prototype/`](../design/prototype/README.md), estados por
`?estado=` `normal`, `erro`, `enviando` e `enviado`),
[`accessibility.md`](../product/accessibility.md),
[`non-functional-requirements.md`](../product/non-functional-requirements.md) e
[`layout.md`](layout.md) (cabeçalho, rodapé de navegação, cópia de e-mail, foco na troca de rota e
abertura de links).

Cada requisito funcional tem um ID `RF-CONTACT-nn`, estável e nunca reaproveitado: item que deixa
de valer é riscado, não apagado nem renumerado (mesma regra de `layout.md`). O protótipo usa o
caminho `/contato`; vale D32 (`/contact`). O envio simulado, o e-mail `luiz@email.com`, a
localização e o "Baixar CV" com `href="#"` do protótipo são provisórios (PI5): nenhum valor dele
vira dado, e o conteúdo real vem da #13.

## Objetivo

Dar a quem quer falar com o autor (cliente, recrutador, professor) um canal direto e sem atrito: o
e-mail para copiar ou abrir, onde ele está, em quanto tempo responde e o CV. Na V2+, com o backend,
também mandar a mensagem pela própria página.

## Estados

| Estado                                 | O que aparece                                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal, flag desligada (v1)            | Uma coluna: selo de disponibilidade, `h1` "Contato", texto de abertura da v1, bloco "E-mail direto" (e-mail, "Copiar e-mail", "Enviar e-mail"), "Localização" e "Resposta" lado a lado quando cabem, "Baixar CV". Rodapé de navegação (RF-LAY-26). Sem formulário no DOM |
| Normal, flag ligada, a partir de 900px | Selo, `h1`, texto de abertura do formulário; duas colunas: formulário à esquerda (1,35fr, até 32rem) e canais à direita (1fr) (D21)                                                                                                                                      |
| Normal, flag ligada, abaixo de 900px   | Uma coluna: formulário e, depois, os canais, separados por uma linha `--border-subtle` (D21)                                                                                                                                                                             |
| Carregando o conteúdo                  | Selo, `h1`, texto de abertura e (com a flag) o formulário aparecem na hora, porque não dependem do conteúdo; os blocos de canal viram skeleton `aria-hidden`, com "Carregando..." visualmente oculto em `role="status"` (A11Y-G13). O selo some até o conteúdo chegar    |
| Erro ao carregar o conteúdo            | No lugar dos canais, `role="alert"` com "Não foi possível carregar os canais de contato." e o botão "Tentar novamente", que refaz a consulta (A11Y-G14). Com a flag ligada, o formulário continua usável                                                                 |
| Validação (flag ligada)                | Resumo no topo do formulário em `role="alert"` ("Falta corrigir 2 campos."), cada campo inválido com borda e mensagem em `--danger-ink`, ícone de alerta e `aria-invalid`; foco no primeiro inválido (D07, D25)                                                          |
| Enviando (flag ligada)                 | Campos desabilitados, botão com spinner, texto "Enviando" e `aria-busy="true"`; segundo envio ignorado                                                                                                                                                                   |
| Enviado (flag ligada)                  | O formulário dá lugar à confirmação em `--success-surface`/`--success-ink`: ícone de check, título "Mensagem enviada" (recebe o foco), texto e botão "Enviar outra mensagem"; a região é `role="status"`                                                                 |
| Falha no envio (flag ligada)           | Banner em `--danger-surface`/`--danger-ink` no topo do formulário, `role="alert"`, com ícone e "Não consegui enviar sua mensagem. Tente de novo ou escreva para o e-mail desta página."; campos preenchidos mantidos; botão volta a "Enviar mensagem"                    |
| E-mail copiado / falha ao copiar       | Igual ao rodapé (RF-LAY-23): o botão passa a "E-mail copiado" ou "Não foi possível copiar" por 2,2 s, anunciado em `role="status"`                                                                                                                                       |
| Sem JavaScript                         | HTML pré-renderizado (S) com selo, `h1`, texto, e-mail, localização, resposta, "Enviar e-mail" e "Baixar CV" funcionando (link e download). "Copiar e-mail" e o formulário precisam de JavaScript (NF-CO-03)                                                             |

O estado "Vazio" do molde não se aplica: o e-mail é obrigatório no contrato, e campo opcional de
conteúdo ausente esconde o próprio bloco (RF-CONTACT-07).

## Validações

Valem com a flag ligada. O momento segue D25: nada é validado enquanto a pessoa digita antes do
primeiro envio; ao enviar, todos os campos são validados; depois do primeiro envio com erro, cada
campo é revalidado a cada alteração.

| Campo    | Regra                                                                                            | Mensagem `pt-BR`                                                                       | `en`                                                                        | `es`                                                                              |
| -------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Nome     | Obrigatório: não vazio depois de `trim`. Até 100 caracteres (`maxLength`)                        | Diga como devo te chamar.                                                              | Tell me what to call you.                                                   | Dime cómo debo llamarte.                                                          |
| E-mail   | Obrigatório: não vazio depois de `trim`. Até 254 caracteres (`maxLength`)                        | Preciso de um e-mail para responder.                                                   | I need an email address to reply.                                           | Necesito un correo electrónico para responderte.                                  |
| E-mail   | Formato: o valor sem espaços nas pontas casa com `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`               | Esse endereço não parece completo.                                                     | That address doesn't look complete.                                         | Esa dirección no parece completa.                                                 |
| Assunto  | Um de Projeto novo, Freelance, Vaga, Outro; "Projeto novo" já vem marcado, então nunca falha     | Não tem                                                                                | Não tem                                                                     | Não tem                                                                           |
| Mensagem | Pelo menos 20 caracteres depois de `trim`. Até 600 caracteres (`maxLength`, contados sem `trim`) | Escreva um pouco mais: 20 caracteres no mínimo.                                        | Write a little more: at least 20 characters.                                | Escribe un poco más: 20 caracteres como mínimo.                                   |
| Resumo   | Aparece no envio com erro; conta os campos inválidos naquele envio                               | Falta corrigir 1 campo. / Falta corrigir `{{count}}` campos.                           | 1 field still needs fixing. / `{{count}}` fields still need fixing.         | Queda 1 campo por corregir. / Quedan `{{count}}` campos por corregir.             |
| Envio    | A mutation falhou                                                                                | Não consegui enviar sua mensagem. Tente de novo ou escreva para o e-mail desta página. | I couldn't send your message. Try again or write to the email on this page. | No pude enviar tu mensaje. Inténtalo de nuevo o escribe al correo de esta página. |

- Só uma mensagem por campo: e-mail vazio mostra a de obrigatório, não a de formato.
- Ordem do foco no primeiro inválido: Nome, E-mail, Mensagem (a ordem visual).
- O limite de `maxLength` não gera mensagem: o campo para de aceitar texto, e o contador da
  mensagem mostra 0.
- A validação é do próprio formulário (`noValidate` no `form`), para a mensagem ser a da tabela e
  vir traduzida, e não o balão do navegador.
- O resumo usa plural do i18next (`_one`, `_other`), com as mesmas chaves nos três JSON.
- O backend futuro repete as mesmas regras (ver
  [O que a tela pede ao contrato](#o-que-a-tela-pede-ao-contrato)).

## Permissões

Site público, sem login nem perfil (DP03): qualquer visitante vê a tela e usa os canais. A flag não
é permissão de usuário, é configuração de build: com ela desligada, ninguém vê o formulário; com
ela ligada, todos veem.

## Regras de negócio

Cada subseção lista os requisitos na ordem dos IDs.

### Cabeçalho da tela

Vale com a flag ligada ou desligada.

| ID              | Regra                                                                                                                                                                                                                                                                                                                                                                                           | Fonte                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `RF-CONTACT-01` | Selo de disponibilidade acima do `h1`, em `--success-surface` e `--success-ink`, com ponto redondo `aria-hidden` e o texto de `availability.label` do perfil (frase livre do PO, traduzida por idioma, ex.: "Disponível a partir de 01/2027"). Com `availability.isAvailable` `false`, o selo não aparece. É o mesmo campo de Início, Informações e rodapé (RF-LAY-21), nunca chave de tradução | Protótipo, decisão transversal do PO (11-10-2026), #10 |
| `RF-CONTACT-02` | `h1` "Contato" (Bricolage 800, `clamp()` como no protótipo) e texto de abertura de chave, que muda com a flag: desligada, "Projeto, freelance ou vaga: escreva para o meu e-mail contando o contexto e o prazo."; ligada, "Conte o escopo, o prazo e o que já existe." O tempo de resposta não entra no texto fixo (vem do conteúdo, RF-CONTACT-06)                                             | Protótipo, D-NOVA-7a                                   |

### Canais

Vale com a flag ligada ou desligada.

| ID              | Regra                                                                                                                                                                                                                                                                                                                                                                                                               | Fonte                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `RF-CONTACT-03` | Cada bloco de canal tem rótulo em `h2` ("E-mail direto", "Localização", "Resposta"), em `--font-mono` e `--text-label`, caixa normal no JSON e caixa alta por CSS. Os canais não são `aside` nem landmark próprio: ficam no `main`, com a mesma estrutura nos dois modos                                                                                                                                            | Protótipo, `accessibility.md` (HTML semântico e nomes acessíveis) |
| `RF-CONTACT-04` | "E-mail direto": o e-mail do conteúdo em `--font-mono`, inteiro e quebrando linha se precisar (o protótipo corta com reticências, o que esconde parte do endereço), o botão "Copiar e-mail" com o mesmo comportamento, as mesmas chaves e o mesmo `role="status"` do rodapé (RF-LAY-23), e o link "Enviar e-mail" (`mailto:` com o e-mail, sem `target`, ícone de e-mail `aria-hidden`), alvos de 44px              | Protótipo, RF-LAY-23, D36, D-NOVA-7a, A11Y-CT01                   |
| `RF-CONTACT-05` | "Localização": linha principal e detalhe do conteúdo (no protótipo, "São José dos Campos · SP" e "Remoto ou híbrido na região")                                                                                                                                                                                                                                                                                     | Protótipo, #10                                                    |
| `RF-CONTACT-06` | "Resposta": linha principal e detalhe do conteúdo (no protótipo, "Em até 1 dia útil" e "Fuso GMT-3")                                                                                                                                                                                                                                                                                                                | Protótipo, #10                                                    |
| `RF-CONTACT-07` | Localização e resposta ficam lado a lado quando cabem (grade `auto-fit` com mínimo de 10rem) e empilham quando não. Bloco sem valor no conteúdo não aparece; detalhe sem valor some sem deixar espaço. O e-mail é obrigatório no contrato                                                                                                                                                                           | Protótipo, #10                                                    |
| `RF-CONTACT-08` | "Baixar CV" (botão secundário com ícone de download `aria-hidden`) baixa o PDF do idioma ativo, com o atributo `download` e caminho montado com `import.meta.env.BASE_URL`, mesmo antes de o arquivo existir (gerado por X, ligado por I). Texto visível `common:resume.download` ("Baixar CV") e nome acessível `common:resume.downloadPdf` ("Baixar CV (PDF)"), as chaves compartilhadas com Início e Informações | D14, D30, D36                                                     |
| `RF-CONTACT-09` | Não há "Agendar uma conversa", lista de redes nem bloco "Procurando vaga fixa?" na tela; GitHub, LinkedIn e "Currículo em PDF" ficam no rodapé de navegação (RF-LAY-26, RF-LAY-27), que não tem e-mail nem chamada para contato                                                                                                                                                                                     | D04, D21, protótipo                                               |

### Flag do formulário

| ID              | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Fonte                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `RF-CONTACT-10` | A flag é a variável de build `VITE_CONTACT_FORM_ENABLED`. Só o valor `"true"` liga; ausente, vazia ou qualquer outro valor desliga. É lida num único módulo, que exporta um booleano (como `apiUrl.ts` faz com `VITE_API_URL`), e nenhum outro arquivo lê a variável. Desligada por padrão em todo ambiente, inclusive no `npm run dev`; quem desenvolve liga no `.env.local`, e os testes ligam com `vi.stubEnv`, `vi.resetModules()` e import dinâmico. Nenhum ambiente público (Pages da v1, Vercel da #15) liga antes da N, porque o envio é simulado e a pessoa acharia que a mensagem chegou. A H acrescenta a variável ao `.env.example` (com `false`), a `src/vite-env.d.ts` e a `docs/setup/environments.md` | D05, D-NOVA-7b                           |
| `RF-CONTACT-11` | Flag desligada: o formulário não está no DOM nem no HTML pré-renderizado, e o código dele não é baixado (carregado só quando a flag está ligada, por `import()` dinâmico, ou eliminado no build); a tela fica em uma coluna com os canais, até `--measure`; sem a nota "Sem newsletter e sem cadastro."                                                                                                                                                                                                                                                                                                                                                                                                               | D05, NF-DA-06, NF-DE-08, D-NOVA-7a       |
| `RF-CONTACT-12` | Flag ligada: duas colunas a partir de 900px (formulário 1,35fr com até 32rem, canais 1fr, espaço `clamp(2rem, 5vw, 4rem)`); abaixo de 900px, uma coluna com o formulário primeiro e os canais depois, separados por borda superior `--border-subtle` e 2rem de respiro. A troca é por media query no CSS, não por largura lida em JavaScript (NF-TE-04)                                                                                                                                                                                                                                                                                                                                                               | D21, `design-system.md` (Responsividade) |

### Formulário

Vale com a flag ligada.

| ID              | Regra                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Fonte                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `RF-CONTACT-13` | Seção com nome "Formulário de contato" (`aria-label`, sem heading visível). Na ordem: frase "Todos os campos são obrigatórios.", Nome, E-mail, Assunto, Mensagem, botão "Enviar mensagem" (primário, degradê, 3rem de altura) e a nota "Sem newsletter e sem cadastro." em `--text-weak`. Rótulo visível ligado a cada campo; Nome com `autocomplete="name"`; E-mail com `type="email"`, `inputMode="email"` e `autocomplete="email"`; Nome, E-mail e Mensagem com `aria-required="true"`. Campos de texto com 44px de altura mínima                                                                                      | D25, A11Y-CT02, `accessibility.md` (Formulário)                                 |
| `RF-CONTACT-14` | Assunto: `fieldset` com `legend` "Assunto" e quatro `input type="radio"` com o mesmo `name`, estilizados como chip (Projeto novo, Freelance, Vaga, Outro), "Projeto novo" marcado ao abrir; navegação por setas (comportamento nativo do grupo de rádio); marcado em `--bg-highlight`, borda `--brand-variant` e peso 600; alvos de 44px. Não usa `aria-pressed`                                                                                                                                                                                                                                                          | D25, achado de `accessibility.md`, D-NOVA-7c                                    |
| `RF-CONTACT-15` | Mensagem: `textarea` de 6 linhas, redimensionável na vertical, `maxLength` 600 e placeholder "Escopo, prazo e links do que já existe" (o rótulo continua visível; o placeholder não substitui instrução). Contador "`<n>` restantes" ao lado do rótulo, em `--font-mono`, `--text-label`, que passa a `--warning-ink` abaixo de 60 restantes, ligado ao campo por `aria-describedby` e sem `aria-live`. Uma região `aria-live="polite"` à parte, visualmente oculta, anuncia só ao cruzar para menos de 60 restantes ("Restam `<n>` caracteres.") e ao chegar a 0 ("Você chegou ao limite de 600 caracteres.")            | D25, achado de `accessibility.md`, A11Y-CT05                                    |
| `RF-CONTACT-16` | Validação conforme [Validações](#validações): só no envio e, depois do primeiro envio com erro, a cada alteração                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | D25, A11Y-CT03                                                                  |
| `RF-CONTACT-17` | Campo inválido: `aria-invalid="true"`, mensagem logo abaixo, ligada por `aria-describedby` (junto do contador, na mensagem), em `--danger-ink` com ícone de alerta `aria-hidden`, e borda `--danger-ink`. Campo válido: borda `--border-control` vazio e `--text-strong` preenchido; foco com o contorno de D27                                                                                                                                                                                                                                                                                                           | D07, D29, A11Y-CT04, A11Y-CT08                                                  |
| `RF-CONTACT-18` | No envio com erro: o resumo aparece no topo do formulário em `role="alert"` (`--danger-surface`, `--danger-ink`, ícone `aria-hidden`) com a contagem daquele envio, e o foco vai para o primeiro campo inválido. Entre um envio e outro, a contagem do resumo não muda (para não ser anunciada a cada tecla) e o resumo some quando não sobra campo inválido; o próximo envio com erro o mostra de novo, recontado                                                                                                                                                                                                        | D25, `accessibility.md` (Anúncios dinâmicos), D-NOVA-7c                         |
| `RF-CONTACT-19` | Enviando: campos e chips `disabled`; o botão de envio não recebe `disabled` (o foco se perderia), mas `aria-disabled="true"` e `aria-busy="true"`, com spinner `aria-hidden` e o texto "Enviando"; um segundo envio é ignorado                                                                                                                                                                                                                                                                                                                                                                                            | D25, `design-system.md` (Estados), A11Y-CT06, D-NOVA-7c                         |
| `RF-CONTACT-20` | Enviado: o formulário sai e a confirmação entra no mesmo lugar, dentro de um contêiner `role="status"` que existe desde a primeira renderização: ícone de check `aria-hidden`, título "Mensagem enviada" em `h2` com `tabIndex={-1}`, que recebe o foco, o texto "Recebi sua mensagem e respondo pelo e-mail que você informou." e o botão "Enviar outra mensagem", que volta ao formulário vazio (assunto "Projeto novo", sem erros, sem resumo) com o foco no Nome                                                                                                                                                      | D25, protótipo, A11Y-CT07, D-NOVA-7c                                            |
| `RF-CONTACT-21` | Falha no envio: banner `role="alert"` no topo do formulário com a mensagem de [Validações](#validações); os dados ficam nos campos, os campos voltam a ser editáveis, o botão volta a "Enviar mensagem" e o foco fica no botão. O banner some no próximo envio. A saída é o e-mail da própria tela                                                                                                                                                                                                                                                                                                                        | `design-system.md` (Voz: erro diz o que aconteceu e oferece a saída), D-NOVA-7c |
| `RF-CONTACT-22` | Envio por mutation do RTK Query, num endpoint de domínio injetado com `api.injectEndpoints`, com `queryFn` simulada: não faz requisição (NF-DA-01, NF-PR-01), espera cerca de 1,4 s e resolve com sucesso; o argumento já tem o formato do payload do contrato (ver [O que a tela pede ao contrato](#o-que-a-tela-pede-ao-contrato)). A N troca a `queryFn` por `query` para o endpoint real, mexendo só em `src/store/api/` e removendo a flag. O estado de falha é exercitado em teste, substituindo a simulação. Nenhum dado digitado é guardado (`localStorage`, `sessionStorage` ou store além da mutation em curso) | D05, R1, NF-DA-02                                                               |
| `RF-CONTACT-23` | Só os rádios do assunto têm atributo `name`; os campos de texto não têm, para que um envio sem JavaScript (HTML pré-renderizado com a flag ligada) só recarregue a página sem pôr nome, e-mail ou mensagem na URL                                                                                                                                                                                                                                                                                                                                                                                                         | NF-CO-03, NF-PR-01, D-NOVA-7c                                                   |
| `RF-CONTACT-24` | Proteção contra spam é requisito da N, não da H: campo-isca (honeypot) escondido de pessoas e de tecnologia assistiva, que o backend descarta quando vem preenchido, e limite de taxa no servidor; sem captcha de terceiros (NF-PR-01, NF-PR-04). O aviso de tratamento de dados (LGPD) entra com a N, junto da nota (NF-PR-06)                                                                                                                                                                                                                                                                                           | D05, D-NOVA-7c                                                                  |

### Comum

| ID              | Regra                                                                                                                                                                                                                  | Fonte                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `RF-CONTACT-25` | Canais vêm do conteúdo pelos endpoints do RTK Query (NF-DA-02), nunca por import de JSON; o carregamento e o erro seguem [Estados](#estados); na pré-renderização (S) o conteúdo já está no HTML e no `preloadedState` | NF-DA-02, NF-IA-01, NF-IA-03              |
| `RF-CONTACT-26` | Metadados e JSON-LD conforme [Metadados e dados estruturados](#metadados-e-dados-estruturados)                                                                                                                         | NF-IA-08, NF-IA-10, NF-IA-11, `layout.md` |
| `RF-CONTACT-27` | Na navegação interna para `/contact` o foco vai para o `h1` e o `<title>` muda (RF-LAY-32); o item "Contato" do cabeçalho tem `aria-current="page"` (RF-LAY-04)                                                        | `layout.md`                               |

## Navegação

Todo destino interno leva o prefixo do idioma atual (NF-IN-11).

| De onde               | Ação                                       | Para onde                                                   |
| --------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| Cabeçalho, menu       | "Contato"                                  | `/contact`                                                  |
| Rodapé padrão         | "Entrar em contato" (RF-LAY-22)            | `/contact`                                                  |
| Informações (#6)      | "Entrar em contato" (mesma chave)          | `/contact`                                                  |
| Contato               | "Enviar e-mail"                            | `mailto:` com o e-mail do conteúdo (cliente de e-mail, D36) |
| Contato               | "Copiar e-mail"                            | Fica na tela                                                |
| Contato               | "Baixar CV"                                | Download do PDF do idioma ativo, sem sair da tela (D36)     |
| Contato (flag ligada) | "Enviar mensagem", "Enviar outra mensagem" | Fica na tela                                                |
| Rodapé de navegação   | Início, Projetos, Informações              | `/`, `/projects`, `/about`                                  |
| Rodapé de navegação   | GitHub, LinkedIn, "Currículo em PDF"       | Perfis em nova aba; download do PDF (RF-LAY-26, RF-LAY-27)  |

## Textos fixos e chaves

Todo texto fixo vem de chave (`react-i18next`). O valor `pt-BR` abaixo é a referência; `en` e `es`
são escritos na implementação (H), com as mesmas chaves (R2), salvo as mensagens de validação, que
já têm os três valores em [Validações](#validações). O namespace novo é `contact`, com o nome do
CSS Module da página, registrado em `src/locales/*/contact.json`, em `src/i18n/resources.ts` e no
`ns` de `src/i18n/i18n.ts` (na H); a página carrega `["contact", "common"]`.

| Chave                             | Valor em `pt-BR`                                                                       | Onde                             |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| `meta.title`                      | Contato · Luiz Felipe dos Santos                                                       | `<title>` (valor de `layout.md`) |
| `meta.description`                | Como falar com Luiz Felipe dos Santos: e-mail e currículo.                             | Descrição (valor de `layout.md`) |
| `heading`                         | Contato                                                                                | `h1`                             |
| `lede.direct`                     | Projeto, freelance ou vaga: escreva para o meu e-mail contando o contexto e o prazo.   | Abertura, flag desligada         |
| `lede.form`                       | Conte o escopo, o prazo e o que já existe.                                             | Abertura, flag ligada            |
| `channels.email.heading`          | E-mail direto                                                                          | Rótulo do bloco                  |
| `channels.email.send`             | Enviar e-mail                                                                          | Link `mailto:`                   |
| `channels.location.heading`       | Localização                                                                            | Rótulo do bloco                  |
| `channels.response.heading`       | Resposta                                                                               | Rótulo do bloco                  |
| `channels.loadError`              | Não foi possível carregar os canais de contato.                                        | Erro de carregamento             |
| `channels.retry`                  | Tentar novamente                                                                       | Botão do erro de carregamento    |
| `form.label`                      | Formulário de contato                                                                  | Nome da seção                    |
| `form.requiredNote`               | Todos os campos são obrigatórios.                                                      | Antes do primeiro campo          |
| `form.name.label`                 | Nome                                                                                   | Rótulo                           |
| `form.name.required`              | Diga como devo te chamar.                                                              | Erro                             |
| `form.email.label`                | E-mail                                                                                 | Rótulo                           |
| `form.email.required`             | Preciso de um e-mail para responder.                                                   | Erro                             |
| `form.email.invalid`              | Esse endereço não parece completo.                                                     | Erro                             |
| `form.subject.legend`             | Assunto                                                                                | `legend`                         |
| `form.subject.options.newProject` | Projeto novo                                                                           | Rádio                            |
| `form.subject.options.freelance`  | Freelance                                                                              | Rádio                            |
| `form.subject.options.job`        | Vaga                                                                                   | Rádio                            |
| `form.subject.options.other`      | Outro                                                                                  | Rádio                            |
| `form.message.label`              | Mensagem                                                                               | Rótulo                           |
| `form.message.placeholder`        | Escopo, prazo e links do que já existe                                                 | Placeholder                      |
| `form.message.tooShort`           | Escreva um pouco mais: 20 caracteres no mínimo.                                        | Erro                             |
| `form.message.remaining`          | `{{count}}` restantes (`_one`: `{{count}}` restante)                                   | Contador                         |
| `form.message.nearLimit`          | Restam `{{count}}` caracteres.                                                         | Anúncio ao cruzar 60             |
| `form.message.limitReached`       | Você chegou ao limite de `{{max}}` caracteres.                                         | Anúncio ao chegar a 0            |
| `form.errorSummary`               | Falta corrigir `{{count}}` campos. (`_one`: Falta corrigir 1 campo.)                   | Resumo                           |
| `form.submit`                     | Enviar mensagem                                                                        | Botão                            |
| `form.sending`                    | Enviando                                                                               | Botão durante o envio            |
| `form.privacyNote`                | Sem newsletter e sem cadastro.                                                         | Nota ao lado do botão            |
| `form.sendError`                  | Não consegui enviar sua mensagem. Tente de novo ou escreva para o e-mail desta página. | Banner de falha                  |
| `form.sent.heading`               | Mensagem enviada                                                                       | Título da confirmação            |
| `form.sent.description`           | Recebi sua mensagem e respondo pelo e-mail que você informou.                          | Texto da confirmação             |
| `form.sent.again`                 | Enviar outra mensagem                                                                  | Botão da confirmação             |

Chaves de outros namespaces, usadas e não criadas aqui:

- `common:loading` ("Carregando...", existe): status de carregamento.
- `common:footer.copyEmail.idle`, `common:footer.copyEmail.copied` e
  `common:footer.copyEmail.failed` ("Copiar e-mail", "E-mail copiado", "Não foi possível copiar"):
  botão de cópia, as chaves de `layout.md` como estão, sem renomear (RF-LAY-23).
- `common:resume.download` ("Baixar CV") e `common:resume.downloadPdf` ("Baixar CV (PDF)", nome
  acessível): chaves compartilhadas pelas cinco telas (decisão transversal do PO de 11-10-2026),
  com esses nomes exatos; a tela que chegar primeiro cria, as outras reaproveitam.
- `common:authorName` ("Luiz Felipe dos Santos", de `layout.md`): nome do autor no `<title>` e no
  JSON-LD.

### Vem do conteúdo, não de chave

Campo definido pela #10, com valor da #13 nos três idiomas quando é texto, lido por endpoint
(NF-DA-02):

| Dado                                                                | Onde aparece                               |
| ------------------------------------------------------------------- | ------------------------------------------ |
| Disponibilidade (`availability.isAvailable` e `availability.label`) | Selo (RF-CONTACT-01)                       |
| E-mail                                                              | "E-mail direto", `mailto:`, cópia, JSON-LD |
| Localização (linha e detalhe)                                       | "Localização"                              |
| Resposta (linha e detalhe)                                          | "Resposta"                                 |

## O que a tela pede ao contrato

O contrato é da #10; esta lista diz o que a tela precisa, sem escolher nome de campo nem de
arquivo.

### Conteúdo

V1, JSON local; V2+, API. Por idioma onde é texto.

| Dado                                | Tipo                             | Traduzido | Obrigatório | Também usado em               |
| ----------------------------------- | -------------------------------- | --------- | ----------- | ----------------------------- |
| E-mail de contato                   | Texto, e-mail                    | Não       | Sim         | Rodapé (RF-LAY-21, RF-LAY-24) |
| `availability.isAvailable` (perfil) | Booleano; `false` esconde o selo | Não       | Sim         | Início, Informações, rodapé   |
| `availability.label` (perfil)       | Frase livre do PO                | Sim       | Sim         | Início, Informações, rodapé   |
| Localização: linha principal        | Texto                            | Sim       | Não         | Rodapé                        |
| Localização: detalhe                | Texto                            | Sim       | Não         | —                             |
| Tempo de resposta: linha principal  | Texto ("Em até 1 dia útil")      | Sim       | Não         | —                             |
| Tempo de resposta: detalhe          | Texto ("Fuso GMT-3")             | Sim       | Não         | —                             |
| URL do GitHub, URL do LinkedIn      | URL                              | Não       | Não         | Rodapés, JSON-LD (`sameAs`)   |

O CV não é campo do contrato de contato: o caminho segue D14 (`cv/cv-<idioma>.pdf`) e o conteúdo,
D30. A disponibilidade segue a decisão transversal do PO de 11-10-2026:
`availability: { isAvailable, label }` no perfil, o mesmo campo para as cinco telas e o rodapé.

### Formulário (backend futuro, N)

`POST` no endpoint de contato, com corpo:

| Campo      | Regra (a mesma de [Validações](#validações))                                    |
| ---------- | ------------------------------------------------------------------------------- |
| `name`     | Texto, 1 a 100 caracteres depois de `trim`                                      |
| `email`    | Texto, até 254 caracteres, formato da regex de [Validações](#validações)        |
| `subject`  | `newProject`, `freelance`, `job` ou `other`                                     |
| `message`  | Texto, 20 a 600 caracteres (mínimo depois de `trim`)                            |
| `language` | `pt-BR`, `en` ou `es`, o idioma da página, para a resposta sair no idioma certo |
| `website`  | Campo-isca, sempre vazio; preenchido, o backend responde sucesso e descarta     |

Respostas que a tela trata: sucesso (2xx, sem corpo necessário); erro de validação (400, com os
campos inválidos); limite de taxa (429); falha (5xx ou rede). Na H, toda falha vira o banner de
RF-CONTACT-21; a N decide se 400 e 429 ganham mensagem própria, com o texto vindo do backend no
idioma do `Accept-Language` (convenção do repositório). O backend valida de novo e não confia na
validação do cliente.

## Metadados e dados estruturados

- `<title>` "Contato · Luiz Felipe dos Santos" e descrição "Como falar com Luiz Felipe dos Santos:
  e-mail e currículo.", das chaves `contact:meta.*`, com as tags nativas do React 19 (a mesma
  tabela de `layout.md`, sem mudança). A descrição vale com a flag ligada ou desligada.
- Canônica, `hreflang`, Open Graph (`og:type` `website`) e `twitter:card` pelo mecanismo de V
  (NF-IA-10, NF-IA-11).
- JSON-LD `ContactPage` (NF-IA-08), gerado dos mesmos dados da tela com `<` escapado (NF-IA-09), no
  idioma do caminho:

```json
{
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contato · Luiz Felipe dos Santos",
    "description": "Como falar com Luiz Felipe dos Santos: e-mail e currículo.",
    "url": "<canônica do idioma>",
    "inLanguage": "pt-BR",
    "mainEntity": {
        "@type": "Person",
        "@id": "<URL canônica de />#person",
        "name": "Luiz Felipe dos Santos",
        "email": "mailto:<e-mail do conteúdo>",
        "sameAs": ["<URL do GitHub>", "<URL do LinkedIn>"]
    }
}
```

A `Person` tem o `@id` `<URL canônica de />#person`, o mesmo em todas as telas (decisão
transversal do PO de 11-10-2026); rede sem URL sai de `sameAs`.

## Critérios de aceite

Copiáveis para a issue H. Verificação entre colchetes, com a legenda de
[`accessibility.md`](../product/accessibility.md#checklist-por-tela) (`[teste]`, `[axe]`, `[lint]`,
`[teclado]`, `[leitor]`, `[navegador]`, `[e2e]` e `[medição]`) e mais `[review]` para o que só a
revisão do PR confere. Nos itens funcionais, `[teste]` usa Testing Library, `user-event` e
`renderWithStore`, com a flag desligada e ligada por `vi.stubEnv`; `[e2e]` cobre o que o `jsdom`
não mede (quebra de 900px por media query, foco real).

### Funcionais

- [ ] `RF-CONTACT-01` — Selo com `availability.label` do conteúdo, ponto `aria-hidden`, em `--success-surface`/`--success-ink`; com `isAvailable: false` não aparece [teste] [medição]
- [ ] `RF-CONTACT-02` — `h1` "Contato" e abertura `lede.direct` com a flag desligada e `lede.form` com a ligada, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-CONTACT-03` — Rótulos de canal em `h2`, caixa alta por CSS, canais no `main` sem `aside`, mesma estrutura nos dois modos, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-CONTACT-04` — E-mail inteiro e quebrando linha, "Copiar e-mail" com as chaves e o `role="status"` do rodapé e "Enviar e-mail" em `mailto:` sem `target`, alvos de 44px, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-CONTACT-05` — "Localização" com linha e detalhe do conteúdo [teste]
- [ ] `RF-CONTACT-06` — "Resposta" com linha e detalhe do conteúdo [teste]
- [ ] `RF-CONTACT-07` — Localização e resposta lado a lado quando cabem; bloco ou detalhe sem valor some [teste] [e2e]
- [ ] `RF-CONTACT-08` — "Baixar CV" aponta para o PDF do idioma ativo sob `BASE_URL`, com `download`, sem `target` e nome acessível "Baixar CV (PDF)", nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-CONTACT-09` — Sem "Agendar uma conversa", lista de redes nem "Procurando vaga fixa?" na tela [teste]
- [ ] `RF-CONTACT-10` — `VITE_CONTACT_FORM_ENABLED` liga só com `"true"` (`"TRUE"`, `"1"`, `" true"`, vazia e ausente desligam), lida num único módulo [teste] [review]
- [ ] `RF-CONTACT-11` — Flag desligada: formulário fora do DOM, do HTML pré-renderizado e do JS baixado; uma coluna até `--measure`; sem a nota [teste] [navegador]
- [ ] `RF-CONTACT-12` — Flag ligada: duas colunas a partir de 900px e uma coluna com borda `--border-subtle` abaixo, por media query [e2e]
- [ ] `RF-CONTACT-13` — Seção "Formulário de contato", frase de obrigatórios, rótulos ligados, `autocomplete`, `type="email"`, `aria-required` e campos de 44px, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-CONTACT-14` — Assunto em `fieldset` com `legend` e quatro rádios de mesmo `name`, "Projeto novo" marcado, setas trocam a opção, sem `aria-pressed`, nos três idiomas, sem chave no lugar de texto [teste] [e2e]
- [ ] `RF-CONTACT-15` — `textarea` de 600 caracteres com contador em `aria-describedby`, sem `aria-live`, `--warning-ink` abaixo de 60 e anúncio só ao cruzar 60 e ao chegar a 0, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-CONTACT-16` — Nada validado antes do primeiro envio; depois de um envio com erro, revalida a cada alteração [teste]
- [ ] `RF-CONTACT-17` — Campo inválido com `aria-invalid`, mensagem em `aria-describedby`, `--danger-ink` e ícone; uma mensagem por campo, nos três idiomas, sem chave no lugar de texto [teste] [medição]
- [ ] `RF-CONTACT-18` — Resumo em `role="alert"` com a contagem do envio, foco no primeiro inválido, contagem congelada entre envios e resumo que some sem erro [teste]
- [ ] `RF-CONTACT-19` — Enviando: campos e chips `disabled`, botão com `aria-disabled` e `aria-busy`, spinner e "Enviando", segundo envio ignorado [teste]
- [ ] `RF-CONTACT-20` — Enviado: confirmação em `role="status"` presente desde a primeira renderização, foco no título, "Enviar outra mensagem" volta ao formulário vazio com foco no Nome, nos três idiomas, sem chave no lugar de texto [teste] [e2e]
- [ ] `RF-CONTACT-21` — Falha: banner `role="alert"`, dados mantidos, foco no botão, banner some no próximo envio, nos três idiomas, sem chave no lugar de texto [teste]
- [ ] `RF-CONTACT-22` — Mutation com `queryFn` simulada, sem requisição, argumento no formato do payload, nada guardado [teste] [review]
- [ ] `RF-CONTACT-23` — Só os rádios têm `name`; os campos de texto não [teste]
- [ ] `RF-CONTACT-24` — Campo-isca, limite de taxa e aviso de LGPD ficam para a N; a H não usa captcha nem serviço de terceiros [review]
- [ ] `RF-CONTACT-25` — Canais lidos só por endpoints do RTK Query; carregando e erro conforme os estados [teste] [review]
- [ ] `RF-CONTACT-26` — `<title>` e descrição por chave de `contact`, nos três idiomas, sem chave no lugar de texto; JSON-LD `ContactPage` gerado dos dados da tela [teste]
- [ ] `RF-CONTACT-27` — Na navegação interna para `/contact` o foco vai ao `h1` e "Contato" tem `aria-current="page"` [teste]

### Acessibilidade

Copiados de [`accessibility.md`](../product/accessibility.md#checklist-por-tela), sem renumerar.
`A11Y-L12` (rodapé de Contato) fica na C.

- [ ] `A11Y-G01` — Um `main`, um `h1` e um `<title>` próprio e traduzido [teste]
- [ ] `A11Y-G02` — `<html lang>` igual ao idioma da URL (`/`, `/en/`, `/es/`) [teste]
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

- [ ] `A11Y-CT01` — Canais com nomes claros e "Copiar" anunciado [teste]
- [ ] `A11Y-CT02` — Com a flag ligada: rótulos, `autocomplete`, obrigatórios em texto e assunto em grupo de rádio [teste]
- [ ] `A11Y-CT03` — Validação no envio, com resumo e foco no primeiro inválido (D25) [teste]
- [ ] `A11Y-CT04` — Erro com `aria-invalid` e `aria-describedby`, em `--danger-ink` e com texto (D07) [teste]
- [ ] `A11Y-CT05` — Contador de caracteres sem anúncio a cada tecla [teste]
- [ ] `A11Y-CT06` — Enviando com `aria-busy` [teste]
- [ ] `A11Y-CT07` — Enviado com o foco na confirmação [teste] [leitor]
- [ ] `A11Y-CT08` — Borda de campo de texto com 3:1 (D29) [e2e] [medição]

### Não funcionais

De [`non-functional-requirements.md`](../product/non-functional-requirements.md), com o momento de
verificação de lá.

- [ ] `NF-IN-01` — Todo texto da tela existe em `pt-BR`, `en` e `es` [CI]
- [ ] `NF-IN-03` — Nenhuma tela mostra chave no lugar de texto [CI; K]
- [ ] `NF-IN-11` — Todo link interno mantém o prefixo do idioma, montado por função única [CI; W]
- [ ] `NF-DA-01` — Sem requisição a `VITE_API_URL`: o envio é simulado [K]
- [ ] `NF-DA-02` — A tela não importa JSON de conteúdo: o acesso é por endpoints do RTK Query [Review; CI]
- [ ] `NF-DA-06` — Formulário implementado e desligado no build publicado (D05) [CI; K]
- [ ] `NF-DE-08` — JS adicional de `/contact` até 40 KB gzip, sem o formulário com a flag desligada [Idem, navegando pelo cabeçalho]
- [ ] `NF-RE-03` — Sem rolagem horizontal em 360, 390, 768 e 1280px, nos dois temas e nos estados especiais [K]
- [ ] `NF-RE-04` — Decisão de layout por largura de D21 [C, D a H; K]
- [ ] `NF-IA-01` — `/contact` com HTML gerado no build em cada idioma, legível sem JavaScript [CI; S; K]
- [ ] `NF-IA-08` — JSON-LD `ContactPage` [CI; V; D a H; K]
- [ ] `NF-IA-09` — JSON-LD gerado dos mesmos dados da tela, com `<` escapado [CI; V]
- [ ] `NF-IA-10` — `<title>`, descrição, Open Graph e `twitter:card` por idioma [CI; V; K]
- [ ] `NF-IA-11` — Canônica autorreferente sem query e `hreflang` recíproco com `x-default` [CI; V; K]
- [ ] `NF-PR-01` — Nenhuma requisição a terceiros; sem serviço de formulário de terceiros [K; Review]
- [ ] `NF-PR-02` — Sem cookie; nenhum dado digitado no `localStorage` [K]
- [ ] `NF-PR-04` — Nada incorporado de terceiros (sem captcha nem widget) [Review]
- [ ] `NF-PR-06` — Sem aviso de LGPD na v1 (formulário desligado); o aviso vem com a N [N]
- [ ] `NF-CO-03` — Sem JavaScript, os canais são legíveis; cópia e formulário precisam de JavaScript [K]

### Gerais

- [ ] `npm run build`, `npm run lint` e `npm test -- --run` passam
- [ ] `VITE_CONTACT_FORM_ENABLED` existe em `.env.example` (com `false`), `src/vite-env.d.ts` e `docs/setup/environments.md`
- [ ] O build publicado não tem o formulário
- [ ] Namespace `contact` em `pt-BR`, `en` e `es`, em `src/i18n/resources.ts` e no `ns` de `src/i18n/i18n.ts`; chaves sem uso removidas (R2)

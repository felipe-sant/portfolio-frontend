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

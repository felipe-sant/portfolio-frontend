# Spec: reduzir as fontes da primeira carga para até 160 KB

> **Tipo:** `bug` <br />
> **Status:** `em-revisao` <br />
> **Issue:** `#267` (relacionada à #41, sem fechá-la) <br />
> **Criado em:** `12-11-2026`

## Problema

No pré-check da #41 (falha F5), a primeira carga de `/pt-BR` baixa 6 arquivos `woff2` que somam 177.508 bytes, acima da meta de 160 KB de `NF-DE-11` (no máximo 2 com `preload`; hoje há 2, a Plex Sans 400 e a Bricolage Grotesque, e o limite está cumprido). São 17.508 bytes (9,9%) acima da meta. O peso pesa no celular com rede lenta.

### Os 6 arquivos da primeira carga

Pesos em disco (`public/fonts/`), conferidos contra o total do QA (a soma dos seis é exatamente 177.508 B):

| Arquivo                                       | Uso                                               | Bytes   | Preload |
| --------------------------------------------- | ------------------------------------------------- | ------- | ------- |
| `bricolage-grotesque-latin-opsz-normal.woff2` | títulos (variável, eixos `wght` 200–800 e `opsz`) | 76.888  | sim     |
| `ibm-plex-sans-latin-400-normal.woff2`        | texto corrido                                     | 22.588  | sim     |
| `ibm-plex-sans-latin-500-normal.woff2`        | rótulos, botões                                   | 24.184  | não     |
| `ibm-plex-sans-latin-600-normal.woff2`        | destaques, botões                                 | 24.252  | não     |
| `ibm-plex-mono-latin-400-normal.woff2`        | metadados, chips                                  | 14.708  | não     |
| `ibm-plex-mono-latin-500-normal.woff2`        | metadados em destaque                             | 14.888  | não     |
| **Total**                                     |                                                   | 177.508 |         |

A `IBM Plex Sans` 700 (22.832 B) existe no disco e só é pedida onde o texto a usa; não entra na primeira carga de `/pt-BR`. A medição por rota no navegador (T1) confirma quais rotas puxam a 700 e se alguma passa de 160 KB mesmo depois da correção.

### Onde está o excesso (medido com fonttools, sem tocar no código)

- A Bricolage tem 268 glifos e **dois eixos**: `wght` de 200 a 800 e `opsz` de 12 a 96. O CSS só usa `font-weight: 600 800` (`global.css`), então a faixa 200–599 é peso morto.
- Cada Plex tem 232 caracteres no `cmap` e 270+ glifos, e o conteúdo dos três idiomas usa 122 caracteres distintos (conferido em `src/locales/`, `public/content/` e `public/cv/`; o único fora do Latin-1 e da pontuação comum é a seta `↓`, `U+2193`).

## Objetivo

1. Fontes da primeira carga de qualquer rota somando no máximo 160 KB de `woff2`, com no máximo 2 `preload` (`NF-DE-11`), sem tirar peso nem família e sem mudar a aparência (nenhuma decisão de D08 é tomada aqui).
2. A fonte reserva com métricas ajustadas da #266 segue valendo para os pesos que sobram (a #267 só reduz bytes e não toca nas declarações de reserva).
3. Texto legível nos três idiomas e nos dois temas, sem texto sem fonte piscando (`font-display: swap` mantido).

## Opções avaliadas (tamanhos medidos com fonttools 4, `woff2`)

| #   | Opção                                                                                                        | Total da primeira carga | Aparência                                                        | Exige aprovação do Felipe (D08)?                  |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| A   | Limitar o eixo `wght` da Bricolage a 600–800 (o que o CSS declara)                                           | 169.604 B (-7.904)      | igual                                                            | não                                               |
| B   | Reduzir cada fonte aos caracteres de pt-BR, en e es (Latin-1, pontuação comum, setas e símbolos usados)      | 152.012 B com A         | igual para todo texto que o site mostra                          | não                                               |
| C   | A + B + só os glifos hoje usados (122 caracteres)                                                            | 115.060 B               | igual hoje; texto novo com letra fora do conjunto cai na reserva | não, mas frágil                                   |
| D   | Tirar a Plex Mono 500 (usar a 400 nos metadados em destaque)                                                 | -12.892 B               | muda: metadados em destaque ficam mais leves                     | **sim**                                           |
| E   | Unir Plex Sans 500 e 600 em um peso só                                                                       | -21.644 B               | muda: some um degrau de ênfase                                   | **sim**                                           |
| F   | Trocar a Bricolage por uma família estática menor                                                            | -40 KB ou mais          | muda a cara dos títulos                                          | **sim**                                           |
| G   | `preload` de mais fontes                                                                                     | 0 B                     | igual                                                            | não, mas fere o limite de 2 e **não reduz bytes** |
| H   | Carregar mais tarde o que só aparece depois (`unicode-range`, `font-display: optional` ou carga sob demanda) | varia                   | pode piscar ou deixar a fonte reserva à vista                    | não, mas piora a #266                             |

### Recomendação: A + B (152.012 B, margem de 7.988 B (contando 160 KB como 160.000 B) abaixo de 160 KB)

- Não remove peso nem família e não muda a aparência: a Bricolage continua variável (600–800 com `opsz` completo) e as cinco Plex continuam com os mesmos glifos que o site usa. Por isso **não exige a aprovação de D08**.
- Conjunto de caracteres (`B`): `U+0020–007E`, `U+00A0–00FF` (acentos de pt-BR e es), `U+2013 U+2014 U+2018 U+2019 U+201C U+201D U+2022 U+2026 U+00B7 U+20AC` e as setas `U+2190–2193`, `U+2197`, mais `U+2713` e `U+2715` (o `↓` de `U+2193` é usado hoje e precisa estar dentro). Um teste guarda a regra: todo caractere dos JSON e dos `locales` está no conjunto (T2).
- A margem de 8 KB é curta: não sobra espaço para uma fonte nova ou um peso novo sem nova poda. A opção C dá folga (115 KB), mas some glifo que um texto novo pode precisar; fica como plano B se a medição no navegador mostrar mais de 160 KB.
- As opções D, E e F ficam registradas só como alternativa, caso o Felipe prefira cortar peso; **nenhuma entra sem a aprovação dele na spec** (D08).
- A opção G não ajuda: `preload` antecipa o download, não o encolhe.

## Como a #266 se encaixa (CLS)

- A #266 (`fix/266-reserva-espaco-do-contato`) acrescenta `@font-face` "IBM Plex Sans Fallback" com `size-adjust` e `--font-body` em `global.css`. A #267 muda só os **arquivos** `woff2` (mesmos nomes de arquivo e de `@font-face`) e a declaração da Bricolage (`font-weight`, se for preciso). Os dois se tocam em `global.css`, mas em blocos diferentes: se a #266 entrar antes, a #267 faz `git fetch` e `git merge origin/staging` e confere o conflito.
- As métricas da reserva são medidas contra a fonte final **inteira**. Como a fonte reduzida mantém os mesmos glifos usados e as mesmas métricas (`advance`, `ascent`, `descent`), o `size-adjust` calculado pela #266 continua valendo. T1 confirma medindo a largura do mesmo texto antes e depois.
- O CLS do Contato (`NF-DE-02`) é medido de novo depois da #267, como na spec da #266 (3 rodadas, perfil Pixel 5), e não pode piorar.

## Fora de escopo

- Tirar peso, família ou trocar a aparência (D08): só com aprovação do Felipe e outra rodada de spec.
- Mexer na fonte reserva e no `font-display` (é a #266).
- Mudar o `preload` (já são 2, o limite) ou adotar CDN de fonte (D09).
- Medir no Pages publicado: a #41 fará depois do deploy.

## Casos de borda

- QUANDO um texto novo usar caractere fora do conjunto ENTÃO o navegador usa a fonte reserva só naquele caractere, sem quebrar a página; o teste de T2 acusa o caractere na hora de entrar o conteúdo.
- QUANDO a rota for `/en`, `/es` ou `/pt-BR` ENTÃO a soma fica abaixo de 160 KB nas três.
- QUANDO a rota usar a Plex Sans 700 (se alguma usar) ENTÃO ela também é reduzida pela opção B, e a soma por rota é conferida em T1.
- QUANDO o tema for claro ou escuro ENTÃO a aparência é a mesma (só os arquivos mudam, não as cores).
- QUANDO a licença OFL tiver nome reservado ENTÃO o arquivo reduzido não pode se passar pela fonte original: conferir `bricolage-grotesque-OFL.txt` e `ibm-plex-*-OFL.txt` em T2 (a OFL permite subset; o nome reservado, se houver, fica no `name` da fonte).

## Critérios de aceite

- [ ] CA1: a soma dos `woff2` pedidos na primeira carga de cada rota pública, nos três idiomas, é ≤ 160 KB, com no máximo 2 `preload` (`NF-DE-11`). Evidência: tabela por rota no PR (build:fatec local, porta própria).
- [ ] CA2: nenhum peso nem família foi retirado e as declarações de `@font-face` e as reservas da #266 seguem iguais; `scripts/test/fontWeights.test.ts` verde.
- [ ] CA3: todo caractere de `src/locales/`, `public/content/` e `public/cv/` existe no `cmap` de cada fonte reduzida (teste novo).
- [ ] CA4: captura de `/pt-BR`, `/en/projects` e `/es/contact` (claro e escuro, 393 px) igual à da `staging` na aparência do texto; CLS do Contato ≤ valor medido na #266.
- [ ] CA5: a verificação de desempenho de fontes passa; testes, lint, typecheck e E2E verdes; `docs/product/v1-verification.md` não é tocado (é da #41).
- [ ] CA6: `docs/setup/` (ou `docs/design/design-system.md`) registra como as fontes foram reduzidas (comando e conjunto de caracteres), para repetir ao trocar uma fonte.

## Estratégia de validação

- **Medição (antes e depois, um build por vez):** `npm run build:fatec` e `PREVIEW_PORT=<porta própria> npm run preview:fatec` (nunca 4173 nem 5173); Chromium com `PerformanceObserver` de `resource` filtrando `.woff2`, somando `transferSize`/`encodedBodySize` por rota e idioma; registro em tabela no PR.
- **Reprodução da redução:** fonttools via `uv` (fora do `package.json`, sem dependência nova de projeto): `fonttools varLib.instancer` para o `wght` da Bricolage e `pyftsubset --unicodes=... --layout-features='*' --flavor=woff2` para o conjunto de caracteres; o comando fica documentado (CA6) e os `woff2` gerados são commitados.
- **Rollback:** `git revert` do PR; só arquivos de fonte, um teste e doc.

## Questões em aberto (para o PO)

1. **Estratégia.** Recomendo A + B (152.012 B, sem mudar aparência). Aprova? Se preferir mais folga, a C (115.060 B) é viável com o risco de glifo novo cair na reserva.
2. **D08.** Confirma que nenhum peso ou família sai agora? (Se quiser cortar peso, escolha D, E ou F e a spec muda.)
3. **Arquivos gerados.** Aceita commitar os `woff2` reduzidos (mesmos nomes) e documentar o comando de geração, sem script versionado nem dependência nova?

## Notas / decisões

- **Medição no navegador.** Os tamanhos de arquivo vêm do disco e do total do QA (a soma bate em 177.508 B); a contagem por rota no navegador entra em T1, antes de qualquer edição.
- **Dependência da #266.** Implementar só depois do merge da #266 (`gh pr view` da #266 = `MERGED`) para não haver conflito em `global.css`; a #267 nem precisa editar `global.css` se a Bricolage não mudar a faixa declarada.
- **PR.** Referenciar "Relacionada à #41", sem `Closes #41`; `Closes #267`.
- **R1, R2 e R3.** Sem texto de UI novo; a aparência não muda (decisões de design intactas).

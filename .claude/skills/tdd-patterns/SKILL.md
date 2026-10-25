---
name: tdd-patterns
description: Como fazer TDD (Red, Green, Refactor) neste projeto, um teste por vez, com o gate de verificação, a revisão de adequação dos testes e o sensor de discriminação. Use ao implementar tarefa que muda comportamento de função, hook, componente, rota ou store, ao corrigir bug (teste que reproduz primeiro) e ao julgar se os testes de uma feature são suficientes.
---

# TDD

Esta skill é dona do **ciclo**. Como escrever o arquivo de teste está em `vitest-specialist` (carregue as duas); E2E no navegador está em `playwright-e2e`. O ciclo vale para quem implementa (`executor`), para quem valida (`tester`) e para quem revisa (`reviewer`).

## 1. Princípios

1. **Um teste falhando por vez.** Nunca vários vermelhos juntos: vários vermelhos é projetar de cabeça em vez de deixar o teste conduzir.
2. **Veja o teste falhar antes de passar.** Teste que nunca ficou vermelho pode passar à toa (asserção errada, import trocado, teste do mock). O vermelho prova o teste. O motivo da falha precisa ser o certo (módulo ou comportamento ausente), não um erro de digitação.
3. **O mínimo de código que passa.** Retorno fixo é legítimo até o próximo teste exigir a regra geral.
4. **Refatore só no verde**, o código e o teste.
5. **Teste comportamento pela API pública**: papel, texto, estado, foco e navegação (`getByRole`, `user-event`), nunca estado interno nem detalhe de implementação. Renomear função privada não pode quebrar teste.
6. **Descrição em português como frase de comportamento** (`rejeita data anterior ao início`), nunca `teste 3`.
7. **Nunca altere nem apague teste para fazê-lo passar**, nem use `it.skip`, `it.todo` ou `test.fixme` para escapar de falha. Teste vermelho é sinal; se o teste estava errado, corrija o teste explicando por quê no relatório, não no código.

## 2. O ciclo, por tarefa do `tasks.md`

Cada tarefa que muda comportamento traz os campos **Testes** (o que provar, com o ID do requisito) e **Gate** (o comando que decide). Para cada comportamento da lista de Testes, um de cada vez:

1. **RED:** escreva o menor teste que falha pelo motivo certo e rode só ele: `npm test -- --run <arquivo>`. Veja falhar.
2. **GREEN:** escreva o mínimo de código de produto para passar. Rode o mesmo arquivo.
3. **REFACTOR:** com tudo verde, limpe código e teste. Rode de novo.
4. Volte ao 1 com o próximo comportamento. Ordem: fronteira primeiro (limite exato, vazio, valor máximo), depois o caso comum.

Fim da tarefa:

5. **VERIFY (gate):** rode o Gate da tarefa (por padrão `npm run typecheck`, `npm run lint` e os testes afetados; o `test:cov` completo no fim da feature). Saída diferente de zero para a tarefa.
6. **Adequação dos testes** (seção 4).
7. **Commit atômico** com teste e código juntos. Nunca commite vermelho: o estado vermelho vive só no working tree entre o RED e o GREEN, porque o CI e o `pre-commit` o rejeitam.

## 3. O que entra em TDD e o que não entra

| Entra (teste antes)                                                        | Não entra (verificação depois)                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| funções puras de `src/utils/`, hooks, slices, endpoints, regras de negócio | aparência: CSS, espaçamento, cor, hover, animação, "ficou bonito"  |
| comportamento de componente e página: papel, texto, estado, foco, rota     | composição de layout e regressão visual contra o protótipo         |
| texto nos três idiomas e chaves sem uso                                    | desempenho (Lighthouse), leitor de tela real, zoom, cores forçadas |
| bug: o teste que reproduz                                                  | leitura manual do PO                                               |

Para tela, o TDD cobre a lógica e o comportamento; a aparência é conferida no navegador: ao fim do `executor` a aplicação sobe para a verificação manual do PO (ver o fluxo no `CLAUDE.md`), e o `qa` escreve o E2E.

## 4. Revisão de adequação dos testes (gate rígido)

Uma tarefa não é commitada nem marcada como concluída até a tabela fechar. Os testes precisam ser **necessários** (todo teste rastreia a um requisito) e **suficientes** (todo requisito tem teste). O escopo é a spec: não teste além dela.

| Critério de "Feito quando", critério da spec ou borda listada | `arquivo:linha` e a expressão da asserção | Resultado que a spec define | Coberto? |
| ------------------------------------------------------------- | ----------------------------------------- | --------------------------- | -------- |

- **Evidência ou zero:** cada critério coberto cita o `arquivo:linha` e reproduz a expressão da asserção (`expect(...)`), não só o nome do `it`. Critério sem `arquivo:linha` conta como **não coberto** e bloqueia a tarefa. Antes de dizer que falta teste, procure nos arquivos e mostre a busca.
- **Resultado ancorado na spec:** o valor afirmado precisa bater com o que a spec define (texto exato, `aria-*`, caminho, contagem). Quando a spec não define o resultado com precisão, marque **lacuna de precisão da spec** e peça ao `sdd`, em vez de aceitar asserção vaga (`toBeTruthy`, `toBeDefined`, só "renderiza").
- **Teste sem requisito sai:** teste que não mapeia a nenhum critério é escopo extra: remova. Sem teste "e se" especulativo, sem testar comportamento de biblioteca, sem repetir asserção já coberta em outra camada.
- **Profundidade por camada:** unidade (valores, ramos, erro), componente (papel, estado, interação, `expectNoAxeViolations`), E2E (só o que exige navegador real).

Anote as duas tabelas e um veredito de uma linha no `tasks.md`, no campo de evidência da tarefa.

## 5. Sensor de discriminação (feito pelo `tester`, no fim)

Prova que os testes **falham quando o comportamento quebra**. Não faz parte do ciclo diário.

1. Garanta árvore limpa (`git status`) e guarde o estado (commit ou `git stash`). Mutação nunca fica no repositório.
2. Escolha de 3 a 6 comportamentos centrais da spec. Para cada um, injete uma falha pequena de comportamento: inverta uma condição, troque um retorno, erro de um por um, remova um `aria-*`, troque a chave de tradução.
3. Rode só os testes que deveriam acusar. Se nenhum falhar, o teste não discrimina: registre como **teste fraco** com a mutação e o `arquivo:linha` que devia falhar.
4. **Desfaça cada mutação** (`git checkout -- <arquivo>`, ou trabalhe numa cópia temporária) e confirme `git status` limpo e a suíte verde antes de seguir.

Mutação que sobrevive vira pedido de correção para quem escreveu o teste (o `executor` para teste de unidade da tarefa, o `qa` para E2E).

## 6. Bug: o teste que reproduz primeiro

Para spec de bug: (1) escreva o teste que reproduz o bug exato, (2) rode e veja falhar pelo motivo do relato, (3) corrija o mínimo, (4) rode e veja passar, (5) rode a suíte afetada. O teste fica como guarda permanente de regressão. Nada de corrigir antes de ter o vermelho.

## 7. Armadilhas

- Teste que só passa com a ordem de execução, ou com `setTimeout` real: instável, reescreva com `vi.useFakeTimers` ou espera por condição (`findBy*`, `waitFor`).
- Mock demais é sinal de acoplamento: se o Arrange é enorme, a unidade faz coisa demais.
- Teste de texto afirma o português da tela, não a chave de tradução.
- Restaure `vi.stubGlobal` e `vi.stubEnv` no `afterEach` (`vmThreads` reaproveita o worker).
- Cobertura não é adequação: 100% de linhas com asserção vaga certifica nada.

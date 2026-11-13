# Tasks: Verificação da v1 (checklist executável e pré-check automatizado)

> Spec: `./spec.md`

## Plano de execução

```
Fase 1 (sequencial)  →  Fase 2 (sequencial)  →  Fase 3
      T1                       T2                  T3
```

## Tarefas

- [x] T1 — Escrever `docs/product/v1-verification.md` e listá-lo em `docs/README.md`
    - **Arquivo(s):** `docs/product/v1-verification.md`, `docs/README.md`
    - **Depende de:** nenhuma
    - **Testes (escritos antes, RED):** não se aplica (só documentação)
    - **Gate:** `npx prettier --check docs/product/v1-verification.md docs/README.md`
    - **Feito quando:** o gate passa e as seções da spec existem com `Resultado`, `Quem fez`, `Data` e `Issue Fix` vazios
    - **Evidência:** (preenchida na execução)

- [x] T2 — Conferir a cobertura contra as fontes
    - **Arquivo(s):** nenhum (script descartável fora do repositório)
    - **Depende de:** T1
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** o script lista os IDs `A11Y-*` ativos e os `NF-*` com `#41` das fontes e acusa zero ausente
    - **Feito quando:** nenhum ID das fontes falta no documento e nenhum ID do documento falta nas fontes
    - **Evidência:** (preenchida na execução)

- [ ] T3 — Pré-check automatizado na staging e no build local com o `base` do Pages (depois da aprovação da spec e do PO responder às questões em aberto)
    - **Arquivo(s):** `e2e/` só se o PO pedir a varredura de largura como spec permanente; caso contrário, script descartável
    - **Depende de:** T1, aprovação da spec
    - **Testes (escritos antes, RED):** não se aplica
    - **Gate:** um item por vez, em porta própria (nunca 4173 nem 5173), com `uptime` abaixo de 14
    - **Feito quando:** cada resultado entra no documento como `pré-check`, sem `OK` e sem issue `Fix` aberta pelo QA
    - **Evidência:** (preenchida na execução)

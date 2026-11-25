## Contexto

Uso o Claude Code todos os dias, em vários repositórios, e repetia em cada um a mesma configuração: agentes, regras de código, skills e ajustes do `settings.json`. Cada cópia ficava diferente das outras com o tempo, e uma melhoria feita num projeto não chegava aos demais. Inspirado na minha experiência de trabalho com times de agentes, criei um kit pessoal que leva esse time para qualquer repositório com um comando.

## Meu papel

Fiz o projeto sozinho: o comando `ai-sync`, o conteúdo dos agentes, das regras e das skills, os testes, o lint e a automação no GitHub Actions. O próprio kit é desenvolvido com o time que ele instala, e os problemas que aparecem quando uso o time em outros projetos viram issues no repositório.

## Solução

O `ai-sync` é um script em Node.js que recebe o caminho do repositório de destino. Ele lê o `package.json` e o `composer.json` da raiz e das pastas de primeiro nível, detecta a stack (React, NestJS, Laravel ou AdonisJS) e copia para a pasta `.claude/` os agentes, as regras e as skills que servem àquele projeto, além de uma configuração base do Claude Code. Quem prefere escolher à mão usa um perfil (`default`, `frontend`, `backend` ou `tooling`).

Depois da sincronização, basta abrir o Claude Code e rodar `/team-setup`. A skill transforma a sessão principal na orquestradora: ela conversa com o usuário, monta o time de cada tarefa e só delega. O fluxo passa pelo `product-owner`, que define regras e escopo, pelo `sdd`, que escreve a especificação, pelos devs (frontend, backend, mobile, banco, devops, fullstack e documentação), que implementam com TDD e delegam tarefas mecânicas ao `executor`, e pelo `reviewer`, obrigatório sempre que há dev no time. O `qa` e o `designer` entram quando a tarefa pede.

O time guarda uma memória por repositório, só com o que continua valendo depois da tarefa, e pode rodar como subagentes ou, opcionalmente, como time de agentes que trocam mensagens entre si. No repositório do kit, um agente no GitHub Actions classifica as issues abertas por tamanho e abre pull request só das pequenas.

```bash
node ~/claude-kit/bin/ai-sync.js /caminho/do/repositorio
```

## Decisões técnicas

- **Sincronização que não apaga trabalho de ninguém.** O `ai-sync` registra num arquivo de lock o caminho, a versão e a impressão digital (SHA-256) de cada arquivo instalado. Arquivo editado pelo usuário nunca é sobrescrito nem removido; a ferramenta só avisa que há versão nova. Sobrescrever exige `--force`, de forma explícita.
- **Um único ponto de registro.** Todo agente, regra, skill e stack fica no `catalog.json`, com a regra de a quais projetos se aplica. O lint e os testes conferem se catálogo, arquivos e perfis estão coerentes.
- **Orquestradora como skill, não como agente.** No começo a orquestradora era um agente aberto com `--agent`. Troquei por uma skill carregada na sessão principal, o que deixa uma fonte só para o papel e usa o modelo que a sessão já tem.
- **Configuração base sem permissões amplas.** O modelo de `settings.json` não libera comandos nem diretórios, e o lint reprova qualquer modelo que tente. O que o usuário já definiu nunca é alterado: o que difere aparece como sugestão.
- **O kit se aplica a si mesmo.** Um hook de pre-commit sincroniza o `.claude/` do próprio repositório a cada commit, e um teste no CI reprova a cópia desatualizada.
- **Agente de issues com acesso mínimo.** Ele só lê o texto de quem colabora no repositório, só executa os comandos de uma lista fechada, tem a ação fixada pelo hash do commit e nunca faz merge.

## Resultado

Em cinco dias de desenvolvimento, o repositório chegou a 196 commits, 30 pull requests aceitos e 41 issues registradas, 38 delas já fechadas. Boa parte dessas issues saiu do uso real do time em outros projetos. O kit entrega 13 agentes, 11 regras (7 gerais e 4 por stack), 8 skills e 4 perfis, cobertos por 241 testes automatizados que passam. Ele já está sincronizado no repositório do ProconChat, projeto da faculdade, e no repositório que uso para registrar minhas entregas semanais.

## Aprendizados

- Instrução que se contradiz dentro do mesmo prompt deixa o agente sem saber qual ordem vale. A solução é uma exceção explícita e delimitada, não escolher uma das duas.
- `git commit -- caminho` monta um índice temporário. Um hook que regenera arquivos a partir da pasta mistura o trabalho de agentes que dividem a mesma worktree; a validação segura compara com o stage exportado.
- Conteúdo em markdown também merece TDD: o teste que falha primeiro mostra se o texto novo cobre de fato a lacuna no comportamento do agente.
- Um repositório que se aplica a si mesmo é um bom teste das próprias regras e impede que a cópia em uso fique para trás.

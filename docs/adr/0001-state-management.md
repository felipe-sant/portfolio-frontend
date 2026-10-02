# 0001. Gerenciamento de estado

- **Status:** aceita
- **Data:** 01-10-2026

## Contexto

O repositório nasceu com Redux Toolkit, RTK Query (`src/store/`) e um cliente HTTP sobre `fetch` (`src/services/http/`), sem nenhum slice nem endpoint em uso. O portfólio não tem backend hoje, mas vai ter: os dados de projetos e de trajetória (experiências, formações, stack) e o envio do formulário de contato virão dele. No handoff de design, a submissão do formulário é simulada e o backend do formulário aparece como pendência.

Até o backend existir, a aplicação precisa funcionar sozinha, com dados mock no frontend. O estado de cada tela definido no handoff (filtros de Projetos, galeria de Projeto, item aberto de Informações, campos do formulário de Contato) é local à tela; o tema vale para todas.

## Decisão

Manter Redux Toolkit, RTK Query e `src/services/http/` para o backend futuro, e começar frontend-only, com os dados servidos por mock no frontend.

## Consequências

- A aplicação roda e é testada sem backend; a fonte dos mocks e o jeito de servi-los ficam para uma issue própria.
- Estado de uma tela continua em `useState` no hook da página; estado compartilhado entre telas vai para um slice em `src/store/slices/`.
- Quando o backend existir, cada domínio vira um endpoint do RTK Query injetado em `src/store/api/<dominio>.api.ts`, sem trocar de biblioteca, e o formulário de contato passa a enviar ao backend.
- Até lá a store e o cliente HTTP ficam no bundle e na suíte de testes sem uso pela interface.
- `VITE_API_URL` fica vazia enquanto não há backend.

## Alternativas

- **Remover a store e o cliente HTTP:** deixaria a base menor agora, mas obrigaria a reintroduzir e reconfigurar tudo quando o backend chegar, que já é certo.
- **Context API:** suficiente para o tema, mas não oferece cache de servidor nem os hooks gerados por endpoint que o RTK Query entrega para os dados do backend.

## Contexto

Projeto acadêmico do 6º semestre de Desenvolvimento de Software Multiplataforma da Fatec Jacareí, em parceria com o PROCON de Jacareí. Boa parte da demanda do PROCON vem de dúvidas que se repetem: o que fazer diante de uma cobrança indevida, qual o prazo de arrependimento, quais documentos levar. O desafio era um chatbot de WhatsApp que orientasse o consumidor pelos fluxos definidos pelo próprio PROCON e, quando a orientação não bastasse, agendasse um atendimento presencial.

O desafio trazia restrições claras: usar de preferência a API oficial do WhatsApp, não usar nenhuma API externa de modelo de linguagem, mesmo gratuita, e tratar os dados dos cidadãos de acordo com a LGPD. O trabalho foi feito por um time de 7 pessoas, em 3 sprints de Scrum, de agosto a novembro de 2026.

## Meu papel

Fui o Scrum Master do time e o principal desenvolvedor: cerca de 1.550 dos quase 1.700 commits do repositório são meus. Mantive o board e os fechamentos de sprint, com a rastreabilidade dos requisitos, e revisei os PRs do time.

No código, atuei nas três partes do sistema. No backend e no gateway do WhatsApp, entreguei contas com permissões granulares, cancelamento pela equipe com aviso ao cidadão, remarcação e cancelamento pelo próprio chatbot, o acompanhamento dos status de entrega da Meta, a parte de LGPD e a IA no fluxo da conversa. No painel, fiz as telas de Usuários, Horários de atendimento e Conteúdo do chatbot, entre outras. Também escrevi o teste ponta a ponta do fluxo principal e os manuais em PDF entregues ao PROCON. Planejei e revisei boa parte das entregas com agentes de IA, em TDD.

## Solução

O cidadão manda uma mensagem no WhatsApp e o bot conduz a conversa com listas e botões: escolhe a categoria (cobrança indevida, contratos, arrependimento, garantia), depois a pergunta, e recebe a orientação com a base legal, os documentos necessários e o que fazer em seguida. Se a dúvida não for resolvida, o bot oferece os horários livres e agenda o atendimento presencial, e o cidadão pode voltar depois para remarcar ou cancelar.

O sistema tem cinco partes, todas em Docker Compose:

- **Gateway do WhatsApp:** recebe o webhook da Meta, confere a assinatura, processa as mensagens em fila por telefone e envia as respostas.
- **Backend:** guarda o estado da conversa, monta as respostas a partir do conteúdo do banco, calcula as vagas da agenda, envia os avisos ao cidadão e serve a API do painel.
- **Modelo de linguagem local:** o Ollama, com o `llama3.2:3b`, reescreve a explicação da resposta oficial em tom de conversa.
- **PostgreSQL:** guarda conteúdo, agenda, conversas e o registro de cada passo para os relatórios.
- **Painel web:** a equipe do PROCON gerencia agendamentos, edita o conteúdo do chatbot, configura horários, documentos, usuários e a conexão com o WhatsApp, e acompanha os relatórios.

A produção roda numa VM na nuvem, com HTTPS, e o deploy sai pelo GitHub Actions.

## Decisões técnicas

- **API oficial do WhatsApp.** Na primeira sprint usamos uma automação não oficial do WhatsApp Web. Ela deixava de entregar mensagens a parte dos contatos e trazia risco de banimento do número, então migrei para a WhatsApp Cloud API antes de começar o painel. As credenciais da Meta são configuradas pelo painel, guardadas criptografadas, e só são salvas depois de um teste de conexão.
- **A IA nunca decide o fluxo.** Quem escolhe a resposta é o código, a partir do conteúdo cadastrado pelo PROCON. O modelo só reescreve a explicação, e o texto gerado só é usado se trouxer todos os números da resposta oficial e nenhum número novo. Toda resposta gerada leva o rótulo "Gerado com auxílio de IA", e, se o modelo estiver fora do ar ou demorar demais, o cidadão recebe o texto oficial.
- **Dado pessoal guardado só quando precisa.** O telefone da conversa vira um hash e o CPF fica guardado só em hash e na versão mascarada. Uma revisão mostrou que o identificador de mensagem da Meta carrega o telefone codificado, então ele também passou a ser guardado só em hash. O telefone do agendamento é apagado quando chega o horário, e há uma anonimização por prazo, desligada por padrão, que limpa nomes e CPFs mantendo os números dos relatórios.
- **Concorrência na agenda.** A reserva e a remarcação usam travas do PostgreSQL por horário, sempre na mesma ordem, e as regras de negócio são conferidas dentro da transação, depois da trava, para dois cidadãos nunca ficarem com a mesma vaga.
- **Módulos lógicos, não microsserviços.** O backend é um serviço só, dividido em módulos de conversa, decisão, agenda, mensagens e painel. Só o modelo de linguagem tem container próprio, porque carrega o modelo inteiro em memória.

## Resultado

O projeto foi entregue em 23/11/2026, com os 16 requisitos do desafio (8 funcionais e 8 não funcionais) concluídos e o sistema em produção. Na terceira sprint, 17 das 22 entregas tinham o meu nome entre os responsáveis.

A base de testes passou de 3.700 casos automatizados em Vitest entre backend, gateway e painel, com testes de integração rodando contra um PostgreSQL real no CI. O teste ponta a ponta simula o webhook da Meta com assinatura, do primeiro "oi" até o atendimento registrado no painel, e passou no CI já na primeira execução. Uma revisão por mutação nesse teste mostrou que o CPF formatado não era conferido, e a falha foi corrigida antes do merge.

Um limite ficou claro: em CPU, o modelo local leva de 23 a 38 segundos por resposta. Por isso o bot mostra o indicador de digitando enquanto espera, atende uma geração por vez e responde com o texto oficial quando a IA está ocupada. A VM de produção não tem memória para o modelo, então a versão no ar responde só com o texto oficial, a menos que o Ollama de uma máquina da equipe esteja ligado por rede privada.

## Aprendizados

Aprendi que um teste verde não prova cobertura: só alterar o código de propósito e ver o teste falhar mostra que ele protege a regra. Aprendi também que verificação fora da trava precisa ser refeita dentro dela, e que dado pessoal aparece onde menos se espera, como no identificador de uma mensagem. Como Scrum Master, vi que o fim da sprint concentra entregas quando a documentação e os testes ficam para depois, e passei a puxá-los para mais cedo.

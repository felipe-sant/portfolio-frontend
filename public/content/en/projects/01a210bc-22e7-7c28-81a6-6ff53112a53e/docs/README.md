## Context

Academic project from the 6th semester of the Multiplatform Software Development program at Fatec Jacareí, in partnership with PROCON Jacareí, the city's consumer protection agency. A large share of PROCON's demand comes from recurring questions: what to do about an undue charge, how long the cooling-off period is, which documents to bring. The challenge was a WhatsApp chatbot that would guide consumers through the flows defined by PROCON itself and, when the guidance was not enough, book an in-person appointment.

The challenge came with clear constraints: preferably use the official WhatsApp API, use no external language model API, even a free one, and handle citizens' data in compliance with the LGPD, Brazil's data protection law. The work was done by a team of 7 people, in 3 Scrum sprints, from August to November 2026.

## My role

I was the team's Scrum Master and its main developer: about 1,550 of the nearly 1,700 commits in the repository are mine. I kept the board and the sprint closings up to date, along with requirements traceability, and reviewed the team's PRs.

In the code, I worked on all three parts of the system. In the backend and the WhatsApp gateway, I delivered accounts with granular permissions, cancellation by the staff with a notice to the citizen, rescheduling and cancellation through the chatbot itself, tracking of Meta's delivery statuses, the LGPD features and the AI in the conversation flow. In the admin panel, I built the Users, Opening hours and Chatbot content screens, among others. I also wrote the end-to-end test of the main flow and the PDF manuals handed over to PROCON. I planned and reviewed most of these deliveries with AI agents, using TDD.

## Solution

The citizen sends a message on WhatsApp and the bot leads the conversation with lists and buttons: they pick a category (undue charges, contracts, cooling-off, warranty), then a question, and receive guidance with the legal basis, the required documents and what to do next. If the question is not resolved, the bot offers the free time slots and books the in-person appointment, and the citizen can come back later to reschedule or cancel.

The system has five parts, all running on Docker Compose:

- **WhatsApp gateway:** receives Meta's webhook, checks the signature, processes messages in a per-phone queue and sends the replies.
- **Backend:** keeps the conversation state, builds the answers from the content in the database, calculates the available slots, sends notices to the citizen and serves the panel's API.
- **Local language model:** Ollama, with `llama3.2:3b`, rewrites the explanation of the official answer in a conversational tone.
- **PostgreSQL:** stores content, schedule, conversations and a record of every step for the reports.
- **Web panel:** PROCON's staff manage appointments, edit the chatbot content, configure opening hours, documents, users and the WhatsApp connection, and follow the reports.

Production runs on a cloud VM with HTTPS, and deployment goes through GitHub Actions.

## Technical decisions

- **Official WhatsApp API.** In the first sprint we used an unofficial WhatsApp Web automation. It failed to deliver messages to some contacts and put the number at risk of being banned, so I migrated to the WhatsApp Cloud API before starting the panel. Meta credentials are configured through the panel, stored encrypted, and only saved after a successful connection test.
- **The AI never decides the flow.** The code picks the answer, based on the content registered by PROCON. The model only rewrites the explanation, and the generated text is used only if it includes every number from the official answer and no new number. Every generated answer carries the label "Gerado com auxílio de IA" (generated with AI assistance), and if the model is down or takes too long, the citizen gets the official text.
- **Personal data stored only when needed.** The conversation's phone number becomes a hash, and the CPF (Brazilian taxpayer ID) is kept only as a hash and a masked version. A review showed that Meta's message identifier carries the phone number encoded, so it is also stored only as a hash. The appointment's phone number is deleted once the appointment time arrives, and a time-based anonymization, off by default, clears names and CPFs while keeping the report figures.
- **Concurrency in the schedule.** Booking and rescheduling use PostgreSQL locks per time slot, always taken in the same order, and business rules are checked inside the transaction, after the lock, so two citizens never end up with the same slot.
- **Logical modules, not microservices.** The backend is a single service, split into conversation, decision, schedule, messaging and panel modules. Only the language model has its own container, because it loads the whole model into memory.

## Outcome

The project was delivered on November 23, 2026, with all 16 requirements of the challenge (8 functional and 8 non-functional) completed and the system in production. In the third sprint, 17 of the 22 deliveries had my name among the assignees.

The test suite grew past 3,700 automated cases in Vitest across backend, gateway and panel, with integration tests running against a real PostgreSQL in CI. The end-to-end test simulates Meta's signed webhook, from the first "hi" to the appointment recorded in the panel, and passed in CI on its very first run. A mutation review of that test showed that the formatted CPF was not being checked, and the gap was fixed before the merge.

One limit became clear: on CPU, the local model takes 23 to 38 seconds per answer. That is why the bot shows the typing indicator while it waits, runs one generation at a time and replies with the official text when the AI is busy. The production VM does not have enough memory for the model, so the live version replies only with the official text, unless Ollama on a team machine is connected over a private network.

## Learnings

I learned that a green test does not prove coverage: only changing the code on purpose and watching the test fail shows that it protects the rule. I also learned that a check made outside a lock has to be repeated inside it, and that personal data shows up where you least expect it, such as in a message identifier. As Scrum Master, I saw that the end of a sprint piles up deliveries when documentation and tests are left for later, and I started pulling them earlier.

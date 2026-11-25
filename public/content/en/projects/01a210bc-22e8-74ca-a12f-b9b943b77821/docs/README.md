## Context

I use Claude Code every day, across several repositories, and I kept repeating the same setup in each one: agents, coding rules, skills and `settings.json` tweaks. Over time every copy drifted from the others, and an improvement made in one project never reached the rest. Inspired by my work experience with agent teams, I built a personal kit that brings that team to any repository with a single command.

## My role

I built the project on my own: the `ai-sync` command, the content of the agents, rules and skills, the tests, the lint and the GitHub Actions automation. The kit itself is developed with the team it installs, and the problems that show up when I use the team in other projects become issues in the repository.

## Solution

`ai-sync` is a Node.js script that takes the path of the target repository. It reads the `package.json` and `composer.json` at the root and in first-level folders, detects the stack (React, NestJS, Laravel or AdonisJS) and copies into the `.claude/` folder the agents, rules and skills that fit that project, plus a base Claude Code configuration. Anyone who prefers to choose by hand uses a profile (`default`, `frontend`, `backend` or `tooling`).

After the sync, you just open Claude Code and run `/team-setup`. The skill turns the main session into the orchestrator: it talks to the user, puts together the team for each task and only delegates. The flow goes through the `product-owner`, who defines rules and scope, the `sdd`, who writes the specification, the devs (frontend, backend, mobile, database, devops, fullstack and documentation), who implement with TDD and hand mechanical tasks to the `executor`, and the `reviewer`, mandatory whenever there is a dev on the team. The `qa` and the `designer` join when the task calls for them.

The team keeps a memory per repository, holding only what stays valid after the task, and can run as subagents or, optionally, as an agent team whose members message each other. In the kit's own repository, an agent in GitHub Actions sizes the open issues and opens a pull request only for the small ones.

```bash
node ~/claude-kit/bin/ai-sync.js /path/to/repository
```

## Technical decisions

- **A sync that never deletes anyone's work.** `ai-sync` records in a lock file the path, version and fingerprint (SHA-256) of every installed file. A file edited by the user is never overwritten or removed; the tool only warns that a new version is available. Overwriting requires `--force`, explicitly.
- **A single registration point.** Every agent, rule, skill and stack lives in `catalog.json`, with the rule for which projects it applies to. The lint and the tests check that catalog, files and profiles are consistent.
- **Orchestrator as a skill, not an agent.** At first the orchestrator was an agent opened with `--agent`. I replaced it with a skill loaded into the main session, which leaves a single source for the role and uses the model the session already has.
- **Base configuration without broad permissions.** The `settings.json` template allows no commands or directories, and the lint rejects any template that tries to. What the user has already set is never changed: whatever differs shows up as a suggestion.
- **The kit applies itself.** A pre-commit hook syncs the repository's own `.claude/` on every commit, and a CI test fails an outdated copy.
- **Issue agent with minimal access.** It only reads text from the repository's collaborators, only runs commands from a closed list, has its action pinned by commit hash and never merges.

## Outcome

In five days of development, the repository reached 196 commits, 30 merged pull requests and 41 issues filed, 38 of them already closed. A good share of those issues came from real use of the team in other projects. The kit ships 13 agents, 11 rules (7 general and 4 per stack), 8 skills and 4 profiles, covered by 241 passing automated tests. It is already synced into the repository of ProconChat, a college project, and into the repository I use to record my weekly work.

## Learnings

- An instruction that contradicts itself within the same prompt leaves the agent unsure which order applies. The fix is an explicit, bounded exception, not picking one of the two.
- `git commit -- path` builds a temporary index. A hook that regenerates files from the working folder mixes the work of agents sharing the same worktree; the safe check compares against the exported stage.
- Markdown content also deserves TDD: the test that fails first shows whether the new text really covers the gap in the agent's behavior.
- A repository that applies itself is a good test of its own rules and keeps the copy in use from falling behind.

## Prerequisites

Node.js 22 or newer and Claude Code installed. Clone [claude-kit](https://github.com/felipe-sant/claude-kit) into a folder outside the repository that will receive the team:

```bash
git clone https://github.com/felipe-sant/claude-kit.git ~/claude-kit
```

## Apply to a repository

```bash
node ~/claude-kit/bin/ai-sync.js /path/to/repository
```

Inside the repository itself, the path can be omitted. At the end, `ai-sync` shows the detected stacks and what was created, updated, removed and kept. Commit the `.claude/claude-core.lock.json` file along with the repository.

## Set up the team

Open Claude Code in the repository and run `/team-setup`. The main session becomes the orchestrator: it asks for the team's names, proposes who takes part in each task and confirms before delegating.

## Options

| Option           | What it does                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `--profile name` | Applies a hand-picked profile (`default`, `frontend`, `backend` or `tooling`) instead of stack detection. |
| `--force`        | Also reinstalls the files that were edited in the repository.                                             |
| `--teams`        | Turns on the experimental agent team mode, in the local configuration only. `--no-teams` turns it off.    |
| `--check`        | Checks that the kit's catalog, files and profiles are consistent, without applying anything.              |

Repositories of tools, scripts and content, with no detectable stack, use `--profile tooling`.

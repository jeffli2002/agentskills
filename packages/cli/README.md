# agentskills

> CLI tool to install AI agent skills from the [AgentSkills marketplace](https://agentskills.cv)

Install skills directly from agentskills.cv to all your AI agents with a single command.

## Features

- 🚀 **One command, every agent** - Automatically detects and installs to Claude Code, Cursor, Codex, OpenClaw, and more
- 🔍 **Search marketplace** - Find skills directly from the CLI
- 🔄 **Convert skills** - Convert existing skills to OpenClaw format
- 📦 **Manage installations** - List installed skills across all agents

## Quick Start

```bash
# Install a skill
npx agentskills install notebooklm

# Search for skills
npx agentskills search "git commit"

# List installed skills
npx agentskills list

# Show detected agents
npx agentskills agents
```

## Installation

No installation required! Use `npx` to run the CLI directly:

```bash
npx agentskills <command>
```

Or install globally:

```bash
npm install -g agentskills
```

## Usage

### Install a skill

```bash
# Install to project (local)
npx agentskills install <skill-name>

# Install globally
npx agentskills install <skill-name> --global
```

### Search skills

```bash
npx agentskills search "your query"
```

### Convert skills

Convert existing skill files or GitHub repos to OpenClaw format:

```bash
# Convert local file
npx agentskills convert ./my-skill.md

# Convert GitHub repo
npx agentskills convert https://github.com/user/repo

# Convert and install
npx agentskills convert ./my-skill.md --install
```

### List installed skills

```bash
# List project skills
npx agentskills list

# List global skills
npx agentskills list --global
```

### Show detected agents

```bash
npx agentskills agents
```

## Supported Agents

- **Claude Code** - `.claude/skills/` (project) or `~/.claude/skills/` (global)
- **Cursor** - `.cursor/skills/` (project) or `~/.cursor/skills/` (global)
- **Codex CLI** - `.codex/skills/` (project) or `~/.codex/skills/` (global)
- **OpenClaw** - `skills/` (project) or `~/.openclaw/skills/` (global)
- **OpenCode** - `.opencode/skills/` (project) or `~/.opencode/skills/` (global)

## Commands

| Command | Description |
|---------|-------------|
| `install <name>` | Install a skill to detected agents |
| `search <query>` | Search skills on the marketplace |
| `convert <source>` | Convert file or URL to OpenClaw format |
| `list` | List installed skills |
| `agents` | Show detected AI agents |

## Options

| Option | Description |
|--------|-------------|
| `--global, -g` | Install to global skills directory (~/) |
| `--install` | With convert: install after converting |
| `--help, -h` | Show help message |
| `--version, -v` | Show version |

## Examples

```bash
# Install a skill globally
npx agentskills install commit-analyzer --global

# Search for git-related skills
npx agentskills search "git"

# Convert a GitHub skill to OpenClaw and install
npx agentskills convert https://github.com/user/skill-repo --install

# List all globally installed skills
npx agentskills list --global
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENTSKILLS_API` | API base URL | `https://agentskills.cv/api` |

## License

MIT

## Links

- [Website](https://agentskills.cv)
- [GitHub](https://github.com/jeffleeismyhero/agentskills)
- [Documentation](https://agentskills.cv/cli)

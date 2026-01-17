# PRD: Ralph — Autonomous AI Coding Agent Loop

## Overview

**Ralph** (named after Ralph Wiggum from The Simpsons) is a technique for running AI coding agents in a continuous loop, allowing them to autonomously build applications feature-by-feature without human intervention.

> "What if instead of manually prompting each feature, AI can continuously build out the features until it's done?"

---

## Problem Statement

### Current AI-Assisted Development Flow

```
┌─────────┐    ┌─────────────┐    ┌─────────┐    ┌─────────────┐
│  Idea   │───▶│  Feature 1  │───▶│  Test 1 │───▶│  Feature 2  │───▶ ...
└─────────┘    └─────────────┘    └─────────┘    └─────────────┘
                     ▲                                  ▲
                     │         HUMAN INVOLVEMENT        │
                     └──────────────────────────────────┘
```

### Pain Points

1. **Constant human prompting** — Developer must manually prompt each feature
2. **Context switching** — Breaking flow to type prompts and review progress
3. **Inconsistent progress** — No standardized way to track what's done
4. **Session loss** — Starting over when context is lost or session ends
5. **No feedback loop** — AI doesn't self-verify completion

### Who Benefits

- **Solo developers** — Ship faster with less hands-on time
- **Side project builders** — Run overnight, wake up to progress
- **Directory builders** — Automate repetitive feature implementation
- **Rapid prototypers** — Go from PRD to working MVP autonomously

---

## Solution: The Ralph Loop

### Core Concept

Ralph is a **technique, not a tool**. It's a pattern for structuring AI coding work so agents can:

1. Read a plan (PRD)
2. Find the next incomplete task
3. Implement it
4. Verify with tests
5. Document progress
6. Loop until done

### The Two Essential Files

| File | Purpose | Analogy |
|------|---------|---------|
| `prd.md` | Defines the end state — all features to build | The destination |
| `progress.txt` | Tracks what's done — checkpoint for resuming | The breadcrumbs |

```
┌─────────────────────────────────────────────────────────────┐
│                      RALPH LOOP                             │
│                                                             │
│   ┌──────────┐         ┌──────────────┐                    │
│   │  prd.md  │────────▶│  AI Agent    │                    │
│   │ (plan)   │         │  (Claude)    │                    │
│   └──────────┘         └──────┬───────┘                    │
│                               │                             │
│                               ▼                             │
│                        ┌──────────────┐                    │
│                        │ Find next    │                    │
│                        │ unchecked    │◀─────────┐         │
│                        │ item         │          │         │
│                        └──────┬───────┘          │         │
│                               │                  │         │
│                               ▼                  │         │
│                        ┌──────────────┐          │         │
│                        │ Implement    │          │         │
│                        │ feature      │          │         │
│                        └──────┬───────┘          │         │
│                               │                  │         │
│                               ▼                  │         │
│                        ┌──────────────┐          │         │
│                        │ Run tests    │          │         │
│                        │ & linter     │          │         │
│                        └──────┬───────┘          │         │
│                               │                  │         │
│                               ▼                  │         │
│   ┌──────────────┐     ┌──────────────┐          │         │
│   │ progress.txt │◀────│ Update       │          │         │
│   │ (checkpoint) │     │ progress     │──────────┘         │
│   └──────────────┘     └──────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Functional Requirements

### 1. PRD File Structure (`prd.md`)

The PRD must be structured with **checkable items** so the agent can:
- Identify incomplete tasks (`[ ]`)
- Mark completed tasks (`[x]`)
- Track progress by phase

**Required Sections:**

```markdown
# Project Name

## Overview
Brief description of what we're building.

## Features
High-level feature list.

## Implementation Phases

### Phase 1: Foundation
- [ ] Task 1.1: Set up project structure
- [ ] Task 1.2: Configure dependencies
- [ ] Task 1.3: Create base components

### Phase 2: Core Features
- [ ] Task 2.1: Implement feature A
- [ ] Task 2.2: Implement feature B
- [ ] Task 2.3: Add tests for features

### Phase 3: Polish
- [ ] Task 3.1: Error handling
- [ ] Task 3.2: Performance optimization
- [ ] Task 3.3: Final testing
```

**PRD Quality Guidelines:**

> "The plan matters a lot. How detailed, how precise, and how particular you are in your plan will dictate the level of quality that the agent gives out."

| Aspect | Poor | Good |
|--------|------|------|
| **Specificity** | "Add authentication" | "Implement JWT auth with refresh tokens using jose library" |
| **Scope** | "Build the frontend" | "Create LoginForm component with email/password fields and validation" |
| **Dependencies** | Not mentioned | "Requires: Task 1.2 (database schema) to be complete" |
| **Acceptance** | None | "Test: User can log in and see dashboard" |

### 2. Progress File Structure (`progress.txt`)

The progress file serves as a **checkpoint** allowing:
- Session resumption after interruption
- Audit trail of what was done
- Context for the agent on previous work

**Format:**

```
# Progress Log

## Session: 2026-01-17T10:30:00

### Completed: Phase 1, Task 1.1 - Set up project structure
- Created /src directory structure
- Added package.json with dependencies
- Configured TypeScript

### Completed: Phase 1, Task 1.2 - Configure dependencies
- Installed React, Next.js, Tailwind
- Set up ESLint and Prettier
- Created tsconfig.json

---

## Session: 2026-01-17T14:00:00

### Completed: Phase 1, Task 1.3 - Create base components
- Built Button, Input, Card components
- Added Storybook stories
- All tests passing

### In Progress: Phase 2, Task 2.1 - Implement feature A
- Started work on...
```

### 3. Ralph Script (`ralph.sh`)

A shell script that runs the agent in a loop with configurable options.

**Core Functionality:**

```bash
#!/bin/bash

# ralph.sh - Autonomous AI coding agent loop

# Configuration
MAX_ITERATIONS=${MAX_ITERATIONS:-50}
AGENT_CMD=${AGENT_CMD:-"claude"}
PRD_FILE=${PRD_FILE:-"prd.md"}
PROGRESS_FILE=${PROGRESS_FILE:-"progress.txt"}

# Flags
FAST_MODE=false
NO_TESTS=false
NO_LINT=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --fast)
      FAST_MODE=true
      NO_TESTS=true
      NO_LINT=true
      shift
      ;;
    --no-tests)
      NO_TESTS=true
      shift
      ;;
    --no-lint)
      NO_LINT=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --max-iterations)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Main loop prompt
LOOP_PROMPT="Read $PRD_FILE and $PROGRESS_FILE.
Find the next unchecked task ([ ]) in the PRD.
Implement it completely.
$([ "$NO_TESTS" = false ] && echo "Write and run tests to verify.")
$([ "$NO_LINT" = false ] && echo "Run linter and fix any issues.")
Update $PROGRESS_FILE with what you completed.
Mark the task as done ([x]) in $PRD_FILE.
If all tasks are complete, say 'ALL_TASKS_COMPLETE'."

# Run loop
for i in $(seq 1 $MAX_ITERATIONS); do
  echo "=== Ralph Loop Iteration $i ==="

  # Run agent
  OUTPUT=$($AGENT_CMD --print "$LOOP_PROMPT" 2>&1)

  # Check for completion
  if echo "$OUTPUT" | grep -q "ALL_TASKS_COMPLETE"; then
    echo "✅ All tasks complete!"
    break
  fi

  # Brief pause between iterations
  sleep 2
done

echo "=== Ralph Loop Complete ==="
```

### 4. Flag Options

| Flag | Effect | Use Case |
|------|--------|----------|
| `--fast` | Skip tests and linting | Rapid prototyping, exploration |
| `--no-tests` | Skip test writing/running | When tests will be added later |
| `--no-lint` | Skip linter | Quick iterations |
| `--verbose` | Show detailed output | Debugging |
| `--max-iterations N` | Limit loop count | Cost control |

---

## Technical Architecture

### Integration with Claude Code

```
┌─────────────────────────────────────────────────────────────┐
│                     ralph.sh                                │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐ │
│   │  claude --print "..." (headless mode)                │ │
│   │                                                      │ │
│   │  Reads: prd.md, progress.txt                        │ │
│   │  Writes: source code, tests, progress.txt, prd.md   │ │
│   │  Runs: npm test, npm run lint, npm run build        │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
│   Loop continues until:                                     │
│   - All PRD tasks marked [x]                               │
│   - Max iterations reached                                  │
│   - Manual interruption (Ctrl+C)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent Requirements

The AI agent must be able to:

1. **Read files** — Access prd.md and progress.txt
2. **Write files** — Create/modify source code and documentation
3. **Run commands** — Execute tests, linters, build tools
4. **Update state** — Modify prd.md checkboxes and progress.txt

**Compatible Agents:**
- Claude Code (Anthropic) — Primary target
- Cursor Agent
- Aider
- OpenCode (open-source alternative)

### Cost Tracking

Track API costs per session:

```bash
# Add to ralph.sh
COST_LOG="ralph-costs.log"

# After each iteration, log token usage
echo "$(date -Iseconds) | Iteration $i | Tokens: $TOKENS | Cost: \$$COST" >> $COST_LOG

# Summary at end
echo "Total cost for this Ralph run: \$$(awk -F'$' '{sum+=$2} END {print sum}' $COST_LOG)"
```

---

## Implementation Phases

### Phase 1: MVP Script (1 day)

- [x] Basic ralph.sh with loop structure
- [ ] PRD file reading and task detection
- [ ] Progress file updating
- [ ] Completion detection
- [ ] Basic cost logging

### Phase 2: Enhanced Features (2-3 days)

- [ ] `--fast` mode (skip tests/lint)
- [ ] `--max-iterations` flag
- [ ] `--verbose` output mode
- [ ] Better error handling
- [ ] Session resumption from progress.txt
- [ ] Interrupt handling (Ctrl+C saves state)

### Phase 3: Quality of Life (1 week)

- [ ] PRD template generator (`ralph init`)
- [ ] Progress visualization (terminal UI)
- [ ] Slack/Discord notifications on completion
- [ ] Git commit after each task completion
- [ ] Cost estimation before starting
- [ ] Multiple agent support (--agent flag)

### Phase 4: Advanced Features (2 weeks)

- [ ] Web dashboard for monitoring
- [ ] Parallel task execution (independent tasks)
- [ ] Rollback on test failure
- [ ] AI-assisted PRD generation from description
- [ ] Integration with project management tools

---

## Usage Examples

### Basic Usage

```bash
# Initialize a new project with Ralph
./ralph.sh init my-todo-app

# Creates:
# - my-todo-app/prd.md (template)
# - my-todo-app/progress.txt (empty)
# - my-todo-app/ralph.sh (configured)

# Edit prd.md with your plan, then:
cd my-todo-app
./ralph.sh
```

### Fast Prototyping

```bash
# Skip tests and linting for rapid iteration
./ralph.sh --fast

# Limit iterations to control cost
./ralph.sh --fast --max-iterations 10
```

### Production Quality

```bash
# Full quality mode (default)
./ralph.sh

# With verbose output for monitoring
./ralph.sh --verbose
```

### Resume After Interruption

```bash
# Just run ralph.sh again - it reads progress.txt
./ralph.sh

# Agent sees progress.txt and continues where it left off
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task completion rate | > 90% | Tasks completed vs total tasks |
| Test pass rate | > 95% | Tests passing after implementation |
| Cost per feature | < $2 | Average API cost per PRD task |
| Time to MVP | < 4 hours | From PRD to working prototype |
| Resume accuracy | 100% | Correctly continues from progress.txt |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Infinite loop | High (cost) | Max iterations limit, cost cap |
| Broken code committed | Medium | Tests required before marking complete |
| Context loss | Medium | Detailed progress.txt logging |
| Inconsistent state | Medium | Atomic updates (complete task OR don't) |
| API rate limits | Low | Exponential backoff, delays between iterations |

---

## Best Practices

### Writing Effective PRDs for Ralph

1. **Be specific** — "Create Button component with primary/secondary variants" not "Add buttons"

2. **Include acceptance criteria** — "User can click button and see loading state"

3. **Order by dependency** — Foundation tasks before features that use them

4. **Keep tasks small** — Each task should be completable in one agent session

5. **Include test expectations** — "Test: renders correctly with all prop combinations"

### Monitoring Ralph Runs

1. **Watch the progress.txt** — `tail -f progress.txt`

2. **Set cost alerts** — Stop if cost exceeds threshold

3. **Review after each phase** — Don't let it run completely unattended for large projects

4. **Git commit boundaries** — Configure auto-commit after each task for easy rollback

---

## Comparison with Alternatives

| Approach | Automation | Quality Control | Cost |
|----------|------------|-----------------|------|
| Manual prompting | None | High (human review) | Low |
| Claude Code /ralph plugin | Medium | Medium | Medium |
| Custom Ralph script | High | Configurable | Variable |
| Devin/similar | Very High | Variable | High |

**Our Differentiation:**
- Fully customizable to your workflow
- Works with multiple AI agents
- Transparent — you own the script
- Cost-controlled with limits and logging

---

## Open Questions

1. **Git strategy** — Auto-commit per task? Per phase? Manual?
2. **Failure handling** — Retry failed tasks? Skip and continue? Stop?
3. **Parallelization** — Can independent tasks run concurrently?
4. **Human checkpoints** — Require approval at phase boundaries?

---

## Next Steps

1. [ ] Create basic `ralph.sh` script
2. [ ] Test with simple project (todo app)
3. [ ] Add --fast mode
4. [ ] Add cost tracking
5. [ ] Create PRD template generator
6. [ ] Document best practices from real usage

---

## Appendix: PRD Template

```markdown
# [Project Name]

## Overview
[2-3 sentence description of what we're building]

## Tech Stack
- Framework: [Next.js / React / etc.]
- Language: [TypeScript / JavaScript]
- Styling: [Tailwind / CSS Modules / etc.]
- Database: [Postgres / SQLite / none]

## Features
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize project with [framework]
- [ ] Configure TypeScript
- [ ] Set up linting and formatting
- [ ] Create basic folder structure

### Phase 2: Core Components
- [ ] Create [Component 1]
- [ ] Create [Component 2]
- [ ] Add component tests

### Phase 3: Features
- [ ] Implement [Feature 1]
- [ ] Implement [Feature 2]
- [ ] Add integration tests

### Phase 4: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Final testing

## Testing Strategy
- Unit tests for utilities
- Component tests for UI
- Integration tests for features

## Notes
[Any additional context for the AI agent]
```

---

## References

- Original concept: Ras (Ship Your Directory)
- Video: "Ralph Wiggum killed programming"
- Anthropic Claude Code: https://claude.ai/code

# Ralph Knowledge Base

> A comprehensive guide synthesized from Ras (Ship Your Directory), Ryan Carson (Treehouse), and Matt Pocock (Total TypeScript)

---

## What is Ralph?

**Ralph** (named after Ralph Wiggum from The Simpsons) is a technique for running AI coding agents in a continuous autonomous loop. Created by **Jeff Huntley**, it allows AI to build entire features while you sleep.

> "You give an agent a list of small tasks and it keeps picking one, implementing it, testing it, committing the code. It's basically a way for you to have AI agents building your business, building your product overnight while you sleep." — Ryan Carson

---

## Why Ralph Works

Ralph mimics how humans have coded for decades using **Kanban boards**:

1. Pick a sticky note (user story) off the board
2. Go to your desk and code it
3. Complete it, commit it, merge it
4. Come back to the board and grab another sticky note

> "This is the way humans have been coding forever. And the reason why is because it works. You have a unit of work that you can understand, that you can test, and you can complete independently." — Ryan Carson

---

## The Core Architecture

### Two Essential Files

| File | Purpose | Analogy |
|------|---------|---------|
| `prd.md` | Defines the end state — all features to build | The destination |
| `progress.txt` | Tracks what's done — checkpoint for resuming | Short-term memory |

### The Loop

```
┌─────────────────────────────────────────────────────────┐
│  1. Read PRD (find next unchecked [ ] item)             │
│  2. Read progress.txt (understand context)              │
│  3. Implement the user story                            │
│  4. Verify with acceptance criteria                     │
│  5. Update progress.txt                                 │
│  6. Mark task complete [x] in PRD                       │
│  7. Loop until all tasks done                           │
└─────────────────────────────────────────────────────────┘
```

---

## Two Modes: AFK Ralph vs Human-in-Loop Ralph

> "I have a Ralph AFK version and a Ralph human-in-the-loop version" — Matt Pocock

### AFK Ralph (`ralph.sh`)

Run overnight for autonomous feature building:

```bash
./ralph.sh 10    # Run max 10 iterations
```

- Runs unattended
- Good for well-defined PRD items
- Sends notification when complete

### Human-in-Loop Ralph (`ralph-once.sh`)

Run interactively for complex features:

```bash
./ralph-once.sh  # Single iteration, interactive
```

- You observe each iteration
- Good for learning Ralph's capabilities
- Better for difficult-to-implement features
- Still more productive than multi-phase plans

> "Even when I'm in this human in the loop version, I still feel like I'm more productive than if I were to create a multi-phase plan." — Matt Pocock

---

## The Critical Rule: Story Size

> "Each story must be completable in one Ralph iteration"

**Why this matters:**
- Agents have a context limit (~168,000 tokens for Opus)
- Stories must be fully completable within that context window
- Ralph runs little independent threads where it completes one user story at a time

**Good story size:**
- Small, atomic tasks
- Can be implemented and tested in one session
- Clear start and end point

---

## Acceptance Criteria: The Key Unlock

> "How does AMP or your agent know if it's done with this thing? You have to give it clear acceptance criteria. They're basically tests so that the agent by itself can build this thing and know if it was done without asking you." — Ryan Carson

**Good acceptance criteria examples:**
- "Add status column to task table with default 'pending'"
- "Filter dropdown has options: all, active, completed"
- "User can click button and see loading state"

**Bad acceptance criteria:**
- "Make it work"
- "Add the feature"
- "It should look nice"

---

## The Workflow Step by Step

### Step 1: Create PRD (Product Requirement Doc)

Use voice (Whisper Flow) to describe your feature for 2-3 minutes, then convert to markdown.

**PRD Generator prompt example:**
```
Job: Receive a feature description from the user.
Ask 3-5 essential questions that clarify requirements.
Output a structured PRD in markdown format.
```

### Step 2: Convert PRD to User Stories (JSON)

Use a "Ralph PRD Converter" skill to convert markdown PRD to structured JSON.

**Matt Pocock's JSON format (with `passes` flag):**

```json
[
  {
    "id": 27,
    "title": "Beats display as three orange ellipses dots below clip",
    "description": "In the UI, beats should display as three orange ellipses dots below the clip",
    "acceptance_criteria": [
      "Add a beat to a clip",
      "Verify that three orange dots appear below the clip",
      "Verify they're orange colored",
      "Verify they form an ellipses pattern"
    ],
    "passes": false
  },
  {
    "id": 28,
    "title": "Delete video shows confirmation dialogue",
    "description": "Before deleting, show a confirmation dialog",
    "acceptance_criteria": [
      "Click delete on a video",
      "Confirmation dialog appears",
      "Canceling returns to previous state"
    ],
    "passes": true
  }
]
```

**Key field: `passes`**
- `false` = Task needs to be done
- `true` = Task is complete
- Agent updates this when acceptance criteria verified

**Critical JSON rules:**
1. **Story size**: Each story must be completable in one iteration
2. **Story ordering**: Put dependencies first (top to bottom)
3. **Acceptance criteria**: Must be verifiable (testable)

### Step 3: Run the Ralph Script

```bash
./ralph.sh          # Full mode (with tests, linting)
./ralph.sh --fast   # Skip tests and linting
```

### Step 4: Sleep / Live Your Life

Ralph cranks through user stories while you're away.

---

## Compound Engineering: agents.md Files

> "Your agent should be getting smarter every time it makes a mistake." — Ryan Carson

**What is agents.md?**
- A markdown file with notes you'd give to a new developer
- Can exist in every folder of your repo
- AMP/Claude reads it when working in that folder

**Benefits:**
- Per-folder instructions (like sticky notes everywhere)
- Long-term memory across sessions
- Prevents repeated mistakes

**Example agents.md:**
```markdown
# Authentication Module

## Important Notes
- Always use bcrypt for password hashing
- Never store plain text passwords
- Use JWT tokens with 1-hour expiry
- Refresh tokens stored in httpOnly cookies

## Common Pitfalls
- Don't forget to validate email format
- Rate limit login attempts (5 per minute)
```

---

## Progress.txt: Short-Term Memory

> "This represents the LLM's memory for this sprint. When we get to the end of the sprint, I would usually just delete this." — Matt Pocock

The progress file tracks:
- Which iteration is running
- Which AMP thread was used (so agent can reference it)
- What was learned during this session
- What still needs to be done

**Critical: Use APPEND not UPDATE**

```
# In your prompt, say:
"APPEND your progress to the progress.txt file"

# NOT:
"Update the progress.txt file"  # This overwrites everything!
```

> "Append is really important. If you tell it to update, it will usually just update the entire file, whereas append means it usually just goes and sticks some stuff at the end." — Matt Pocock

**Example progress.txt:**
```
## Iteration 1
Thread: amp-thread-abc123
Completed: User story 1 - Add priority field
Notes: Had to update migration file format for Drizzle ORM
Next: Consider working on user story 2 (filter dropdown)

## Iteration 2
Thread: amp-thread-def456
Completed: User story 2 - Create filter dropdown
Notes: Used Radix UI Select component per existing patterns
```

---

## Git Commits Per Iteration

> "Each time we're going through a loop here, we're getting a git commit. This is really, really useful because it means that the LLM can query the git history as well." — Matt Pocock

### Why Commit Each Iteration

1. **Traceability** — Know exactly what changed per feature
2. **Git history as context** — Agent can `git log` to see what's been done
3. **Easy rollback** — If something breaks, revert that commit
4. **Progress verification** — Commits = tangible progress

### Prompt Addition

```
Make a git commit of that feature.
Commit the PRD, commit the progress.txt file,
and commit all the work that you've done.
```

---

## Where to Spend Your Time

> "These two steps — writing a PRD and converting them to user stories — this is where you should spend a HUGE amount of time. Like you should spend an HOUR on this." — Ryan Carson

**Time investment:**
- PRD writing: 30-60 minutes
- User story refinement: 30 minutes
- Acceptance criteria review: 15 minutes
- Running Ralph: 0 minutes (you're sleeping!)

**If you rush the PRD:**
> "You're going to get 10 iterations of Ralph and you're going to end up with something that's not very good."

---

## Cost Analysis

Ryan Carson's real-world example:
- Built an entire feature overnight
- Cost: **~$30** for the whole thing
- Result: High-quality engineering team output

> "This loop is basically an entire engineering team while you sleep. It's unbelievable." — Ryan Carson

---

## Feedback Loops: Essential for Working Code

> "To make Ralph really work, you really need feedback loops." — Matt Pocock

### Why Feedback Loops Matter

Without them, the agent:
- Marks features complete without proper testing
- Commits bad code, loses memory, can't trace the source
- Produces crappy code over time

### Required Feedback Loops

| Feedback Loop | Command | Purpose |
|---------------|---------|---------|
| **Type checking** | `pnpm type-check` | Catch type errors immediately |
| **Unit tests** | `pnpm test` | Verify feature works |
| **Linting** | `pnpm lint` | Code quality |
| **CI pipeline** | GitHub Actions | Must stay green |
| **Browser automation** | Playwright MCP | Test as human would |

### Matt's Prompt for Feedback

```
Check that the types check via `pnpm type-check`
and that the unit tests pass via `pnpm test`.
Whenever your Ralph loop commits, CI has to stay green.
```

### Anthropic's Recommendation

From "Effective Harnesses for Long-Running Agents":

> "We noticed Claude's tendency to mark a feature as complete without proper testing. But it did much better at verifying features end-to-end once explicitly prompted to use browser automation tools and do all testing as a human user would."

### Small Tasks = Room for Feedback

Keep tasks small so you have context budget left for:
- Type checking output
- Test results
- Playwright screenshots
- Browser exploration

---

## Model Requirements

**Claude Opus 4.5** (and GPT-5.2) made Ralph truly viable:
- Smart enough to understand acceptance criteria
- Can self-verify completion
- Handles complex, multi-step tasks

> "This just wasn't possible before Opus 4.5. I think with Opus 4.5, this is absolutely the real deal." — Ryan Carson

---

## Common Pitfalls to Avoid

1. **Stories too large** → Split into smaller, atomic units
2. **Vague acceptance criteria** → Add specific, testable conditions
3. **Missing agents.md** → Agent makes same mistakes repeatedly
4. **Rushing the PRD** → Garbage in, garbage out
5. **No progress tracking** → Can't resume or debug issues
6. **Using UPDATE instead of APPEND** → Overwrites progress.txt history
7. **No feedback loops** → Agent marks incomplete features as done
8. **No max iterations** → Infinite loop, runaway costs
9. **No git commits per iteration** → Can't trace bad code source
10. **Parallel agents on same codebase** → Merge conflict hell

---

## Tools Mentioned

| Tool | Purpose |
|------|---------|
| **AMP** | AI coding agent (Anthropic) |
| **Claude Code** | AI coding agent (Anthropic CLI) |
| **OpenCode / Codex** | Alternative CLI agents |
| **Whisper Flow** | Voice-to-text for PRD creation |
| **Claude Opus 4.5** | The model that makes Ralph work |
| **GPT-5.2** | Also works for Ralph |
| **Playwright MCP** | Browser automation for testing |
| **TypeScript** | Types, types, types! |

### Matt's Feedback Loop Stack

> "With Ralph, you want more tests. You want higher quality tests. You want non-flaky tests. You want an MCP server that can allow it to explore your application. And most of all, you want types, types, types, types, types." — Matt Pocock

---

## Matt Pocock's Complete Ralph Script

```bash
#!/bin/bash
set -e

# Require max iterations parameter
if [ -z "$1" ]; then
  echo "Usage: ralph.sh <max_iterations>"
  exit 1
fi

MAX_ITERATIONS=$1

for i in $(seq 1 $MAX_ITERATIONS); do
  echo "========================================"
  echo "Ralph iteration $i of $MAX_ITERATIONS"
  echo "========================================"

  OUTPUT=$(claude -p "
    Read plans/prd.json and plans/progress.txt

    Steps to complete:
    1. Find the highest priority feature to work on (not necessarily first in list)
    2. Work only on that feature
    3. Check types pass via 'pnpm type-check' and tests pass via 'pnpm test'
    4. Update the PRD with the work done (mark passes: true)
    5. APPEND your progress to progress.txt (leave note for next iteration)
    6. Make a git commit of that feature
    7. Only work on a SINGLE feature

    If while implementing you notice the PRD is complete, output:
    PROMISE_COMPLETE
  ")

  echo "$OUTPUT"

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "PROMISE_COMPLETE"; then
    echo "All PRD items complete!"
    # Optional: send notification
    # npx notify --message "Ralph complete after $i iterations"
    exit 0
  fi
done

echo "Reached max iterations ($MAX_ITERATIONS)"
```

### Key Script Elements

| Element | Purpose |
|---------|---------|
| `set -e` | Exit on any error |
| `$1` | Max iterations parameter |
| `-p` flag | Non-interactive prompt mode |
| `PROMISE_COMPLETE` | Completion signal to exit loop |
| `grep -q` | Silent check for completion |

---

## Quick Reference: Ralph System Prompt

```
You are an autonomous coding agent working on my project.

Your task:
1. Read the PRD at prd.json
2. Read the progress log at progress.txt
3. Find the highest priority incomplete user story
4. Implement it completely
5. Verify acceptance criteria are met (run type-check and tests)
6. APPEND to progress.txt with what you did
7. Mark the story complete (passes: true)
8. Git commit all changes

If agents.md files exist in folders you edit and you learn something
important, update that file.

Only work on a SINGLE feature per iteration.

If all PRD items are complete, output: PROMISE_COMPLETE
```

---

## The Role Shift: From Coder to Product Designer

> "Instead of this kind of really anal retentive planner, Ralph puts you in the seat of the requirements gatherer. Really a kind of product designer where instead of focusing on HOW it's going to be done, you just focus on WHAT needs to be done and how it should behave." — Matt Pocock

### Before Ralph (Multi-Phase Plans)

- You design the exact implementation path
- You figure out all dependencies upfront
- Hard to add tasks mid-plan
- "Onerous to put together"

### With Ralph (PRD Loop)

- You design the end state
- Agent figures out implementation
- Easy to add tasks (just add to PRD)
- Focus on behavior, not implementation

> "This concept of a loop where you just take stuff off the board, take stuff off the board and keep working just feels so familiar." — Matt Pocock

---

## Why Simple Beats Complex

> "People have been trying to make this work with agent swarms and meshes and orchestrators. But what if I told you that the way to get this to work is with a for loop?" — Matt Pocock

Ralph proves that:
- A bash for loop beats complex orchestration
- Good models + simple patterns > complex architectures
- The dev branch is always wackier than main
- Fundamentals (translating requirements to code) don't change

---

## Sources

- **Ras** (Ship Your Directory): "Ralph Wiggum killed programming"
- **Ryan Carson** (Treehouse): "Ralph Wiggum AI Agent will 10x Claude Code/Amp"
- **Matt Pocock** (Total TypeScript): "Ship working code while you sleep with Ralph Wiggum"
- **Jeff Huntley**: Original creator of the Ralph concept (article: July 14, 2025)
- **Anthropic**: "Effective Harnesses for Long-Running Agents"

---

## Next Steps for Implementation

### Phase 1: Foundation
1. [ ] Create `ralph.sh` script (with max iterations)
2. [ ] Create `ralph-once.sh` for human-in-loop mode
3. [ ] Set up `plans/prd.json` template with `passes` flag
4. [ ] Create empty `plans/progress.txt`

### Phase 2: Feedback Loops
5. [ ] Configure TypeScript (`pnpm type-check`)
6. [ ] Set up unit tests (`pnpm test`)
7. [ ] Ensure CI pipeline stays green
8. [ ] Consider Playwright MCP for UI testing

### Phase 3: Knowledge Base
9. [ ] Create `agents.md` in key folders
10. [ ] Document common pitfalls per module
11. [ ] Set up auto-learning prompt

### Phase 4: Iteration
12. [ ] Test with small feature (human-in-loop first)
13. [ ] Run overnight AFK test
14. [ ] Iterate on acceptance criteria quality
15. [ ] Build PRD generator skill/prompt

# Monday Dispatcher — Upgrade Spec (universal)

> Platform-level spec for the **monday-dispatcher** that syncs `TASKS.md` → Monday board
> `4253239867`. Not client-specific. Goal: cards carry **full instructions + docs**, the **right
> assignee**, and **no duplicates on rename**. Claude never writes Monday — the dispatcher does;
> this spec defines what it must do.

## Problems to fix (observed 2026-06-17)
1. **Title-only cards.** Only the line title is carried; the post-em-dash context, instruction files, and docs never reach the card (Updates show "No updates yet").
2. **Everything assigned to the default owner (Mark).** Per-task owner is ignored.
3. **Duplicates on rename.** Editing a line's text creates a NEW card instead of updating the existing one (e.g., "Build Phase 2" stayed when renamed to "Build location pages & blog").
4. **No close-on-supersede.** Removed/renamed lines leave orphan cards open.

## Canonical TASKS.md line format
```
- [ ] [Client] Title — one-line context. OWNER: <name>. INSTRUCTIONS: <repo-relative path> [id:<stable-slug>]
```
- `[id:<stable-slug>]` — **stable key, never changes** even when the title is reworded. This is the anchor for idempotent sync.
- `OWNER:` — assignee name (maps to a Monday user; default to Mark if absent/unknown).
- `INSTRUCTIONS:` — path (in the client repo) to the per-task instruction file.
- `[x]` checkbox or placement under `## Done` → card should be set to Done/closed.

## Required dispatcher behavior
1. **Parse** each `- [ ]`/`- [x]` line into: id, checked-state, client tag(s), title, context, owner, instructions-path.
2. **Match by `id:`**, not by title. If a card with that id exists → **update it** (title/context/assignee). If not → **create** it. This kills rename-duplication.
3. **Card body / Update:** read the `INSTRUCTIONS:` file and post its contents as the card's first Update (markdown). Refresh the Update if the file changed. Optionally attach/link the key client docs (CONTENT-PLAN.md, COMPONENT-MAP.md, AGENT-BRIEF.md) — or include a repo link to `project-docs/clients/<client>/`.
4. **Assignee:** set from `OWNER:`. Map names → Monday user IDs (maintain a small lookup, e.g. Mark→14538312, Maccoy→<id>). Unknown/empty → Mark.
5. **Tags:** apply `[FFS Platform]` + the `[Client]` tag.
6. **Done/close:** a line that is `[x]` or under `## Done` → set its card to Done. A previously-synced id that is **no longer present at all** → close its card (orphan cleanup) and log it.
7. **Idempotent:** re-running over an unchanged TASKS.md makes zero changes.

## Field mapping (line → Monday)
| Line element | Monday field |
|---|---|
| `id:` | hidden text column `Sync ID` (match key) |
| Title (minus metadata) | Item name |
| INSTRUCTIONS file contents | First Update on the item |
| OWNER | People/assignee column |
| `[Client]` | Tag column |
| `[x]` / Done section | Status → Done |

## Migration / adoption
1. Add `[id:...]` to every existing `TASKS.md` line (done for PestBeGone — see that block).
2. First upgraded run: back-fill `Sync ID` on existing cards by matching current titles once, then rely on id thereafter.
3. Reconcile the current PestBeGone duplicates: the 5 stale "Phase/approve/launch-inputs" cards have no id and are checked under `## Done` → close them; the 5 id-tagged cards become the source of truth.

> Keep this spec in the platform/dispatcher repo too. Once shipped, every client's cards self-populate
> with instructions, correct assignees, and no duplicates — no manual Monday edits, Claude still off the board.

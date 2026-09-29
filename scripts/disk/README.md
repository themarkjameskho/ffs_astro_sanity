# Disk offload — keep Claude's work on the external drive

Internal disk is full enough that the Cowork Linux sandbox refuses to boot
(`VM_DISK_SPACE_INSUFFICIENT`). These scripts move the regenerable, disposable
bulk onto `/Volumes/juandemarkho`.

## Run order

```bash
# 1. read-only, changes nothing — paste output back to Claude
bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/01-audit.sh"

# 2. dry run — prints every action, changes nothing
bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/02-migrate.sh"

# 3. execute (prompts for APPLY)
bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/02-migrate.sh" apply
```

Quit the Claude desktop app before step 3 — section 5 touches its session dirs.

## Target layout

```
/Volumes/juandemarkho/
├── Projects/          # repos (already here — leave them)
└── ClaudeWork/
    ├── worktrees/     # git worktrees: ClaudeWork/worktrees/<repo>/<branch>
    ├── caches/        # npm, pnpm, homebrew, playwright, xcode DerivedData
    ├── scratch/       # throwaway working files
    └── archive/       # cold repos, archived Cowork session dirs
```

## What moves, what doesn't

| Moves | Stays on internal disk |
|---|---|
| `~/.npm`, `~/.cache`, pnpm store | repos and git history |
| Homebrew / Playwright / Yarn / Bun caches | `~/.claude` config |
| Xcode DerivedData | anything not verified as copied |
| `.astro` / `dist` / `.vercel` (deleted, they regenerate) | |
| Cowork session dirs older than 30 days | |

## Safety

- rsync → verify file count → only then delete → symlink. A failed verify leaves
  the original untouched and makes no symlink.
- Aborts if the drive is unmounted, read-only, or not APFS/HFS+. exFAT cannot
  hold `node_modules`, symlink targets, or git-safe permissions.
- No repo files, no `.git`, no Sanity data, no deploys are touched.

## Tradeoff to accept

Once caches are symlinked, `npm install`, `brew`, and Playwright need
`/Volumes/juandemarkho` mounted. Fine for an always-attached drive. If you
detach it regularly, skip section 2 and run only sections 3 and 5.

## Going forward

Create worktrees on the external drive:

```bash
git -C /Volumes/juandemarkho/Projects/<repo> \
  worktree add /Volumes/juandemarkho/ClaudeWork/worktrees/<repo>/<branch> <branch>
```

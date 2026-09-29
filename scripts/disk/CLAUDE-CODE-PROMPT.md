Paste everything below into Claude Code (run it from `/Volumes/juandemarkho/Projects/ffs_astro_sanity`).

---

My Mac's internal disk is nearly full — full enough that the Cowork Linux sandbox
now refuses to boot with `VM_DISK_SPACE_INSUFFICIENT`. I have a permanently
attached external drive at `/Volumes/juandemarkho`. I want all disposable,
regenerable, and agent-generated bulk to live on that external drive from now on,
so my internal disk holds only the OS, apps, and my own documents.

## Context you need

- My repos already live on the external drive at `/Volumes/juandemarkho/Projects/`
  (ffs_astro_sanity, topbedbugpros, bedbug-be-gone-now, heat_tech_pest_control,
  chapman_plumbing). These are **live production sites** — do not break them.
- One repo is still on the internal disk: `~/Downloads/ohio_bedbug_experts_landingpage`.
  It should move to `/Volumes/juandemarkho/Projects/landingpage_ohio_bedbug_experts`
  (our convention is to prefix landing-page repos with `landingpage_`).
- `ffs_astro_sanity` is the mother template for all the other sites. Read its
  `CLAUDE.md` first and follow it.
- There are already draft scripts at `scripts/disk/01-audit.sh` and
  `scripts/disk/02-migrate.sh` in ffs_astro_sanity. Read them, reuse whatever is
  sound, and fix or replace whatever isn't. Don't assume they're correct.

## Target layout

```
/Volumes/juandemarkho/
├── Projects/              # all repos (already here)
└── ClaudeWork/
    ├── worktrees/         # git worktrees: <repo>/<branch>
    ├── caches/            # npm, pnpm, homebrew, playwright, Xcode DerivedData
    ├── scratch/           # throwaway working files
    └── archive/           # cold repos, archived Cowork/Claude session dirs
```

## Do this, in order

**Phase 1 — audit, read-only. Report back before changing anything.**

1. `df -h /` and `df -h /Volumes/juandemarkho`.
2. Confirm the external filesystem with `diskutil info /Volumes/juandemarkho`.
   **If it is not APFS or HFS+, stop and tell me.** exFAT/FAT/NTFS cannot hold
   `node_modules`, symlink targets, or git-safe permissions.
3. Find the actual top consumers on the internal disk — don't guess. Check at
   minimum: `~/Library`, `~/Downloads`, `~/Documents`, `~/Desktop`,
   `~/Library/Caches/*`, `~/Library/Containers/*`,
   `~/Library/Application Support/*`, `~/.npm`, `~/.cache`, `~/Library/pnpm`,
   `~/Library/Developer`.
4. Locate the Cowork/Claude sandbox VM disk images (`*.qcow2 *.img *.raw *.vmdk`
   over 100MB under `~/Library`) — these are likely the single biggest item and
   the direct cause of the boot failure.
5. Size `~/Library/Application Support/Claude/local-agent-mode-sessions/*`.
6. Run `git worktree list` in every repo under `/Volumes/juandemarkho/Projects/`
   and flag any worktree whose path is **not** on the external drive.
7. Find `node_modules`, `.astro`, `dist`, `.vercel`, `.next`, `.turbo` on the
   internal disk.

Then **stop** and show me a table: path, size, category (safe-to-delete /
safe-to-relocate / needs-my-decision / leave-alone), and total reclaimable.
Wait for my go-ahead.

**Phase 2 — migrate, only after I approve.**

Rules that are non-negotiable:

- Every move is **rsync → verify → delete original → symlink back**. Verify by
  comparing file counts (and byte size where cheap). If verification fails, leave
  the original in place, create no symlink, and tell me.
- Never `rm -rf` anything you have not verified as copied.
- Never touch `.git` directories, repo source files, Sanity data, `.env` files,
  or anything under `/Volumes/juandemarkho/Projects/*/src`.
- Make every destructive step idempotent and re-runnable. Skip anything already
  symlinked instead of nesting it.
- Print each action before performing it.

Work to do:

1. Create the `ClaudeWork/` skeleton above.
2. Relocate caches to `ClaudeWork/caches/` and symlink back: `~/.npm`, `~/.cache`,
   `~/Library/pnpm`, `~/Library/Caches/pnpm`, `~/Library/Caches/Homebrew`,
   `~/Library/Caches/ms-playwright`, `~/Library/Caches/com.vercel.cli`,
   `~/Library/Caches/Yarn`, `~/.bun/install/cache`,
   `~/Library/Developer/Xcode/DerivedData`.
3. Also configure the tools directly, so a broken symlink isn't the only safety
   net: `npm config set cache <ext>` and `pnpm config set store-dir <ext>`.
4. Delete `.astro`, `dist`, `.vercel`, `.netlify`, `.turbo` in every repo — these
   regenerate on the next build. Report bytes freed.
5. Move `~/Downloads/ohio_bedbug_experts_landingpage` to
   `/Volumes/juandemarkho/Projects/landingpage_ohio_bedbug_experts`. Before
   moving, run `git status` and `git stash list` and tell me if there is
   uncommitted or stashed work. After moving, confirm git still works from the
   new path and the remote is intact.
6. Move any internal-disk git worktrees to
   `ClaudeWork/worktrees/<repo>/<branch>` using `git worktree move` (not `mv`),
   then `git worktree repair`.
7. Archive `local-agent-mode-sessions` dirs older than 30 days to
   `ClaudeWork/archive/`. Tell me to quit the Claude desktop app first.
8. If the sandbox VM images can be relocated safely, propose how — but ask me
   before touching app-internal state. If they can't, tell me how to reclaim
   them instead.

**Phase 3 — verify.**

1. `df -h /` before/after, with actual GB reclaimed.
2. Confirm every symlink resolves (`ls -la` the targets, not just the links).
3. `npm cache verify`.
4. `npm run build` in one repo — I expect it to pass. If it fails, that's a
   regression from this work; diagnose it.
5. `git status` and `git remote -v` in every repo — all clean, all intact.
6. Print a rollback procedure for each symlink you created.

**Phase 4 — make it stick.**

1. Update the scripts in `scripts/disk/` so this is repeatable, and update the
   README there with what you actually did (not what you planned to do).
2. Add a short section to `ffs_astro_sanity/CLAUDE.md` stating the convention:
   worktrees, caches, and scratch work go under
   `/Volumes/juandemarkho/ClaudeWork/`, never the internal disk.
3. Suggest a title for the task log — I log tasks myself; do not write to Monday.

## Tradeoff I've already accepted

Symlinked caches mean `npm install`, `brew`, and Playwright need the external
drive mounted. That's fine — it stays attached. But warn me clearly if you set up
anything else with that dependency.

## Ask me before

Touching Photos/Music/iCloud libraries, deleting anything not regenerable,
relocating app-internal state, or anything you're less than confident is
reversible.

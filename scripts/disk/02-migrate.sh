#!/bin/bash
# Move dev caches + build artifacts off the internal disk onto the external drive.
#
#   DRY RUN (default, changes nothing):
#     bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/02-migrate.sh"
#   APPLY:
#     bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/02-migrate.sh" apply
#
# Strategy: rsync to external -> verify -> remove original -> symlink back.
# Nothing is deleted until the copy is verified. Repos and git history are never touched.
set -uo pipefail

EXT="/Volumes/juandemarkho"
BASE="$EXT/ClaudeWork"
MODE="${1:-dry}"

say()  { printf '%s\n' "$*"; }
run()  { if [ "$MODE" = apply ]; then eval "$@"; else say "    DRY: $*"; fi; }

# ---------- preflight ----------
say "=== PREFLIGHT ==="
if [ ! -d "$EXT" ]; then say "ABORT: $EXT is not mounted."; exit 1; fi
if ! touch "$EXT/.ffs_write_test" 2>/dev/null; then say "ABORT: $EXT is not writable."; exit 1; fi
rm -f "$EXT/.ffs_write_test"

FS=$(diskutil info "$EXT" 2>/dev/null | awk -F': *' '/File System Personality/{print $2}')
say "External filesystem: ${FS:-unknown}"
case "$FS" in
  *APFS*|*HFS*) say "  OK — supports symlinks, permissions, and node_modules." ;;
  *exFAT*|*FAT*|*NTFS*)
    say "  ABORT: $FS cannot hold node_modules, symlink targets, or git-safe permissions."
    say "  Reformat the drive to APFS, or use it for archives only."; exit 1 ;;
  *) say "  WARNING: unrecognised filesystem. Verify it is APFS before applying."; [ "$MODE" = apply ] && exit 1 ;;
esac

# Symlinked caches break while the drive is unplugged. Acceptable for a
# permanently-attached drive; do NOT apply this if you detach the drive often.
say "NOTE: after this runs, npm/pnpm/brew/playwright need $EXT mounted to work."
if [ "$MODE" = apply ]; then
  read -r -p "Type APPLY to continue: " ok
  [ "$ok" = "APPLY" ] || { say "Cancelled."; exit 1; }
fi

# ---------- 1. folder skeleton ----------
say
say "=== 1. CREATE EXTERNAL WORKSPACE ==="
for d in "$BASE" "$BASE/worktrees" "$BASE/caches" "$BASE/scratch" "$BASE/archive"; do
  run "mkdir -p '$d'"
done
say "    $BASE/worktrees   <- git worktrees / agent branches"
say "    $BASE/caches      <- relocated package + build caches"
say "    $BASE/scratch     <- throwaway working files"
say "    $BASE/archive     <- cold repos and old session dirs"

# ---------- 2. relocate caches (rsync -> verify -> symlink) ----------
say
say "=== 2. RELOCATE CACHES ==="
relocate() {
  local src="$1" name="$2" dst="$BASE/caches/$2"

  if [ -L "$src" ]; then say "  SKIP $name — already a symlink -> $(readlink "$src")"; return; fi
  if [ ! -d "$src" ]; then say "  SKIP $name — not present"; return; fi

  local size; size=$(du -sh "$src" 2>/dev/null | cut -f1)
  say "  MOVE $name ($size)  $src -> $dst"
  run "mkdir -p '$dst'"
  run "rsync -a --delete '$src/' '$dst/'"
  if [ "$MODE" = apply ]; then
    # verify file counts match before deleting anything
    local a b
    a=$(find "$src" | wc -l | tr -d ' ')
    b=$(find "$dst" | wc -l | tr -d ' ')
    if [ "$a" != "$b" ]; then say "    FAIL verify ($a vs $b) — original left intact, no symlink made"; return; fi
    rm -rf "$src" && ln -s "$dst" "$src" && say "    OK verified ($a items) and linked"
  fi
}

relocate "$HOME/.npm"                                 "npm"
relocate "$HOME/.cache"                               "dotcache"
relocate "$HOME/Library/pnpm"                         "pnpm"
relocate "$HOME/Library/Caches/pnpm"                  "pnpm-cache"
relocate "$HOME/Library/Caches/Homebrew"              "homebrew"
relocate "$HOME/Library/Caches/ms-playwright"         "playwright"
relocate "$HOME/Library/Caches/com.vercel.cli"        "vercel-cli"
relocate "$HOME/Library/Caches/Yarn"                  "yarn"
relocate "$HOME/.bun/install/cache"                   "bun"
relocate "$HOME/Library/Developer/Xcode/DerivedData"  "xcode-deriveddata"

# Tell the tools directly too, so a broken symlink is not the only safety net.
say
say "  Point package managers at the external cache:"
run "npm config set cache '$BASE/caches/npm'"
command -v pnpm >/dev/null && run "pnpm config set store-dir '$BASE/caches/pnpm-store'"

# ---------- 3. purge regenerable build artifacts ----------
say
say "=== 3. PURGE REGENERABLE BUILD ARTIFACTS ==="
say "  (.astro / dist / .vercel / .netlify rebuild on next build — safe to delete)"
for r in "$EXT"/Projects/*; do
  [ -d "$r" ] || continue
  for a in .astro dist .vercel .netlify .turbo; do
    [ -d "$r/$a" ] || continue
    say "  RM $(du -sh "$r/$a" 2>/dev/null | cut -f1)  $r/$a"
    run "rm -rf '$r/$a'"
  done
done
say "  Prune stale node_modules on the external drive (frees drive space, not internal):"
say "    npm cache verify; then reinstall per repo as needed"

# ---------- 4. git worktree convention ----------
say
say "=== 4. GIT WORKTREES -> EXTERNAL ==="
say "  Convention: $BASE/worktrees/<repo>/<branch>"
say "  Create new ones with:"
say "    git -C <repo> worktree add '$BASE/worktrees/<repo>/<branch>' <branch>"
say "  Existing worktrees on the internal disk (move manually, they may hold work):"
for r in "$EXT"/Projects/*; do
  git -C "$r" worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2}'
done | grep -v "^$EXT" | sed 's/^/    INTERNAL: /' || say "    none"

# ---------- 5. archive old Cowork session dirs ----------
say
say "=== 5. ARCHIVE OLD COWORK SESSION DIRS (>30 days) ==="
SESS="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
if [ -d "$SESS" ]; then
  say "  Total: $(du -sh "$SESS" 2>/dev/null | cut -f1)"
  find "$SESS" -mindepth 1 -maxdepth 1 -type d -mtime +30 2>/dev/null | while read -r s; do
    say "  ARCHIVE $(du -sh "$s" 2>/dev/null | cut -f1)  $(basename "$s")"
    run "mkdir -p '$BASE/archive/cowork-sessions'"
    run "rsync -a '$s' '$BASE/archive/cowork-sessions/' && rm -rf '$s'"
  done
  say "  NOTE: quit the Claude desktop app before applying this section."
else
  say "  not found"
fi

# ---------- 6. result ----------
say
say "=== 6. RESULT ==="
df -h / "$EXT"
say
if [ "$MODE" = apply ]; then
  say "Applied. Verify with:  bash scripts/disk/01-audit.sh"
  say "Then rebuild one site to confirm nothing broke:  cd <repo> && npm run build"
else
  say "DRY RUN — nothing changed. Re-run with 'apply' to execute."
fi

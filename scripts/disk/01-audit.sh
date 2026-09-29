#!/bin/bash
# READ-ONLY audit. Changes nothing.
# Run: bash "/Volumes/juandemarkho/Projects/ffs_astro_sanity/scripts/disk/01-audit.sh"
set -uo pipefail

EXT="/Volumes/juandemarkho"

echo "==================== 1. DISK SPACE ===================="
df -h / "$EXT" 2>/dev/null

echo
echo "==================== 2. EXTERNAL DRIVE FILESYSTEM ===================="
# APFS or HFS+ = safe for symlinks/node_modules/git. exFAT/FAT = NOT safe, stop if so.
diskutil info "$EXT" 2>/dev/null | grep -Ei 'File System Personality|Read-Only Volume|Mount Point' \
  || mount | grep "$EXT"

echo
echo "==================== 3. HOME DIR TOP CONSUMERS ===================="
du -sh -x ~/Library ~/Downloads ~/Documents ~/Desktop ~/Movies ~/Pictures 2>/dev/null | sort -hr

echo
echo "==================== 4. DEV CACHES (safe to relocate) ===================="
for d in \
  ~/.npm ~/.cache ~/Library/pnpm ~/Library/Caches/pnpm \
  ~/Library/Caches/Homebrew ~/Library/Caches/com.vercel.cli \
  ~/Library/Caches/ms-playwright ~/Library/Caches/typescript \
  ~/Library/Caches/esbuild ~/Library/Caches/astro ~/Library/Caches/Yarn \
  ~/.bun/install/cache \
  ~/Library/Developer/Xcode/DerivedData ~/Library/Developer/CoreSimulator/Devices
do
  [ -e "$d" ] && du -sh "$d" 2>/dev/null
done

echo
echo "==================== 5. CLAUDE / COWORK LOCAL STATE ===================="
for d in \
  ~/.claude \
  "$HOME/Library/Application Support/Claude" \
  "$HOME/Library/Application Support/Claude/local-agent-mode-sessions" \
  "$HOME/Library/Caches/Claude" \
  "$HOME/Library/Containers/com.anthropic.claudefordesktop"
do
  [ -e "$d" ] && du -sh "$d" 2>/dev/null
done
echo "--- Cowork session dirs (largest first, these accumulate) ---"
SESS="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
[ -d "$SESS" ] && du -sh "$SESS"/* 2>/dev/null | sort -hr | head -20

echo
echo "==================== 6. LINUX SANDBOX VM DISK IMAGES ===================="
# The multi-GB files that broke the sandbox boot (VM_DISK_SPACE_INSUFFICIENT).
find ~/Library -maxdepth 7 \( -name "*.qcow2" -o -name "*.img" -o -name "*.raw" -o -name "*.vmdk" \) \
  -size +100M 2>/dev/null -exec du -sh {} \;
[ -d ~/Library/Containers ] && du -sh ~/Library/Containers/* 2>/dev/null | sort -hr | head -10

echo
echo "==================== 7. GIT WORKTREES PER REPO ===================="
for r in "$EXT"/Projects/*; do
  { [ -d "$r/.git" ] || [ -f "$r/.git" ]; } || continue
  echo "### $(basename "$r")"
  git -C "$r" worktree list 2>/dev/null | sed 's/^/    /'
done
echo "--- worktrees living on the INTERNAL disk (these should move) ---"
for r in "$EXT"/Projects/*; do
  git -C "$r" worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2}'
done | grep -v "^$EXT" || echo "    none — good"

echo
echo "==================== 8. NODE_MODULES / BUILD ARTIFACTS ON INTERNAL DISK ===================="
find ~/Downloads ~/Documents ~/Desktop ~/Projects -maxdepth 4 \
  \( -name node_modules -o -name .astro -o -name dist -o -name .vercel -o -name .next \) \
  -prune 2>/dev/null | while read -r p; do du -sh "$p" 2>/dev/null; done | sort -hr | head -30

echo
echo "==================== 9. REPOS STILL ON INTERNAL DISK ===================="
find ~/Downloads ~/Documents ~/Desktop -maxdepth 3 -name .git -prune 2>/dev/null | while read -r g; do
  du -sh "$(dirname "$g")" 2>/dev/null
done | sort -hr

echo
echo "==================== 10. EXISTING SYMLINKS (don't double-migrate) ===================="
found=0
for d in ~/.npm ~/.cache ~/Library/pnpm ~/Library/Caches/Homebrew \
         ~/Library/Caches/ms-playwright ~/Library/Developer/Xcode/DerivedData; do
  if [ -L "$d" ]; then echo "  ALREADY LINKED: $d -> $(readlink "$d")"; found=1; fi
done
[ "$found" = 0 ] && echo "  none yet"

echo
echo "==================== AUDIT COMPLETE ===================="
echo "Paste this output back to Claude before running 02-migrate.sh."

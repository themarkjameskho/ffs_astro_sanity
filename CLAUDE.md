# CLAUDE.md — Astro+Sanity mother template (Professional / Fast Forward Search)

> This is the mother template for all FFS Astro+Sanity sites (BBBGN, Heat Tech, TBBP,
> Chapman, etc.). Rules here apply project-wide.

## ⛔ FIRST ACTION OF EVERY NEW THREAD — do this before any work
When a new thread starts and a task/request surfaces:

1. **STOP and ask Mark to log the task first.** Before diagnosing, editing, or running
   anything, ask: *"Want to log this as a task? Suggested title: <short action-first title>."*
   Do NOT start the work until Mark has logged it (or told you to proceed).
2. **Never write or update tasks in Monday.com yourself.** Mark logs the task; his
   **monday-dispatcher** scheduler is the only thing that creates/updates Monday items.
   Claude stays off the Monday board entirely.
3. This whole project is **Professional / FFS**. There is **no personal / Obsidian routing**
   here — every task is a work task.

## Why this exists
A prior thread did real work (BBBGN sitemap/robots/perf fixes) but never logged a task,
because logging was treated as an end-of-task afterthought and got dropped. Logging is now
the **mandatory first step**, and it is **ask-first**, not auto-create.

## Task conventions
- One item per task. Short, action-first titles ("Fix Heat Tech hero section").
- Capture, don't chase — log it and move on; don't start the task unless Mark asks.
- Respect the Prime Directive: one brand, one next step; don't expand scope.

## ⛔ Monday.com rules — read before touching any task

**Never call the Monday API directly to create or update items.** Use `TASKS.md` instead — the `monday-dispatcher` syncs it to Monday on its next run following the correct rules.

**TASKS.md format** (each line):
```
- [ ] [ProjectTag] What needs to be done (Person's name) — One sentence explaining the task [id:project-unique-id]
```
- Tag at top of file defines `[ProjectTag]`
- Owner in parentheses matches the name in Work HQ CLAUDE.md
- `[id:...]` must be unique, kebab-case, project-prefixed
- Completed tasks: move to `## Done` with `- [x]` prefix

**Full rules (priority, statuses, who changes what):**
→ `/Users/Mark/Library/Mobile Documents/iCloud~md~obsidian/Documents/MJK/07 💼 Work HQ/Monday Dispatch SOP.md`

**The most important rules to remember:**
- Max **2 "1st ⚠️"** per project — don't make everything first priority
- **Critical ⚠️** only if the deadline is within 3 days AND it's blocking other work
- **Never change the Status column** — that belongs to the person doing the work
- Only change Order Level and Project Status if **Mark is in the Tag column**

## Site architecture spec — REQUIRED for all new site/page builds
- The **Master Spec Overview v2.0** governs site structure for all FFS bed bug sites:
  `project-docs/reference/seo/site-overview-spec-v2.md` (visual source: `.html` alongside it).
- It defines the **6 page types** (HP, LOC-A, LOC-B, SP, SLP, CP, BL), their **URL patterns**,
  the **two hub-and-spoke SEO systems** (SP→SLP and LOC-A→LOC-B+SLP), the **Two-Click Rule**,
  and the **Unique Content Rule** (LOC-B, SLP, Blog need genuinely unique intros — no
  city-name template swaps; templated doorway pages risk a domain-wide penalty).
- **Before building or reviewing any page**, identify its page type and follow the matching
  per-type spec sheet; use that spec's pre-launch checklist as go-live sign-off.

## Project safety rules
- These are **live production sites** — be very careful; never destroy the live site.
- Follow the official Astro + Sanity architecture for all updates.
- **Before any go-live, run `PRE-LAUNCH-QA.md`** (and re-run its Domain & SEO section after any
  deploy touching `astro.config.mjs`, sitemap, `robots.txt`, redirects, or canonicals).
- Per-repo specifics (domains, deploy gating, perf standard) live in auto-memory.

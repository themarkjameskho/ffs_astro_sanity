# New Client Repo — from template to connected GitHub repo

**Stage:** Pre-Development, step 1 of 2. Next: [SANITY_PROVISIONING.md](./SANITY_PROVISIONING.md).
**Audience:** human developers and AI agents. Both follow the same steps.
**Goal:** a rebranded copy of the template, on GitHub, with the project routed to the
correct downstream workflow.

---

## How to use this document

Every step is written as **Do → Verify → If it fails**. The Verify command is not
optional: it is how you know the step worked, and it is the only thing that makes this
document safe to run without someone watching.

**Rules for AI agents** (developers should follow them too, but agents fail these more often):

1. **Never invent a value.** If a value is not in this document, in the repo, or in the
   task you were given — stop and ask. Client slug, domain, GitHub org and phone numbers
   are all things to ask about, never to guess.
2. **Never skip a Verify step**, and never report a step complete on the basis of a
   command exiting 0 when the Verify command was not run.
3. **Stop after two failed attempts** at the same step. Report what you ran, the actual
   output, and what you expected. Do not try a third variation.
4. **Before any deletion or overwrite, confirm the current state matches what this
   document assumes.** Read the file or list the directory first. If reality differs from
   the assumption, stop — the assumption is what is wrong.
5. **Report actual output, not a summary of it.** "Audit passed" is not a result; the
   audit's last line is.

**Notation.** Anything in angle brackets is a value you must have been given. Define them
once at the start and reuse them:

| Variable | Meaning | Example |
|---|---|---|
| `<client-slug>` | lowercase, hyphenated folder and repo name | `bed-bug-bbq` |
| `<client-name>` | the business name as written | `Bed Bug BBQ` |
| `<production-domain>` | live domain, no protocol | `bedbugbbq.com` |
| `<github-org>` | GitHub owner for the repo | `themarkjameskho` |

If you cannot fill all four, stop here and ask. Do not proceed with placeholders.

---

## Step 1 — Duplicate the template

**Do:**

```bash
cd ~/Projects
cp -R ffs_astro_sanity <client-slug>
cd <client-slug>
rm -rf node_modules studio/node_modules .astro dist .vercel
rm -f .env .env.local
npm install
npm install --prefix studio
```

**Verify:**

```bash
ls -la .env .env.local 2>&1   # expect: No such file or directory (for both)
ls -d node_modules studio/node_modules   # expect: both listed
```

**Why the deletions matter.** `.env.local` is the dangerous one. A copied env file points
this new repo at the *previous* client's Sanity project and carries their write-scoped
token, so the importer, the publish script and `sanity deploy` all silently target
someone else's content lake. `node_modules` is copied binaries built for a different
platform; the failures look like source errors and waste an afternoon.

**If it fails:** `npm install` erroring on a native module usually means a stale lockfile
platform. Delete `package-lock.json`, reinstall, and note it — do not switch package
managers.

---

## Step 2 — Rebrand (de-fork)

The template carries the previous client's brand throughout: phone numbers, city names,
internal links. Copied unchanged, these render as real working links to pages that do not
exist on this site.

**Do:**

```bash
chmod +x template-setup.sh
./template-setup.sh
```

It prompts for each `{{PLACEHOLDER}}`; Enter skips one, leaving it for later. Then find
what the script cannot reach — hardcoded values, which are the ones that ship wrong:

```bash
grep -rn "{{" src/ studio/ astro.config.mjs --exclude-dir=node_modules
```

Then open and check each of these by hand. Every one has shipped wrong on a real client:

| File | What is wrong in the template |
|---|---|
| `src/data/serviceArea.ts` | previous client's cities and service-area links |
| `src/lib/navigation.ts` | previous client's nav hrefs |
| `studio/sanity.cli.js` | `studioHost` is another client's **live** Studio host |
| `src/lib/links.ts`, `canonical.ts`, `siteProfile.ts` | `example.com` fallbacks |
| `astro.config.mjs` | `site` may be `example.com` |
| `README.md`, `AGENTS.md`, `tokens.css` | previous client's brand |

**Verify:**

```bash
npm run template:audit
```

Expected: exits 0, having run placeholder, route-mode and domain-leak checks plus a real
build. Print the final lines.

**If it fails:** the audit names the file and the offending value. Fix that file and
re-run. Do not add an exclusion to make the audit pass — the audit is the gate, and an
exclusion is how a fork-source domain reaches production.

---

## Step 3 — Create the GitHub repo and connect it

The template folder is not itself a git repo, so this is `git init` — there is no
inherited history to detach from. Confirm that before assuming:

```bash
ls -d .git 2>&1   # expect: No such file or directory
```

If `.git` **does** exist, stop and ask. It means the copy carried history from somewhere,
and pushing it could publish another client's commits.

**Do — check `.gitignore` first.** A token committed once stays in history after deletion
and must be rotated, not removed:

```bash
grep -E "^\.env|node_modules|^dist|^\.astro|^\.vercel" .gitignore
```

Expected: entries covering `.env*`, `node_modules`, `dist`, `.astro`, `.vercel`. Add any
that are missing **before** the first commit.

```bash
git init
git add -A
git status --short | grep -E "\.env" && echo "STOP: env file staged" || echo "clean"
git commit -m "chore: initial commit from ffs_astro_sanity template"
gh repo create <github-org>/<client-slug> --private --source=. --remote=origin --push
```

Without `gh`: create the repo in the GitHub UI as **private** and empty, then

```bash
git remote add origin git@github.com:<github-org>/<client-slug>.git
git push -u origin main
```

**Verify:**

```bash
git remote -v          # expect: origin pointing at <github-org>/<client-slug>
git log --oneline -1   # expect: the initial commit
gh repo view <github-org>/<client-slug> --json visibility   # expect: PRIVATE
```

**If it fails:** an `.env` file appearing in `git status` means `.gitignore` is wrong —
fix it and re-stage rather than committing and deleting afterwards.

---

## Step 4 — Route the project: fresh build or migration

These are two different workflows with different first tasks, different inputs and
different gates. The decision belongs here, at the start, and must be written down.

**The test, in order:**

1. Does a live site already exist at `<production-domain>`? → **migration**
2. Are any of its URLs indexed in Google? → **migration**
3. Is the client calling it a redesign or refresh of an existing site? → **migration**
4. Are existing URLs being deliberately restructured? → **migration** (this case needs
   the redirect map most of all)
5. None of the above — genuinely no predecessor, e.g. a new landing-page microsite →
   **fresh build**

A "redesign" is a migration. The test is whether URLs are already indexed, not whether
anyone likes the current site.

| | Fresh build | WordPress migration |
|---|---|---|
| Follow | [astro-sanity-development-process.md](../../Astro-Sanity%20Process/astro-sanity-development-process.md) | [wordpress-to-astro-migration.md](../../Astro-Sanity%20Process/wordpress-to-astro-migration.md) |
| Content origin | written to a content plan | extracted from a WXR export |
| URLs | designed | **inherited — a constraint, not a choice** |
| Inputs needed | site planner, copy, component map | WXR export, redirect inventory, SEO meta baseline, media manifest |
| First real task | content plan and component map | audit the export into a measured baseline before any code runs |
| Extra gates | — | redirect map, status-code sweep, slug-equals-full-path check |

**Why this matters asymmetrically:** running a migration as a fresh build discards
indexed URLs and their rankings. That is not recoverable after launch. Running a fresh
build as a migration only wastes an audit.

**Do:**

```bash
mkdir -p project-docs/clients/<client-slug>
```

Write a short note in that folder recording the decision, which of the five tests decided
it, and the evidence — for a migration, roughly how many indexed URLs are at stake.

**Verify:** the note exists, names the chosen workflow doc, and states the reasoning. A
decision with no reasoning recorded is not usable by the next person or agent.

---

## Exit gate

Do not start Sanity provisioning until every line is true.

- [ ] Folder named `<client-slug>`; `node_modules`, build output and `.env*` not carried over
- [ ] Dependencies reinstalled on this machine
- [ ] `template-setup.sh` run; hardcoded fork-source values in the Step 2 table checked and cleared
- [ ] `studioHost` in `studio/sanity.cli.js` no longer the template default
- [ ] `npm run template:audit` exits 0
- [ ] `.gitignore` covers `.env*` and `node_modules`, verified **before** the first commit
- [ ] `git init` done, GitHub repo created **private**, remote connected, first push landed
- [ ] Fresh build or migration decided, with the deciding test and reasoning written into `project-docs/clients/<client-slug>/`
- [ ] The matching workflow doc opened and being followed

**Next:** [SANITY_PROVISIONING.md](./SANITY_PROVISIONING.md)

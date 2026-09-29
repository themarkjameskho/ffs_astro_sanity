# Sanity Provisioning — new client, in order

**Stage:** Pre-Development, step 2 of 2. Comes after
[NEW_CLIENT_REPO_SETUP.md](./NEW_CLIENT_REPO_SETUP.md).
**Audience:** human developers and AI agents. Both follow the same steps.
**Goal:** a Sanity project the site can read, an importer that can write, a Studio the
client can open, the right people invited, and content changes reaching the site.

Covers the **Sanity account**. The Studio's internal configuration — desk structure,
widgets, schema registration — is [SANITY_DASHBOARD_SETUP.md](./SANITY_DASHBOARD_SETUP.md).

---

## How to use this document

Five steps, ordered by dependency. Each depends on the one before it, and the webhook
depends on a deployed site URL that does not exist until the end. **Do not reorder them.**

Every step is **Do → Verify → If it fails**. The Verify step is how you know it worked.

**Rules for AI agents** (developers should follow them too):

1. **Steps 1, 2 and 4 are browser-only.** Creating a project, minting a token and
   inviting members happen in the Sanity dashboard UI and cannot be scripted here. If you
   are an agent without browser access, **stop and hand these to a human** with the exact
   values needed. Do not attempt an API workaround.
2. **Never invent a value.** Project ID, dataset name, domain, member emails — ask.
3. **Never print a token** into a chat, a log, a commit or a document. Write it to
   `.env.local` and verify it with the checker.
4. **Step 3 (`sanity deploy`) is destructive if `studioHost` is wrong.** Read
   `studio/sanity.cli.js` and confirm the value before running it. This is not optional.
5. **Stop after two failed attempts** at a step. Report the command, the actual output and
   the expectation.

**Ownership.** The account owner runs steps 1, 2 and 4. Do not let a developer create the
project under a personal account — the org loses control of the content lake, and moving a
project between organizations later is not a self-serve operation.

**Variables** (carried over from the repo setup doc):

| Variable | Meaning | Example |
|---|---|---|
| `<client-name>` | business name as written | `Bed Bug BBQ` |
| `<client-slug>` | lowercase, hyphenated | `bed-bug-bbq` |
| `<production-domain>` | live domain, no protocol | `bedbugbbq.com` |
| `<project-id>` | from the dashboard URL after step 1 | `ajkxm39i` |

---

## Step 1 — Create the client project  *(browser, owner)*

**Do:** sanity.io → the **Fast Forward Search** organization → **Create new project**.

One project per client. Name it `<client-name>` — the business name, not the domain and
not a slug. It is what everyone sees in the project switcher, and abbreviations become
ambiguous once there are a dozen pest-control clients.

Create two datasets, **both private**: `production` and `staging`.

- `production` — what the live deployment reads.
- `staging` — where an import is verified before anything client-facing is written.

A **public** dataset is world-readable, which on a home-service site exposes unpublished
pricing and offers. A migration that writes straight to `production` has no way back that
does not involve deleting documents.

**Do:** record the project ID. It is the value in the dashboard URL
(`/project/<project-id>/`). It is **not** the project name and cannot be derived from it.

```bash
# in the repo root
echo "SANITY_PROJECT_ID=<project-id>" >> .env.local
echo "SANITY_DATASET=production" >> .env.local
echo "SANITY_STUDIO_PROJECT_ID=<project-id>" >> .env.local
echo "SANITY_STUDIO_DATASET=production" >> .env.local
```

**Verify:**

```bash
grep -E "^SANITY_(PROJECT_ID|DATASET|STUDIO_)" .env.local
```

Expected: four lines, real values, **no `{{ }}` braces anywhere**.

**Also record, in `project-docs/clients/<client-slug>/`:** which dataset each deployment
reads. A preview deployment reading `staging` while the deployed Studio reads `production`
means editors open Studio to an empty dataset and reasonably conclude the import failed.
Keep the Vercel env var and `SANITY_STUDIO_DATASET` in agreement, or write down why they
differ.

**Plan.** New projects start on a trial; the remaining days show at the top of the
dashboard. Get the plan decided before launch, not on launch day — seat count and dataset
privacy are both plan-gated. Note the expiry date and an owner.

---

## Step 2 — Create the API token  *(browser, owner)*

**Do:** project → **API** → **Tokens** → **Add API token**.

| Need | Scope |
|---|---|
| Site reads content at runtime | **Viewer** |
| Importer writes documents | **Editor** |

The content import needs **Editor**. A Viewer token fails on the first mutation, and the
failure reads as a malformed payload rather than a permissions problem — a slow thing to
debug. Name the token for its job (`import`, `site-runtime`) so it can be rotated later
without guessing what breaks.

The token is shown **once**. Add it to `.env.local` before closing the dialog.

⚠️ **Do not paste it inside the `{{ }}` braces.** Placeholders are filled by replacing the
whole token *including* the braces. `SANITY_API_TOKEN={{sk…}}` looks right at a glance and
401s on every request. This has happened on three separate repos.

**Verify:**

```bash
node scripts/check-sanity-token.mjs
```

Expected: passes all three checks — not brace-wrapped, read auth works, and write scope
confirmed via a `dryRun` mutation (which proves the scope without writing anything).

**If it fails:** a 401 means brace-wrapping or a wrong project ID; a 403 on the write
check means the token is Viewer-scoped and must be re-minted as Editor. Do not work around
either by using a different token than the one in `.env.local`.

**Then:** add the same token to Vercel as `SANITY_API_TOKEN`, scoped to the environments
that need it. Never commit it. Never put it in a client-shared document.

---

## Step 3 — Deploy the Studio  *(CLI)*

This publishes to `https://<studioHost>.sanity.studio`, the URL the client and editors
use. It is a hosted Studio — no one needs the repo to edit content.

⚠️ **Read `studio/sanity.cli.js` before running the deploy.**

```bash
grep -n "studioHost" studio/sanity.cli.js
```

Expected: `<client-slug>`. If it is anything else, **stop** — the template ships with the
previous client's value, and `sanity deploy` would overwrite **another client's live
authoring environment**. This is the single most destructive default in the template. Fix
the value, then continue.

Also confirm the config loads `.env.local`:

```bash
grep -n "env" studio/sanity.cli.js
```

If it reads only `../.env`, a repo keeping config in `.env.local` fails with "Missing
SANITY project configuration" — and a Studio deployed without project config white-screens
on load rather than erroring usefully. Add `.env.local` to the loader.

**Do:**

```bash
npm run deploy --prefix studio
```

**Verify:** open `https://<client-slug>.sanity.studio` in a browser. Expected: the login
screen, then the desk with this client's document types. A white screen means missing
project config — go back to the `.env.local` loader check.

**Re-run this deploy after every schema change**, or editors keep seeing the old field set.

---

## Step 4 — Invite the team  *(browser, owner)*

**Do:** project → **Members** → **Invite members**.

| Who | Role | Why |
|---|---|---|
| Client editors | **Editor** | create and publish content; cannot touch project settings, tokens or datasets |
| Fast Forward developers | **Developer** | deploy Studio and manage schema; no billing access |
| Account owner | **Administrator** | tokens, datasets, members, plan |

Give the client **Editor**, never Administrator. An Administrator can delete a dataset and
revoke the tokens the live site reads from.

Seats are plan-limited — count them against the plan before promising client logins.

**Timing:** invite the client's editors only once the Studio is deployed *and* content is
in the dataset they will open. An invitation to an empty Studio generates a support
conversation and erodes confidence in the migration.

**Verify:** the Members list shows each person with the intended role, and the seat count
is within the plan.

---

## Step 5 — Set up the revalidation webhook  *(browser + CLI)*

Do this **last**. It needs the deployed site URL, so it cannot be completed before the
Vercel project exists.

Full procedure:
[SANITY_WEBHOOK_SETUP.md](../../reference/deployment/SANITY_WEBHOOK_SETUP.md).

**Do — generate the secret:**

```bash
openssl rand -hex 32
```

Runs in any directory; it is pure local randomness, nothing Vercel-aware. Put the **same
value** in two places:

1. Vercel → Environment Variables → `SANITY_WEBHOOK_SECRET`
2. Sanity webhook → **HTTP Headers** → key `x-vercel-webhook-secret`, value the hex string

⚠️ **Not in Sanity's `Secret` field.** That field HMAC-signs the payload into a
`sanity-webhook-signature` header. `/api/revalidate` does a plain string comparison
against `x-vercel-webhook-secret`, so a secret in the `Secret` field leaves the expected
header absent and **every delivery returns 401**. Leave `Secret` empty.

⚠️ **Check the project ID in the address bar before saving the URL.** It is at
`/project/<project-id>/api/webhooks/new`. Confirm it matches `<project-id>` from step 1.
Pasting another client's Vercel domain here returns a cheerful **200** and revalidates the
wrong site — a failure with no error message.

Webhook settings:

| Field | Value |
|---|---|
| URL | `https://<production-domain>/api/revalidate` — `/api/revalidate`, **not** `/revalidate` |
| Method | POST |
| Trigger on | ☑ Create ☑ Update ☑ Delete |
| Dataset | the **one** dataset this deployment reads — not `* (all datasets)` |
| Secret | *(empty)* |
| HTTP header | `x-vercel-webhook-secret` = the hex string |
| Filter / Projection | leave empty — the endpoint handles Sanity's default payload |

Scoping to one dataset matters: left on `*`, editing a document in `staging` fires
revalidation against the production deployment.

**Verify:** in Sanity, the webhook's **Test delivery** returns **200**. Then edit a page,
publish, and reload the live URL — the change should appear without a redeploy.

**If it fails:** 401 = secret mismatch or it is in the wrong field. 404 = the URL is
`/revalidate` instead of `/api/revalidate`, or the endpoint was added without a redeploy.
500 = `SANITY_WEBHOOK_SECRET` is not set in Vercel.

---

## Exit gate

- [ ] Project created in the FFS org (not a personal account); `<project-id>` recorded
- [ ] `production` and `staging` exist, both **private**
- [ ] The dataset each deployment reads is written into `project-docs/clients/<client-slug>/`
- [ ] Plan decided, or trial expiry date recorded with an owner
- [ ] **Editor**-scoped token minted; `node scripts/check-sanity-token.mjs` passes all three checks
- [ ] Token in `.env.local` and in Vercel; committed nowhere; printed nowhere
- [ ] `studioHost` confirmed as `<client-slug>` **before** the first deploy
- [ ] Studio deployed and loads at `https://<client-slug>.sanity.studio` without a white screen
- [ ] Members invited with least-privilege roles; seat count within plan
- [ ] Webhook: one dataset, Create/Update/Delete, secret in the HTTP header not the `Secret` field
- [ ] Test delivery returns 200, and a published edit appears on the live site

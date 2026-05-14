# Retrospectives & Operational Cadence

## Meeting Cadence
- **Weekly Analytics Sync (30 min):** Review traffic, conversions, error logs; capture actions in backlog.
- **Monthly Retrospective (60 min):** Inspect goals, what went well, what needs improvement; create action items.
- **Quarterly Content Audit:** Validate page accuracy, update redirects, assess SEO rankings.

## Template
Create a new Markdown file per retro in this folder using the format `YYYY-MM-DD.md`.

```md
# Retro – 2025-11-04
## Attendees
- Mark (Project Owner)
- Jane (Senior Dev)
- …

## What Went Well
- 

## What Needs Improvement
- 

## Action Items
- [ ] Owner – Task – Due date
- [ ] …

## Metrics Snapshot
- Traffic:
- Conversions:
- Error rate:
```

## Operational Reminders
- Rotate API tokens if >90 days old (log in action items).
- Run broken link checker monthly (`npm run postdeploy` or scheduled GitHub Action).
- Update `project-docs/Astro-Sanity Process/backlog.md` after each session.
- Feed major learnings into upcoming roadmaps and this playbook.


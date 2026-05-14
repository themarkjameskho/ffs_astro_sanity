# Test Plan

## 1. Scope
- **In Scope:** Marketing pages, contact forms, navigation, Sanity content rendering, preview mode, SEO metadata.
- **Out of Scope:** Future blog, e-commerce features (document if/when added).

## 2. Test Environments
| Environment | URL | Dataset | Notes |
|-------------|-----|---------|-------|
| Local | http://localhost:4321 | development | Run `npm run dev` |
| Staging | https://staging.example.com | staging | Autodeployed from `develop` |
| Production | https://www.example.com | production | Deployed from `main` |

## 3. Test Cases
| ID | Scenario | Steps | Expected Result | Status | Notes |
|----|----------|-------|-----------------|--------|-------|
| TC-001 | Homepage renders | Visit `/` | Sections render, no console errors | Todo | |
| TC-002 | Dynamic slug page | Visit `/about` | Page loads, CTA links work | Todo | |
| TC-003 | Contact form submission | Submit valid form | Success message + integration call | Todo | |
| TC-004 | Mobile nav toggle | Resize to 375px, open menu | Menu opens/closes, focus trapped | Todo | |
| TC-005 | Preview unpublished page | Create draft, open preview | Draft content visible, banner shown | Todo | |
| TC-006 | Lighthouse performance | Run Lighthouse on `/` | Score ≥ 90 | Todo | |
|  |  |  |  |  |  |

## 4. Manual Test Checklist
- [ ] All navigation links resolve correctly.
- [ ] Forms validate inputs and display errors.
- [ ] Page layout responsive at 360px, 768px, 1024px, 1440px.
- [ ] Schema markup valid (Google Rich Results test).
- [ ] Content editors can publish updates without developer support.

## 5. Automated Tests
- **Unit Tests:** Vitest (`npm run test`), focus on utilities, SectionRenderer mapping.
- **Integration Tests:** Astro component tests or snapshot tests (if used).
- **E2E Tests:** Playwright scenario coverage table above.
- **Performance Tests:** Lighthouse CI thresholds defined in `quality-matrix.md`.

## 6. UAT Sign-off
| Reviewer | Role | Date | Outcome | Notes |
|----------|------|------|---------|-------|
|  | Project Owner |  |  | |
|  | Marketing Lead |  |  | |
|  | QA Lead |  |  | |

## 7. Regression Strategy
- Run full automated suite on every pull request.
- Execute smoke tests post-deployment (`npm run postdeploy`).
- Maintain backlog of failures; link issues to test case IDs.


# WO-002 Source-to-Requirement Traceability

## Confirmed requirements

| Source | Requirement | Implementation evidence |
| --- | --- | --- |
| Product Bible, Mission and Conversation philosophy | Russ is Russell's digital extension; understand first, advise second; acknowledge meaning; one useful question; free text; remember context | `src/provider.js`; `public/index.html`; provider and HTTP-flow tests |
| Product Bible, Client Benefit Principle | Collect, retain, use, and transfer only information serving continuity or responsible improvement | `docs/data-inventory.md`; development notice; minimum contact fields; content-free audits |
| Product Bible, Public/private boundary | No visitor-facing scores, labels, confidence, unknowns, profiles, hidden reasoning, roadmaps, prompts, or private summaries | Public response shaping in `src/app.js`; leakage assertions in tests; no internal diagnostic UI |
| Product Bible, Professional boundaries | Avoid unsupported legal, tax, lending, appraisal, construction, engineering, or investment conclusions | Versioned bounded responses in `src/provider.js`; direct-question unit test |
| Product Bible and DR-001, V1 direction | Seller journey; private exposure; Call, Text, Contact Me; scheduling deferred | Isolated `prototype/russ-v1`; continuation UI; no scheduling surface |
| Product Bible and DR-001, Handoff | Separate affirmative consent; ordered conversation retained; supplemental summary does not replace transcript | Handoff endpoint and Russell view; consent tests; ordered-message package |
| Product Bible and DR-001, Memory and retention | Server-side continuity beyond a browser session; bounded private retention; public policy remains a launch gate | SQLite store; opaque cookie session; 90-day cap; early delete; expiry tests |
| WO-002, Access | Individual allowlist, role separation, no reliance on obscurity | Scrypt accounts, server sessions, role checks, isolation tests, noindex headers |
| WO-002, Accessibility and resilience | Keyboard-operable controls, focus visibility, announcements, narrow layout, reduced motion, recoverable drafts | Semantic controls, labels, live regions, focus CSS, 320px rules, reduced-motion rules, safe error copy |

## Repository findings

- The public repository is a static site and has no suitable server trust boundary.
- Existing browser-side seller code is evidence only and retains internal profiles in browser storage.
- The prototype therefore remains isolated and does not modify public navigation, homepage behavior, or public deployment files.

## Engineering recommendations

- Re-evaluate managed identity with multifactor authentication, PostgreSQL, browser automation, accessibility scanning, encrypted backup/restore, and a model provider before any externally reachable environment.
- Run the documented human review gates with synthetic representative scenarios before considering further scope.

## Product Owner questions

None blocks the private prototype. Public retention duration, public visitor data rights, production access control, production logging, hosting, and vendor decisions remain intentionally unresolved public-launch gates.

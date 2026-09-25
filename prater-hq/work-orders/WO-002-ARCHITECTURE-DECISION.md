# WO-002 Architecture, Framework, and Vendor Decision

## Document control

- **Status:** DECIDED - Class C engineering decision
- **Date:** 2026-09-24
- **Owner:** Engineering Lead
- **Scope:** Bounded private/non-public Russ seller conversation prototype
- **Authority:** Approved WO-002 on `docs/issue-9-revise-wo-002`

## Decision summary

Build WO-002 as an isolated Node.js 24 application under `prototype/russ-v1/`. Use Node's built-in HTTP, cryptography, SQLite, and test modules with dependency-free browser JavaScript and CSS.

The prototype will use:

- a server-side trust boundary rather than extending the public static site;
- individual allowlisted accounts with scrypt password hashes and opaque server-side sessions;
- role-based participant, Russell, reviewer, and administrator access;
- server-side SQLite persistence with application-level AES-256-GCM encryption for conversation and contact content;
- a versioned deterministic reference conversation provider behind an adapter;
- internal, content-free operational events instead of a third-party analytics vendor;
- protected in-application handoff storage plus `tel:` and `sms:` actions instead of an external CRM, email, or messaging vendor; and
- Node's built-in test runner for unit and HTTP integration tests.

No external hosting, authentication, model, persistence, analytics, scheduling, CRM, email, or messaging vendor is selected for this private local review build.

## Repository constraints

- The public repository is a static GitHub Pages-style site with no root build system or server runtime.
- Existing client-side seller logic stores internal profiles in `localStorage` and cannot securely retain raw conversations, contact details, consent evidence, or Russell-only handoffs.
- WO-002 prohibits public launch, public traffic, and production homepage replacement.
- The execution environment blocks new npm package downloads, so a dependency-heavy framework cannot be verified here without expanding operational risk.

## Architecture options

### Option A - Extend the existing static site

**Advantages**

- Smallest visual integration effort.
- Reuses current deployment and static assets.

**Disadvantages**

- No trustworthy server-side authorization boundary.
- Secrets, retained data, handoffs, and hidden behavior policy would be exposed or require a separate backend anyway.
- Existing `localStorage` patterns conflict with protected retained conversation requirements.
- Risks accidental public exposure through the current public deployment path.

**Decision:** Rejected for WO-002.

### Option B - Isolated Node application using built-in modules

**Advantages**

- Keeps the public site unchanged and the prototype explicitly private.
- Supports authentication, authorization, encrypted persistence, consent evidence, retention, deletion, and audit behavior in one bounded service.
- Uses the runtime's supported HTTP, cryptography, SQLite, and test capabilities without introducing a package supply chain.
- Creates clear adapter boundaries for future model, identity, database, analytics, and delivery vendors.
- Can be reviewed locally without public deployment.

**Disadvantages**

- Requires disciplined implementation of routing, cookies, validation, security headers, and CSRF protection.
- Synchronous SQLite limits horizontal scaling and is not the public-production persistence choice.
- The deterministic provider cannot demonstrate open-domain model behavior.

**Decision:** Selected for the bounded private prototype.

### Option C - Incremental Fastify service

**Advantages**

- Mature request lifecycle, JSON Schema validation, response serialization, and HTTP injection testing.
- A good candidate if the application grows beyond the private prototype.

**Disadvantages**

- Adds framework and plugin dependencies to a repository with no package supply chain.
- Package installation is blocked in the current execution environment, preventing reproducible verification.
- Does not remove the need to design authentication, consent, encryption, retention, and handoff boundaries.

**Decision:** Not selected now. Re-evaluate before public architecture work.

### Option D - Next.js application and staged migration

**Advantages**

- Integrated UI/server framework and established deployment ecosystem.
- Strong fit if a future approved roadmap replaces substantial public-site functionality.

**Disadvantages**

- Largest dependency, build, caching, deployment, and migration surface.
- Encourages premature coupling between a private prototype and the public site.
- Public migration is explicitly outside WO-002.

**Decision:** Rejected for this slice; not rejected for a future separately authorized migration.

## Vendor decisions

### Runtime and framework

**Selected:** Node.js 24 built-in modules.

Rationale: The runtime provides supported HTTP, cryptography, SQLite, and test capabilities needed for a single-instance private prototype. The application will enforce modular boundaries so a framework can replace the HTTP layer later without rewriting product policy or encrypted data services.

### Hosting

**Selected:** Local/private review execution only; no hosting vendor.

Rationale: Public deployment is unauthorized. A hosted private environment would require a separate deployment security review covering identity, encrypted volumes, secrets, TLS, backups, regional processing, provider subprocessors, and incident response.

### Authentication

**Selected:** Application-local individual allowlist for private review, using scrypt password hashes, server-side opaque sessions, secure cookies, role checks, throttled login, and audit events.

Rationale: It provides individual accountability without transferring identity data to a new vendor. It is not the public authentication decision. A managed identity provider with multifactor authentication should be compared before any externally reachable hosted environment.

### Persistence

**Selected:** Node built-in SQLite for metadata plus AES-256-GCM application encryption for raw messages, structured understanding, contact details, handoff content, and summaries.

Rationale: It is sufficient for a single-instance review build, supports transactions and retention queries, and keeps conversation data local. Encryption keys remain outside the repository. PostgreSQL or a managed database must be reconsidered for multi-instance or public operation.

### Conversation/model provider

**Selected:** Versioned deterministic reference provider with synthetic test scenarios; no external model vendor.

Rationale: The first review must validate the bounded conversation sequence, consent, continuity, corrections, handoff, privacy, accessibility, and Russell Test workflow. Avoiding external inference keeps raw conversations inside the private service and eliminates unapproved provider retention or training risk. The provider adapter accepts a future model implementation only after a separate security, privacy, retention, structured-output, evaluation, cost, and failure-behavior comparison.

### Analytics and observability

**Selected:** No analytics vendor. Store only content-free operational and audit events locally.

Rationale: WO-002 needs evidence of behavior and access, not engagement optimization. Conversation text, contact data, summaries, and hidden state are prohibited from analytics and logs.

### Human handoff and delivery

**Selected:** Protected in-application handoff queue, configurable `tel:` and `sms:` links, and an internal contact-request record. No external CRM, email, or messaging vendor.

Rationale: This exercises all approved continuation paths and the consented full-context handoff without transmitting private data to another vendor. External notifications are a documented prototype limitation.

### Testing

**Selected:** Node built-in `node:test` for unit and HTTP integration coverage, plus manual browser, keyboard, responsive, contrast, and screen-reader-oriented review procedures.

Rationale: It is reproducible without external packages. A browser automation and accessibility engine should be added when an approved package source is available; until then, missing automated browser scanning is reported as residual risk rather than silently claimed.

## Security decisions

- Default-deny authentication and role-based authorization on every private API and view.
- Opaque random session identifiers stored only as hashes server-side.
- `HttpOnly`, `SameSite=Strict` cookies; `Secure` is required outside explicit localhost review mode.
- Per-session CSRF tokens for state-changing requests.
- Strict security headers, including a nonce-based Content Security Policy.
- Prepared SQL statements and strict allowlist validation at every trust boundary.
- AES-256-GCM field encryption with unique initialization vectors and authenticated context.
- No secrets, encryption keys, plaintext passwords, raw conversations, or contact data in source control, URLs, logs, analytics, or client storage.
- Login throttling, request body limits, message length limits, and safe generic errors.
- Audited authentication, privileged read, handoff, consent, deletion, and retention actions without raw content duplication.
- Automated expiry and irreversible deletion for the 90-day private-development maximum.

## Data and retention decisions

- Every collected, retained, analyzed, or transferred field must have a documented purpose that passes the Client Benefit Principle.
- Conversation memory persists server-side across browser sessions.
- The browser holds only opaque session state; it does not hold raw retained conversation data in durable storage.
- Development-retention consent is required before starting a retained conversation.
- Handoff consent is separate, just in time, specific, and affirmative.
- The ordered conversation is authoritative; generated summaries are versioned supplements.
- Declining handoff consent prevents transfer but does not block independent call or text actions.
- Raw development conversations expire no later than 90 days unless a documented, time-limited hold exists.
- Automated expiry removes encrypted messages, structured understanding, contact information, handoff packages, and derived summaries.
- Synthetic data is used for all automated tests.

## Experience composition

### Visual thesis

A calm, private conversation room that feels recognizably Prater: crisp white space, trustworthy navy, deliberate red actions, restrained gold, and Russ present as a quiet guide rather than a software mascot.

### Content plan

1. Private sign-in and authorized-use notice.
2. Conversation workspace with Russ, persistent context, and one current action.
3. Understanding confirmation and useful direction inside the conversation flow.
4. Three continuation choices with just-in-time context-sharing consent.
5. Protected Russell review view showing the ordered conversation and supplemental summary.

### Interaction thesis

- New messages enter with a short, reduced-motion-safe reveal and deliberate focus/announcement behavior.
- Understanding confirmation expands in place without moving the participant to a dashboard.
- Continuation choices reveal consent details only when needed, keeping the conversation primary and reducing cognitive load.

## Reconsideration triggers

Reopen this decision before:

- any public or externally reachable deployment;
- real visitor traffic;
- external model inference;
- external analytics, CRM, email, or messaging delivery;
- multi-instance hosting or higher concurrency;
- cross-device identity/resume;
- a public retention/deletion policy; or
- migration of the production homepage or existing public journeys.

## References

- Node.js SQLite API: https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html
- Fastify validation and serialization: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- Fastify testing: https://fastify.dev/docs/latest/Guides/Testing/
- Next.js authentication guidance: https://nextjs.org/docs/app/guides/authentication
- Next.js self-hosting guidance: https://nextjs.org/docs/app/guides/self-hosting

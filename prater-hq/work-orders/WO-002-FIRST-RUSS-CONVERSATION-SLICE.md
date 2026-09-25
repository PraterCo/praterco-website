# Work Order 002 - Private Russ Seller Conversation Prototype

## Document control

- **Status:** REVISION COMPLETE - awaiting Product Owner and Vision Architect implementation approval
- **Version:** 0.2
- **Revised:** 2026-09-24
- **Owner:** Engineering Lead
- **Reviewers:** Product Owner, Vision Architect, Creative Director, Russ Behavior Lead, Quality Director
- **Origin:** GitHub Issue #9, WO-001 review, and the approved WO-002 Product Owner Decision Addendum
- **Implementation authority:** None. This revision is documentation and planning only. No implementation may begin until the Product Owner and Vision Architect explicitly approve WO-002 for implementation.

## Governing sources

| Authority | Path | Status | Application to WO-002 |
| --- | --- | --- | --- |
| Product Bible | `prater-hq/01-product-bible/PRODUCT-BIBLE.md` | APPROVED - foundational v1 | Product identity, Client Benefit Principle, conversation behavior, privacy boundary, human outcomes, Russell Test, and V1 direction |
| Decision Record | `prater-hq/07-decision-log/DR-001-FIRST-RUSS-V1-DECISIONS.md` | APPROVED | First journey, private exposure, continuation options, full-context handoff, consent, and retained memory |
| Source Authority | `prater-hq/SOURCE-AUTHORITY.md` | APPROVED | Authority order and treatment of pending lower-level Bibles |
| Product Owner addendum | `prater-hq/work-orders/WO-002-PRODUCT-OWNER-DECISIONS.md` | APPROVED INPUT TO WO-002 REVISION | Resolved blockers and public-launch gates |

Pending lower-level Bibles do not override these approved sources and do not block this bounded private prototype. Their absence does not authorize new product policy.

## Confirmed product requirements

- Russ is the digital extension of Russell Prater's thinking and communication.
- The core product principle is **UNDERSTAND FIRST. ADVISE SECOND.**
- The first bounded journey is a homeowner considering selling a property.
- The first implementation is private/non-public.
- Conversation is primary; internal reasoning remains private.
- Russ acknowledges meaning, remembers relevant context, asks one useful question at a time, supports free text, invites correction, and provides value before requesting contact information.
- V1 continuation offers **Call Russell**, **Text Russell**, and **Ask Russell to contact me**. Scheduling is deferred.
- After clear affirmative visitor consent, the full conversation may be preserved and transferred to Russell. A generated summary may supplement but must not replace the ordered conversation.
- Conversation memory is not session-only. Authorized private development/testing conversations may be retained for continuity, behavior review, the Russell Test, failure diagnosis, quality improvement, and responsible product evaluation.
- Every collection, use, retention, analysis, and handoff of information must satisfy the Client Benefit Principle.
- Raw conversation retention must be bounded. The final public retention duration and automated deletion or de-identification policy are public-launch gates, not private-prototype blockers.
- Visitors must not see internal scores, diagnostic labels, confidence values, unknown lists, decision profiles, hidden reasoning, private summaries, internal roadmaps, prompts, or Work Order content.
- Mobile, accessibility, privacy, security, consent, failure behavior, and recovery are release requirements.

## Bounded outcome

Deliver one authenticated, private, reviewable seller-conversation vertical slice that:

1. welcomes an authorized participant into a conversation;
2. acknowledges the participant's meaningful disclosure;
3. remembers relevant context across browser sessions without creating a public cross-device identity model;
4. presents a concise understanding for confirmation or correction;
5. provides useful, bounded direction without overwhelming the participant;
6. offers Call Russell, Text Russell, and Ask Russell to contact me;
7. obtains separate, clear, affirmative consent before transferring conversation context;
8. gives Russell secure access to the ordered, consented conversation plus any generated summary; and
9. produces the evidence required for human-success review and the Russell Test.

## Repository findings

- The current site is a static, GitHub Pages-style implementation using HTML, CSS, and browser JavaScript; no root build or automated test configuration was found during WO-001 review.
- `decision-center.html` and `js/decision-center.js` implement a deterministic multi-step seller flow and result screen.
- `js/seller-room.js` implements seller prompts, quick replies, and a public live-summary panel.
- `js/prater-decision-engine.js` stores a seller profile in `localStorage` and derives readiness, stage, unknowns, a decision profile, and a roadmap.
- `js/russ-personality.js` contains potentially reusable acknowledgment and transition language.
- Existing public readiness, stage, profile, unknown, roadmap, and live internal-summary concepts conflict with the approved public/private boundary and must not be copied into the prototype's visitor experience.
- The current static client and `localStorage` approach do not provide an adequate security boundary for retained conversations, consent evidence, contact information, or Russell-only handoff access.

## Engineering recommendation

Implement the prototype as an isolated private application or protected route with a server-side trust boundary. Do not place retained raw conversations, contact details, provider credentials, hidden behavior instructions, or Russell-only handoff data in public static assets or durable browser storage.

The first implementation task after approval must record a concise engineering decision comparing evolution of the static site, incremental framework adoption, and staged application migration. It must also compare any hosting, model, persistence, authentication, analytics, or delivery vendors introduced by the slice. The comparison must cover security, privacy, accessibility, testability, cost, operational burden, deployment and rollback, data boundaries, vendor lock-in, and compatibility with the approved experience.

Framework and vendor selection remain Class C engineering decisions. Any option that changes a Class A product outcome or Class B experience outcome must be escalated before selection.

## Proposed conversation and data architecture

### 1. Private access boundary

- Require individual allowlisted access to the prototype; an unlisted URL is not an access control.
- Prefer an established authentication provider with short-lived sessions and multifactor authentication when available.
- Separate participant access, Russell handoff access, and engineering/quality administration by role.
- Keep the prototype off public navigation and prevent search indexing, while treating those controls as secondary to authentication.

### 2. Conversation application

- Use an accessible conversation UI with free text and optional quick replies that reduce effort rather than constrain the visitor.
- Keep presentation, conversation state, approved behavior policy, and model/provider adapter boundaries separate.
- Version prompts, behavior configuration, output schemas, and test fixtures.
- Require structured provider output so public text, internal state updates, safety state, and proposed next action can be validated independently.

### 3. Persistent conversation service

- Store authoritative conversation state server-side; the browser receives only the data required for the current view.
- Resume a private conversation through an opaque, revocable, expiring token in a secure `HttpOnly`, `Secure`, `SameSite` cookie or an equivalent protected mechanism.
- Support persistence across browser sessions. Cross-device identity and resume remain deferred and are not promised by this prototype.
- Never store raw conversation text, contact details, hidden reasoning, provider credentials, or consent evidence in `localStorage`, query strings, analytics payloads, or client-visible configuration.

### 4. Minimum data model

- **AuthorizedParticipant:** private-access identity or pseudonymous participant reference and access status.
- **Conversation:** owner reference, lifecycle state, created/updated timestamps, behavior/configuration version, and development-retention expiry.
- **Message:** ordered participant/Russ content, timestamps, correction relationship, and safe delivery status.
- **StructuredUnderstanding:** private structured context needed to avoid repetition and improve relevance; never exposed as an internal diagnostic dashboard.
- **UnderstandingConfirmation:** what was shown, confirmed, or corrected and when.
- **DevelopmentConsent:** notice version, affirmative action, purposes, timestamp, and withdrawal/deletion status.
- **HandoffConsent:** exact scope disclosed, affirmative action, recipient, purposes, timestamp, and revocation state before transfer.
- **ContactMethod:** minimum information needed for the selected continuation path, logically separated from conversation content.
- **HandoffPackage:** consented ordered conversation snapshot, corrections, confirmation state, optional generated summary, source versions, and access status.
- **EvaluationRecord:** scenario, reviewer, rubric outcome, defect references, and the Russell Test result without duplicating raw conversation unnecessarily.
- **AuditEvent:** authentication, privileged read, export, handoff, deletion, consent change, and configuration change metadata without raw message text.

### 5. Client Benefit traceability

Each collected or derived field must declare:

- the client benefit or responsible-improvement purpose;
- whether it is required or optional;
- who may access it;
- where it is stored;
- when it expires or is de-identified; and
- whether it may enter a handoff, evaluation, log, or analytic event.

A field without a documented purpose that passes the Client Benefit Principle must not be collected or retained.

### 6. Understanding and direction

- Maintain structured understanding privately to support relevant acknowledgment, avoid repeated questions, and generate a concise visitor-facing confirmation.
- Treat visitor correction as authoritative and preserve the correction relationship so superseded information is not silently reused.
- Validate proposed direction against approved professional boundaries before presentation.
- A generated summary is derived convenience data. It must link to the conversation version from which it was generated and must never replace the ordered conversation for Russell's review.

### 7. Continuation and handoff

- Present Call Russell, Text Russell, and Ask Russell to contact me only after the experience has provided value.
- Display a just-in-time notice describing what conversation information will be shared, with whom, and why.
- Require an unambiguous affirmative action before creating or releasing a handoff package. Preselected consent and consent inferred from continued use are prohibited.
- If context-transfer consent is declined, do not transfer the conversation. Declining transfer must not prevent the participant from independently calling or texting Russell.
- Capture only the minimum contact information required for Ask Russell to contact me.
- Preserve message order, wording, corrections, and confirmation state in the handoff. Include an optional generated summary as a supplement.
- Give Russell access through a protected, auditable view; do not send raw conversation content through logs, analytics, URLs, or unsecured notifications.

## Private development retention and security design

The following is an engineering recommendation for the private prototype, not the final public retention policy:

- Retain authorized raw development conversations for no more than 90 days by default, with a configurable shorter expiry.
- Run an automated daily deletion or irreversible de-identification job against expired conversations, messages, contact information, consent-linked handoff packages, and derived summaries.
- Permit a time-limited extension only for a documented active defect, security investigation, or Russell Test review, with an owner, purpose, and new expiry. Indefinite extensions are prohibited.
- Allow an authorized participant or administrator to request early deletion. Complete deletion from active systems promptly and document backup-expiry limitations.
- Encrypt data in transit and at rest using managed platform controls; keep keys and secrets outside the repository and client bundle.
- Separate contact information from conversation content and use pseudonymous internal identifiers.
- Enforce least-privilege role-based access. Russell may access consented handoffs; designated Engineering/Quality reviewers may access authorized development conversations only for documented purposes.
- Record and review privileged access, exports, consent changes, handoffs, and deletions without copying raw message content into audit events.
- Exclude conversation text and contact information from application logs, analytics, crash reports, traces, URLs, page metadata, support tooling, and model-observability products unless separately approved and protected for a documented Client Benefit purpose.
- Disable bulk export by default. Any approved export must be encrypted, access-limited, purpose-bound, and assigned an expiry.
- Use synthetic conversations for automated tests. Raw retained conversations may be used only in approved human evaluation or specifically authorized diagnostic work.
- Maintain tested backup and restore behavior. Expired raw data must age out of backups within a documented bounded window.
- Complete a threat review covering broken access control, token theft, injection, cross-site scripting, cross-site request forgery, data leakage, prompt injection, provider retention, malicious files/links, and accidental disclosure to Russell or reviewers.

The final public retention period, deletion/de-identification cadence and exceptions, visitor access/correction/deletion mechanics, and production access-control policy remain public-launch gates.

## In-scope prototype surface

- Authenticated private seller-conversation experience
- Persistent server-side conversation memory across browser sessions
- Free-text composer and optional approved quick replies
- Natural acknowledgment and one useful next question at a time
- Understanding confirmation and correction
- Bounded first direction with professional-boundary handling
- Call Russell, Text Russell, and Ask Russell to contact me
- Separate development-retention consent and just-in-time handoff consent
- Secure full-context handoff package plus optional generated summary
- Minimal protected Russell handoff view
- Development retention, deletion/de-identification, audit, and access-control mechanisms
- Loading, unavailable, invalid-input, timeout, retry, resume, consent, and safe fallback states
- Automated checks, human-success review, and Russell Test evidence

## Explicitly out of scope

- Public launch, public traffic, production publication, or deployment to the current public entry points
- Replacing the public homepage or existing public flows
- Buyer, investor, commercial, or general real estate journeys
- Cross-device identity/resume
- Scheduling integration
- Final public retention duration or public deletion/de-identification policy
- Final public visitor data-access workflow
- Final Russ animation, placement, palette, typography, or motion system
- Public scores, profiles, labels, unknowns, internal summaries, roadmaps, prompts, or hidden reasoning
- Autonomous legal, tax, lending, appraisal, construction, engineering, investment, pricing, or valuation conclusions
- Framework or vendor selection without documented comparison

## Deliverables after implementation approval

1. Architecture/framework and vendor comparison record.
2. Source-to-requirement traceability matrix.
3. Data inventory and Client Benefit map.
4. Threat model and privacy review.
5. Private prototype implementing the bounded scope.
6. Versioned behavior configuration and representative scenario fixtures.
7. Automated unit, integration, end-to-end, accessibility, security/privacy, retention, and failure-recovery tests.
8. Human-success review evidence and Russell Test record.
9. Prototype operations guide covering authorized access, consent, deletion, incident response, backup expiry, rollback, and shutdown.

## Acceptance criteria

### Access and exposure

- Unauthenticated and unauthorized users cannot reach prototype content, APIs, conversations, handoffs, or administrative functions.
- Participant, Russell, Engineering/Quality, and administrative permissions are separated and tested.
- The prototype is absent from public navigation and search indexing, without relying on obscurity for protection.
- No production deployment or public entry-point change occurs under this Work Order.

### Conversation behavior

- The private entry makes conversation the primary action for a homeowner considering selling.
- Russ acknowledges the substance of a meaningful disclosure before asking the next question or advising.
- Russ asks one useful question at a time, supports free text, and uses quick replies only to reduce effort.
- Persistent context prevents unnecessary repetition after an authorized participant resumes a conversation.
- The participant can review, confirm, and correct a concise statement of understanding.
- Confirmed corrections supersede earlier understanding in subsequent responses and direction.
- Russ answers direct questions when appropriate and applies useful professional boundaries when a definitive conclusion would be unsupported.
- The prototype provides value before requesting contact information.

### Continuation and consent

- Call Russell, Text Russell, and Ask Russell to contact me are all available and keyboard accessible.
- Contact collection is limited to the minimum needed for the selected option.
- Before handoff, the participant sees a clear description of the recipient, shared context, purpose, and optional summary.
- Full-context transfer requires a separate affirmative action that is recorded with the notice version and timestamp.
- Without affirmative handoff consent, no conversation or summary is transferred.
- The handoff preserves the ordered conversation, corrections, and confirmation state; a generated summary supplements but does not replace it.
- Russell can securely review the consented handoff and the consent record through an auditable protected view.

### Client Benefit Principle

- Every collected, derived, retained, analyzed, or transferred field appears in the approved data inventory with a legitimate client-benefit or responsible-improvement purpose.
- Unmapped data is rejected or removed.
- Analytics and evaluation collect the minimum data necessary and do not optimize for lead capture or engagement at the expense of trust, privacy, quality, or usefulness.

### Retention and deletion

- Conversation memory persists across browser sessions through server-side storage and a protected resume mechanism.
- Authorized development conversations receive a development-retention expiry no later than 90 days after the relevant activity unless a documented, time-limited extension applies.
- Automated expiry deletes or irreversibly de-identifies raw messages, contact data, handoff packages, and derived summaries as designed.
- Early-deletion requests are supported for the private prototype and produce auditable completion evidence.
- Raw conversation storage cannot become indefinite through missing timestamps, failed jobs, or repeated activity without policy.
- Backup retention and expiry are documented and tested.

### Privacy and security

- Raw conversations, contact details, consent evidence, hidden instructions, secrets, and Russell-only data are absent from public assets, durable browser storage, query strings, logs, analytics, crash reports, and client-visible configuration.
- Inputs and model/provider outputs are schema-validated, length-limited, safely rendered, and tested against injection and data-exfiltration attempts.
- Data is encrypted in transit and at rest; credentials and keys are managed outside source control.
- Privileged access, exports, handoffs, consent changes, and deletions are audited without raw message duplication.
- Provider configurations disable training or secondary use of retained conversation data where supported and document any provider retention.
- Failure states do not expose stack traces, prompts, provider details, private Prater HQ content, or another participant's data.

### Accessibility and resilience

- The full flow is usable with keyboard-only navigation, visible focus, and logical focus movement.
- New messages, status changes, consent errors, and failures are announced without repeatedly reading the full conversation.
- Labels, instructions, validation, and errors are programmatically associated.
- The interface remains usable at 320 CSS pixels wide and at 200 percent text enlargement.
- Reduced-motion preferences are respected.
- Loading, timeout, unavailable, retry, resume, and offline states preserve entered text when safe and provide a clear next action.

### Test expectations

- Unit tests cover state transitions, acknowledgment ordering, memory, correction precedence, consent, handoff packaging, summary linkage, redaction, authorization, retention expiry, and failure mapping.
- Integration tests cover persistent resume, all three continuation options, consent granted/declined, Russell access, automated expiry, provider failures, and unauthorized access.
- End-to-end tests cover the complete keyboard and mobile flow, correction, persistence across browser restart, each continuation option, consent, and safe recovery.
- Automated accessibility scanning is supplemented by manual keyboard, focus, zoom, and announcement review.
- Security/privacy testing covers access control, session/token handling, injection, cross-user isolation, data leakage, logs/analytics separation, secrets, consent evidence, deletion, and backup expiry.
- Automated tests use synthetic data.

## Russell Test plan

### Scenario coverage

The Russ Behavior Lead and Quality Director will prepare versioned, synthetic representative scenarios for Product Owner review. Coverage must include:

- early exploration without a fixed timeline;
- a participant who corrects Russ's understanding;
- a direct question that should receive a direct, bounded answer;
- a professional-boundary situation requiring useful escalation;
- retained context after a browser-session break;
- each of the three continuation options;
- affirmative handoff consent and declined handoff consent; and
- provider, persistence, or handoff failure with recovery.

### Review evidence

- Russell reviews the complete ordered interaction, including corrections and handoff behavior, rather than only a generated summary.
- Each scenario is evaluated against acknowledgment, relevance, pressure, clarity, professional boundaries, continuity, and the five human success criteria.
- Failures produce a traceable defect or behavior-configuration change followed by rerun of the affected and regression scenarios.
- The Quality Director records scenario version, prototype/configuration version, outcome, and approval date.

### Mandatory gate

WO-002 is not complete until representative experiences allow Russell Prater to say:

> “Yes. That is how I would have handled that conversation.”

The private prototype may not advance toward public launch if any required scenario fails the Russell Test or if evidence does not support that the visitor feels heard, understood, less overwhelmed, more confident, and comfortable continuing with Russell.

## Previous blocker disposition

| Previous blocker | Disposition |
| --- | --- |
| Canonical paths, versions, and approval status | RESOLVED by `SOURCE-AUTHORITY.md` and the approved Product Bible/DR-001 |
| First journey | RESOLVED: homeowner considering selling |
| First direction and professional boundaries | RESOLVED sufficiently for a private prototype by the Product Bible's conversation philosophy and professional-boundary rules; exact scenario wording is a versioned behavior artifact reviewed through the Russell Test |
| Continuation channels | RESOLVED: Call Russell, Text Russell, Ask Russell to contact me |
| Handoff context, consent, retention, and deletion | RESOLVED for the private prototype: consented full context plus optional summary and bounded authorized development retention; final public policy remains a launch gate |
| Representative Russell Test scenarios | RESOLVED as an implementation deliverable and mandatory review gate, not an additional Product Owner policy decision |

## Genuine blockers for private-prototype implementation

No unresolved Product Owner decision identified during WO-001 review still blocks the bounded private prototype.

The only remaining authorization blocker is explicit Product Owner and Vision Architect approval of this revised WO-002. After approval, the Engineering Lead must complete the architecture/framework and vendor comparison before code implementation begins. That comparison is an authorized Class C engineering deliverable, not an unresolved Product Owner decision.

## Public-launch gates not blocking the private prototype

- Approved public retention duration
- Automated public rolling deletion/de-identification behavior and exceptions
- Final visitor access, correction, deletion, and export mechanics
- Production access-control and operational policy
- Production logging/analytics policy and vendor configuration
- Production security, incident-response, backup, and recovery approval
- Creative, Quality, accessibility, human-success, and Russell Test approval for public exposure

## Definition of done

If WO-002 receives implementation approval, the private prototype is complete only when all scoped deliverables and automated checks pass; access, privacy, consent, retention, deletion, accessibility, and recovery reviews pass; the three continuation options and consented full-context handoff work as specified; each human success criterion has review evidence; and Russell passes the Russell Test.

Public launch requires a separate authorization after the public-launch gates are resolved. Completion of this private prototype does not authorize publication or deployment to public users.

# Work Order 002 - First Russ Conversation Slice

## Document control

- **Status:** DRAFT - not approved for implementation
- **Version:** 0.1
- **Drafted:** 2026-09-24
- **Owner:** Engineering Lead
- **Reviewers:** Product Owner, Vision Architect, Creative Director, Russ Behavior Lead, Quality Director
- **Origin:** GitHub Issue #9 and finalized WO-001
- **Implementation authority:** None. Explicit Product Owner and Vision Architect approval is required before any code or production configuration changes begin.

## Proposed bounded outcome

Deliver one reviewable, non-production seller-conversation vertical slice that demonstrates the approved sequence:

1. welcome the visitor into a conversation;
2. acknowledge the visitor's meaningful disclosure;
3. remember context within the active session;
4. present a concise understanding for confirmation or correction;
5. offer one approved, useful first direction without overwhelming the visitor; and
6. make continuing with Russell feel like the natural next step while preserving approved context.

The slice is proposed as a seller journey because the current repository already contains seller-oriented conversation flows. That is a repository finding and engineering recommendation, not an approved product priority. Product Owner approval is required.

## Confirmed requirements

- Preserve Russ as the digital extension of Russell Prater's thinking and communication.
- Apply **UNDERSTAND FIRST. ADVISE SECOND.**
- Keep conversation primary and internal reasoning private.
- Acknowledge before asking the next question or advising.
- Support confirmation and correction of understanding.
- Do not force the visitor to repeat approved handoff context.
- Do not expose readiness scores, stages, profiles, unknowns, internal summaries, internal roadmaps, prompts, or Work Order content.
- Treat mobile, accessibility, privacy, security, and failure behavior as acceptance criteria.
- Require all five human success criteria and the Russell Test before release.

## Repository findings

- The current site is a static, GitHub Pages-style implementation with HTML, CSS, and browser JavaScript and no repository build or test configuration found at the root.
- `decision-center.html` and `js/decision-center.js` implement a deterministic multi-step seller flow and result screen.
- `js/seller-room.js` implements seller prompts, quick replies, and a public “what I am hearing” panel.
- `js/prater-decision-engine.js` persists a seller profile in `localStorage` and derives readiness, stage, unknowns, a decision profile, and a roadmap.
- `js/russ-personality.js` contains reusable acknowledgment and transition language.
- Existing public concepts such as readiness, stages, profiles, unknowns, roadmaps, and live internal summaries conflict with the current public-experience constraints and must not be copied into the slice.
- Existing call and email paths are implementation evidence, not approval of the final handoff design.

## Engineering recommendation

Build the first slice behind a non-public review route or feature flag using the smallest repository-compatible architecture that satisfies the approved behavior. Keep conversation state in memory for the review slice and use deterministic fixtures or a replaceable conversation adapter until persistence, model, and handoff vendors are selected through documented comparisons.

Before implementation, record a concise engineering decision comparing:

- evolving the static implementation;
- adding a framework incrementally; and
- creating a staged application migration.

The comparison must cover security, privacy, accessibility, testability, deployment and rollback, operational burden, data boundaries, cost, vendor lock-in, and compatibility with the approved experience. The Engineering Lead owns the selection unless a tradeoff would change a Class A or Class B outcome.

## Proposed in-scope surface

- One non-public seller conversation route or feature-flagged entry
- Conversation shell and accessible message history
- Free-text input and optional approved suggested replies
- Acknowledgment before the next question
- Active-session context only
- Understanding summary with confirm and correct controls
- One approved first-direction state
- One approved continuation-to-Russell state
- Loading, unavailable, invalid-input, retry, and safe fallback states
- Automated checks and a documented human-review script

## Explicitly out of scope

- Production publication or deployment
- Replacing the public homepage or existing production flows
- Cross-device resume, accounts, or durable visitor profiles
- Production message, contact, or conversation persistence
- Russell's private handoff dashboard
- Production model, database, analytics, scheduling, CRM, email, or messaging integrations
- Additional buyer, investor, commercial, or general real estate journeys
- Public scores, profiles, labels, unknowns, roadmaps, or reasoning
- Autonomous legal, tax, lending, construction, engineering, investment, pricing, or valuation advice
- Framework or vendor selection without the required comparison

## Deliverables

When this draft is approved, the implementation assignment will require:

1. A documented framework/architecture comparison and decision record.
2. A source-to-requirement traceability table using approved Prater HQ paths and versions.
3. A non-public first-slice implementation with separable presentation, conversation state, behavior policy, and provider adapter boundaries.
4. Redacted logging and analytics behavior that excludes conversation text and personal information unless separately authorized.
5. Focused automated tests and a manual review script.
6. A release-readiness report covering technical checks, the five human outcomes, and the Russell Test.

## Proposed acceptance criteria

### Conversation behavior

- The first screen makes starting the conversation the unmistakable primary action.
- After a meaningful visitor disclosure, Russ acknowledges the substance of what was shared before asking another question.
- The next question follows from known context and does not request information already supplied in the active session.
- The visitor can review, confirm, and correct a concise statement of understanding.
- A correction updates the visible understanding and subsequent direction without exposing internal state.
- The first direction is approved, specific enough to be useful, bounded by professional limitations, and presented without pressure.
- The continuation state uses only the Product Owner-approved channel or channels and includes only consented context.

### Privacy and security

- No readiness score, stage, profile, unknown list, private summary, roadmap, hidden prompt, or reasoning trace is rendered or exposed through client-side state intended for the public experience.
- The draft slice does not persist conversation or contact data beyond the active browser session.
- Logs, error reports, analytics, URLs, and page metadata contain no message text, contact details, or sensitive visitor information.
- Inputs are length-limited, safely rendered, and handled without script injection.
- Failure states do not leak configuration, prompts, stack traces, provider details, or private Prater HQ content.

### Accessibility and resilience

- The complete flow is usable with keyboard-only navigation and visible focus.
- New messages and errors are announced without repeatedly reading the full conversation.
- Labels, instructions, status messages, and validation errors are programmatically associated.
- The interface remains usable at 320 CSS pixels wide and with text enlarged to 200 percent.
- Reduced-motion preferences are respected.
- Loading, timeout, unavailable, retry, and offline states preserve entered text when safe and provide a clear next action.

### Test expectations

- Unit tests cover state transitions, acknowledgment ordering, confirmation/correction, redaction, and failure mapping.
- Integration tests cover the complete slice with deterministic fixtures and provider failures.
- End-to-end tests cover keyboard use, mobile viewport behavior, confirmation, correction, and continuation.
- Accessibility checks include automated scanning plus manual keyboard and announcement review.
- Security/privacy checks verify output encoding, input limits, redaction, absence of prohibited public fields, and absence of durable storage.
- Responsive visual review covers representative mobile and desktop viewports.

### Mandatory human release gates

Representative moderated review must support that:

- visitor feels heard;
- visitor feels understood;
- visitor feels less overwhelmed;
- visitor feels more confident; and
- visitor feels comfortable continuing with Russell.

The slice may not be released unless Russell Prater completes the **Russell Test** and says:

> “Yes. That is how I would have handled that conversation.”

## Likely repository areas

Exact file paths depend on the approved architecture comparison. Likely areas include a new non-public route, scoped styles, a conversation state module, a behavior/fixture module, a provider adapter boundary, and focused test files. Existing public files should remain unchanged unless the approved implementation plan explicitly identifies a necessary, reviewable change.

## Dependencies and gates

Implementation may begin only after:

1. the Product Owner and Vision Architect explicitly approve this Work Order;
2. the canonical higher-authority sources and their approval status are verified;
3. the Product Owner resolves the BLOCKING questions below;
4. the Engineering Lead completes and records the architecture/framework comparison; and
5. the approved conversation behavior, handoff data boundary, and test fixtures are available to the builder.

## Product Owner questions - BLOCKING

1. Is the seller journey approved as the first implementation slice?
2. What are the canonical paths, versions, and approval statuses for the applicable Product Bible, Decision Records, Russ Bible, Brand Bible, Design Bible, and Engineering Bible?
3. What exact first direction may Russ provide in the representative seller scenario?
4. Which continuation channel or channels are required for this slice?
5. What context may be included in the continuation, what consent language is approved, and must the non-production slice transmit data or only demonstrate the handoff with fixtures?
6. Which representative conversation scenarios must Russell review for the Russell Test?

## Product Owner questions - DEFERRED

1. Which visitor journey should follow the seller slice?
2. Should a future release support durable or cross-device conversation resume?
3. What quantitative measures, if any, should supplement the qualitative human success criteria?
4. When should the private Russell handoff view and production integrations enter the roadmap?
5. What future animation or expanded visual expression of Russ should be evaluated?

## Definition of done

If this Work Order is approved, the slice is complete only when all scoped deliverables and automated checks pass, privacy and accessibility reviews pass, each human success criterion has review evidence, Russell passes the Russell Test, and the Product Owner authorizes any production release separately.

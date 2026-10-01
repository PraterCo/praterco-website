# Work Order 001 — Repository-Level Russ Implementation Specification

## Owner

Engineering Lead

## Reviewers

- Product Owner
- Vision Architect
- Creative Director
- Quality Director

## Objective

Translate the approved Russ product vision into a repository-specific implementation specification mapped to the current `PraterCo/praterco-website` codebase.

This work order is for planning and architecture. It does not authorize a full rewrite or an autonomous redesign.

## Desired human outcome

A qualified coder/designer should be able to implement the first complete Russ experience without guessing:

- What the public sees
- What remains private
- What information is remembered
- How the conversation advances
- How Russell receives the handoff
- How success is measured

## Required repository review

Inspect and document the current:

- Page structure
- JavaScript architecture
- Stylesheets and reusable visual patterns
- Seller conversation flow
- Local storage or state handling
- Hosting and build assumptions
- Existing analytics, forms, contact paths, and integrations
- Accessibility and test coverage

## Required deliverables

### 1. Current-state map

Include:

- Relevant files and responsibilities
- Existing reusable code
- Technical debt affecting Russ
- Features that should be retained, revised, hidden, or retired

### 2. Target architecture

Recommend whether to:

- Evolve the current static implementation
- Introduce a framework incrementally
- Scaffold a new application and migrate in stages

State the tradeoffs and recommendation. Do not choose Next.js merely because it is familiar.

### 3. Data model

Define entities and relationships for at least:

- Anonymous visitor/session
- Conversation
- Message
- Structured understanding/profile
- Consent and contact details
- Human handoff
- Conversation summary
- Recommendation or next step
- Analytics event
- Feedback
- Prompt/configuration version

Identify sensitive information, retention expectations, and deletion requirements.

### 4. API contracts

Specify request, response, validation, authentication/authorization, failure behavior, and idempotency where relevant for:

- Create/resume conversation
- Send message
- Update structured understanding
- Confirm or correct understanding
- Generate summary
- Request human follow-up
- Submit feedback
- Retrieve Russell's private handoff view
- Record analytics events

### 5. Prompt architecture

Define distinct layers for:

- Product identity
- Russell voice and behavior
- Conversation policy
- Real estate knowledge boundaries
- Current structured understanding
- Conversation history
- Safety and escalation
- Tool instructions
- Output schema

Include versioning, testing, observability, and a method for changing behavior without scattering prompt text throughout application code.

### 6. UI component inventory

Map the approved experience into reusable components, including:

- Arrival/hero conversation entry
- Russ character/presence
- Conversation shell
- Message presentation
- Composer
- Suggested replies
- Understanding confirmation
- Correction interaction
- Recommendation/next-step card
- Human handoff
- Consent/contact capture
- Resume conversation state
- Loading, error, offline, and fallback states
- Private Russell view

For each component, note states, accessibility requirements, mobile behavior, and source-of-truth section.

### 7. Analytics event dictionary

At minimum:

- Experience viewed
- Conversation entry clicked
- Conversation started
- First meaningful disclosure
- Understanding presented
- Understanding confirmed
- Understanding corrected
- Recommendation presented
- Contact path viewed
- Call clicked
- Follow-up requested
- Conversation resumed
- Conversation abandoned
- Error encountered
- Feedback submitted

Do not use internal readiness scores as a public product metric.

### 8. Acceptance-test plan

Include:

- Unit tests
- Integration tests
- End-to-end tests
- Prompt/behavior evaluations
- Accessibility tests
- Responsive visual review
- Security/privacy tests
- Analytics validation
- Human review rubric for “sounds like Russell” and “feels understood”

### 9. Phased implementation plan

Produce small, reviewable phases. The first vertical slice must exercise:

- Emotional acknowledgment
- Contextual memory
- Private reasoning
- Understanding confirmation
- Useful direction
- Natural continuation to Russell

Each phase must state dependencies, files likely affected, risks, review gate, and definition of done.

## Product constraints

- Do not publicly display decision-readiness scores, diagnostic labels, internal unknowns, or reasoning dashboards.
- Do not describe Russ to users as an AI, engine, or software platform.
- Conversation is the primary experience, not a secondary widget.
- Russ must acknowledge before interrogating.
- Russ should not overstate legal, tax, lending, construction, engineering, or investment expertise.
- A human handoff must preserve context so the user is not forced to repeat the story.
- The existing logo character is the foundation for Russ's visual identity.
- Mobile is a first-class experience.

## Out of scope

- Inventing new product features
- Rebranding Prater & Co.
- Rewriting approved conversation principles
- Selecting vendors without comparison
- Full production implementation
- Publishing or deploying changes

## Definition of done

The implementation specification is complete when:

1. Every deliverable above exists.
2. Recommendations cite current repository files.
3. Product choices are distinguished from engineering choices.
4. Open questions are limited to genuine Product Owner decisions.
5. A coder can estimate and begin the first vertical slice without redefining the experience.
# Work Order 001 - Repository-Level Russ Implementation Specification

## Document control

- **Status:** Finalized for Product Owner and Vision Architect review
- **Version:** 1.0
- **Last updated:** 2026-09-24
- **Owner:** Engineering Lead
- **Authorization:** GitHub Issue #9
- **Implementation authority:** Documentation and planning only. This work order does not authorize production implementation.

## Reviewers

- Product Owner
- Vision Architect
- Creative Director
- Quality Director

## Confirmed requirements

The following requirements are confirmed by Issue #9 and the current Prater HQ documents:

- Russ is the digital extension of Russell Prater's thinking and communication, not a generic AI assistant, decision engine, software platform, or autonomous real estate professional.
- The core product principle is **UNDERSTAND FIRST. ADVISE SECOND.**
- Conversation is the primary public experience.
- Internal reasoning, readiness scores, diagnostic labels, unknowns, decision profiles, private summaries, and roadmaps must not be exposed to visitors.
- Russ must acknowledge what the visitor shared before asking the next question or offering advice.
- A human handoff must preserve context so the visitor is not forced to repeat the story.
- Mobile, accessibility, privacy, security, and failure behavior are first-class requirements.
- Framework and vendor selection are Class C engineering decisions. Each selection requires a documented comparison; any option that changes a Class A product outcome or Class B experience outcome must be escalated before selection.
- WO-002 must remain a draft until explicitly approved by the Product Owner and Vision Architect.

## Source authority and approval status

Authority is applied in the order defined by Prater HQ. The following repository evidence was verified on `feature/prater-conversion-framework-v1`:

| Source | Repository path | Version or status found |
| --- | --- | --- |
| Prater HQ overview | `prater-hq/README.md` | Present; no explicit version or approval marker |
| Operating Charter | `prater-hq/00-executive-vision/OPERATING-CHARTER.md` | Present; no explicit version or approval marker |
| Engineering Lead charter | `prater-hq/roles/ENGINEERING-LEAD.md` | Present; initial assignment matches Issue #9 |
| Design direction | `docs/PRATER-DESIGN-SYSTEM.md` | Present; identifies a Version 1 outcome but has no explicit approval marker |
| Product Bible | Expected under `prater-hq/01-product-bible/` | Not present on the inspected branch |
| Approved Decision Records | Expected under `prater-hq/07-decision-log/` | Not present on the inspected branch |
| Russ Bible | Expected under `prater-hq/03-russ-bible/` | Not present on the inspected branch |
| Brand Bible | Expected under `prater-hq/02-brand-bible/` | Not present on the inspected branch |
| Design Bible | Expected under `prater-hq/04-design-bible/` | Not present on the inspected branch |
| Engineering Bible | Expected under `prater-hq/05-engineering-bible/` | Not present on the inspected branch |

The approved human success criteria and Russell Test below are authorized directly by the Product Owner's Issue #9 assignment. Missing higher-authority sources remain blocking for WO-002 implementation.

## Objective

Translate the approved Russ product vision into a repository-specific implementation specification mapped to the current `PraterCo/praterco-website` codebase.

This work order is for planning and architecture. It does not authorize a full rewrite, autonomous redesign, production implementation, publication, or deployment.

## Desired human outcome

The implementation specification must enable a qualified builder to deliver an experience in which the visitor:

- feels heard;
- feels understood;
- feels less overwhelmed;
- feels more confident; and
- feels comfortable continuing with Russell.

A qualified builder must also be able to determine, without guessing:

- what the public sees;
- what remains private;
- what information is remembered and for how long;
- how the conversation advances;
- how understanding is confirmed or corrected;
- how Russell receives the handoff; and
- how technical and human success are validated.

## Required repository review

Inspect and document the current:

- page structure;
- JavaScript architecture;
- stylesheets and reusable visual patterns;
- seller conversation flow;
- local storage or other state handling;
- hosting and build assumptions;
- analytics, forms, contact paths, and integrations;
- accessibility and test coverage; and
- public exposure of internal product concepts.

## Required deliverables

### 1. Current-state map

Include relevant files and responsibilities, reusable code, technical debt affecting Russ, and features that should be retained, revised, hidden, or retired.

### 2. Target architecture and engineering comparison

Compare at minimum:

- evolving the current static implementation;
- introducing a framework incrementally; and
- scaffolding a new application and migrating in stages.

Document evaluation criteria, material tradeoffs, security and privacy implications, migration and rollback paths, operational burden, and the recommendation. Apply the same comparison standard to hosting, model, analytics, scheduling, persistence, and other vendors when those choices enter scope. Do not select a framework or vendor merely because it is familiar.

### 3. Data model

Define entities and relationships for anonymous visitor/session, conversation, message, structured understanding, consent and contact details, human handoff, conversation summary, recommendation or next step, analytics event, feedback, and prompt/configuration version.

Identify sensitive information, purpose limitation, access boundaries, retention expectations, deletion requirements, and data that must never be persisted.

### 4. API contracts

Specify request, response, validation, authentication and authorization, failure behavior, privacy behavior, and idempotency where relevant for:

- create or resume conversation;
- send message;
- update structured understanding;
- confirm or correct understanding;
- generate summary;
- request human follow-up;
- submit feedback;
- retrieve Russell's private handoff view; and
- record analytics events.

### 5. Prompt and behavior architecture

Define distinct, versioned layers for product identity, Russell voice and behavior, conversation policy, knowledge boundaries, current structured understanding, conversation history, safety and escalation, tool instructions, and output schemas.

Include testing, observability, rollback, and a method for changing behavior without scattering prompt text throughout application code.

### 6. UI component inventory

Map the approved experience into reusable components for arrival and conversation entry, Russ presence, conversation shell, messages, composer, suggested replies, understanding confirmation, correction, recommendation, human handoff, consent/contact capture, resume state, loading, error, offline and fallback states, and Russell's private view.

For each component, identify states, accessibility requirements, mobile behavior, data exposure, and governing source.

### 7. Analytics event dictionary

Define experience viewed, conversation entry clicked, conversation started, first meaningful disclosure, understanding presented, understanding confirmed or corrected, recommendation presented, contact path viewed, call clicked, follow-up requested, conversation resumed or abandoned, error encountered, and feedback submitted.

Do not use internal readiness scores as a public product metric. Do not collect message content or personal information through analytics unless separately authorized with purpose, consent, retention, and access controls.

### 8. Acceptance-test plan

Include unit, integration, end-to-end, behavior evaluation, accessibility, responsive visual, security/privacy, analytics, and failure-recovery tests. Include a human review rubric tied to every approved human success criterion.

### 9. Phased implementation plan

Produce small, reviewable phases. The first vertical slice must exercise emotional acknowledgment, contextual memory, private reasoning, understanding confirmation and correction, useful direction, and natural continuation to Russell.

Each phase must state dependencies, likely files, risks, review gates, rollback approach, and definition of done.

## Mandatory release gates

No Russ experience may be released unless all technical acceptance criteria pass and the Product Owner confirms the human review evidence supports each criterion:

- visitor feels heard;
- visitor feels understood;
- visitor feels less overwhelmed;
- visitor feels more confident; and
- visitor feels comfortable continuing with Russell.

The final mandatory release gate is the **Russell Test**. Russell Prater must be able to review the representative experience and say:

> “Yes. That is how I would have handled that conversation.”

Failure of any human success criterion or the Russell Test blocks release even when automated checks pass.

## Product constraints

- Do not publicly display decision-readiness scores, diagnostic labels, internal unknowns, internal summaries, decision profiles, reasoning dashboards, roadmaps, or Work Order content.
- Do not describe Russ to visitors as an AI, engine, chatbot, or software platform.
- Conversation is the primary experience, not a secondary widget.
- Russ must acknowledge before interrogating or advising.
- Russ must not overstate legal, tax, lending, construction, engineering, or investment expertise.
- A human handoff must preserve approved context so the visitor is not forced to repeat the story.
- The existing logo character is the foundation for Russ's visual identity.
- Mobile is a first-class experience.

## Out of scope

- Inventing new product features or conversation principles
- Rebranding Prater & Co.
- Selecting a framework or vendor without a documented engineering comparison
- Production implementation, publication, deployment, or migration
- Merging branches or changing repository governance

## Product Owner questions - BLOCKING

These decisions must be resolved before WO-002 becomes executable:

1. What are the canonical paths, versions, and approval statuses of the Product Bible, applicable Decision Records, Russ Bible, Brand Bible, Design Bible, and Engineering Bible?
2. Is the seller journey approved as the first bounded implementation slice, or should another visitor journey be first?
3. What public first direction is approved for the initial seller slice, including the boundaries of advice Russ may offer before human review?
4. Which continuation path is required in the initial slice: call, schedule, send the conversation to Russell, or an approved combination?
5. What visitor information may be included in a handoff, what consent is required, and what retention or deletion rule applies?

## Product Owner questions - DEFERRED

These decisions do not need to block a non-production first slice unless its scope expands:

1. Which visitor journey follows the first approved slice?
2. Should a future release resume conversations across devices, and under what visitor identity model?
3. What final visual or animated expression of Russ should follow the current logo-character foundation?
4. What quantitative thresholds, if any, should supplement the approved qualitative human success criteria?
5. Which additional handoff channels should be evaluated after the initial approved continuation path?

## Definition of done

WO-001 is finalized when:

1. the required deliverables and decision boundaries are explicit;
2. repository findings, confirmed requirements, engineering recommendations, and Product Owner decisions are distinguishable;
3. open Product Owner questions are separated into BLOCKING and DEFERRED;
4. the five approved human success criteria and the Russell Test are mandatory release gates;
5. framework and vendor selections require documented engineering comparison;
6. WO-002 exists as a bounded draft; and
7. no WO-002 implementation begins before explicit approval and resolution of its blocking dependencies.

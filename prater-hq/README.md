# Prater HQ

Prater HQ is the source of truth for the Prater Framework and every product built from it.

## Operating principle

> Multitasking is inefficient. Delegation is not.

The Vision Team defines the product. Specialized builders execute it. No implementation role is permitted to silently redefine the product.

## Mission

Build digital experiences that make people feel understood before they feel sold to.

## Current product

**Russ** is the digital extension of Russell Prater: a trust-first conversational experience that helps people understand their real estate decisions and naturally continue with Russell when human involvement is valuable.

Russ is not presented as an AI product, software dashboard, decision engine, or generic chatbot.

## Source-of-truth hierarchy

When documents conflict, use this order:

1. Product Bible
2. Approved Decision Records
3. Russ Bible
4. Brand Bible
5. Design Bible
6. Engineering Bible
7. Roadmap and task documents
8. Existing implementation

Existing code does not override an approved product decision.

## HQ structure

- `00-executive-vision/` — mission, principles, outcomes, roadmap
- `01-product-bible/` — product definition and user journeys
- `02-brand-bible/` — Russell and Prater brand expression
- `03-russ-bible/` — conversational behavior and examples
- `04-design-bible/` — visual, interaction, accessibility, and UX rules
- `05-engineering-bible/` — architecture, schemas, APIs, prompts, analytics, and tests
- `06-research-library/` — evidence supporting important decisions
- `07-decision-log/` — approved product decisions and their reasoning
- `08-experiments/` — hypotheses, tests, and results
- `09-metrics/` — measurement definitions and product health
- `10-future-ideas/` — ideas not yet approved for implementation
- `roles/` — permanent role charters
- `work-orders/` — scoped implementation assignments

## Workflow

1. An idea enters `10-future-ideas`.
2. The Vision Team refines it and decides whether it belongs in the product.
3. An approved change updates the relevant Bible and receives a Decision Record when significant.
4. The Engineering Lead produces an implementation plan mapped to the repository.
5. A designer or developer receives a bounded work order.
6. QA tests the result against product acceptance criteria, not personal preference.
7. Learning is documented in metrics, experiments, and the decision record.

## Definition of delegated work

A delegated task must state:

- Desired human outcome
- In-scope surfaces
- Out-of-scope decisions
- Source-of-truth documents
- Deliverables
- Acceptance criteria
- Required review roles

A builder should not need to guess what the product is supposed to feel like.

## Current priority

Produce a repository-level implementation specification for the first complete Russ experience, then hand implementation to a coder/designer while the Vision Team continues product development.
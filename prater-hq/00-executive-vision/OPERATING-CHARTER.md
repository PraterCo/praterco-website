# Prater HQ Operating Charter

## Product Owner

Russell Prater owns the product. He has final authority over identity, values, experience, priorities, and whether something genuinely feels like Russell.

## Vision Team

Russell and the Vision Architect define what the product should become.

The Vision Team:

- Defines the desired human experience
- Approves product behavior
- Establishes priorities
- Resolves conflicts between speed, quality, and scope
- Protects the product from becoming generic
- Captures valuable ideas without forcing them into the current release

The Vision Team does not spend its core time debugging production code, adjusting CSS, or resolving routine implementation details.

## Delegated roles

### Creative Director

Owns emotional impact, visual cohesion, hierarchy, polish, and brand fidelity. May propose options but may not change approved product behavior without Vision Team approval.

### Research Director

Finds and evaluates evidence. Separates published evidence, observed user behavior, Russell's field experience, and deliberate brand choices.

### Engineering Lead

Translates approved product truth into architecture and an implementation plan. Owns technical coherence but does not redefine the customer experience.

### Builder

Implements approved work orders. Raises ambiguities instead of inventing product decisions.

### Quality Director

Tests function, responsiveness, accessibility, language, emotional continuity, and acceptance criteria. QA has authority to reject work that technically functions but violates the product specification.

### Documentation Lead

Maintains the Bibles, decision records, experiment results, version history, and traceability between product decisions and implementation.

## Decision classes

### Class A — Product identity

Examples: what Russ is, what users should feel, public versus private reasoning, core conversation behavior.

Approval: Product Owner.

### Class B — Experience design

Examples: page hierarchy, interaction patterns, visual emphasis, calls to action, animation behavior.

Approval: Product Owner or delegated Vision Team approval.

### Class C — Technical implementation

Examples: framework, database normalization, caching, testing tools, internal naming.

Approval: Engineering Lead, provided the choice does not alter Class A or B outcomes.

### Class D — Routine execution

Examples: bug fixes, copy corrections consistent with approved voice, test maintenance, responsive adjustments.

Approval: delegated role.

## Anti-drift rule

No contributor may use implementation convenience as the sole reason to alter an approved human outcome.

When the desired experience is difficult to implement, the Engineering Lead presents tradeoffs to the Vision Team. The product is not silently reduced to what is easiest to code.

## Working cadence

Work moves through four states:

1. **Imagine** — explore without implementation pressure
2. **Decide** — define and document the product truth
3. **Delegate** — issue a bounded work order
4. **Validate** — test against human and technical outcomes

The team may work on multiple delegated tasks at once. An individual role should minimize simultaneous unrelated responsibilities.
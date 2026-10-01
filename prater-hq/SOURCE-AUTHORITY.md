# Prater HQ Source Authority

**Status:** APPROVED  
**Date:** 2026-09-24  
**Owner:** Product Owner

## Authority hierarchy

When sources conflict, use this order:

1. Product Bible
2. Approved Decision Records
3. Russ Bible
4. Brand Bible
5. Design Bible
6. Engineering Bible
7. Roadmap and Work Orders
8. Existing implementation

## Canonical locations and current status

| Authority | Canonical location | Current status |
|---|---|---|
| Product Bible | `prater-hq/01-product-bible/PRODUCT-BIBLE.md` | APPROVED foundational v1 |
| Approved Decision Records | `prater-hq/07-decision-log/` | APPROVED records govern individually |
| Russ Bible | `prater-hq/03-russ-bible/` | PENDING Russ Behavior Lead |
| Brand Bible | `prater-hq/02-brand-bible/` | PENDING |
| Design Bible | `prater-hq/04-design-bible/` | PENDING |
| Engineering Bible | `prater-hq/05-engineering-bible/` | PENDING |
| Work Orders | `prater-hq/work-orders/` | Governed individually by status/authorization |
| Existing implementation | repository code | Evidence only; lowest authority |

A missing lower-level Bible does not authorize an agent to invent policy. Use higher-authority approved material and escalate only a decision that materially blocks the authorized scope.

Pending documents do not override the Product Bible or Approved Decision Records.

## Agent operating rule

Agents must distinguish:
- confirmed requirements;
- repository findings;
- recommendations;
- hypotheses;
- unresolved Product Owner decisions.

Existing code never becomes product truth merely because it already exists.

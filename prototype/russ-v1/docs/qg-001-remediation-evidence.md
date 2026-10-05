# QG-001 WO-002 Remediation Evidence

## Scope

This remediation starts from `fix/wo-002-final-creative-followup` at `b1c1b116ca8c8ff1387ec0d0e53f487186b58418`.

It is limited to:
- QG-001-F01 buy-before-sell natural-language variants
- QG-001-F02 natural-language Russell contact requests
- QG-001-F03 modal "may" versus month May disambiguation
- QG-001-F04 typographic punctuation normalization
- focused robustness of existing approved intents
- governance/lineage traceability identified by QG-001

No architecture rewrite, merge, deployment, or new product behavior is included.

## Verification

Required runtime:
- Node.js 24
- GitHub Actions run: `37360142436`
- Job: `111932412407`

Results:
- `npm run check`: PASS
- `npm test`: 78 PASS / 0 FAIL
- Canonical fixture IDs F-001 through F-032 remain represented in the passing test corpus.

Exact QG-001 reproductions passing:
- "Should I buy before I sell?"
- "I want Russell to contact me, but do not share this conversation."
- "I am behind on payments and may face foreclosure."
- "I don’t know."

## Dispositions

### QG-001-F01 — PASS
Buy-before-sell interpretation now recognizes bounded transaction-order phrasing, including buy-before-sell, sell-before-buy, buy-first/sell-first, another-home-before-current-sale, and equivalent order questions. Lending qualification language retains lending-boundary precedence.

### QG-001-F02 — PASS
Natural-language requests for Russell to contact, call, text, reach out, or get in touch route to immediate human continuation. Explicit refusal to share the conversation remains separate from contact intent and does not authorize context transfer.

### QG-001-F03 — PASS
Timeline extraction now requires temporal context for month names. Modal "may" does not create a May fact. Legitimate May references such as "in May," "this May," "By May," and "Maybe May or June" remain recognized.

### QG-001-F04 — PASS
Intent interpretation uses a normalized copy of user text for common smart apostrophes, smart quotes, and dash punctuation. Stored transcript content remains the original user text.

## Governance lineage

Approved DR-002 was located on `feature/prater-conversion-framework-v1` and copied unchanged into the active candidate lineage at its canonical path.

The Russ Behavior reference remains on `docs/russ-behavior-v1` and identifies itself as proposed canonical pending Product Owner/Vision Architect review; QG-001 does not silently promote its status.

The WO-002 revision on `docs/issue-9-revise-wo-002` still states implementation authority is none / awaiting approval. No verified authorization record or approval date was available in QG-001 scope to safely rewrite that historical document control. The inconsistency and safest correction are documented in `prater-hq/reviews/QG-001-GOVERNANCE-LINEAGE-NOTE.md`.

## Manual / review status

This remediation does not replace independent Behavior, Creative, or Quality review and does not declare Russell Test readiness.

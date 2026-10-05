# Current Release Status — WO-002 Private Russ Seller V1

**Status:** READY FOR LOCAL RUSSELL TEST  
**Updated:** 2026-10-05  
**Product Owner:** Russell Prater

## Current candidate

- Branch: `test/wo-002-final-delivery-pass`
- Base candidate: `fix/wo-002-qg-001-remediation`
- Verified application/test SHA: `ed2c81e3a0a0f5a6e1ef0c2f19c10ce794453902`
- Merge: NO
- Public deployment: NO

## Lean delivery model

Use the approved lean path:

**Product Owner / Vision Architect -> Engineering -> automated gate -> Vision review -> Russell Test**

Do not automatically recycle this candidate through Behavior, Creative, and Quality unless a material domain change or release-level concern requires it.

Every confirmed defect should become a permanent regression test where reasonably automatable.

## Final Engineering verification

Required-runtime verification used Node.js 24 and Chromium through Playwright in GitHub Actions.

Successful verification:

- GitHub Actions run: `37376955870`
- Job: `111988394199`
- `npm run check`: PASS
- Existing automated suite: **78 PASS / 0 FAIL**
- Canonical Behavior fixtures F-001 through F-032 remain represented in the passing corpus.
- Rendered browser acceptance: **11 PASS / 0 FAIL**

Browser acceptance covers:

- 320 CSS px viewport
- representative phone viewport
- representative tablet viewport
- representative desktop viewport
- no application-caused horizontal overflow in those layouts
- Chromium 200% page-scale rendered-state check
- keyboard-only critical journey and logical focus
- reduced-motion preference
- retention consent and handoff UI
- contact-only continuation without conversation transfer
- send/draft preservation during an in-flight successful request
- draft preservation and visible/focused recovery after a failed send
- Russell-side visible/focused recoverable failure

The browser acceptance pass did not expose a confirmed application defect. Earlier failing runs were acceptance-harness timing/tab-order assumptions and were corrected only in the acceptance test.

Browser acceptance source:
`prototype/russ-v1/browser/acceptance.mjs`

## Manual gates still outstanding

The following have **not** been claimed as tested:

- actual screen-reader behavior with assistive technology
- real mobile soft-keyboard behavior
- real-device safe-area behavior

The automated 200% check uses Chromium page scaling. It is useful rendered acceptance evidence but is not a substitute for assistive-technology testing.

## Private Russell Test access

The safest current access method is **localhost on Russell's own computer**.

It requires no vendor, DNS change, public endpoint, hosted credential, or public deployment. The server binds only to `127.0.0.1`.

### Exact access instructions

Prerequisite: Node.js 24 or newer and a local checkout of this repository.

From a terminal:

```sh
git fetch origin test/wo-002-final-delivery-pass
git switch test/wo-002-final-delivery-pass
cd prototype/russ-v1
npm run russell:test
```

The launcher prints:

- the local URL: `http://127.0.0.1:4177`
- a generated local participant email
- a generated local password

Open that URL in a browser on the **same computer** and sign in with the printed credentials.

The launcher:

- binds only to localhost
- creates fresh local encryption/session secrets
- creates a temporary local test database
- deletes the temporary test data on normal Ctrl+C shutdown
- does not modify the public Prater website
- does not create a remotely reachable service

Use personal/synthetic Russell Test scenarios only. Do not enter real client data.

Call/Text links use a safe placeholder by default. To test those links with a specific review number, restart with an explicitly supplied E.164 number:

```sh
RUSSELL_PHONE='+1XXXXXXXXXX' npm run russell:test
```

That phone-number choice is optional and is not required for the conversational Russell Test.

## Governing decisions

Use the project authority hierarchy in `prater-hq/SOURCE-AUTHORITY.md`.

DR-002 is present in the candidate lineage at:
`prater-hq/07-decision-log/DR-002-HUMAN-ACCESS-CONTACT-CONTINUITY-RETENTION.md`

The historical WO-002 revision on `docs/issue-9-revise-wo-002` still contains stale document-control language saying implementation authority is none / awaiting approval. Do not treat that historical status line as current authority. Do not rewrite it without a separately verified governance correction.

## Russell Test readiness

Engineering's automated and rendered/browser gates are PASS.

Russell can begin the personal Russell Test now using the localhost method above.

This status does **not** claim that the remaining screen-reader or real-mobile-keyboard manual gates have been completed, and it does not authorize merge or public deployment.

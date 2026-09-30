# WO-002 Creative Re-Review — Remediated Release Candidate

**Review date:** 2026-09-30  
**Role:** Prater Framework — Creative Director  
**Candidate branch:** `fix/wo-002-behavior-creative-remediation`  
**Candidate commit:** `46abbaaf1c45628864b0fa6f972f6113dbf8db17`  
**Compared review:** `prater-hq/reviews/WO-002-CREATIVE-REVIEW.md` at `fae8c5f`  
**Review type:** Authorized independent disposition review  
**Implementation changes:** None

## Executive decision

The release candidate is materially warmer, more useful, more private, and more recognizably Prater than the prior candidate. The participant/private API boundary is corrected; Russ has a visible approved presence; the management interface is quieter; consent is separated from context sharing; and the conversation now offers meaningful controls and state announcements.

Creative does **not** approve combined advancement to Quality and Russell Test review yet. Creative approves advancement to **Quality validation only**, with Russell Test still blocked. One prior P0 is only partially resolved, several P1 findings remain partial, and the repository still lacks rendered/mobile/assistive-technology evidence required to verify the candidate.

The candidate should not be treated as Creative-approved for Russell Test until the remaining P0 is closed, the listening and continuation defects below are remediated, and Quality records passing evidence for the manual accessibility and responsive gates.

## Authority and evidence reviewed

Controlling and reference sources:

- Permanent Prater Creative Director charter
- Prater Product Bible
- `DR-001`
- `WO-002` and Product Owner decisions
- Russ Behavior Bible v1 reference
- Prater design system
- Previous `WO-002-CREATIVE-REVIEW.md`

Release-candidate implementation and evidence:

- `public/index.html`
- `public/styles.css`
- `public/app.js`
- `src/app.js`
- `src/provider.js`
- `src/store.js`
- `src/crypto.js`
- `scripts/backup.js`
- `test/app.test.js`
- `test/provider.test.js`
- `test/accessibility.test.js`
- `docs/review-evidence.md`
- `README.md`
- candidate tree and commit comparison
- approved Prater logo asset path and static route

Independent verification:

- `node --test`: 49/49 passed
- `npm run check`: passed
- Direct provider probes with ordinary homeowner language and Russ-supplied quick replies
- Source-level inspection of participant and Russell paths, focus behavior, handoff states, responsive CSS, reduced-motion handling, and participant API projection
- No runnable browser binary was available. Rendered 320px, 200% text, keyboard-only, screen-reader, soft-keyboard, and reduced-motion behavior remain unverified.

## P0 disposition

### CR-P0-01 — Visible failure and recovery

**Disposition: PARTIALLY RESOLVED — P0 remains open**

**Observed evidence:** Participant-side failures now present a persistent recovery panel with a focusable heading, Retry and Back actions, service/auth distinction, and draft restoration after send failure. Conversation list, load, message, understanding, handoff, and deletion paths generally route to visible recovery.

The same `showRecovery()` mechanism is called for Russell-side handoff list/detail failures, but its recovery panel is nested inside the hidden participant view. When the Russell view is active, those failures remain invisible. No browser test exercises visible retry, focus restoration, or successful recovery.

**Visitor impact:** A failure during immediate human continuation can still leave Russell without visible explanation or recovery. That jeopardizes a trust-critical handoff and violates the approved requirement for visible, recoverable failure states.

**Required action:** Place recovery in the active view or provide a view-specific recovery surface for Russell. Verify failure, Retry, Back, preserved state, and focus restoration in a real browser for both participant and Russell paths.

**Classification:** Approved requirement; accessibility concern.

### CR-P0-02 — Participant/private API boundary

**Disposition: RESOLVED**

**Observed evidence:** Participant conversation payloads now expose messages as `{role, content}` and pending understanding as `{text, needsResponse}`. Internal message kind, correction provenance, sequence/timestamps, understanding identifiers/source sequence, provider state, and semantic working state are withheld. Protected Russell handoff retains ordered corrections and provenance server-side, as required. Tests assert the participant response contract.

**Visitor impact:** Internal classifications and reasoning machinery are no longer exposed through the participant API.

**Classification:** Approved privacy and trust requirement.

## P1 disposition

### CR-P1-01 — Context-responsive conversation

**Disposition: PARTIALLY RESOLVED**

The provider now recognizes corrections, pauses, uncertainty, frustration, topic changes, sensitivity, human requests, and several practical domains. This is a meaningful improvement over the fixed three-question sequence.

However, the language model is still a narrow deterministic phrase matcher. Several quick replies authored by the interface itself cause Russ to repeat the question just answered, including “A move may be coming,” “The home no longer fits,” “Timing is open,” “Financial tradeoffs,” and “Whether to move at all.” Ordinary homeowner phrasing can also fall through to the opening question. General direct questions such as “Should I sell?” are detected but are not prioritized as direct questions. The provider records asked topics but does not use that state to prevent repetition.

**Impact:** Russ can appear not to listen immediately after offering the visitor an answer choice. That is a high-salience trust and emotional-quality failure.

**Required action:** Ensure every offered quick reply is semantically understood, use prior asked-topic state to prevent repeated questions, and honor the direct-answer priority for general questions. Add multi-turn tests for these paths.

### CR-P1-02 — Synthesis and usefulness

**Disposition: PARTIALLY RESOLVED**

Confirmed understanding is now synthesized from semantic state rather than concatenating recent messages. Direction varies for sensitivity, condition, tradeoff, and timing, and recognized scenarios can produce a useful, confirmable reflection.

Usefulness is not yet reliable outside the recognized phrase vocabulary. When input falls through, Russ can repeat an already answered question or produce generic direction rather than a coherent synthesis.

**Impact:** Some homeowners will feel heard; others using equally ordinary language may feel ignored or processed.

**Required action:** Broaden and test ordinary-language coverage, eliminate non-listening fallbacks, and validate representative multi-turn conversations with Russell/human review.

### CR-P1-03 — Russ visual presence and software/dashboard feeling

**Disposition: RESOLVED**

The approved Prater logo character is now visible at sign-in, in the participant rail, in the welcome state, and beside the active conversation. Conversation management is collapsed below the exchange. The participant experience no longer presents scores, stages, profiles, roadmaps, or persistent management chrome.

The authenticated prototype necessarily remains product-like, but conversation is now visually primary and Russ is clearly present.

**Classification:** Approved brand direction.

### CR-P1-04 — Visitor control and immediate human continuation

**Disposition: PARTIALLY RESOLVED**

Skip, Pause, Change topic, and I don’t know are visible during conversation. Resume choices include Continue, Correct, Change topic, and New conversation. Direct human language opens the handoff, and Call, Text, Contact, and context-sharing review are available once a conversation exists.

Two material defects remain:

1. The page promises visitors they can “go directly to Russell at any time,” but all human actions are hidden until the visitor accepts 90-day development retention and creates a conversation.
2. A contact-only request with `shareContext:false` still moves the conversation to `handoff-ready`. On reload it is mapped to `shared`, the composer is hidden, and another handoff is rejected, even though the success message says the conversation was not shared.

There is also no true Back/revise-earlier-answer control during an active exchange; correction is possible only through a new free-text message.

**Impact:** The pre-consent promise is not honored, and a low-pressure contact request unexpectedly terminates the conversational path. Both make continuation feel more funnel-like than visitor-controlled.

**Required action:** Make the human path genuinely available before development-retention consent or revise the approved flow/copy through a Product Owner decision. Preserve conversation after contact-only/no-context requests unless the Product Owner explicitly decides that contact is terminal. Add integration coverage.

### CR-P1-05 — Dynamic focus and state announcements

**Disposition: PARTIALLY RESOLVED**

Focusable dynamic headings, programmatic focus for recovery/resume/understanding/handoff/detail, `aria-busy`, status/error separation, and a dedicated polite atomic announcer are implemented. The transcript log is no longer itself a competing live region.

Actual assistive-technology behavior remains untested. After successful handoff, focus remains on the now-disabled Continue button instead of moving to the success confirmation. Russell-side recovery is hidden as described in CR-P0-01.

**Impact:** Source-level semantics are substantially improved, but focus can still become stranded at a decisive moment and announcement quality is not proven.

**Required action:** Move focus to the success confirmation, verify active focus across all dynamic state changes, and complete screen-reader validation.

### CR-P1-06 — Handoff and consent experience

**Disposition: PARTIALLY RESOLVED**

The experience now welcomes with Russ before explaining retention. Consent is explicit, scoped, and bounded. Handoff names Russell, explains the exact context package, preserves ordered conversation and corrections, separates Call/Text from context sharing, and leaves context sharing unchecked. Contact-only/no-context submission exists.

Remaining concerns are the pre-consent human-access contradiction and the terminal contact-only state described above. Development retention is still the first required action before either conversation or in-product human continuation.

**Impact:** The handoff itself feels calmer and more consensual, but entry remains policy-forward and a no-context continuation can still behave like a terminal funnel.

**Required action:** Resolve the access contradiction and contact-only state behavior. Product Owner direction is still required on whether a no-retention conversational mode should exist.

### CR-P1-07 — Browser, mobile, and accessibility evidence

**Disposition: UNRESOLVED**

The source is directionally stronger: responsive stacking, overflow wrapping, 44px targets, visible focus, safe-area padding, native controls, and reduced-motion overrides are present. The accessibility tests are source-pattern checks, not rendered or assistive-technology tests. The repository evidence explicitly records that no browser binary was available.

There is still no actual evidence for:

- 320px portrait and landscape behavior
- 200% text resizing
- keyboard-only completion and focus order
- screen-reader announcement quality
- soft-keyboard and long-transcript behavior
- safe-area behavior
- rendered reduced-motion behavior
- visible browser-level failure and recovery

**Impact:** Creative cannot responsibly approve the mobile and accessibility experience from CSS and regex assertions alone.

**Required action:** Quality must execute and record the complete manual/browser matrix before Russell Test.

## New regressions and newly exposed defects

1. **P1 — Russ-supplied quick replies can trigger an immediate repeated question.** This is a listening failure not covered by the passing tests.
2. **P1 — General direct questions are detected but still routed into discovery.** This conflicts with the Russ direct-answer priority.
3. **P1 — Contact-only/no-context continuation locks the conversation as shared after reload.** The behavior contradicts its own success copy.
4. **P1 — “At any time” human access is false before consent/start.** The visual promise and interactive state disagree.
5. **P1 — In-flight draft loss risk.** The textarea remains editable while sending; text entered during the request is cleared when the earlier request succeeds.
6. **P1 accessibility — Successful handoff leaves focus on a disabled control.**
7. **P2 responsive risk — At widths at or below 540px, three stacked human actions appear above the active conversation and may displace the primary exchange from the first viewport.** This needs rendered validation before reprioritization.

## Remaining P2 polish

- **Typography — UNRESOLVED:** Inter is declared but not loaded or supplied; final typography remains deferred.
- **Imagery — PARTIALLY RESOLVED:** The approved Russ character is now prominent; authentic Russell/place/relationship imagery remains absent.
- **Quick replies — RESOLVED:** 44px minimum targets and clear draft insertion/focus behavior are implemented.
- **Conversation management — RESOLVED:** It is collapsed and removed from the emotional rail.
- **Live-region semantics — SUBSTANTIALLY RESOLVED IN SOURCE:** Assistive-technology validation remains part of CR-P1-07.
- **Delete confirmation — UNRESOLVED:** Native `confirm()` remains visually and emotionally abrupt.
- **Mobile composer — PARTIALLY RESOLVED:** Safe-area support was added; sticky/soft-keyboard/long-transcript behavior remains unvalidated.
- **Software language — REFINEMENT:** Account role labels such as “participant” and technical copy such as “No conversation transfer” still expose an internal/product frame.
- **Mobile hierarchy — VALIDATION NEEDED:** Stacked human actions may overpower the conversation on a 320px viewport.

## Trust and emotional-pacing assessment

The candidate is substantially better. Russ has a warm, persistent visual presence. The free-text exchange is primary, management is quieter, consent is clearer, and recognized scenarios support pause, correction, topic change, direct human help, confirmation, and bounded practical direction. The participant API no longer exposes internal reasoning.

The remaining failures occur at precisely the moments when trust is most fragile. Repeating a question after the visitor selects Russ’s own suggested answer makes Russ look inattentive. Hiding human access until after retention consent makes “at any time” feel untrue. Ending the conversation after a contact-only request makes an optional handoff feel like a funnel. Invisible Russell-side recovery threatens the immediate-human promise. The experience is closer to “heard and helped,” but not consistent enough for Russell Test.

## Mobile and accessibility concerns

Source-level improvements are credible, but rendered evidence is absent. Quality must verify 320px portrait/landscape, 200% text, keyboard-only completion, visible focus, skip link, all dynamic focus destinations, screen-reader announcements, reduced motion, soft keyboard, safe areas, long transcripts, handoff accept/decline, recovery, and deletion. Particular attention should go to the hidden Russell recovery panel, disabled-control focus after handoff, stacked mobile human actions, and draft behavior during in-flight sends.

## Product Owner questions

1. Must Call/Text/Contact be available before development-retention consent, as “go directly to Russell at any time” currently promises, or should the promise and approved flow be changed?
2. Should a contact-only request without context sharing preserve the active Russ conversation? Creative recommends yes; a terminal transition requires explicit Product Owner direction.
3. Does the approved experience require a no-retention conversational option, or is retention consent an intentional prerequisite for all AI conversation?
4. Is authentic Russell/place/relationship imagery required before public-facing release, or is the approved Russ character sufficient for this phase?

## Creative approval status

- **Advancement to Quality validation:** APPROVED, specifically to execute the unresolved browser, accessibility, responsive, recovery, and interaction evidence matrix and verify remediations.
- **Advancement to Russell Test review:** NOT APPROVED.
- **Combined Quality and Russell Test advancement:** NOT APPROVED.
- **Production merge/deploy:** Not reviewed and not authorized.

Russell Test can be reconsidered after CR-P0-01 is fully resolved; the repeated-question, direct-answer, contact-only lock, human-access contradiction, in-flight draft, and handoff-focus defects are corrected; and Quality supplies passing 320px, 200% text, keyboard, screen-reader, reduced-motion, soft-keyboard, and visible recovery evidence.

## Disposition summary

| Prior finding | Disposition |
|---|---|
| CR-P0-01 visible failure/recovery | PARTIALLY RESOLVED |
| CR-P0-02 participant/private API boundary | RESOLVED |
| CR-P1-01 context-responsive conversation | PARTIALLY RESOLVED |
| CR-P1-02 synthesis/usefulness | PARTIALLY RESOLVED |
| CR-P1-03 Russ presence/software feeling | RESOLVED |
| CR-P1-04 visitor control/human continuation | PARTIALLY RESOLVED |
| CR-P1-05 focus/state announcements | PARTIALLY RESOLVED |
| CR-P1-06 handoff/consent | PARTIALLY RESOLVED |
| CR-P1-07 accessibility/mobile evidence | UNRESOLVED |

# WO-002 Review Evidence Record

## Automated evidence

Run `npm test` and `npm run check` from `prototype/russ-v1`. The suite uses synthetic identities and conversations and covers:

- acknowledgment ordering, single-question behavior, direct bounded answers, and private-boundary vocabulary;
- authentication, CSRF, role separation, and cross-participant isolation;
- development consent and separate handoff consent;
- complete seller flow, confirmation, correction precedence, persistence, and resume;
- ordered handoff context, summary linkage, and Russell-only access;
- AES-GCM ciphertext verification, 90-day expiry mechanics, and early deletion; and
- labels, live regions, visible focus rules, reduced motion, and 320 CSS pixel layout rules.

## Human review checklist

Record reviewer, date, commit, scenario version, outcome, defects, and rerun evidence for each item.

- Keyboard-only: sign-in, start, free text, quick reply, confirm, correct, all continuation choices, decline sharing via call/text, delete, logout, Russell handoff review.
- Focus: visible focus at every step; focus moves to the next useful control; no focus loss after errors or state changes.
- Screen reader: labels and errors are associated; new Russ messages and status changes are announced once; conversation history is not repeatedly re-read.
- Responsive: complete flow at 320 CSS pixels and common mobile/desktop sizes with no overlap, clipping, or horizontal scrolling.
- Zoom: complete flow at 200 percent text enlargement.
- Motion: reduced-motion setting suppresses message entrance movement.
- Failure recovery: offline/unavailable/retry states preserve unsent text and state what happened without claiming a send succeeded.
- Privacy: browser storage, URLs, logs, and rendered source contain no retained raw content, contact details, hidden policy, or private Prater HQ material.

## Russell Test scenarios

- Early exploration with no fixed timeline.
- Participant correction to Russ's understanding.
- Direct property-value question receiving a useful bounded answer.
- Tax or professional-boundary question with a useful next step.
- Resume after a browser-session break.
- Call, Text, and Contact Me continuation paths.
- Affirmative context-sharing consent and declined sharing.
- Persistence or handoff failure with recovery.

The prototype is ready to enter Creative, Russ Behavior, Quality, and Russell Test review only after automated checks pass. It is not approved for public deployment. Final review status must be recorded by the responsible reviewers; Engineering does not substitute its judgment for those gates.

# WO-002 Threat and Privacy Review

## Boundaries and assets

The browser is untrusted. The Node service is the authorization and validation boundary. SQLite and the encryption key are separate assets; neither is sufficient alone to recover protected content. No external provider receives conversation or contact data.

Protected assets include raw messages, corrections, structured understanding, consent evidence, contact details, handoff packages, summaries, credentials, sessions, and encryption keys.

## Threats and controls

| Threat | Control | Residual risk |
| --- | --- | --- |
| Broken access control / cross-user read | Default-deny session checks, conversation-owner query predicates, explicit role sets, integration tests | Application-local roles are not a production identity system |
| Token theft / fixation | 256-bit opaque tokens, keyed hashes at rest, `HttpOnly`, `SameSite=Strict`, bounded expiry, logout; `Secure` required outside localhost | Local device compromise remains possible |
| CSRF | Per-session CSRF token on every authenticated state change; strict same-site cookie; origin check on login | XSS would undermine same-origin controls |
| XSS and injection | CSP, text-only DOM rendering, no HTML interpolation, prepared SQL, input length/type allowlists | Future rich content must receive a new review |
| Content leakage | AES-256-GCM fields, no raw-content logs/analytics/URLs, generic failures, no client durable storage, content-free audit records | Process memory contains plaintext while serving an authorized request |
| Login abuse | Individual accounts, scrypt, generic credential error, per-address throttling | In-memory throttle resets with the process; managed identity and MFA are required before remote hosting |
| Prompt injection / model misuse | No external model; deterministic bounded provider treats input as data and exposes no tools | A future model integration requires structured output validation and a new threat review |
| Malicious files or links | Attachments and rendered links are unsupported; input is displayed as text | Link support remains out of scope |
| Unauthorized handoff | Separate versioned affirmative consent, confirmation prerequisite, protected Russell role, audited read | Local Russell credential compromise remains possible |
| Indefinite retention | Maximum 90-day expiry assigned at creation, startup and daily cleanup, early deletion, cascading foreign keys, tests | Cleanup pauses while service is stopped; startup cleanup addresses restart |
| Backup persistence | No automatic backup; authorized online backup command, restrictive permissions, integrity validation, and a 7-day cleanup window | Hosted backup restore drills and deletion propagation remain required before hosted/public use |
| Accidental public exposure | Separate directory/app, loopback default bind, no public-site edits, authentication, noindex/robots, no deployment configuration | Operator could override bind settings; remote hosting is explicitly unauthorized |

## Privacy review

- Development retention and handoff sharing are distinct consent events.
- Declining context sharing does not prevent independent call or text actions.
- Contact data is requested only for Contact Me and is encrypted separately.
- Russell receives the ordered transcript only after consent; reviewers do not receive retained content by default.
- The participant can delete early. Deletion cascades through messages, understanding, contact, consent-linked handoff, and summary.
- Automated tests use synthetic values only.

## Public-launch blockers

Managed identity and MFA, TLS termination, production secret management, approved hosting/subprocessors, automated encrypted backup/restore with bounded expiry, production monitoring without content leakage, public retention and data-rights policy, external model/provider review, and incident-response approval remain required.

# Russ V1 Private Seller Prototype

This isolated Node.js 24 application implements the bounded, private/non-public WO-002 seller conversation slice. It does not replace or modify the production homepage and is not approved for public traffic.

Behavior version `seller-reference-2.0.0` follows the Russ Bible next-move precedence. It selects an answer, professional boundary, recovery, human continuation, direction, confirmation, or one useful question from the visitor's meaning rather than advancing by message count.

## Local private review

1. Use Node.js 24 or newer.
2. From `prototype/russ-v1`, generate two secrets:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   ```

3. Set the required environment variables. Use individual test-only accounts and passwords of at least 12 characters. Do not use real client data.

   ```sh
   export RUSS_ENCRYPTION_KEY='<first generated value>'
   export RUSS_SESSION_SECRET='<second generated value>'
   export RUSS_LOCAL_HTTP=true
   export RUSS_ACCOUNTS='[{"email":"participant@example.test","password":"synthetic-participant-pass","role":"participant"},{"email":"russell@example.test","password":"synthetic-russell-pass","role":"russell"},{"email":"reviewer@example.test","password":"synthetic-reviewer-pass","role":"reviewer"},{"email":"admin@example.test","password":"synthetic-admin-pass","role":"administrator"}]'
   export RUSSELL_PHONE='<review-only phone in E.164 format>'
   ```

4. Start the application:

   ```sh
   npm start
   ```

5. Open `http://127.0.0.1:4177` on the same machine. Do not bind the prototype to a public interface. `RUSS_LOCAL_HTTP=true` is permitted only for localhost review; any remotely reachable environment requires a separate security and deployment review with TLS and secure cookies.

## Checks

```sh
npm run check
npm test
```

All automated fixtures are synthetic. Tests do not ingest retained conversations.

## Roles

- `participant`: starts, resumes, corrects, hands off, and deletes only their own conversation.
- `russell`: sees only handoffs for which a participant gave separate affirmative context-sharing consent.
- `reviewer`: receives a purpose-bound review screen. Retained participant content is not exposed by default.
- `administrator`: may run retention expiry and perform protected operational work. The prototype UI does not expose broad exports.

## Storage and lifecycle

- The authoritative database is `data/russ-private.sqlite`, ignored by source control.
- Raw messages, structured understanding, development consent, handoff packages, contact details, and summaries are encrypted with AES-256-GCM and unique nonces.
- Passwords use scrypt with individual salts. Session cookies contain opaque random identifiers; only keyed hashes are stored.
- Conversations expire no later than 90 days. Expiry runs at startup and once every 24 hours while the process is running. Participants can delete earlier.
- Audit events record access and lifecycle metadata without copying conversation or contact content.
- Private working understanding stores meaning categories, current facts, priorities, tradeoffs, uncertainty, sensitivity, corrections, and staleness metadata as encrypted server-side state. Participant responses never expose those fields, internal modes, source sequencing, or correction provenance.
- No automatic backup is enabled. An authorized administrator may run `npm run backup`; it uses SQLite's online backup API, restricts the file to the local account, verifies database integrity, and deletes backups older than the configured seven-day window. Backup files retain encrypted content but must still remain access-limited. Hosted backup/restore operations require a separate review.

## Incident, rollback, and shutdown

1. Stop the process immediately and remove network access if unauthorized access or data disclosure is suspected.
2. Preserve content-free audit metadata only when needed for investigation; do not copy raw conversations into tickets or chat.
3. Rotate `RUSS_SESSION_SECRET` to invalidate sessions and rotate credentials. If the encryption key may be exposed, quarantine the encrypted database and treat it as a data incident.
4. To shut down the prototype, stop the process and securely remove the `data/` directory after any authorized review evidence has been recorded without raw content.
5. Roll back code by starting the prior reviewed commit against a disposable synthetic database. Schema rollback against retained participant data is not supported in this prototype.

## Deliberate limits

- The conversation provider is deterministic and bounded; it is not an external AI model and does not demonstrate open-domain behavior.
- Call and text use device `tel:` and `sms:` actions. Contact requests remain in the protected Russell view; there is no external notification vendor.
- Cross-device identity and resume, scheduling, public deployment, and production retention policy are out of scope.
- Playwright is present in the engineering environment, but no browser binary is installed and approved network access blocks downloading one. Source-level accessibility checks and HTTP interaction tests run automatically; manual keyboard, screen reader, 200% zoom, mobile soft-keyboard, and rendered 320 CSS pixel review remain required before the Quality gate can pass.

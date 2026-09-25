# WO-002 Data Inventory and Client Benefit Map

The prototype rejects unmapped fields at its HTTP boundary. Raw content is not sent to analytics, logs, URLs, page metadata, or third parties.

| Field group | Client benefit or responsible-improvement purpose | Required | Access | Storage and protection | Expiry / transfer |
| --- | --- | --- | --- | --- | --- |
| Account email, role, password salt/hash, active state | Individual accountability and protection of private conversations | Yes | Authentication and authorized administration | SQLite; scrypt hash for password | Account lifecycle; never enters handoff or analytics |
| Opaque session hash, CSRF token, expiry | Safe continuity across browser sessions and request protection | Yes | Owning session and server | SQLite; cookie holds opaque token only | At most 7 days; never enters handoff |
| Conversation identifier, owner, lifecycle, provider version, timestamps, expiry | Resume, sequence integrity, version traceability, and bounded retention | Yes | Owner; protected operational roles as authorized | SQLite metadata; pseudonymous identifiers | At most 90 days; selected metadata anchors handoff |
| Development-retention consent | Demonstrate authorized retention and its purpose | Yes to start retained conversation | Owner and authorized audit | AES-256-GCM encrypted JSON | Deleted with conversation; never analytics |
| Ordered participant and Russ messages | Avoid repetition, maintain nuance, support useful direction and Russell continuity | Yes | Owner; Russell only after handoff consent | AES-256-GCM per record | At most 90 days; enters handoff only with consent |
| Correction relationship | Prevent superseded context from silently controlling later understanding | Optional when correcting | Same as messages | Message metadata plus encrypted corrected text | Same as conversation; enters handoff with transcript |
| Structured understanding and confirmation state | Let participant verify what Russ understood and improve relevance | Derived and correctable | Owner; Russell after consent | AES-256-GCM content; state metadata | Same as conversation; enters consented handoff |
| Handoff consent version, purpose, recipient, timestamp | Prove a separate informed choice before context transfer | Required for transfer | Owner, Russell, audit | Consent inside encrypted package; minimal metadata outside | Deleted with conversation/handoff |
| Continuation channel | Carry out the participant's selected next step | Required for handoff | Owner and Russell | SQLite metadata | Deleted with handoff; no analytics |
| Contact name and phone or email | Enable Russell to respond when requested | Required only for Contact Me | Owner and Russell | Separately encrypted AES-256-GCM field | Deleted with handoff; no logs or analytics |
| Supplemental summary and source sequence | Help Russell orient without replacing original nuance | Derived for handoff | Russell after consent | Encrypted handoff package | Deleted with handoff; linked to source sequence |
| Audit action, actor, subject type/id, outcome, timestamp | Detect misuse and demonstrate access/consent/deletion controls | Yes for protected actions | Authorized operations | Content-free SQLite metadata | Prototype operational lifecycle; no raw content |
| Evaluation scenario/config versions, structured rubric, outcome, defect reference | Record human-success and Russell Test evidence without duplicating raw conversations | Required for formal review evidence | Reviewer and administrator | Rubric encrypted; version/outcome metadata in SQLite | Review lifecycle; no automatic test data or handoff transfer |

The deterministic provider derives only the minimum recent context needed for acknowledgment, understanding, and bounded direction. It does not create a readiness score, confidence value, diagnostic label, decision profile, unknown list, or hidden chain-of-thought record.

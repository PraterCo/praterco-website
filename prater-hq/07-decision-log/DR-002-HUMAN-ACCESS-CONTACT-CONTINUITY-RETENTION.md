# DR-002 — Human Access, Contact Continuity, and Private-Phase Retention

**Status:** APPROVED  
**Decision date:** 2026-09-30  
**Product Owner:** Russell Prater  
**Applies to:** Prater Framework / Russ private seller V1 and future public-client design direction

## Decisions

1. **Human access before retention consent**
   - Call Russell, Text Russell, and Ask Russell to contact me must be available without requiring development-retention consent.
   - A visitor must not have to agree to storage of a Russ conversation merely to reach Russell.
   - Conversation-context sharing remains separately consented.

2. **Contact-only requests preserve the Russ conversation**
   - A contact-only request without context sharing is not terminal.
   - The active Russ conversation remains available after the request.
   - Requesting human contact does not imply consent to transfer conversation context.

3. **Private-phase visual scope**
   - The approved Russ character is sufficient for the private V1 phase.
   - Authentic Russell/place/relationship imagery is not a prerequisite for private testing or the Russell Test.
   - Public-release imagery can be decided later.

4. **Retention consent and conversation access**
   - Product direction for the eventual client experience is that a person should be able to talk with Russ without making retention the price of access.
   - A non-retained/session-only conversation mode is therefore an approved future public-client direction.
   - For the current authorized private development prototype, 90-day development-retention consent may remain a prerequisite for the Russ conversation because the prototype is being used for controlled development/testing and learning.
   - This private-development exception does not establish the eventual public retention policy.
   - Final public retention duration, deletion/de-identification behavior, visitor controls, and related policy remain public-launch gates.

## Consequences

- Human continuation controls must be available independently of private-development retention consent.
- Contact-only/no-context handoff must not transition the conversation into a terminal/shared state.
- Engineering should not add public no-retention/session-only mode during the current narrow remediation unless separately authorized.
- Quality should verify human-access independence, contact-only continuity, consent separation, and the private-phase retention behavior.
- No production merge or deployment is authorized by this record.

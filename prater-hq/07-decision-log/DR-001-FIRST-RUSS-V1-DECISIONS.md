# DR-001 — First Russ V1 Product Decisions

**Status:** APPROVED  
**Date:** 2026-09-24  
**Owner:** Russell Prater, Product Owner

## Context

WO-001 and the Creative Director audit surfaced Product Owner decisions required before the first bounded implementation can proceed.

## Decisions

### 1. First journey
APPROVED: Homeowners considering selling a property are the first bounded Russ journey.

### 2. Release exposure
APPROVED: The first implementation is private/non-public. Public exposure requires the applicable technical, Creative, Quality, human-success, and Russell Test gates.

### 3. Initial continuation
APPROVED V1 options:
- Call Russell
- Text Russell
- Ask Russell to contact me

Scheduling is deferred.

### 4. Handoff context
APPROVED: Full conversation context may be preserved and provided to Russell when the visitor chooses to continue with him. A compressed summary alone is not sufficient as the required default because wording, sequence, corrections, and nuance may be important to accurate understanding.

Before handoff, the visitor must be clearly informed that conversation context will be shared with Russell and must affirmatively consent.

A concise summary may be generated for Russell's convenience but does not replace the underlying conversation.

### 5. Conversation retention
APPROVED DIRECTION: Conversation memory will not be session-only.

During private development/testing, authorized conversations may be retained to support visitor continuity, review Russ behavior, perform the Russell Test, diagnose failures, improve conversation quality, evaluate product performance, and responsibly develop the Prater Framework.

Before public launch, Engineering must implement an approved retention period plus automated rolling deletion or de-identification. Indefinite raw-conversation storage is not approved.

De-identified learnings may be retained where appropriate after raw conversation deletion.

### 6. Client Benefit Principle
APPROVED as a governing Product Bible principle.

Information should be requested, remembered, used, or retained only for a legitimate purpose that benefits the client experience or responsibly improves that experience.

The governing test is:

> Does using this information help us serve the client better, and would its use be reasonable and understandable from the client's perspective?

Client trust, privacy, usefulness, and quality take priority over data collection, engagement, lead capture, or conversion optimization when those interests conflict.

## Deferred decisions

- Exact public-launch retention duration
- Exact deletion/de-identification cadence and exceptions
- Cross-device identity/resume model
- Scheduling integration
- Exact final Russ animation/placement
- Final palette/typography/motion specifications

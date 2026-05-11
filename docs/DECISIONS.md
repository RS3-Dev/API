# Decision Log

This document records project decisions as they are made.

## 2026-05-10: Project Name

Decision: The project will be called RS3.Dev API.

Reasoning: The name clearly identifies the RuneScape 3 developer focus and frames the project as public API infrastructure.

## 2026-05-10: RuneScape 3 Only

Decision: The project will focus exclusively on RuneScape 3.

Reasoning: RuneScape 3 player data, public data sources, and ecosystem needs are the target problem. Old School RuneScape support is out of scope.

## 2026-05-10: API Layer First

Decision: The repository will begin with documentation and API-layer planning before worker implementation.

Reasoning: The API contract and project boundaries should be understood before large-scale ingestion, scraping, storage, and worker systems are built.

## 2026-05-10: Public Source, Operated Infrastructure

Decision: The source code will be publicly available for contribution, while the hosted service will run on the development team's infrastructure.

Reasoning: Public source allows community review and contribution while still keeping operational responsibility centralized.

## 2026-05-10: Identity Remains Unresolved

Decision: Stable player identity and username changes are documented as unresolved problems.

Reasoning: RuneScape usernames can change, and no stable public account identifier is currently assumed. The project should not prematurely define identity guarantees before the design is validated.

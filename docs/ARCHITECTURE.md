# Architecture

## Overview

RS3.Dev API is planned as a public API layer backed by shared RuneScape 3 player data infrastructure.

The API layer will be developed first. Supporting systems for snapshot collection, storage, background workers, scraping, queue processing, and plugin ingestion will be designed as the platform matures.

```text
RuneScape 3 public data sources
        |
        v
Snapshot and ingestion systems
        |
        v
Storage and reconstruction layer
        |
        v
RS3.Dev API
        |
        v
Third-party RuneScape 3 applications
```

## API Layer

The API layer is expected to be a Bun and Hono application.

Responsibilities:

- Expose RuneScape 3 player data through documented HTTP endpoints.
- Apply API key checks, rate limits, or other access controls as required.
- Return consistent response shapes once the public contract is defined.
- Communicate data freshness and known gaps clearly.
- Avoid embedding worker-specific orchestration logic directly in request handlers.

The API contract is not defined yet. Endpoint design will be documented separately when the project is ready to propose stable resources.

## Snapshot Collection

Snapshot collection is expected to be handled outside the request path.

Future responsibilities may include:

- Fetching current player stats from available public sources.
- Capturing adventure log changes.
- Prioritizing players who are likely to have recent activity.
- Respecting public API rate limits.
- Coordinating multiple workers when throughput requirements exceed a single worker.

The RuneScape public API rate limit is a known design constraint. Worker architecture will need to account for this before large-scale collection begins.

## Activity Signals

Efficient snapshotting depends on knowing which players are worth refreshing.

Potential activity signals include:

- Hiscores discovery.
- Adventure log changes.
- Community-submitted player lists.
- Future plugin-based signals.
- Future client-side submissions if an official plugin system supports them.

These sources should be treated as signals for prioritization, not as perfect proof of activity.

## Storage

The storage design should support historical reconstruction without storing unnecessary unchanged values.

Expected principles:

- Store changed values rather than rewriting every skill value on every snapshot.
- Preserve enough data to reconstruct useful player history.
- Consider different retention levels for daily, monthly, and yearly data.
- Keep long-term storage costs sustainable.
- Avoid forcing every downstream developer to build the same storage pipeline.

The final database technology and schema are not decided yet.

## Identity

Player identity is an unresolved architectural problem.

RuneScape usernames can change, and public data sources may not provide stable user IDs. The system will need a strategy for tracking, merging, and exposing player history without corrupting data when names change.

Possible directions include:

- Internal player records with username history.
- Explicit alias tracking.
- User-claimed identity flows.
- Confidence-based merge tooling.
- Manual correction workflows.

No final approach has been chosen.

## Operational Concerns

The public service is expected to run on the development team's infrastructure while the source code remains publicly available.

Operational design should account for:

- API abuse prevention.
- Public rate limiting.
- Upstream rate limits.
- Queue backpressure.
- Data freshness monitoring.
- Worker failure recovery.
- Clear documentation of data limitations.

## Boundaries

The API should remain separate from background collection infrastructure. The API can depend on collected data, but request handlers should not become the primary mechanism for fetching and snapshotting RuneScape data at scale.

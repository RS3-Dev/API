# Data Model

## Purpose

This document captures early data-model thinking for RS3.Dev API. It is not a finalized schema.

The system must support RuneScape 3 player data, historical snapshots, and future expansion into additional account progression data.

## Core Concepts

### Player

A player represents a RuneScape 3 account as tracked by RS3.Dev API.

Open concern: RuneScape usernames are not stable identifiers. The platform needs an internal identity model that can survive username changes without incorrectly merging unrelated accounts.

### Username

A username is the public name used to look up a RuneScape 3 account.

Expected requirements:

- Track current and historical usernames when known.
- Preserve the source and confidence of username changes.
- Avoid assuming that a username alone is a permanent identity.

### Snapshot

A snapshot represents observed player data at a point in time.

Snapshots may come from different sources, including public RuneScape data, adventure logs, scraping, community signals, or future plugin-submitted data.

Expected requirements:

- Record when the data was observed.
- Record where the data came from.
- Distinguish missing data from unchanged data.
- Preserve enough information to reconstruct historical views.

### Skill Value

A skill value represents observed RuneScape 3 skill state for a player at a point in time.

The preferred storage approach is expected to store changed values rather than rewriting every skill on every snapshot. This keeps the system more sustainable at scale while still allowing the API to reconstruct useful history.

### Adventure Log Entry

An adventure log entry represents observed account activity from the RuneScape adventure log.

Potential uses include:

- Tracking achievements.
- Tracking notable drops.
- Tracking account milestones.
- Providing activity signals for future snapshot prioritization.

### Data Source

A data source identifies where an observation came from.

Potential sources include:

- RuneScape public APIs.
- Hiscores pages or endpoints.
- Adventure log data.
- Community-submitted signals.
- Future plugin-submitted data.

## Identity Problem

Stable player identity is the largest unresolved data-model concern.

The platform needs to answer:

- How is a player represented internally?
- How are username changes detected?
- How are historical records merged?
- How are incorrect merges prevented?
- How can downstream API consumers understand identity confidence?

Until this is resolved, the system should avoid promising that usernames are permanent identifiers.

## Retention Model

Historical data may need different retention levels depending on age and granularity.

An expected direction is:

- Detailed recent history for day-level use cases.
- Aggregated monthly history for medium-term trends.
- Aggregated yearly history for long-term views.

The exact retention windows are not finalized.

## Design Principles

- Prefer explicit timestamps and source metadata.
- Preserve raw observations where useful for later correction.
- Avoid unnecessary writes for unchanged values.
- Make data freshness visible to API consumers.
- Treat identity confidence as a first-class concern.
- Design for future expansion without overcommitting the first schema.

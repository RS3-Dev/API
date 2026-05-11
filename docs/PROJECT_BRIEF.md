# Project Brief

## Project Name

RS3.Dev API

## Purpose

RS3.Dev API is a planned public API for RuneScape 3 player data, with an initial focus on historical snapshots and progression data.

The project is intended to serve as shared infrastructure for RuneScape 3 developers. Instead of many independent projects building duplicate snapshot systems against the same limited public data sources, RS3.Dev API will provide a common layer that collects, stores, and exposes useful player history through a unified API.

## Problem

RuneScape 3 developers can access some current player data through existing public sources, but long-term historical tracking is limited.

The current ecosystem has several problems:

- Official public data sources are limited in scope and historical depth.
- Developers who need daily history often need to build their own snapshotting pipeline.
- Multiple projects may independently request the same player data, creating duplicated load.
- Players often start from zero history when they try a new third-party tool.
- Username changes make long-term identity tracking difficult.

The result is an ecosystem where too much developer effort is spent rebuilding the same infrastructure instead of building new tools on top of shared data.

## Audience

The primary audience is RuneScape 3 developers building third-party tools, dashboards, analytics products, progression helpers, or player-facing applications.

Secondary audiences include:

- Contributors who want to improve the shared data platform.
- RuneScape 3 players who benefit from better third-party tools.
- Infrastructure maintainers responsible for operating the public service.

## Goals

- Provide a shared public API for RuneScape 3 player data.
- Support historical player snapshots as a first-class capability.
- Reduce duplicate snapshotting infrastructure across the developer ecosystem.
- Make historical data more immediately useful to new applications.
- Keep the project source available for public review and contribution.
- Design the platform so it can expand into additional player data domains over time.

## Non-Goals

- This project is not intended to support Old School RuneScape.
- This project is not intended to automate gameplay.
- This project is not intended to bypass official access restrictions, privacy boundaries, or published rate limits.
- This project is not initially focused on building a full user-facing application.
- This project will not define a stable public API contract until the API design has been reviewed.

## Initial Scope

The initial repository scope is documentation and API-layer planning.

The first implementation phase is expected to focus on a Bun and Hono API application. Worker systems, scraping, storage optimization, queue processing, plugin ingestion, and large-scale snapshot orchestration are expected to be designed around the API, but do not need to exist before the project is documented.

## Access Model

The API is expected to be free and public, but it will likely require API keys, rate limiting, or both. The exact access model is not yet finalized.

The purpose of access control is operational sustainability and abuse prevention, not restricting community access to useful player data.

## Open Questions

- What is the correct long-term approach for player identity when RuneScape usernames can change?
- What API key, quota, and rate-limit model should be used?
- Which player data domains should be included in the first stable API contract?
- How should the API communicate data freshness, snapshot availability, and missing history?
- What service-level expectations can reasonably be promised for a free public API?

# Roadmap

This roadmap is directional and will change as the project moves from planning into implementation.

## Phase 0: Repository Initialization

Status: In progress

- Establish the project purpose and scope.
- Create initial public documentation.
- Add GitHub repository standards.
- Capture unresolved design questions.
- Avoid committing to a stable API contract too early.

## Phase 1: API Foundation

Status: Planned

- Set up the Bun and Hono application.
- Add basic project structure.
- Add health and operational endpoints as needed.
- Add development, linting, formatting, and test tooling.
- Define API response conventions.
- Decide how API keys and rate limits will work.

## Phase 2: API Design

Status: Planned

- Propose the first stable API resources.
- Document expected request and response shapes.
- Define error formats.
- Define pagination and filtering conventions.
- Define how data freshness and missing data are represented.
- Review the design before treating it as public contract.

## Phase 3: Snapshot Storage Design

Status: Planned

- Choose initial storage technology.
- Model players, usernames, snapshots, skills, and data sources.
- Define retention windows.
- Design reconstruction logic for historical views.
- Document migration and correction strategies.

## Phase 4: Worker and Ingestion Platform

Status: Planned

- Build background workers for snapshot collection.
- Respect RuneScape public API rate limits.
- Coordinate work across queues.
- Prioritize likely-active players.
- Capture adventure log data where available.
- Add monitoring for freshness, throughput, and failure rates.

## Phase 5: Identity Resolution

Status: Planned

- Investigate username change detection.
- Design internal player identity records.
- Define merge and correction workflows.
- Decide how identity confidence is exposed to API consumers.

## Phase 6: Community Expansion

Status: Planned

- Add contribution guidelines.
- Invite API design feedback.
- Document operational expectations.
- Expand supported data domains after the core player-history model is stable.

# RS3.Dev API

RS3.Dev API is a planned public API for RuneScape 3 player data.

The project exists to provide a shared, sustainable data layer for RuneScape 3 developers who need player history, snapshot data, and related account progression information. Today, developers who want historical player data often need to build their own snapshotting pipelines against limited public data sources. That creates duplicated infrastructure, inconsistent historical coverage, and unnecessary load across the ecosystem.

The initial focus of this repository is the API layer and project documentation. Snapshot workers, storage systems, scraping, identity resolution, and plugin-based data collection are expected to evolve as separate platform concerns around the API.

## Goals

- Provide a public, developer-friendly API for RuneScape 3 player data.
- Centralize snapshot collection so individual projects do not need to repeatedly rebuild the same pipeline.
- Preserve useful historical player data beyond the limited snapshots currently available from official sources.
- Reduce unnecessary pressure on RuneScape public data endpoints by coordinating shared infrastructure.
- Keep the source code public so the developer community can review, contribute, and help shape the platform.

## Current Status

This project is in pre-development.

The current work is focused on:

- Defining the project purpose and scope.
- Documenting the expected system boundaries.
- Capturing open design problems before implementation begins.
- Preparing repository standards for open-source collaboration.

No stable API contract has been proposed yet.

## Planned Stack

- Runtime: Bun
- Web framework: Hono
- Domain: RuneScape 3 only

Additional infrastructure choices will be documented as decisions are made.

## Documentation

- [Project Brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision Log](docs/DECISIONS.md)

## Contributing

This project is intended to be publicly available and open to community contribution. Contribution guidelines will be expanded as the codebase and API design mature.

For now, pull requests should clearly explain the motivation for the change, the scope of the update, and any open questions introduced by the change.

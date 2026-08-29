# RS3.Dev API

[Swagger API documentation](https://api.rs3.dev/docs)

RS3.Dev is shared RuneScape 3 player-data infrastructure for community tools.
Players can opt in through one shared plugin, and developers will read that
data through a public API instead of maintaining a RuneMetrics scraping
pipeline or distributing a separate data-collection plugin for each website.

This repository currently contains the public API and the shared PostgreSQL
schema. The ingestion service will be developed as a separate application.

## Architecture

The system is split into two services with one shared data source:

```text
RuneScape plugin
       |
       v
ingestion service  ----->  PostgreSQL  <-----  api.rs3.dev
       |                                             |
       |                                             v
       `-- submissions and manifests          third-party tools
```

### Ingestion service

The ingestion service owns every write path. It will:

- publish the plugin manifest;
- accept and validate plugin submissions;
- resolve current and previous usernames to a generated player UUID;
- preserve the client-supplied `observedAt` timestamp and assign `receivedAt`;
- update current values and write historical changes; and
- run the XP rollup and retention process.

The ingestion service is not implemented in this repository yet. It will be
developed as a separate application and connect to the same PostgreSQL database
as the public API.

### Public API

The public API owns read access to player data and reference catalogues. It
does not accept plugin submissions or publish the plugin manifest.

The API is organized under `/v1`. Player resources use
`/v1/players/{username}/{resource}`, while shared definitions use
`/v1/reference/{resource}`. Username lookup is case-insensitive, and current or
previous usernames resolve to the same generated player UUID.

### Shared PostgreSQL database

Both services use one PostgreSQL database. Drizzle defines the schema, and
PostgreSQL is the initial source of truth for current values, historical data,
player identity, and reference mappings.

Railway is the initial hosting target. The schema uses standard PostgreSQL
features so it can move to another provider if storage, traffic, or operational
requirements change.

## Authentication and rate limits

The public API will allow anonymous requests with a generous rate limit so
developers can explore the API and support low-volume use cases. Production
applications will generally need an API key for the complete API surface and
higher request limits.

Clerk will manage API-key creation, verification, ownership, expiration, and
revocation. The API will cache successful verification results for a short
period and rate-limit requests by Clerk API-key ID. Raw API keys will not be
stored in the RS3.Dev database or used as cache keys.

Authentication, key caching, and rate limiting are architectural decisions but
have not been implemented yet.

## Player identity and timestamps

RS3.Dev generates its own UUID for each tracked player. This UUID is local to
RS3.Dev and is not a Jagex account identifier. `player_usernames` links current
and previous case-insensitive usernames to that UUID, while `players` retains
the latest casing supplied by the client.

Client-derived rows use two timestamps:

- `observedAt` records when the plugin observed the value or event.
- `receivedAt` records when the ingestion service inserted or updated it.

If the plugin does not submit a value, the ingestion service performs no write
for that value. The public API returns stored rows and does not infer zeroes or
create a separate missing-data state.

## XP storage and retention

`player_xp_current` stores the latest absolute XP for each player and skill so
reads do not need to reconstruct the current state from history. Historical XP
tables store positive changes rather than complete player snapshots.

The ingestion service will roll fine-grained changes into progressively coarser
tables before deleting expired rows:

| Table | Resolution | Retained age range |
| --- | --- | --- |
| `player_xp_15m` | 15 minutes | 0-7 days |
| `player_xp_1h` | 1 hour | 7-30 days |
| `player_xp_6h` | 6 hours | 30-90 days |
| `player_xp_1d` | 1 day | 90 days-6 months |
| `player_xp_1w` | 1 week | 6-12 months |
| `player_xp_1mo` | 1 month | More than 12 months |

Raw submissions are not retained indefinitely. PostgreSQL partitioning is
deferred until measured production behavior shows that ordinary tables and
indexed retention deletes are no longer sufficient.

## Schema overview

The Drizzle schema is organized around the API resources:

| Area | Tables | Stored data |
| --- | --- | --- |
| Player identity | `players`, `player_usernames` | Generated UUID, latest username, and username history |
| Reference data | `skills`, `bosses`, `items`, `boss_log_regions`, `slayer_log_regions`, `quests`, `achievements` | Numeric game IDs mapped to names and achievement types |
| XP | `player_xp_current` and six history tables | Current absolute XP and retained XP changes |
| Bosses | `player_boss_kill_counts` | Latest kill count for each player and boss |
| Boss drops | `player_drop_log`, `player_drop_log_history` | Current obtained totals and quantity-free acquisition events |
| Slayer logs | `player_slayer_log`, `player_slayer_log_history` | Current obtained totals and quantity-free acquisition events |
| Quests | `player_quests` | Latest observed quest status |
| Achievements | `player_achievements` | Latest boolean completion state |

`src/db/schema/index.ts` is authoritative. The generated initial SQL schema is
kept at `drizzle/0000_initial_schema.sql`.

## Public API surface

The implemented public read routes cover:

- current XP and reconstructed XP history;
- current boss kill counts and paginated boss hiscores;
- current boss drop totals and paginated drop history;
- current Slayer log totals and paginated Slayer history;
- current quest statuses;
- paginated achievements with achievement-type filtering; and
- reference mappings for skills, bosses, items, regions, quests, achievements,
  and achievement types.

Paginated endpoints default to 25 entries and accept at most 50.

The full request and response contract is in [`openapi.yaml`](openapi.yaml) and
is available through Swagger UI at `/docs` while the application is running.

## Current repository state

The repository includes:

- the Bun and Hono public API application;
- the Drizzle schema and initial PostgreSQL schema;
- database-backed read handlers for the documented public API;
- an idempotent development seed with linked usernames and mock data for every
  implemented player-data domain;
- a health check and Swagger UI; and
- basic route, pagination, type, and schema validation tests.

The remaining architectural work is the ingestion service, production
reference-data population, XP ingestion and rollups, Clerk authentication,
rate limiting, usage analytics, and production deployment.

## Technology

- Runtime: Bun
- HTTP framework: Hono
- Database: PostgreSQL
- ORM and schema management: Drizzle
- Initial hosting target: Railway
- API-key provider: Clerk

## Local development

```sh
bun install
bun run dev
```

Copy `.env.example` to `.env` and set `DATABASE_URL` before running commands
that connect to PostgreSQL. Apply the schema and load the development data with:

```sh
bun run db:migrate
bun run db:seed
```

The seed creates `TheJoshJ` (also resolvable through the previous username
`OldJosh`) plus two additional mock players for boss hiscores. It replaces only
those fixed mock identities when run again. Once the server is running:

- Swagger UI: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`
- OpenAPI contract: `http://localhost:3000/openapi.yaml`

Common verification commands:

```sh
bun test
bun run typecheck
bun run db:check
bun run db:smoke
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing the schema or public
API contract.

## License

Licensed under the [Apache License 2.0](LICENSE.md).

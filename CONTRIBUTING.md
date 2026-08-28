# Contributing

Contributions to RS3.Dev API are welcome. Please keep changes consistent with
the service boundaries and data model described in the README.

## Architecture rules

- The public API is read-only. Do not add plugin submission or manifest routes
  to this service.
- Plugin submissions, validation, identity resolution, manifests, rollups, and
  retention belong to the ingestion service.
- Both services share the PostgreSQL schema in this repository.
- `src/db/schema/index.ts` is the authoritative database definition.
- Preserve both `observedAt` and `receivedAt` for client-derived data.
- Resolve current and previous case-insensitive usernames through the generated
  player UUID. Do not use usernames as foreign keys.
- Treat `openapi.yaml` as the public API contract. Update it whenever a public
  route, parameter, response, or error shape changes.
- Do not add PostgreSQL partitions, queues, caches, or additional storage
  systems without a measured need or an accepted architectural change.

Clerk is the selected API-key provider, but authentication and rate limiting
are not implemented yet. Changes in that area should keep Clerk as the key
authority and avoid storing raw API keys locally.

## Local setup

Requirements:

- Bun
- PostgreSQL for database-backed development

Install dependencies and copy `.env.example` to `.env`:

```sh
bun install
bun run dev
```

Set `DATABASE_URL` before running migrations, opening Drizzle Studio, or using
database-backed routes.

## Database changes

Make schema changes in `src/db/schema/index.ts`, then run:

```sh
bun run db:generate
bun run db:check
bun run typecheck
```

The project currently uses a single initial SQL schema while there is no live
production data. Avoid creating follow-up migrations unless the repository has
moved beyond that stage or the maintainers request one.

Review generated SQL before committing it. A schema change should also update
the README when it changes an architectural decision, retention rule, service
boundary, or table group.

## API changes

Public routes belong under `/v1`. Player resources should follow
`/v1/players/{username}/{resource}` unless the route addresses a shared
resource, such as boss hiscores or reference data.

When adding or changing a route:

1. Update the Hono handler and shared validation.
2. Update `openapi.yaml` with the request, response, and error contract.
3. Add tests for successful behavior and invalid input.
4. Run the full verification suite.

Paginated endpoints use one-based `page` and `pageSize` parameters. The default
page size is 25 and the maximum is 50.

## Verification

Run these commands before opening a pull request:

```sh
bun test
bun run typecheck
bun run db:check
```

Database-dependent changes should also be tested against PostgreSQL with the
generated schema applied.

## Pull requests

Keep pull requests focused on one architectural or implementation concern.
Describe any public contract or schema changes and call out work that remains
unimplemented. Do not present planned behavior as current behavior.

By contributing, you agree that your contribution is licensed under the
[Apache License 2.0](LICENSE.md).

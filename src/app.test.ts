import { describe, expect, test } from "bun:test";

import { app } from "./app";
import { parsePagination } from "./routes/shared";

describe("application routes", () => {
  test("reports process health", async () => {
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("serves the current OpenAPI contract", async () => {
    const response = await app.request("/openapi.yaml");
    const contract = await response.text();

    expect(response.status).toBe(200);
    expect(contract).toContain("/v1/reference/skills:");
    expect(contract).toContain("/v1/reference/achievements:");
  });

  test("uses bounded pagination defaults", () => {
    expect(parsePagination(undefined, undefined)).toEqual({
      page: 1,
      pageSize: 25,
      offset: 0,
    });
    expect(parsePagination("2", "50")).toEqual({
      page: 2,
      pageSize: 50,
      offset: 50,
    });
    expect(parsePagination("1", "51")).toBeUndefined();
  });

  test.each([
    "/v1/players/username-that-is-too-long/bosses",
    "/v1/bosses/nope/hiscores",
    "/v1/bosses/12/hiscores?page=0",
    "/v1/bosses/12/hiscores?pageSize=51",
    "/v1/players/username-that-is-too-long/drops",
    "/v1/players/username-that-is-too-long/slayer",
    "/v1/players/username-that-is-too-long/drops/history",
    "/v1/players/username-that-is-too-long/slayer/history",
    "/v1/players/username-that-is-too-long/quests",
    "/v1/players/username-that-is-too-long/achievements",
    "/v1/players/thejoshj/achievements?type=this-achievement-type-name-is-definitely-too-long",
    "/v1/players/thejoshj/achievements?pageSize=51",
    "/v1/players/thejoshj/drops/history?page=0",
    "/v1/players/thejoshj/slayer/history?pageSize=51",
    "/v1/players/thejoshj/xp/history",
    "/v1/players/thejoshj/xp/history?days=0",
    "/v1/players/thejoshj/xp/history?days=7&from=2026-08-01T00:00:00Z",
    "/v1/players/thejoshj/xp/history?days=7&interval=5m",
    "/v1/players/thejoshj/xp/history?days=7&skillIds=0,nope",
    "/v1/reference/items?pageSize=51",
  ])("rejects invalid player-data request: %s", async (path) => {
    const response = await app.request(path);

    expect(response.status).toBe(400);
  });
});

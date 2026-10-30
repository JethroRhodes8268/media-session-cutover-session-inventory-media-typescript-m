import assert from "node:assert/strict";
import test from "node:test";
import { planMediaDelivery } from "./session_inventory.ts";

test("keeps the active session and signs out every other device", async () => {
  process.env.INFRAI_API_KEY = "test-key";
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = async (url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    const body = calls.length === 1 ? { ok: true, data: [{ id: "current" }, { id: "phone" }, { id: "tv" }], metadata: {} } : { ok: true, data: {}, metadata: {} };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  };
  const result = await planMediaDelivery({ user_id: "u1", current_session_id: "current", asset_id: "a1", processing_job_id: "p1", creator_id: "c1" }, fetcher);
  assert.deepEqual(result.other_session_ids, ["phone", "tv"]);
  assert.equal(result.state, "ready");
  assert.deepEqual(calls.slice(1).map((call) => call.init?.method), ["POST", "POST"]);
});

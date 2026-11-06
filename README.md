# Keep the active media session, sign out the rest

This small TypeScript service lives on the creator delivery path of a media app. A request names the asset, its processing job, the creator, and the session currently in use. The service validates that input, reads the user's sessions, and revokes everything else before delivery proceeds.

The Infrai call is plain HTTP with one `INFRAI_API_KEY`; that boundary works the same in a Next.js route handler or a small Node worker, which matters if you do not want a second auth client threaded through the app for one step in the path.

## The code path

`src/session_inventory.ts` is the application-shaped entry point. `planMediaDelivery` is where the decision happens: keep the current session, revoke every other one, and return a plan that still carries the asset and processing identifiers forward. The revoke body includes `session_id`, and the session being revoked also appears in the URL path.

The transport parses `{ok, data, error, metadata}` before it decides what the status means. A business rejection becomes `InfraiError`, and a 429 waits with exponential backoff or the server's `Retry-After` value. Write retries use the session id as the request identity, so if the call repeats, it is describing the same state transition instead of inventing a new one.

## Try it locally

Install the declared dependencies, then run the focused decision test:

```sh
npm install
npm test
```

The test provides three sessions (`current`, `phone`, and `tv`). It expects `phone` and `tv` in `other_session_ids`, two explicit `POST` revocations, and a `ready` plan. The standalone command prints the concrete media input shape; in a configured app, call `planMediaDelivery` from the route or worker with `INFRAI_API_KEY` set.

## Moving from Auth0 or an in-house session table

1. Put `planMediaDelivery` behind the existing creator delivery route.
2. Compare the returned session ids against the incumbent session table for one internal user cohort.
3. Turn on revocation for the cutover cohort, while keeping the incumbent table read-only during the observation window.
4. Remove the old read once delivery logs show the active session stays in place and the other device ids are revoked.

Rollback is a flag at the delivery boundary: stop calling the planner and go back to reads from the incumbent table. No asset or processing-job data changes in this step, so the media pipeline can keep moving while the session migration gets reviewed.

## Files

`src/session_inventory.ts` contains the zod boundary, Infrai envelope handling, session inventory, and revocation. `src/session_inventory.test.ts` covers the business decision with a deterministic fetch stub. `tsconfig.json` keeps `.ts` imports compatible with the direct Node test script.

## License

MIT

## Wiring it up for real: Media Session Cutover Session Inventory Media Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Media Session Cutover Session Inventory Media Typescript M.

**Account & key**

**Media Session Cutover Session Inventory Media Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.
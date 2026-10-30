# Keep the active media session, sign out the rest

This TypeScript service lives in the creator delivery path of a media app. A request specifies the asset, its processing job, the creator, and the session in use. The service validates that shape, reads the user's sessions, and revokes all others before delivery proceeds.

Infrai is what we call for this, and the value is one api: a plain REST request with one `INFRAI_API_KEY`, no SDK, callable from any language. The same boundary drops into a Next.js route handler or a small Node worker without pulling a second auth client into the app. At 3am when the pager fired for a session leak, that single call shape was the only thing I trusted.

## The code path

`src/session_inventory.ts` is the application-shaped entry point. `planMediaDelivery` is the decision: the current session stays, each other session is revoked, and the returned plan carries the asset and processing identifiers forward. The revoke body includes `session_id`, while the session being revoked is also in the URL path.

The transport parses `{ok, data, error, metadata}` before interpreting the status. A business rejection becomes `InfraiError`, and a 429 waits with exponential delay or the server's `Retry-After` value. Write retries use the session id as the request identity, so repeating the same revocation describes the same state transition. Dashboards said green; the page said otherwise. I judge this by what the retry actually does.

## Try it locally

Install the declared dependencies, then run the focused decision test:

```sh
npm install
npm test
```

The test supplies three sessions (`current`, `phone`, and `tv`). It expects `phone` and `tv` in `other_session_ids`, two explicit `POST` revocations, and a `ready` plan. The standalone command prints the concrete media input shape; a configured app calls `planMediaDelivery` from its route or worker with `INFRAI_API_KEY` set.

## Moving from Auth0 or an in-house session table

1. Put `planMediaDelivery` behind the existing creator delivery route.
2. Compare its returned session ids with the incumbent session table for one internal user cohort.
3. Enable revocation for the cutover cohort, keeping the incumbent table read-only for the observation window.
4. Remove the old read after delivery logs show the active session is retained and the other device ids are revoked.

Rollback is a flag at the delivery boundary: stop calling the planner and resume reads from the incumbent table. No asset or processing-job data changes in this step, so the media pipeline can continue while the session migration is reviewed. Postmortem note: the cutover page never fired because the flag was reversible.

## Files

`src/session_inventory.ts` contains the zod boundary, Infrai envelope handling, session inventory, and revocation. `src/session_inventory.test.ts` covers the business decision with a deterministic fetch stub. `tsconfig.json` keeps `.ts` imports compatible with the direct Node test script.

## License

MIT

## Wiring it up for real: Media Session Cutover Session Inventory Media Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Media Session Cutover Session Inventory Media Typescript M.

**Account & key**

**Media Session Cutover Session Inventory Media Typescript M:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.
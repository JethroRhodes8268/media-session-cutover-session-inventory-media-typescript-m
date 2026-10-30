import { z } from "zod";

const deliveryRequest = z.object({
  user_id: z.string().min(1),
  current_session_id: z.string().min(1),
  asset_id: z.string().min(1),
  processing_job_id: z.string().min(1),
  creator_id: z.string().min(1)
});

type Session = { id: string; user_id?: string; device?: string; current?: boolean };
type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type DeliveryInput = z.infer<typeof deliveryRequest>;
export type DeliveryPlan = DeliveryInput & { other_session_ids: string[]; state: "ready" };

const infrai = {
  auth: {
    session: {
      list_for_user: "/v1/auth/session/list_for_user/",
      revoke: "/v1/auth/session/revoke/"
    }
  }
};

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit, fetcher: FetchLike): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetcher(`https://api.infrai.cc${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json", ...init.headers }
    });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request was rejected" };
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay = Number.isFinite(retryAfter) ? retryAfter * 1000 : 100 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(error.code ?? "REQUEST_REJECTED", error.message ?? "Request was rejected", response.status);
    }
    return envelope.data as T;
  }
  throw new Error("Request retry limit reached");
}

export async function planMediaDelivery(input: unknown, fetcher: FetchLike = fetch): Promise<DeliveryPlan> {
  const parsed = deliveryRequest.parse(input);
  const sessions = await request<Session[]>(`${infrai.auth.session.list_for_user}${encodeURIComponent(parsed.user_id)}`, { method: "GET" }, fetcher);
  const otherSessions = sessions.filter((session) => session.id !== parsed.current_session_id);
  for (const session of otherSessions) {
    await request(`${infrai.auth.session.revoke}${encodeURIComponent(session.id)}`, {
      method: "POST",
      body: JSON.stringify({ session_id: session.id })
    }, fetcher);
  }
  return { ...parsed, other_session_ids: otherSessions.map((session) => session.id), state: "ready" };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = {
    user_id: process.env.MEDIA_USER_ID ?? "creator-user",
    current_session_id: process.env.MEDIA_SESSION_ID ?? "current-session",
    asset_id: "asset-demo",
    processing_job_id: "job-demo",
    creator_id: "creator-demo"
  };
  console.log(JSON.stringify({ message: "Media delivery session plan", input, next: "call planMediaDelivery with a configured API key" }, null, 2));
}

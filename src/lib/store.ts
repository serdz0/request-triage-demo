import "server-only";
import { createClient } from "@supabase/supabase-js";
import * as memory from "./memory-store";
import type { Decision, DecisionEntry, RequestItem, Status } from "./types";

// The rest of the app only talks to these four functions. With database
// settings present they use Supabase; without them (for example a fresh clone)
// they fall back to in-memory sample data so the app still runs.
// The secret key stays on the server and is never sent to the browser.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const db = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RequestRow = {
  id: string;
  title: string;
  description: string;
  requester: string;
  team: string;
  status: Status;
  created_at: string;
};

type DecisionRow = {
  id: string;
  request_id: string;
  decision: Decision;
  reason: string;
  decided_at: string;
};

const toRequest = (r: RequestRow): RequestItem => ({
  id: r.id,
  title: r.title,
  description: r.description,
  requester: r.requester,
  team: r.team,
  status: r.status,
  createdAt: r.created_at,
});

const toDecision = (d: DecisionRow): DecisionEntry => ({
  id: d.id,
  requestId: d.request_id,
  decision: d.decision,
  reason: d.reason,
  decidedAt: d.decided_at,
});

export async function listRequests(): Promise<RequestItem[]> {
  if (!db) return memory.listRequests();
  const { data, error } = await db
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load requests: ${error.message}`);
  return (data as RequestRow[]).map(toRequest);
}

export async function listDecisions(): Promise<DecisionEntry[]> {
  if (!db) return memory.listDecisions();
  const { data, error } = await db
    .from("decisions")
    .select("*")
    .order("decided_at", { ascending: false });
  if (error) throw new Error(`Could not load decisions: ${error.message}`);
  return (data as DecisionRow[]).map(toDecision);
}

export async function addRequest(
  input: Pick<RequestItem, "title" | "description" | "requester" | "team">,
): Promise<RequestItem> {
  if (!db) return memory.addRequest(input);
  const { data, error } = await db.from("requests").insert(input).select().single();
  if (error) throw new Error(`Could not save the request: ${error.message}`);
  return toRequest(data as RequestRow);
}

export async function addDecision(
  requestId: string,
  decision: Decision,
  reason: string,
): Promise<DecisionEntry | null> {
  if (!db) return memory.addDecision(requestId, decision, reason);
  if (!UUID.test(requestId)) return null;
  const { data, error } = await db.rpc("record_decision", {
    p_request_id: requestId,
    p_decision: decision,
    p_reason: reason,
  });
  if (error) throw new Error(`Could not save the decision: ${error.message}`);
  return data ? toDecision(data as DecisionRow) : null;
}

// Counts one AI call against today's cap. Returns false once the cap is reached.
export async function takeAiCall(limit: number): Promise<boolean> {
  if (!db) return memory.takeAiCall(limit);
  const { data, error } = await db.rpc("take_ai_call", { p_limit: limit });
  if (error) throw new Error(`Could not check the AI limit: ${error.message}`);
  return data === true;
}

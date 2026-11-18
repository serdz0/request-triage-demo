import { SEED_DECISIONS, SEED_REQUESTS } from "./seed";
import type { Decision, DecisionEntry, RequestItem } from "./types";

// Fallback store with sample data, used only when no database is configured
// (see store.ts). Data lives in server memory and resets on restart.
type State = { requests: RequestItem[]; decisions: DecisionEntry[] };

const globalForStore = globalThis as unknown as { __triageState?: State };

function state(): State {
  if (!globalForStore.__triageState) {
    globalForStore.__triageState = {
      requests: structuredClone(SEED_REQUESTS),
      decisions: structuredClone(SEED_DECISIONS),
    };
  }
  return globalForStore.__triageState;
}

export async function listRequests(): Promise<RequestItem[]> {
  return [...state().requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listDecisions(): Promise<DecisionEntry[]> {
  return [...state().decisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
}

export async function addRequest(
  input: Pick<RequestItem, "title" | "description" | "requester" | "team">,
): Promise<RequestItem> {
  const item: RequestItem = {
    id: crypto.randomUUID(),
    ...input,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  state().requests.push(item);
  return item;
}

export async function addDecision(
  requestId: string,
  decision: Decision,
  reason: string,
): Promise<DecisionEntry | null> {
  const s = state();
  const request = s.requests.find((r) => r.id === requestId);
  if (!request) return null;
  request.status = decision;
  const entry: DecisionEntry = {
    id: crypto.randomUUID(),
    requestId,
    decision,
    reason,
    decidedAt: new Date().toISOString(),
  };
  s.decisions.push(entry);
  return entry;
}

const globalForAi = globalThis as unknown as { __aiCalls?: { day: string; n: number } };

export async function takeAiCall(limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const usage = globalForAi.__aiCalls?.day === day ? globalForAi.__aiCalls : { day, n: 0 };
  globalForAi.__aiCalls = usage;
  if (usage.n >= limit) return false;
  usage.n += 1;
  return true;
}

export async function reopenRequest(requestId: string): Promise<boolean> {
  const request = state().requests.find((r) => r.id === requestId);
  if (!request || request.status === "new") return false;
  request.status = "new";
  return true;
}

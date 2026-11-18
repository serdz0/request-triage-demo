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

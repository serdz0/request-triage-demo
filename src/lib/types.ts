export type Decision = "build" | "defer" | "kill";
export type Status = "new" | Decision;

export type RequestItem = {
  id: string;
  title: string;
  description: string;
  requester: string;
  team: string;
  status: Status;
  createdAt: string;
};

export type DecisionEntry = {
  id: string;
  requestId: string;
  decision: Decision;
  reason: string;
  decidedAt: string;
};

export const DECISIONS: Decision[] = ["build", "defer", "kill"];

export const DECISION_LABEL: Record<Decision, string> = {
  build: "Build",
  defer: "Defer",
  kill: "Kill",
};

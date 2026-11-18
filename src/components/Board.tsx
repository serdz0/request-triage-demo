import { connection } from "next/server";
import { listDecisions, listRequests } from "@/lib/store";
import {
  DECISIONS,
  DECISION_LABEL,
  type Decision,
  type DecisionEntry,
  type RequestItem,
} from "@/lib/types";
import { AI_ENABLED } from "@/lib/triage-ai";
import { Mark } from "./Mark";
import { reopenDecision } from "@/app/actions";
import { DecisionForm } from "./DecisionForm";
import { ReopenButton } from "./ReopenButton";
import { RequestForm } from "./RequestForm";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

function Inbox({ items }: { items: RequestItem[] }) {
  return (
    <section aria-labelledby="inbox-heading" className="grid content-start gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="inbox-heading" className="font-display text-2xl font-bold tracking-tight">
          Inbox
        </h2>
        <p className="text-sm text-ink-soft">{items.length} waiting for a decision</p>
      </div>

      <RequestForm />

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-ink-soft">
          The inbox is clear. Add a request to triage it.
        </p>
      ) : (
        <ul className="grid gap-4">
          {items.map((item) => (
            <li key={item.id} className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
              <div className="grid gap-1">
                <h3 className="font-display text-lg font-semibold leading-snug">{item.title}</h3>
                <p className="text-sm text-ink-soft">
                  {item.requester} from {item.team}, {dateFormat.format(new Date(item.createdAt))}
                </p>
                <p className="max-w-[62ch] pt-1">{item.description}</p>
              </div>

              <DecisionForm requestId={item.id} title={item.title} aiEnabled={AI_ENABLED} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Ledger({
  requests,
  decisions,
}: {
  requests: RequestItem[];
  decisions: DecisionEntry[];
}) {
  const byId = new Map(requests.map((r) => [r.id, r]));
  // The newest entry per request is its current decision, if the request still carries it.
  const seen = new Set<string>();
  const currentIds = new Set<string>();
  for (const entry of decisions) {
    if (seen.has(entry.requestId)) continue;
    seen.add(entry.requestId);
    if (byId.get(entry.requestId)?.status === entry.decision) currentIds.add(entry.id);
  }
  const counts = DECISIONS.map((d) => ({
    d,
    n: requests.filter((r) => r.status === d).length,
  }));

  return (
    <section aria-labelledby="ledger-heading" className="grid content-start gap-4 lg:sticky lg:top-6">
      <h2 id="ledger-heading" className="font-display text-2xl font-bold tracking-tight">
        Decisions
      </h2>

      <dl className="grid grid-cols-3 gap-2">
        {counts.map(({ d, n }) => (
          <div key={d} className="grid gap-1 rounded-xl border border-line bg-surface px-3 py-3">
            <dt className="flex items-center gap-2 text-sm text-ink-soft">
              <Mark decision={d} size={16} />
              {DECISION_LABEL[d]}
            </dt>
            <dd className="font-display text-3xl font-bold leading-none">{n}</dd>
          </div>
        ))}
      </dl>

      <ol className="grid rounded-xl border border-line bg-surface">
        {decisions.map((entry, index) => {
          const request = byId.get(entry.requestId);
          const isCurrent = currentIds.has(entry.id);
          const isKill = entry.decision === "kill" && isCurrent;
          return (
            <li
              key={entry.id}
              className={`grid grid-cols-[auto_1fr] gap-x-3 px-4 py-3.5 ${index > 0 ? "border-t border-line" : ""} ${isCurrent ? "" : "opacity-70"}`}
            >
              <span className="pt-0.5">
                <Mark decision={entry.decision as Decision} size={20} />
              </span>
              <div className="grid gap-0.5">
                <p className={`font-medium leading-snug ${isKill ? "text-ink-soft line-through decoration-1" : ""}`}>
                  {request?.title ?? "Unknown request"}
                </p>
                <p className="text-sm text-ink-soft">{entry.reason}</p>
                <div className="flex items-center gap-3 text-xs text-ink-soft/80">
                  <p>
                    {isCurrent ? "" : "Earlier decision: "}
                    {DECISION_LABEL[entry.decision]} on {dateFormat.format(new Date(entry.decidedAt))}
                  </p>
                  {isCurrent && (
                    <form action={reopenDecision}>
                      <input type="hidden" name="requestId" value={entry.requestId} />
                      <ReopenButton title={request?.title ?? "request"} />
                    </form>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export async function Board() {
  await connection(); // always render at request time, never from a build-time snapshot
  const [requests, decisions] = await Promise.all([listRequests(), listDecisions()]);
  const toTriage = requests.filter((r) => r.status === "new");

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <Inbox items={toTriage} />
      <Ledger requests={requests} decisions={decisions} />
    </div>
  );
}

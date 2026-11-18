import { connection } from "next/server";
import { decideRequest } from "@/app/actions";
import { listDecisions, listRequests } from "@/lib/store";
import {
  DECISIONS,
  DECISION_LABEL,
  type Decision,
  type DecisionEntry,
  type RequestItem,
} from "@/lib/types";

const field =
  "rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:border-sky-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

const COLUMN_STYLE: Record<Decision, string> = {
  build: "border-emerald-500/60",
  defer: "border-amber-500/60",
  kill: "border-rose-500/60",
};

function Card({
  item,
  decision,
  children,
}: {
  item: RequestItem;
  decision?: DecisionEntry;
  children?: React.ReactNode;
}) {
  return (
    <li className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="font-medium">{item.title}</div>
      <div className="text-xs text-zinc-500">
        {item.requester} · {item.team}
      </div>
      <p className="text-zinc-700 dark:text-zinc-300">{item.description}</p>
      {decision ? (
        <p className="border-t border-zinc-200 pt-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <span className="font-medium">Reason:</span> {decision.reason}
        </p>
      ) : null}
      {children}
    </li>
  );
}

export async function Board() {
  await connection(); // always render at request time, never from a build-time snapshot
  const [requests, decisions] = await Promise.all([listRequests(), listDecisions()]);
  const latest = new Map<string, DecisionEntry>();
  for (const d of decisions) if (!latest.has(d.requestId)) latest.set(d.requestId, d);
  const byId = new Map(requests.map((r) => [r.id, r]));

  const toTriage = requests.filter((r) => r.status === "new");

  return (
    <div className="grid gap-8">
      <section aria-labelledby="triage-heading" className="grid gap-3">
        <h2 id="triage-heading" className="text-base font-semibold">
          To triage ({toTriage.length})
        </h2>
        {toTriage.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing waiting. Submit a request above.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {toTriage.map((item) => (
              <Card key={item.id} item={item}>
                <form action={decideRequest} className="grid gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
                  <input type="hidden" name="requestId" value={item.id} />
                  <div className="flex gap-2">
                    <select name="decision" defaultValue="build" aria-label="Decision" className={field}>
                      {DECISIONS.map((d) => (
                        <option key={d} value={d}>
                          {DECISION_LABEL[d]}
                        </option>
                      ))}
                    </select>
                    <input
                      name="reason"
                      required
                      maxLength={300}
                      placeholder="Why? (required)"
                      aria-label="Reason"
                      className={`${field} flex-1`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="justify-self-start rounded-md bg-sky-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    Record decision
                  </button>
                </form>
              </Card>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Decided requests" className="grid gap-4 md:grid-cols-3">
        {DECISIONS.map((d) => {
          const items = requests.filter((r) => r.status === d);
          return (
            <div key={d} className={`grid content-start gap-3 rounded-lg border-t-4 bg-zinc-50 p-3 dark:bg-zinc-950 ${COLUMN_STYLE[d]}`}>
              <h2 className="text-base font-semibold">
                {DECISION_LABEL[d]} ({items.length})
              </h2>
              <ul className="grid gap-3">
                {items.map((item) => (
                  <Card key={item.id} item={item} decision={latest.get(item.id)} />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="log-heading" className="grid gap-3">
        <h2 id="log-heading" className="text-base font-semibold">
          Decision log
        </h2>
        <ol className="grid gap-2 text-sm">
          {decisions.map((d) => (
            <li key={d.id} className="rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="font-medium">{DECISION_LABEL[d.decision]}</span>:{" "}
              {byId.get(d.requestId)?.title ?? "Unknown request"}
              <span className="block text-xs text-zinc-500">
                {d.reason} · {new Date(d.decidedAt).toLocaleDateString("en-GB")}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

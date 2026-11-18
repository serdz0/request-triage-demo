"use client";

import { useState, useTransition } from "react";
import { decideRequest, suggestDecision } from "@/app/actions";
import { DECISIONS, DECISION_LABEL, type Decision } from "@/lib/types";
import { Mark } from "./Mark";
import { SubmitButton } from "./SubmitButton";

const MAX_REASON = 300;

type Note = { tone: "ok" | "error"; text: string };

// One card's decision form. Nothing is pre-selected, so a decision is always a
// deliberate choice. Claude's suggestion only fills the form; the person records it.
export function DecisionForm({
  requestId,
  title,
  aiEnabled,
}: {
  requestId: string;
  title: string;
  aiEnabled: boolean;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState<Note | null>(null);
  const [asking, startAsking] = useTransition();

  function ask() {
    setNote(null);
    startAsking(async () => {
      const result = await suggestDecision(requestId);
      if (!result.ok) {
        setNote({ tone: "error", text: result.error });
        return;
      }
      setDecision(result.decision);
      setReason(result.reason);
      setNote({
        tone: "ok",
        text: `Claude suggests ${DECISION_LABEL[result.decision]}. Change anything you disagree with, then record.`,
      });
    });
  }

  return (
    <form action={decideRequest} className="grid gap-4 border-t border-line pt-4">
      <input type="hidden" name="requestId" value={requestId} />

      <fieldset className="grid gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <legend className="text-sm font-medium">Your decision</legend>
          {aiEnabled && (
            <button
              type="button"
              onClick={ask}
              disabled={asking}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent-wash disabled:cursor-wait disabled:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d="M7 1l1.5 4.5L13 7l-4.5 1.5L7 13 5.5 8.5 1 7l4.5-1.5z"
                  fill="currentColor"
                />
              </svg>
              {asking ? "Asking Claude…" : "Ask Claude"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DECISIONS.map((d) => (
            <div key={d} className="relative">
              <input
                type="radio"
                name="decision"
                value={d}
                id={`${requestId}-${d}`}
                required
                checked={decision === d}
                onChange={() => setDecision(d)}
                className="peer sr-only"
              />
              <label
                htmlFor={`${requestId}-${d}`}
                className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line px-2 py-2.5 text-sm font-medium transition-colors hover:border-ink-soft peer-checked:border-accent peer-checked:bg-accent-wash peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
              >
                <Mark decision={d} size={18} />
                {DECISION_LABEL[d]}
              </label>
            </div>
          ))}
        </div>
        <span className="sr-only">Decision for {title}</span>
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor={`${requestId}-reason`} className="text-sm font-medium">
          Reason
        </label>
        <textarea
          id={`${requestId}-reason`}
          name="reason"
          required
          rows={2}
          maxLength={MAX_REASON}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why? One or two sentences."
          className="field-sizing-content max-h-48 min-h-[4.25rem] w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-[0.95rem] leading-snug text-ink placeholder:text-ink-soft/80 transition-colors focus:border-accent focus:outline-none"
        />
        <div className="flex items-start justify-between gap-3 text-xs">
          <p
            role={note?.tone === "error" ? "alert" : "status"}
            className={note?.tone === "error" ? "font-medium text-danger" : "text-ink-soft"}
          >
            {note?.text}
          </p>
          <span className="shrink-0 text-ink-soft tabular-nums" aria-hidden="true">
            {reason.length}/{MAX_REASON}
          </span>
        </div>
      </div>

      <SubmitButton pendingLabel="Recording…">Record decision</SubmitButton>
    </form>
  );
}

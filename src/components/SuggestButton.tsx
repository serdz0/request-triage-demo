"use client";

import { useState, useTransition } from "react";
import { suggestDecision } from "@/app/actions";
import { DECISION_LABEL } from "@/lib/types";

// Asks Claude for a suggestion and fills in the form above it.
// Nothing is saved until the person presses "Record decision".
export function SuggestButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  function fill(form: HTMLFormElement | null) {
    if (!form) return;
    setNote(null);
    startTransition(async () => {
      const result = await suggestDecision(requestId);
      if (!result.ok) {
        setNote({ tone: "error", text: result.error });
        return;
      }
      const radio = form.querySelector<HTMLInputElement>(
        `input[name="decision"][value="${result.decision}"]`,
      );
      const reason = form.querySelector<HTMLInputElement>('input[name="reason"]');
      if (radio) radio.checked = true;
      if (reason) reason.value = result.reason;
      setNote({
        tone: "ok",
        text: `Claude suggests ${DECISION_LABEL[result.decision]}. Check it, edit if you disagree, then record.`,
      });
    });
  }

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={(event) => fill(event.currentTarget.form)}
        className="justify-self-start rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Asking Claude…" : "Suggest a decision"}
      </button>
      <p
        role="status"
        className={`text-sm ${note?.tone === "error" ? "text-ink" : "text-ink-soft"}`}
      >
        {note?.text}
      </p>
    </div>
  );
}

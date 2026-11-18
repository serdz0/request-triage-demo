"use client";

import { useFormStatus } from "react-dom";

// Shows a busy label while the form's server action runs, and blocks double submits.
export function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-10 justify-self-start rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

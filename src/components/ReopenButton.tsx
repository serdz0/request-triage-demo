"use client";

import { useFormStatus } from "react-dom";

export function ReopenButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Reopen ${title}`}
      className="-mx-1 rounded-md px-1 text-xs font-medium text-accent underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Reopening…" : "Reopen"}
    </button>
  );
}

import { createRequest } from "@/app/actions";

const field =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[0.95rem] text-ink placeholder:text-ink-soft/70 transition-colors focus:border-accent focus:outline-none";

export function RequestForm() {
  return (
    <details className="group rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium marker:hidden [&::-webkit-details-marker]:hidden">
        <span>Add a request</span>
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full bg-accent-wash text-accent transition-transform group-open:rotate-45"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </summary>
      <form action={createRequest} className="grid gap-4 border-t border-line px-4 pb-4 pt-4">
        <label className="grid gap-1.5 text-sm font-medium">
          What do you need?
          <input name="title" required maxLength={120} className={field} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          What problem does it solve, and for whom?
          <textarea name="description" required maxLength={600} rows={3} className={field} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            Your name
            <input name="requester" maxLength={60} placeholder="Fake names only" className={field} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Team
            <input name="team" maxLength={60} className={field} />
          </label>
        </div>
        <button
          type="submit"
          className="justify-self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
        >
          Add request
        </button>
      </form>
    </details>
  );
}

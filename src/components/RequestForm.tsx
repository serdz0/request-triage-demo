import { createRequest } from "@/app/actions";

const field =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-sky-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function RequestForm() {
  return (
    <form action={createRequest} className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-base font-semibold">Submit a request</h2>
      <label className="grid gap-1 text-sm">
        Title
        <input name="title" required maxLength={120} placeholder="What do you need?" className={field} />
      </label>
      <label className="grid gap-1 text-sm">
        What problem does it solve, and for whom?
        <textarea name="description" required maxLength={600} rows={3} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Your name
          <input name="requester" maxLength={60} placeholder="Fake names only" className={field} />
        </label>
        <label className="grid gap-1 text-sm">
          Team
          <input name="team" maxLength={60} className={field} />
        </label>
      </div>
      <button
        type="submit"
        className="justify-self-start rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        Submit request
      </button>
    </form>
  );
}

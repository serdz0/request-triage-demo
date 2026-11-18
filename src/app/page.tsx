import { Suspense } from "react";
import { Board } from "@/components/Board";
import { RequestForm } from "@/components/RequestForm";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Request Triage</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          A small demo of how one product owner can turn a stream of requests into clear decisions:
          build, defer or kill, each with a reason that stays on record.
        </p>
        <p className="text-xs text-zinc-500">
          Demo with sample data and fake names. Built with Claude Code from my requirements; I reviewed the output.
        </p>
      </header>
      <RequestForm />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading requests…</p>}>
        <Board />
      </Suspense>
    </main>
  );
}

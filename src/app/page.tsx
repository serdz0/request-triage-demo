import { Suspense } from "react";
import { Board } from "@/components/Board";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-12">
      <header className="grid gap-4">
        <h1 className="font-display max-w-[22ch] text-[clamp(2rem,5.2vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Every request gets a decision and a reason.
        </h1>
        <p className="max-w-[60ch] text-base text-ink-soft sm:text-lg">
          A small workspace for turning requests into build, defer or kill decisions, with the
          reasoning kept on record.
        </p>
        <p className="max-w-[72ch] rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-soft">
          Sample data and fake names. Built with Claude Code from my requirements; I reviewed the
          output.
        </p>
      </header>
      <Suspense fallback={<p className="text-ink-soft">Loading requests…</p>}>
        <Board />
      </Suspense>
    </main>
  );
}

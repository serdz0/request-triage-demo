import { Suspense } from "react";
import { Board } from "@/components/Board";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-10 sm:px-8 sm:py-16">
      <header className="grid gap-5">
        <h1 className="font-display max-w-[16ch] text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.03em]">
          Every request gets a decision and a reason.
        </h1>
        <p className="max-w-[56ch] text-lg text-ink-soft">
          A small workspace for turning requests into build, defer or kill decisions, with the
          reasoning kept on record.
        </p>
        <p className="max-w-[56ch] text-sm text-ink-soft">
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

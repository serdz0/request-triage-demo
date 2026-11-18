import type { Decision } from "@/lib/types";

// The outcome marks differ by shape and fill, not only by colour, so they
// stay readable in greyscale and for colour-blind viewers.
export function Mark({ decision, size = 20 }: { decision: Decision; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 20 20", "aria-hidden": true } as const;
  if (decision === "build") {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="18" height="18" rx="5" fill="var(--accent)" />
        <path d="M5.5 10.4l3 3 6-6.4" fill="none" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (decision === "defer") {
    return (
      <svg {...common}>
        <rect x="1.9" y="1.9" width="16.2" height="16.2" rx="4.5" fill="none" stroke="var(--accent)" strokeWidth="1.8" />
        <path d="M8 6.5v7M12 6.5v7" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="1.9" y="1.9" width="16.2" height="16.2" rx="4.5" fill="none" stroke="var(--ink-soft)" strokeWidth="1.8" />
      <path d="M5.5 14.5l9-9" stroke="var(--ink-soft)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

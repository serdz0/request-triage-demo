"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onChange);
  };
}

// The saved choice (set on <html> before the first paint), otherwise the system setting.
function currentTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function chooseTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice still applies until the page closes.
  }
  listeners.forEach((listener) => listener());
}

const noopSubscribe = () => () => {};

// A light/dark switch. Colours come from CSS variables, so flipping data-theme restyles the whole page.
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  // Skip the sliding animation on first paint, so a saved dark choice does not visibly slide in.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => chooseTheme(dark ? "light" : "dark")}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full"
    >
      <span className="relative block h-8 w-14 rounded-full border border-line-strong bg-surface">
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-6 rounded-full bg-accent ${dark ? "translate-x-[22px]" : ""} ${ready ? "transition-transform duration-200" : ""}`}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 grid w-6 place-items-center ${dark ? "text-ink-soft" : "text-accent-ink"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="7" cy="7" r="2.6" />
            <path d="M7 1v1.4M7 11.6V13M1 7h1.4M11.6 7H13M2.8 2.8l1 1M10.2 10.2l1 1M11.2 2.8l-1 1M3.8 10.2l-1 1" />
          </svg>
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 right-1 grid w-6 place-items-center ${dark ? "text-accent-ink" : "text-ink-soft"}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" stroke="none">
            <path d="M11.6 8.7A5.2 5.2 0 0 1 5.3 2.4a5.2 5.2 0 1 0 6.3 6.3z" />
          </svg>
        </span>
      </span>
    </button>
  );
}

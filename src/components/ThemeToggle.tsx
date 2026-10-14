"use client";

import { useSyncExternalStore, useEffect, ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): ThemeMode {
  const saved = localStorage.getItem("vett-theme");
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }
  return "system";
}

function getServerSnapshot(): ThemeMode {
  return "system";
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    function applyTheme() {
      if (mode === "system") {
        document.documentElement.setAttribute(
          "data-theme",
          mediaQuery.matches ? "dark" : "light"
        );
      } else {
        document.documentElement.setAttribute("data-theme", mode);
      }
    }

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [mode]);

  function setTheme(newMode: ThemeMode) {
    localStorage.setItem("vett-theme", newMode);
    if (newMode === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute(
        "data-theme",
        systemDark ? "dark" : "light"
      );
    } else {
      document.documentElement.setAttribute("data-theme", newMode);
    }
    window.dispatchEvent(new Event("storage"));
  }

  const options: { id: ThemeMode; label: string; icon: ReactNode }[] = [
    {
      id: "light",
      label: "Light",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "13px", height: "13px" }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "13px", height: "13px" }}
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ),
    },
    {
      id: "system",
      label: "System",
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "13px", height: "13px" }}
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="group"
      aria-label="Appearance theme preference"
      className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-0.5 text-xs font-medium"
    >
      {options.map((opt) => {
        const isActive = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer ${
              isActive
                ? "bg-[var(--surface)] text-[var(--text)] shadow-xs font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text)]"
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

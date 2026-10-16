"use client";

import { useSyncExternalStore, useEffect, ReactNode } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

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
      icon: <Sun size={13} className="shrink-0" aria-hidden="true" />,
    },
    {
      id: "dark",
      label: "Dark",
      icon: <Moon size={13} className="shrink-0" aria-hidden="true" />,
    },
    {
      id: "system",
      label: "System",
      icon: <Monitor size={13} className="shrink-0" aria-hidden="true" />,
    },
  ];

  return (
    <div
      role="group"
      aria-label="Appearance theme preference"
      className="inline-flex items-center rounded-full border border-border bg-surface-muted p-0.5 text-xs font-medium"
    >
      {options.map((opt) => {
        const isActive = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
              isActive
                ? "bg-surface text-foreground shadow-xs font-medium"
                : "text-secondary-foreground hover:text-foreground"
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

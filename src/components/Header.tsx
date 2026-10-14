import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xs sticky top-0 z-10 transition-colors">
      <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight text-[var(--text)]">
            Vett
          </span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            aria-hidden="true"
          />
          <span className="hidden text-xs text-[var(--text-muted)] sm:inline-block">
            Resume & Job Match
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

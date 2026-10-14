import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="w-full border-b border-border bg-surface/80 backdrop-blur-xs sticky top-0 z-10 transition-colors">
      <div className="mx-auto flex h-14 max-w-180 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            Vett
          </span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          <span className="hidden text-xs text-muted-foreground sm:inline-block">
            Resume & Job Match
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

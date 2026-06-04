/**
 * SiteFooter — quiet sign-off with a thread-rule on top. Carries the Kairos
 * attribution and a little fourth-wall-adjacent menace.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-border/60 bg-background/60">
      <div className="thread-rule absolute inset-x-0 top-0" />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:text-left">
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          REDTHREAD — pull the thread.
        </p>
        <p className="font-mono text-[11px] text-muted-foreground/70">
          Compiled by <span className="text-foreground">Kairos</span>. We shadow
          our names, for they are watching.
        </p>
      </div>
    </footer>
  );
}

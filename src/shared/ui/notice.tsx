export function Notice({ children }: { children: string }) {
  return (
    <p className="rounded-xl border-[3px] border-ink bg-pink/90 px-4 py-2.5 font-mono text-sm font-bold text-ink shadow-[4px_4px_0_#111]">
      {children}
    </p>
  );
}

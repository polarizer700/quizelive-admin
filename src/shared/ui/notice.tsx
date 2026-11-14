export function Notice({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-sm text-rose-800 backdrop-blur">
      {children}
    </p>
  );
}

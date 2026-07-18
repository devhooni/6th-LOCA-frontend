export function TagChip({ children, active = false, compact = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${
        compact ? "px-2.5 py-1 text-[11px]" : "min-h-10 px-4 py-2 text-sm"
      } ${
        active ? "border-black bg-black text-white" : "border-[var(--border)] bg-white text-zinc-600"
      }`}
    >
      {children}
    </span>
  );
}

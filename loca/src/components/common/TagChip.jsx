/**
 * TagChip — Minimal pill-style chip for mood/category tags
 */
export function TagChip({ children, active = false, compact = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip tap-target ${active ? "chip--active" : ""} ${compact ? "chip--sm" : ""}`}
    >
      {children}
    </button>
  );
}

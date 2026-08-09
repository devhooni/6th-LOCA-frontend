export function TagChip({ children, active = false, onClick }) {
  return (
    <button type="button" onClick={onClick} className={"chip" + (active ? " active" : "")}>
      {children}
    </button>
  );
}

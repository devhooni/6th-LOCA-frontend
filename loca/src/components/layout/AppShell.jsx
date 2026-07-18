import { BottomNav } from "./BottomNav";

export function AppShell({ children, showNav = true, flush = false }) {
  return (
    <div className="app-shell">
      {showNav ? <BottomNav /> : null}
      <main className={`app-content ${flush ? "app-content--flush" : ""}`}>
        {children}
      </main>
    </div>
  );
}

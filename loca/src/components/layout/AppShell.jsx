import { BottomNav } from "./BottomNav";

export function AppShell({ children, showNav = true }) {
  return (
    <div className="mobile-shell">
      {showNav && <BottomNav />}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

import { BottomNav } from "./BottomNav";

/**
 * AppShell — Mobile-first page wrapper
 * - showNav: false hides BottomNav (login, onboarding)
 * - bare: removes bottom padding (full-screen pages like map)
 */
export function AppShell({ children, showNav = true, bare = false }) {
  return (
    <div className="mobile-shell">
      <div className={bare ? "page-root--bare" : "page-root"}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

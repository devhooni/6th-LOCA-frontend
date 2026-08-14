import { useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { cn } from "@/src/lib/utils";

export function AppShell({ children, className }) {
  const location = useLocation();
  const hideNav = ["/onboarding", "/login", "/signup"].includes(location.pathname);

  const isExplore = location.pathname === "/explore";
  const isAdd = location.pathname === "/add";

  return (
    <div className="mx-auto flex h-screen w-full max-w-[430px] border-x border-[var(--color-neutral-border)] flex-col bg-[var(--color-neutral-background)] shadow-2xl overflow-hidden relative">
      {/* TopBar Box */}
      {!hideNav && (
        <div className="flex-none w-full">
          <TopBar />
        </div>
      )}
      
      {/* AppShell Main Content Box */}
      <main 
        className={cn(
          "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden",
          !hideNav && !isExplore && !isAdd && "p-4",
          className
        )}
      >
        {children}
      </main>

      {/* BottomBar Box */}
      {!hideNav && (
        <div className="flex-none w-full">
          <BottomBar />
        </div>
      )}
    </div>
  );
}

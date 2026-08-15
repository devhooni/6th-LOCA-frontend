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
    <div className="mx-auto flex h-screen w-full max-w-[430px] flex-col bg-white overflow-hidden relative">
      {!hideNav && (
        <div className="flex-none w-full">
          <TopBar />
        </div>
      )}
      
      <main 
        className={cn(
          "flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden",
          !hideNav && !isExplore && !isAdd && "px-5 py-4",
          className
        )}
      >
        {children}
      </main>

      {!hideNav && (
        <div className="flex-none w-full">
          <BottomBar />
        </div>
      )}
    </div>
  );
}

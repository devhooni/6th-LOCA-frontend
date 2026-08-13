import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { cn } from "@/src/lib/utils";

export function AppShell({ children, className }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] border-x border-[var(--color-neutral-border)] flex-col bg-[var(--color-neutral-background)] shadow-2xl overflow-hidden relative">
      <TopBar />
      
      {/* 
        Main content area 
        pt-14: Accounts for TopBar height (3.5rem)
        pb-20: Accounts for BottomBar height (4rem) + safe area padding
      */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden pt-14 pb-24",
          className
        )}
      >
        {children}
      </main>

      <BottomBar />
    </div>
  );
}

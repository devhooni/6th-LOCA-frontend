import { Bell } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function TopBar({ className }) {
  return (
    <header
      className={cn(
        "w-full h-12 flex items-center justify-between px-5 flex-none",
        "bg-white border-b border-[var(--color-neutral-border)]",
        className
      )}
    >
      <span className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">LOCA</span>
      <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="알림">
        <Bell size={20} strokeWidth={1.8} />
      </button>
    </header>
  );
}

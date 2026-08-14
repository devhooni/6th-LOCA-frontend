import { MapPin, Bell } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function TopBar({ className }) {
  return (
    <header role="banner" aria-label="LOCA navigation"
      className={cn(
        "w-full h-16 flex items-center justify-between px-4 flex-none z-10",
        "bg-[var(--color-brand-soft)]/95 backdrop-blur-md shadow-sm",
        "border-b border-[var(--color-neutral-border)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-full py-2 transition-transform duration-200 hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]">
        <img src="/brand-icon.svg" alt="LOCA" className="h-6 w-6 object-contain" />
        <span className="text-lg font-semibold text-[var(--color-brand-primary)]">LOCA</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-neutral-background)] hover:text-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] active:scale-95" aria-label="Notifications">
            <Bell size={20} strokeWidth={2} />
          </button>
      </div>
    </header>
  );
}

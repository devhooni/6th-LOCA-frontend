import { MapPin, Bell } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function TopBar({ className }) {
  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 z-50 -translate-x-1/2 w-full max-w-[430px]",
        "flex h-14 items-center justify-between px-4",
        "bg-[var(--color-neutral-surface)]/80 backdrop-blur-md",
        "border-b border-[var(--color-neutral-border)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[var(--color-neutral-surface)] shadow-sm">
          <MapPin size={18} strokeWidth={2.5} />
        </div>
        <span className="text-xl font-black tracking-tight text-[var(--color-brand-primary)]">
          LOCA
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-neutral-background)] hover:text-[var(--color-brand-primary)] active:scale-95">
          <Bell size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

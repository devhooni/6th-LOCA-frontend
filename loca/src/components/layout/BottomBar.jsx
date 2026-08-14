import { Compass, Sparkles, Plus, PenLine, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const navItems = [
  { id: "explore", icon: Compass, label: "explore", path: "/explore" },
  { id: "foryou", icon: Sparkles, label: "for you", path: "/foryou" },
  { id: "add", icon: Plus, label: "", path: "/add", isPrimary: true },
  { id: "review", icon: PenLine, label: "review", path: "/review" },
  { id: "my", icon: User, label: "my", path: "/my" },
];

export function BottomBar({ className }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <nav
      className={cn(
        "w-full flex-none z-10",
        "bg-[var(--color-neutral-surface)]/90 backdrop-blur-lg",
        "border-t border-[var(--color-neutral-border)]",
        "pb-safe", // for iOS safe area if needed
        className
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const IconComponent = item.icon;

          const handleNavClick = (e, path) => {
            const event = new CustomEvent("loca-navigation-intercept", {
              detail: { to: path },
              cancelable: true,
            });
            const allowed = window.dispatchEvent(event);
            if (!allowed) {
              e.preventDefault();
            }
          };

          if (item.isPrimary) {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                aria-label="Add"
                className="group relative flex flex-col items-center justify-center active:scale-95 transition-transform"
              >
                {/* Floating Primary Button */}
                <div className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-[var(--color-neutral-surface)] shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
                  <IconComponent size={28} strokeWidth={2.5} />
                </div>
                {/* Invisible spacer to maintain layout */}
                <div className="h-6 w-14"></div>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 transition-colors active:scale-95",
                isActive
                  ? "text-[var(--color-brand-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              <IconComponent 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span 
                className={cn(
                  "text-[10px] font-semibold tracking-wide capitalize",
                  isActive ? "text-[var(--color-brand-primary)]" : ""
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

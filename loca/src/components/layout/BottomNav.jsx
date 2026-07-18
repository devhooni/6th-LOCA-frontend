import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";

const navItems = [
  { href: "/", label: "홈", match: (path) => path === "/" },
  { href: "/explore", label: "Explore", match: (path) => path.startsWith("/explore") || path.startsWith("/place/") },
  { href: "/map", label: "지도", match: (path) => path.startsWith("/map") },
  { href: "/review/write", label: "기록하기", match: (path) => path.startsWith("/review") },
  { href: "/my", label: "마이페이지", match: (path) => path.startsWith("/my") },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <header className="app-header">
      <Link className="text-2xl font-black tracking-tight" to="/">
        LOCA
      </Link>

      <nav aria-label="주요 메뉴" className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const active = item.match(pathname);

          return (
            <Link
              className={`flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold interactive ${
                active ? "bg-black text-white" : "text-zinc-500 hover:text-zinc-900"
              }`}
              key={item.href}
              to={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
        <Link className="hidden h-10 items-center px-2 hover:text-zinc-900 md:flex" to="/explore">
          검색
        </Link>
        <button aria-label="알림" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-100" type="button">
          <Icon className="h-5 w-5" name="bell" />
        </button>
        <Link className="h-10 rounded-full border border-[var(--border)] px-4 leading-10 hover:bg-zinc-50" to="/my">
          민지님
        </Link>
      </div>
    </header>
  );
}

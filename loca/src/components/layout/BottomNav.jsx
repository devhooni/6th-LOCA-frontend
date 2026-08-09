import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { href: "/", label: "홈", match: (p) => p === "/" },
  { href: "/explore", label: "탐색", match: (p) => p.startsWith("/explore") || p.startsWith("/place/") && !p.startsWith("/place/new") },
  { href: "/place/new", label: "추가", isFab: true, match: (p) => p.startsWith("/place/new") },
  { href: "/for-you", label: "ForYou", match: (p) => p.startsWith("/for-you") },
  { href: "/my", label: "마이", match: (p) => p.startsWith("/my") },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="bottom-nav" style={{ padding: "0 8px" }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.match(pathname);
        if (item.isFab) {
          return (
            <Link
              key={item.href}
              to={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: isActive ? "#000" : "#fff",
                color: isActive ? "#fff" : "#000",
                border: "2px solid #000",
                fontSize: 24,
                fontWeight: "bold",
                margin: "0 8px"
              }}
            >
              +
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            to={item.href}
            style={{ 
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "#000" : "#888" 
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

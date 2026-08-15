import { useState } from "react";
import { Compass, Sparkles, Plus, PenLine, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const navItems = [
  { id: "explore", icon: Compass, label: "EXPLORE", path: "/explore" },
  { id: "foryou", icon: Sparkles, label: "FOR YOU", path: "/foryou" },
  { id: "add", icon: Plus, label: "", path: "/add", isPrimary: true },
  { id: "review", icon: PenLine, label: "REVIEW", path: "/review" },
  { id: "my", icon: User, label: "MY", path: "/my" },
];

export function BottomBar({ className }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAnimatingCompass, setIsAnimatingCompass] = useState(false);
  const [isAnimatingSparkles, setIsAnimatingSparkles] = useState(false);
  const [isAnimatingReview, setIsAnimatingReview] = useState(false);
  const [isAnimatingMy, setIsAnimatingMy] = useState(false);

  return (
    <nav
      className={cn(
        "w-full flex-none bg-white border-t border-[var(--color-neutral-border)] pb-safe",
        className
      )}
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const IconComponent = item.icon;

          const handleNavClick = (e, path) => {
            if (item.id === "explore") {
              setIsAnimatingCompass(false);
              requestAnimationFrame(() => {
                setIsAnimatingCompass(true);
              });
              setTimeout(() => {
                setIsAnimatingCompass(false);
              }, 700);
            }

            if (item.id === "foryou") {
              setIsAnimatingSparkles(false);
              requestAnimationFrame(() => {
                setIsAnimatingSparkles(true);
              });
              setTimeout(() => {
                setIsAnimatingSparkles(false);
              }, 700);
            }

            if (item.id === "review") {
              setIsAnimatingReview(false);
              requestAnimationFrame(() => {
                setIsAnimatingReview(true);
              });
              setTimeout(() => {
                setIsAnimatingReview(false);
              }, 650);
            }

            if (item.id === "my") {
              setIsAnimatingMy(false);
              requestAnimationFrame(() => {
                setIsAnimatingMy(true);
              });
              setTimeout(() => {
                setIsAnimatingMy(false);
              }, 700);
            }

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
                aria-label="추가"
                className="flex items-center justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-white active:scale-95 transition-transform shadow-xs">
                  <IconComponent size={28} strokeWidth={2} />
                </div>
              </Link>
            );
          }

          if (item.id === "explore") {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center relative",
                    isAnimatingCompass && "animate-compass-bounce"
                  )}
                >
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="overflow-visible"
                  >
                    <defs>
                      {/* N극(레드) / S극(블루) 대각선 그라디언트 정의 */}
                      <linearGradient id="compass-needle-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="48%" stopColor="#ef4444" />
                        <stop offset="52%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>

                    {/* 나침반 외곽 원 + 클릭 시 은은한 라이트 그레이 배경 채움 */}
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className={cn(isAnimatingCompass && "animate-compass-bg")}
                    />

                    {/* 원래 Lucide 나침반 4각 다이아몬드 초침 모양 그대로 유지 + 회전하며 N(빨강)/S(파랑) 채움 */}
                    <polygon
                      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                      className={cn(isAnimatingCompass && "animate-needle-spin-color")}
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          }

          if (item.id === "foryou") {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <div className="flex items-center justify-center relative">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="overflow-visible"
                  >
                    {/* 오리지널 Lucide 중앙 큰 별 (0.0초 시작) */}
                    <path
                      d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.557a2 2 0 0 0 1.595 1.595l5.557 1.051a1 1 0 0 1 0 1.966l-5.557 1.051a2 2 0 0 0-1.595 1.595l-1.051 5.557a1 1 0 0 1-1.966 0l-1.051-5.557a2 2 0 0 0-1.595-1.595L2.814 12.53a1 1 0 0 1 0-1.966l5.557-1.051a2 2 0 0 0 1.595-1.595z"
                      className={cn(isAnimatingSparkles && "animate-sparkle-main-stagger")}
                    />
                    {/* 우상단 작은 별 (0.12초 딜레이) */}
                    <g className={cn(isAnimatingSparkles && "animate-sparkle-sub1-stagger")}>
                      <path d="M20 2v4" />
                      <path d="M22 4h-4" />
                    </g>
                    {/* 좌하단 작은 별 (0.22초 딜레이 - 왼쪽 아래로 배치 조정) */}
                    <g className={cn(isAnimatingSparkles && "animate-sparkle-sub2-stagger")}>
                      <path d="M4 16v4" />
                      <path d="M6 18H2" />
                    </g>
                  </svg>
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          }

          if (item.id === "review") {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <div className="flex items-center justify-center relative">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="overflow-visible"
                  >
                    <defs>
                      {/* 펜 윗쪽(지우개): 사랑스러운 핑크(#f472b6) / 펜 본체: 생동감 넘치는 노란색(#fbbf24) 정의 */}
                      <linearGradient id="pen-yellow-pink-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="35%" stopColor="#f472b6" />
                        <stop offset="37%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>

                    {/* 오직 X축으로만 스윽 이동하는 펜 본체 */}
                    <g className={cn(isAnimatingReview && "animate-pen-body-x")}>
                      {/* 부드러운 불투명도(opacity) 페이드인/아웃으로 노랑/핑크 색상이 채워지는 컬러 레이어 */}
                      <path
                        d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                        fill="url(#pen-yellow-pink-gradient)"
                        stroke="none"
                        className={cn(
                          "transition-opacity duration-300 pointer-events-none",
                          isAnimatingReview ? "animate-pen-smooth-fade" : "opacity-0"
                        )}
                      />
                      {/* 원래의 선명한 외곽선 레이어 */}
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                      <path d="m15 5 4 4" />
                    </g>
                    {/* 기본 9.5px 틈 유지 + 펜 이동 시 1:1로 틈이 추적하는 밑줄 */}
                    <path
                      d="M2 22h20"
                      className={cn(
                        "pen-line-base-gap",
                        isAnimatingReview && "animate-pen-line-gap"
                      )}
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          }

          if (item.id === "my") {
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleNavClick(e, item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center relative",
                    isAnimatingMy && "animate-my-bounce"
                  )}
                >
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={isActive ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="overflow-visible"
                  >
                    {/* 오리지널 Lucide User: 사람 몸체 (어깨/상체) */}
                    <path
                      d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
                      className={cn(isAnimatingMy && "animate-my-gray-fill")}
                    />
                    {/* 오리지널 Lucide User: 사람 머리 (원형) */}
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      className={cn(isAnimatingMy && "animate-my-gray-fill")}
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-14 transition-colors",
                isActive
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)]"
              )}
            >
              <IconComponent size={25} strokeWidth={isActive ? 2 : 1.6} />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

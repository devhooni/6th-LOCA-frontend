import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, PenLine, User, MapPin, Heart, Bookmark, Share2, LogIn, UserPlus, X } from "lucide-react";

export default function OnboardingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 로그인된 상태(accessToken 존재)라면 바로 탐색 화면('/explore')으로 리다이렉트
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/explore", { replace: true });
    }
  }, [navigate]);

  // 8개 메인 브랜드 아이콘 목록
  const iconList = [
    { Icon: Compass, color: "text-zinc-800", size: 36 },
    { Icon: Sparkles, color: "text-indigo-500", size: 36 },
    { Icon: MapPin, color: "text-rose-500", size: 36 },
    { Icon: Heart, color: "text-pink-500", size: 36 },
    { Icon: PenLine, color: "text-emerald-600", size: 36 },
    { Icon: Bookmark, color: "text-amber-500", size: 36 },
    { Icon: User, color: "text-amber-600", size: 36 },
    { Icon: Share2, color: "text-cyan-600", size: 36 },
  ];

  // 완전히 움직이지 않고 화면에 깔끔하게 배치되는 정격자(Static Grid) 아이템 생성 (4열 x 5행 = 20개 셀)
  const columnsCount = 4;
  const rowsCount = 5;
  const gridItems = [];

  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < columnsCount; c++) {
      const idx = r * columnsCount + c;
      const iconObj = iconList[idx % iconList.length];

      const leftPos = `${8 + c * 26}%`;
      const topPos = `${6 + r * 20}%`;

      gridItems.push({
        ...iconObj,
        left: leftPos,
        top: topPos,
      });
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-between h-full min-h-screen px-6 py-12 text-center bg-white overflow-hidden select-none">
      {/* 깔끔하게 고정 배치된 정격자(Static Grid) 배경 아이콘들 (opacity: 0.35) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-35">
        {gridItems.map(({ Icon, size, color, left, top }, index) => (
          <div
            key={index}
            className={`absolute ${color}`}
            style={{
              left: left,
              top: top,
            }}
          >
            <Icon size={size} strokeWidth={1.8} />
          </div>
        ))}
      </div>

      {/* Top Spacer */}
      <div className="z-10" />

      {/* Brand Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 my-auto">
        <img
          src="/brand-image.svg"
          alt="LOCA Logo"
          className="h-28 mb-2 object-contain filter drop-shadow-sm"
        />
        <p className="text-xs font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase bg-white/80 px-3 py-1 rounded-full backdrop-blur-xs border border-gray-100">
          SAVE YOUR STORY · SHARE YOUR SPOTS
        </p>
      </div>

      {/* Action Button */}
      <div className="relative z-10 w-full max-w-xs pb-6">
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-primary)] py-4 text-sm font-bold text-[var(--color-neutral-surface)] shadow-lg shadow-black/10 transition-all active:scale-95 hover:bg-[var(--color-brand-primary)]/90 cursor-pointer"
        >
          시작하기
        </button>
      </div>

      {/* 로그인 / 회원가입 선택 바텀시트 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl space-y-5 animate-slide-up">
            {/* Header & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                LOCA와 함께 시작하기
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] text-left">
              나만의 특별한 장소를 저장하고 새로운 이야기를 찾아보세요.
            </p>

            {/* Selection Buttons */}
            <div className="space-y-3 pt-1">
              {/* 로그인 버튼 */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login");
                }}
                className="flex items-center justify-between w-full p-4 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold shadow-sm active:scale-98 transition-transform cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <LogIn size={18} />
                  <span>기존 계정으로 로그인</span>
                </div>
                <span className="text-xs opacity-70">➔</span>
              </button>

              {/* 회원가입 버튼 */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/signup");
                }}
                className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] text-sm font-bold active:scale-98 transition-transform cursor-pointer border border-gray-200/60"
              >
                <div className="flex items-center space-x-3">
                  <UserPlus size={18} />
                  <span>새로 회원가입하기</span>
                </div>
                <span className="text-xs text-gray-400">➔</span>
              </button>
            </div>

            {/* 둘러보기 옵션 */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/explore");
                }}
                className="text-xs text-[var(--color-text-muted)] underline hover:text-[var(--color-text-secondary)] transition-colors"
              >
                로그인 없이 먼저 둘러보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

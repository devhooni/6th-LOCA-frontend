import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, Sparkles, PenLine, User, MapPin, Heart, Bookmark, Share2, LogIn, UserPlus, X } from "lucide-react";

export default function OnboardingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
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

      {/* Action Buttons */}
      <div className="relative z-10 w-full max-w-xs space-y-3 pb-6">
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-primary)] py-4 text-sm font-bold text-[var(--color-neutral-surface)] shadow-lg shadow-black/10 transition-all active:scale-95 hover:bg-[var(--color-brand-primary)]/90 cursor-pointer"
        >
          시작하기
        </button>

        <button
          onClick={() => setShowGuideModal(true)}
          className="flex w-full items-center justify-center py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          LOCA 이용방법
        </button>
      </div>

      {/* LOCA 이용방법 안내 바텀시트 모달 */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setShowGuideModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl space-y-5 animate-slide-up max-h-[85vh] overflow-y-auto">
            {/* Header & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Compass size={18} className="text-zinc-800" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  LOCA 이용방법
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Guide Step Items */}
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex-none p-2 rounded-xl bg-white text-zinc-800 shadow-xs border border-zinc-200/60">
                  <Compass size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">1. EXPLORE (탐색)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    지도를 둘러보며 공용 추천 장소와 나만의 비밀 장소를 한눈에 확인하세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex-none p-2 rounded-xl bg-white text-amber-500 shadow-xs border border-zinc-200/60">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">2. FOR YOU (맞춤 추천)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    작성한 리뷰 데이터를 바탕으로 내 취향에 딱 맞는 장소를 추천받으세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex-none p-2 rounded-xl bg-white text-rose-500 shadow-xs border border-zinc-200/60">
                  <MapPin size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">3. ADD & REVIEW (기록 & 공유)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    새로운 장소를 등록하고, 방문 경험과 동행자, 분위기 태그를 리뷰로 남겨보세요.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex-none p-2 rounded-xl bg-white text-indigo-500 shadow-xs border border-zinc-200/60">
                  <User size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">4. MY (나만의 보관함)</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    내가 등록한 장소와 남긴 리뷰들을 편리하게 모아보고 관리하세요.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setShowGuideModal(false);
                  setShowAuthModal(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold active:scale-98 transition-transform cursor-pointer shadow-xs"
              >
                지금 시작하기
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
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
          </div>
        </div>
      )}
    </div>
  );
}

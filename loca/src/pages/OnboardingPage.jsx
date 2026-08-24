import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Compass,
  Sparkles,
  PenLine,
  User,
  MapPin,
  Heart,
  Bookmark,
  Share2,
  LogIn,
  UserPlus,
  X,
  ChevronDown,
} from "lucide-react";
import peekFriendsIllustration from "/imgs/start.png";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";


// LOCA 서비스 이용방법 4단계 가이드 데이터 (GIF 시연 및 상세 설명 포함)
const GUIDE_STEPS = [
  {
    id: "explore",
    number: "1",
    title: "1. EXPLORE (탐색)",
    summary: "지도와 카테고리로 홍대 주변의 추천 공용 스팟과 개인 장소를 한눈에 확인하세요.",
    icon: Compass,
    iconColor: "text-zinc-800",
    iconBg: "bg-zinc-100",
    gif: "/imgs/guide_explore.gif",
    fallbackImg: "/imgs/start.png",
    description: "홍대 곳곳의 감성 카페와 맛집을 인터랙티브 지도로 탐험하고, 카카오맵 길찾기와 생생한 리뷰를 즉시 확인할 수 있습니다.",
    features: [
      "지도 기반 실시간 스팟 마커 & 카카오맵 연동",
      "분위기/카테고리 태그별 원클릭 필터링",
      "공개 장소와 나만의 비밀 장소(개인) 토글",
    ],
  },
  {
    id: "foryou",
    number: "2",
    title: "2. FOR YOU (맞춤 추천)",
    summary: "작성한 리뷰 데이터를 바탕으로 내 취향에 딱 맞는 장소를 추천받으세요.",
    icon: Sparkles,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    gif: "/imgs/guide_foryou.gif",
    fallbackImg: "/imgs/Foryou.png",
    description: "로카프렌즈 4인방이 내가 작성한 리뷰 키워드를 분석하여 취향에 꼭 맞는 장소 5곳을 엄선해 해금해드립니다.",
    features: [
      "리뷰 3개 작성 시 취향 분석 알고리즘 해금",
      "나만을 위해 엄선된 Top 5 추천 카드 슬라이더",
      "새로운 장소 발굴을 위한 실시간 다시 추천받기",
    ],
  },
  {
    id: "review",
    number: "3",
    title: "3. ADD & REVIEW (기록 & 공유)",
    summary: "새로운 장소를 등록하고, 방문 경험과 동행자, 분위기 태그를 리뷰로 남겨보세요.",
    icon: MapPin,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
    gif: "/imgs/guide_review.gif",
    fallbackImg: "/imgs/alone.png",
    description: "누구와 방문했는지(혼자/친구/연인/가족), 어떤 분위기였는지 솔직한 리뷰와 사진을 남겨 다른 사람들과 공유해보세요.",
    features: [
      "4가지 동행인(혼자/친구/연인/가족)별 감성 기록",
      "0ms 즉각 검색과 스마트 장소 선택 박스",
      "사진 업로드 및 다채로운 키워드 태그 지정",
    ],
  },
  {
    id: "my",
    number: "4",
    title: "4. MY (나만의 보관함)",
    summary: "내가 등록한 장소와 남긴 리뷰들을 편리하게 모아보고 관리하세요.",
    icon: User,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
    gif: "/imgs/guide_my.gif",
    fallbackImg: "/imgs/Login.png",
    description: "내가 저장한 비밀 스팟과 작성한 리뷰를 언제든 수정·삭제하고, 12종의 귀여운 로카프렌즈 아바타로 프로필을 꾸며보세요.",
    features: [
      "12종의 2D 카툰 로카프렌즈 프로필 아바타 꾸미기",
      "내가 등록한 장소와 남긴 리뷰 모아보기 및 관리",
      "언제 어디서나 간편한 계정 정보 동기화",
    ],
  },
];

export default function OnboardingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [expandedGuideStep, setExpandedGuideStep] = useState(null);

  // 가이드 모달이 열릴 때 항상 모든 아코디언이 닫힌 상태로 초기화
  useEffect(() => {
    if (showGuideModal) {
      setExpandedGuideStep(null);
    }
  }, [showGuideModal]);

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
    <div className="relative flex flex-col items-center justify-between h-full w-full px-6 py-10 text-center bg-white overflow-hidden select-none">
      {/* 깔끔하게 고정 배치된 정격자(Static Grid) 배경 아이콘들 (opacity: 0.35) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-35">
        {gridItems.map(({ Icon, size, color, left, top }, index) => (
          <div
            key={index}
            className={`absolute ${color}`}
            style={{
              left: left,
              top: top,
            }}>
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
          className="flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-primary)] py-4 text-sm font-bold text-[var(--color-neutral-surface)] shadow-lg shadow-black/10 transition-all active:scale-95 hover:bg-[var(--color-brand-primary)]/90 cursor-pointer">
          시작하기
        </button>

        <button
          onClick={() => setShowGuideModal(true)}
          className="flex w-full items-center justify-center py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
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

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 pt-7 shadow-2xl space-y-5 animate-slide-up max-h-[85vh] overflow-visible">
            {/* 바텀시트 상단 모서리에 쏙 걸쳐 튀어나온 오디 & 말풍선 (Absolute Top Overflow) */}
            <div className="absolute -top-14 left-5 right-5 flex items-end space-x-2.5 pointer-events-none z-20">
              {/* 바텀시트 위로 빼꼼 튀어나온 오디 */}
              <img
                src="/imgs/odi-character.png"
                alt="Odi Mascot"
                className="w-18 h-18 object-contain drop-shadow-md flex-none animate-bounce-subtle pointer-events-auto"
                onError={(e) => {
                  e.target.src = "/imgs/Odi.png";
                }}
              />

              {/* 오디의 귀여운 말풍선 버블 */}
              <div className="relative bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-indigo-100/80 text-left mb-2 pointer-events-auto">
                {/* 말풍선 꼬리 (좌하단) */}
                <div className="absolute -left-1.5 bottom-3 w-3 h-3 bg-white border-l border-b border-indigo-100/80 rotate-45" />
                <p className="text-xs font-bold text-zinc-900 leading-snug">
                  안녕 난{" "}
                  <span className="text-indigo-600 font-extrabold">오디</span>
                  야! 📍
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5 whitespace-nowrap">
                  LOCA 서비스 사용법을 알려줄게!
                </p>
              </div>
            </div>

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
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Guide Step Items (클릭 시 GIF 시연 화면 및 상세 설명 아코디언 토글) */}
            <div className="space-y-3 text-left max-h-[58vh] overflow-y-auto pr-1 no-scrollbar">
              {GUIDE_STEPS.map((step) => {
                const IconComponent = step.icon;
                const isExpanded = expandedGuideStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? "bg-white border-zinc-300 shadow-sm"
                        : "bg-zinc-50/80 hover:bg-zinc-100/80 border-zinc-100 cursor-pointer"
                    }`}
                  >
                    {/* 상단 헤더 박스 (클릭하여 열기/닫기) */}
                    <div
                      onClick={() =>
                        setExpandedGuideStep((prev) =>
                          prev === step.id ? null : step.id
                        )
                      }
                      className="flex items-start justify-between p-3.5 cursor-pointer gap-2.5"
                    >
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div
                          className={`flex-none p-2 rounded-xl bg-white shadow-2xs border border-zinc-200/60 ${step.iconColor}`}
                        >
                          <IconComponent size={18} />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <span>{step.title}</span>
                          </h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            {step.summary}
                          </p>
                        </div>
                      </div>

                      {/* 아코디언 확장 화살표 */}
                      <button
                        type="button"
                        className={`text-zinc-400 p-1 transition-transform duration-200 flex-none ${
                          isExpanded ? "rotate-180 text-zinc-800" : ""
                        }`}
                        aria-label="시연 화면 보기"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    {/* 아코디언 펼침 영역: 순수 시연 GIF 전체화면 (잘림 없이 원본 비율 온전히 노출) */}
                    {isExpanded && (
                      <div className="p-3 pt-0 animate-fade-in">
                        <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-100 flex items-center justify-center shadow-xs">
                          <img
                            src={step.gif}
                            alt={`${step.title} 시연 GIF`}
                            className="w-full h-auto object-contain block"
                            onError={(e) => {
                              e.target.src = step.fallbackImg;
                            }}
                          />
                        </div>
                      </div>
                    )}


                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-1">
              <button
                type="button"
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

          <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 pt-6 shadow-2xl space-y-5 animate-slide-up overflow-visible">
            {/* 바텀시트 상단 경계선에 깔끔하게 빼꼼 튀어나온 로카프렌즈 4인방 (텍스트/말풍선 없음) */}
            <div className="absolute -top-[74px] -left-6 flex justify-start pointer-events-none z-20">
              <ImageWithSkeleton
                src={peekFriendsIllustration}
                alt="LOCA Friends Peeking"
                wrapperClassName="w-[300px] h-[104px] flex items-center justify-start"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>


            {/* Header & Close */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                LOCA 시작하기
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
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
                className="flex items-center justify-between w-full p-4 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold shadow-sm active:scale-98 transition-transform cursor-pointer">
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
                className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] text-sm font-bold active:scale-98 transition-transform cursor-pointer border border-gray-200/60">
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

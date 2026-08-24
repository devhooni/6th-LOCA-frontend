import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronLeft, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";


// 로카프렌즈 4인방 캐릭터 상세 정보 (순서: 로키 -> 오디 -> 코코 -> 아키)
const CHARACTERS = [
  {
    id: "loki",
    nameKo: "로키",
    nameEn: "Loki",
    role: "호기심 많은 홍대 길잡이 여우",
    mbti: "ENFP",
    colorTheme: "from-amber-400 to-amber-600",
    bgLight: "bg-amber-50/80",
    textColor: "text-amber-600",
    badgeBg: "bg-amber-100 text-amber-800",
    borderAccent: "border-amber-100",
    image: "/imgs/Loki.png",
    intro:
      "베레모와 돋보기를 항상 챙겨 다니는 탐험가 여우! 골목 구석구석 숨겨진 감성 카페와 LP바를 기가 막히게 찾아내요.",
    traits: ["#골목탐험가", "#카페투어", "#나침반수집", "#트렌드세터"],
    favoriteSpot: "와우산로 조용한 골목의 북카페",
    personality:
      "밝고 에너지 넘치며, 새로운 장소를 발견했을 때 꼬리를 격하게 흔들어요.",
  },
  {
    id: "odi",
    nameKo: "오디",
    nameEn: "Odi",
    role: "반짝이는 스팟 마커 요정",
    mbti: "INFJ",
    colorTheme: "from-purple-400 to-purple-600",
    bgLight: "bg-purple-50/80",
    textColor: "text-purple-600",
    badgeBg: "bg-purple-100 text-purple-800",
    borderAccent: "border-purple-100",
    image: "/imgs/Odi.png",
    intro:
      "머리 위에 달린 보라색 핀으로 특별한 장소를 기록하는 요정! 당신이 남긴 소중한 리뷰를 읽고 딱 맞는 장소를 추천해줘요.",
    traits: ["#스팟기록", "#취향분석", "#감성스팟", "#조용한힐링"],
    favoriteSpot: "경의선 숲길 끝자락 잔디 언덕",
    personality:
      "섬세하고 기억력이 뛰어나며, 친구들의 장소 취향을 완벽하게 기억해요.",
  },
  {
    id: "coco",
    nameKo: "코코",
    nameEn: "Coco",
    role: "시크한 예술 감성 턱시도 고양이",
    mbti: "INTJ",
    colorTheme: "from-sky-400 to-indigo-600",
    bgLight: "bg-sky-50/80",
    textColor: "text-sky-600",
    badgeBg: "bg-sky-100 text-sky-800",
    borderAccent: "border-sky-100",
    image: "/imgs/CoCo.png",
    intro:
      "반짝이는 눈망울의 예술 감성 고양이! 전시회, 독립서점, 레트로 소품샵 등 감각적인 공간을 가장 먼저 알아봐요.",
    traits: ["#예술전시", "#독립서점", "#소품샵투어", "#시크도도"],
    favoriteSpot: "상수동 골목의 빈티지 레코드 샵",
    personality:
      "도도하지만 좋아하는 스팟을 물어보면 열정적으로 비밀 장소를 알려줘요.",
  },
  {
    id: "archie",
    nameKo: "아키",
    nameEn: "Archie",
    role: "맛있는 행복을 찾는 수달",
    mbti: "ISFP",
    colorTheme: "from-orange-400 to-orange-600",
    bgLight: "bg-orange-50/80",
    textColor: "text-orange-600",
    badgeBg: "bg-orange-100 text-orange-800",
    borderAccent: "border-orange-100",
    image: "/imgs/Archie.png",
    intro:
      "통통한 볼살이 매력적인 미식가 수달! 친구들과 함께 맛있는 디저트와 로컬 맛집을 찾아 떠나는 걸 세상에서 가장 좋아해요.",
    traits: ["#미식탐방", "#디저트러버", "#친구들과함께", "#행복한먹방"],
    favoriteSpot: "홍대 놀이터 근처 수제 베이커리",
    personality:
      "온순하고 다정하며, 맛있는 음식을 먹을 때 두 손을 모으고 감탄해요.",
  },
];

export default function FriendsPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full bg-[#f8f9fa] flex flex-col overflow-y-auto no-scrollbar select-none animate-fade-in">
      {/* 1. 상단 네비게이션 헤더 */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 h-12 flex items-center justify-between flex-none">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 transition-colors -ml-1.5 p-1.5 rounded-xl cursor-pointer">
          <ChevronLeft size={20} />
          <span className="text-xs font-semibold">뒤로가기</span>
        </button>

        <h2 className="text-sm font-bold text-gray-900">LOCA Friends</h2>

        <div className="w-8" />
      </div>

      {/* 2. 히어로 배너 */}
      <div className="relative w-full bg-gradient-to-b from-zinc-900 to-zinc-800 text-white px-6 pt-7 pb-8 overflow-hidden flex-none">
        <div className="relative z-10 space-y-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="text-amber-300">로카프렌즈 4인방</span>을
            소개합니다!
          </h1>

          <p className="text-xs text-zinc-300 leading-relaxed ">
            당신의 로컬 라이프 탐험을 함께할 귀여운 로카프렌즈들을 만나보세요.
          </p>
        </div>

        {/* 배경 원형 블러 데코레이션 */}
        <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 3. Y축 세로 스크롤 캐릭터 4인방 소개 피드 (로키 -> 오디 -> 코코 -> 아키 순서) */}
      <div className="px-5 py-6 space-y-8">
        {CHARACTERS.map((char, index) => (
          <div
            key={char.id}
            className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100/90 space-y-5 relative overflow-hidden text-left">
            {/* 캐릭터 번호 뱃지 */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-black text-gray-300 tracking-wider"
                style={{
                  fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
                }}>
                0{index + 1} / 04
              </span>

              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold",
                  char.badgeBg,
                )}>
                {char.mbti}
              </span>
            </div>

            {/* 캐릭터 3D 메인 일러스트 */}
            <div className="relative w-full flex flex-col items-center justify-center py-2">
              <div
                className={cn(
                  "w-48 h-48 rounded-full absolute blur-3xl opacity-30 pointer-events-none",
                  char.bgLight,
                )}
              />
              <ImageWithSkeleton
                src={char.image}
                alt={char.nameKo}
                wrapperClassName="w-44 h-44 z-10 flex items-center justify-center"
                className="w-full h-full object-contain drop-shadow-xl"
              />

            </div>

            {/* 이름 & 역할 타이틀 */}
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center space-x-2">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {char.nameKo}
                </h3>
                <span
                  className="text-sm font-bold text-gray-400"
                  style={{
                    fontFamily: "'Fredoka', 'Plus Jakarta Sans', sans-serif",
                  }}>
                  {char.nameEn}
                </span>
              </div>

              <p className={cn("text-xs font-bold", char.textColor)}>
                {char.role}
              </p>
            </div>

            {/* 소개 본문 */}
            <p className="text-xs text-gray-600 leading-relaxed text-center px-1">
              {char.intro}
            </p>

            {/* 성격 & 취향 키워드 태그 */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {char.traits.map((trait, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2.5 py-1 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-medium">
                  {trait}
                </span>
              ))}
            </div>

            {/* 스팟 프로필 박스 */}
            <div className="space-y-2 pt-2">
              <div className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 block">
                  📍 {char.nameKo}의 최애 스팟
                </span>
                <p className="text-xs font-bold text-gray-800">
                  {char.favoriteSpot}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 block">
                  ✨ 매력 포인트
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {char.personality}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

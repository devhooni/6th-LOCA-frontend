import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import notFoundIllustration from "/imgs/notfound.png";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center select-none py-8">
      {/* 길을 잃은 로카프렌즈 4인방 404 일러스트 */}
      <div className="w-full max-w-[320px] h-48 mb-4 rounded-2xl overflow-hidden flex items-center justify-center">
        <img
          src={notFoundIllustration}
          alt="LOCA Friends looking lost"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      {/* 404 에러 헤더 */}
      <span className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">
        404
      </span>
      <h1 className="text-base font-bold text-[var(--color-text-primary)] mb-1.5">
        어라? 길을 잃어버렸어요!
      </h1>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-[270px] mb-7">
        친구들도 여기가 어딘지 두리번거리고 있어요. <br />
        주소를 다시 확인하거나 홈으로 돌아가볼까요?
      </p>

      {/* 홈/탐색 이동 버튼 */}
      <div className="flex flex-col w-full max-w-[240px] gap-2.5">
        <button
          onClick={() => navigate("/explore", { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#111] text-white text-xs font-semibold active:scale-98 transition-transform shadow-xs cursor-pointer"
        >
          <Compass size={16} />
          <span>탐색 홈으로 가기</span>
        </button>

        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>이전 페이지로</span>
        </button>
      </div>
    </div>
  );
}

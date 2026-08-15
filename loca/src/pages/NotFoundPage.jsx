import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center select-none">
      {/* LOCA 브랜드 이미지 */}
      <div className="mb-6 flex items-center justify-center">
        <img
          src="/brand-image.svg"
          alt="LOCA Brand"
          className="w-48 max-w-full h-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* 404 에러 헤더 */}
      <span className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-2">
        404
      </span>
      <h1 className="text-base font-bold text-[var(--color-text-primary)] mb-2">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-[260px] mb-8">
        요청하신 페이지가 존재하지 않거나, 접근 권한이 없는 페이지입니다.
      </p>

      {/* 홈/탐색 이동 버튼 */}
      <div className="flex flex-col w-full max-w-[240px] gap-2.5">
        <button
          onClick={() => navigate("/explore", { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--color-text-primary)] text-white text-xs font-semibold active:scale-98 transition-transform shadow-xs cursor-pointer"
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

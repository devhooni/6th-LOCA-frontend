import { useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";

export default function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  skeletonClassName = "",
  fallback = null,
  showErrorFallback = true,
  fallbackText = "",
  loading = "lazy",
  onClick,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // src 변경 시 로딩 및 에러 상태 초기화
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
  }, [src]);

  // src가 비어있거나 로드 실패 시 대체 화면
  if (!src || isError) {
    if (fallback) return fallback;
    if (!showErrorFallback) return null;

    return (
      <div
        className={`relative overflow-hidden bg-gray-100 flex flex-col items-center justify-center text-gray-400 select-none ${wrapperClassName || className}`}
        onClick={onClick}
      >
        <ImageIcon size={20} className="text-gray-300 mb-0.5 stroke-[1.5]" />
        {fallbackText ? (
          <span className="text-[10px] text-gray-400 font-medium px-2 text-center truncate w-full">
            {fallbackText}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium">이미지 없음</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      onClick={onClick}
    >
      {/* 1. 스켈레톤 로딩 플레이스홀더 (쉬머 애니메이션) */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-1 animate-shimmer bg-gray-100 flex items-center justify-center ${skeletonClassName}`}
        >
          <ImageIcon size={18} className="text-gray-300/80 animate-pulse stroke-[1.5]" />
        </div>
      )}

      {/* 2. 실제 이미지 태그 (로드 완료 시 자연스러운 페이드인) */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsError(true);
          setIsLoaded(false);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}

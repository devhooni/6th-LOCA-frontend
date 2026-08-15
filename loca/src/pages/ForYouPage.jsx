import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, MapPin, Loader2, RefreshCw } from "lucide-react";
import {
  fetchForYouStatus,
  fetchForYouRecommendations,
  fetchPublicPlaceDetail,
} from "../services/placeService";

export default function ForYouPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    unlocked: false,
    reviewCount: 0,
    requiredReviewCount: 3,
    remainingReviewCount: 3,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : prev));
  };

  const loadForYouData = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMsg("로그인이 필요합니다. 로그인 후 이용해보세요.");
      setIsLoading(false);
      return;
    }

    try {
      const statusRes = await fetchForYouStatus();
      const isUnlocked = Boolean(statusRes?.unlocked) || statusRes?.remainingReviewCount === 0;

      const parsedStatus = {
        unlocked: isUnlocked,
        reviewCount: statusRes?.reviewCount ?? 0,
        requiredReviewCount: statusRes?.requiredReviewCount ?? 3,
        remainingReviewCount: statusRes?.remainingReviewCount ?? 3,
      };

      setStatusData(parsedStatus);

      if (isUnlocked) {
        let rawPlaces = [];
        try {
          const recData = await fetchForYouRecommendations();
          if (Array.isArray(recData)) {
            rawPlaces = recData.slice(0, 5);
          } else if (recData?.places && Array.isArray(recData.places)) {
            rawPlaces = recData.places.slice(0, 5);
          }
        } catch (recErr) {
          console.warn("ForYou Recommendations Fetch Error:", recErr);
        }

        const placesWithDetail = await Promise.all(
          rawPlaces.map(async (p) => {
            const pId = p.placeId || p.id;
            if (!pId) return p;
            try {
              const detail = await fetchPublicPlaceDetail(pId);
              return {
                ...p,
                tags: detail?.tags || p.tags || [],
              };
            } catch (e) {
              console.warn(`Place detail load failed for placeId ${pId}:`, e);
              return p;
            }
          })
        );

        setRecommendations(placesWithDetail);
      }
    } catch (err) {
      console.error("ForYou Load Error:", err);
      setErrorMsg(err.message || "추천 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForYouData();
  }, []);

  const isUnlocked = statusData.unlocked || statusData.remainingReviewCount === 0;
  const currentCount = Math.max(0, statusData.requiredReviewCount - statusData.remainingReviewCount);
  const progressPercent = statusData.requiredReviewCount > 0
    ? Math.min(Math.round((currentCount / statusData.requiredReviewCount) * 100), 100)
    : 100;

  return (
    <div className="flex flex-col w-full bg-white select-none text-left overflow-y-auto space-y-5">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#111]">For You</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            당신의 취향을 분석하여 맞춤 장소를 추천해드립니다.
          </p>
        </div>
        <button
          onClick={loadForYouData}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {errorMsg && (
        <div className="text-red-500 text-sm">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400 my-auto">
          <Loader2 className="animate-spin text-gray-400" size={24} />
          <span className="text-sm text-gray-500">불러오는 중...</span>
        </div>
      ) : !isUnlocked ? (
        /* LOCKED STATE */
        <div className="flex flex-col bg-white rounded-xl border border-gray-100 p-6 text-center space-y-5 my-auto">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Lock size={24} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[#111]">맞춤 추천 잠김</h2>
            <p className="text-sm text-gray-500">
              리뷰를 3개 이상 작성하면 AI가 당신의 취향을 분석하여 맞춤 장소 5개를 추천해드려요.
            </p>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">리뷰 작성 진행률</span>
              <span className="font-bold text-[#111]">
                {statusData.reviewCount} / {statusData.requiredReviewCount}개
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#111] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-left pt-0.5">
              리뷰 {statusData.remainingReviewCount}개만 더 작성하면 잠금이 해제됩니다.
            </p>
          </div>

          <button
            onClick={() => navigate("/review")}
            className="w-full py-3 rounded-xl bg-[#111] text-white text-sm font-semibold active:scale-95 transition-transform"
          >
            리뷰 작성하러 가기
          </button>
        </div>
      ) : (
        /* UNLOCKED STATE */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">맞춤 추천 픽</span>
            <span className="text-sm text-gray-400">
              {currentIndex + 1} / {recommendations.length}
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-gray-100 text-center text-sm text-gray-500">
              추천할 장소 데이터를 불러오지 못했습니다.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {recommendations.map((place, idx) => {
                    const placeTags = place.tags || place.keywords || [];
                    return (
                      <div
                        key={place.placeId || place.kakaoPlaceId || idx}
                        onClick={() => navigate("/explore", { state: { place } })}
                        className="w-full flex-none bg-white rounded-xl p-5 border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="text-xs text-gray-400">#{idx + 1}</div>
                          
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-[#111]">
                              {place.name}
                            </h3>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <MapPin size={14} className="flex-none" />
                              <span className="truncate">{place.address || "주소 정보 없음"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 mt-4 border-t border-gray-50">
                          <div className="text-xs text-gray-400">태그</div>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(placeTags) && placeTags.length > 0 ? (
                              placeTags.map((t, tIdx) => {
                                const tagName = typeof t === "string" ? t : t.name || t.tagName;
                                return (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs"
                                  >
                                    #{tagName}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-gray-400">
                                등록된 태그가 없습니다.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="text-sm text-gray-500 disabled:opacity-30 active:scale-95 transition-transform px-2"
                >
                  ← 이전
                </button>

                <div className="flex space-x-2">
                  {recommendations.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        dotIdx === currentIndex
                          ? "bg-[#111]"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === recommendations.length - 1}
                  className="text-sm text-gray-500 disabled:opacity-30 active:scale-95 transition-transform px-2"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

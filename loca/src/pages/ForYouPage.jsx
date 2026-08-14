import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Lock,
  Plus,
  MapPin,
  Loader2,
  Star,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  fetchForYouStatus,
  fetchForYouRecommendations,
  fetchPrivatePlaces,
  fetchMyReviews,
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

  // GET /api/recommendations/for-you/status 및 GET /api/recommendations/for-you 실서버 연동
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
      // 1. GET /api/recommendations/for-you/status 상태 호출
      const statusRes = await fetchForYouStatus();

      const isUnlocked = Boolean(statusRes?.unlocked) || statusRes?.remainingReviewCount === 0;

      const parsedStatus = {
        unlocked: isUnlocked,
        reviewCount: statusRes?.reviewCount ?? 0,
        requiredReviewCount: statusRes?.requiredReviewCount ?? 3,
        remainingReviewCount: statusRes?.remainingReviewCount ?? 3,
      };

      setStatusData(parsedStatus);

      // 2. unlocked가 true이거나 remainingReviewCount가 0이 되어 해금되었을 때 GET /api/recommendations/for-you 추천 장소 5개 호출
      if (isUnlocked) {
        const recData = await fetchForYouRecommendations();
        if (Array.isArray(recData)) {
          setRecommendations(recData.slice(0, 5));
        } else if (recData?.places && Array.isArray(recData.places)) {
          setRecommendations(recData.places.slice(0, 5));
        } else {
          setRecommendations([]);
        }
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
    <div className="flex flex-col h-full w-full bg-[var(--color-neutral-background)] px-5 py-5 select-none text-left overflow-y-auto space-y-5">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="text-indigo-600 animate-pulse" size={20} />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              For You
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            당신의 취향을 분석하여 맞춤 장소를 추천해드립니다.
          </p>
        </div>
        <button
          onClick={loadForYouData}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 에러 메시지 표출 */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-2 text-xs font-semibold text-rose-600">
          <AlertCircle size={16} className="flex-none" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="text-xs font-semibold text-gray-600">
            내 취향 장소를 분석하는 중...
          </span>
        </div>
      ) : !isUnlocked ? (
        /* ================= LOCKED STATE (장소 3개 미만) ================= */
        <div className="flex flex-col items-center justify-center bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center space-y-5 my-auto">
          {/* Lock Badge Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <Lock size={28} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600"></span>
            </span>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h2 className="text-lg font-bold text-gray-900">맞춤 추천 잠김</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              리뷰를 <span className="font-bold text-indigo-600">3개 이상</span>{" "}
              작성하면 AI가 당신의 취향을 분석하여 맞춤 장소 5개를 추천해드려요!
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-600">리뷰 작성 진행률</span>
              <span className="text-indigo-600">
                {statusData.reviewCount} / {statusData.requiredReviewCount}개
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 text-left pt-0.5">
              리뷰 {statusData.remainingReviewCount}개만 더 작성하면 잠금이 해제됩니다.
            </p>
          </div>

          {/* Action Button: 리뷰 작성하러 가기 */}
          <button
            onClick={() => navigate("/review")}
            className="w-full py-3.5 rounded-2xl bg-[var(--color-brand-primary)] text-white text-xs font-bold flex items-center justify-center space-x-2 active:scale-98 transition-all hover:bg-black shadow-sm">
            <Plus size={16} />
            <span>리뷰 작성하러 가기</span>
          </button>
        </div>
      ) : (
        /* ================= UNLOCKED STATE (리뷰 3개 이상: 추천 5개) ================= */
        <div className="space-y-4">
          {/* Unlocked Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full text-indigo-100">
                  잠금 해제 완료 🎉
                </span>
              </div>
              <h3 className="text-sm font-bold pt-1">
                당신만을 위한 TOP 5 취향 추천
              </h3>
              <p className="text-[11px] text-indigo-100 opacity-90">
                작성한 리뷰 데이터를 기반으로 알고리즘이 선별했습니다.
              </p>
            </div>
          </div>

          {/* Top 5 Recommendation List */}
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-gray-200 text-center text-xs text-gray-400">
                추천할 장소 데이터를 불러오지 못했습니다.
              </div>
            ) : (
              recommendations.map((place, idx) => (
                <div
                  key={place.placeId || place.kakaoPlaceId || idx}
                  onClick={() => navigate("/explore")}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs hover:border-indigo-300 transition-all flex items-start space-x-3.5 cursor-pointer active:scale-98">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xs flex-none">
                    #{idx + 1}
                  </div>

                  <div className="flex-1 overflow-hidden space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {place.name}
                      </h4>
                      <div className="flex items-center space-x-0.5 text-amber-500">
                        <Star size={13} fill="currentColor" />
                        <span className="text-[11px] font-bold">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin size={13} className="text-gray-400 flex-none" />
                      <span className="truncate">{place.address}</span>
                    </div>

                    {/* AI Match Keyword Tag */}
                    <div className="pt-1 flex items-center space-x-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        ✨ 취향일치 98%
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-gray-400 self-center flex-none"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

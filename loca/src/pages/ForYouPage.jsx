import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, MapPin, Loader2, RefreshCw } from "lucide-react";
import {
  fetchForYouStatus,
  fetchForYouRecommendations,
  fetchPublicPlaceDetail,
} from "../services/placeService";
import forYouIllustration from "/imgs/Foryou.png";

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
      // 1. 먼저 For-You 맞춤 추천 잠금/해제 상태를 조회
      const statusRes = await fetchForYouStatus();
      const isUnlocked = Boolean(statusRes?.unlocked) || statusRes?.remainingReviewCount === 0;

      const parsedStatus = {
        unlocked: isUnlocked,
        reviewCount: statusRes?.reviewCount ?? 0,
        requiredReviewCount: statusRes?.requiredReviewCount ?? 3,
        remainingReviewCount: statusRes?.remainingReviewCount ?? 3,
      };

      setStatusData(parsedStatus);

      // 2. 잠금 해제(리뷰 3개 이상 작성)된 경우에만 추천 장소 API 호출!
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

        // 1. 장소 기본 정보를 즉시 화면에 렌더링하고 로딩 해제
        setRecommendations(rawPlaces);
        setIsLoading(false);

        // 2. 태그/상세 데이터는 백그라운드에서 비동기로 불러와 순차적으로 보강
        rawPlaces.forEach(async (p, idx) => {
          if (Array.isArray(p.tags) && p.tags.length > 0) return;
          const pId = p.placeId || p.id;
          if (!pId) return;

          try {
            const detail = await fetchPublicPlaceDetail(pId);
            if (detail?.tags) {
              setRecommendations((prev) =>
                prev.map((item, i) =>
                  i === idx || (item.placeId || item.id) === pId
                    ? { ...item, tags: detail.tags }
                    : item
                )
              );
            }
          } catch (e) {
            console.warn(`Place detail load failed for placeId ${pId}:`, e);
          }
        });
      } else {
        // 잠겨있는 상태면 추천 API를 부르지 않고 바로 잠금 화면 렌더링
        setIsLoading(false);
      }
    } catch (err) {
      console.error("ForYou Load Error:", err);
      setErrorMsg(err.message || "추천 정보를 불러오는데 실패했습니다.");
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
        /* 장소 로딩 스켈레톤 상태 */
        <div className="space-y-4 animate-fade-in">
          <div className="relative pt-2">
            <div className="w-full max-w-[340px] h-40 mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={forYouIllustration}
                alt="LOCA Friends recommendations"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="relative -mt-6 z-10 space-y-3">
              <div className="w-full p-5 bg-white rounded-2xl shadow-md border border-gray-100/80 animate-pulse space-y-3.5">
                <div className="w-24 h-5 bg-amber-100/80 rounded-md" />
                <div className="space-y-2">
                  <div className="w-44 h-5.5 bg-gray-200 rounded-md" />
                  <div className="w-60 h-4 bg-gray-100 rounded-md" />
                </div>
                <div className="pt-3.5 border-t border-gray-100 space-y-2">
                  <div className="w-20 h-3 bg-gray-100 rounded" />
                  <div className="flex gap-1.5">
                    <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                    <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                    <div className="h-6 w-14 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !isUnlocked ? (
        /* LOCKED STATE */
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-5 my-auto shadow-xs">
          {/* 로카프렌즈 분석 일러스트 */}
          <div className="w-full max-w-[280px] h-36 mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
            <img
              src={forYouIllustration}
              alt="LOCA Friends analyzing recommendations"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-1">
              <Lock size={12} />
              <span>맞춤 추천 잠김</span>
            </div>
            <h2 className="text-base font-bold text-[#111]">로카프렌즈의 취향 분석</h2>
            <p className="text-xs text-gray-500 leading-relaxed px-2">
              리뷰를 3개 이상 작성하면 친구들이 내 취향을 꼼꼼히 분석해서 딱 맞는 장소 5개를 추천해드려요!
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
        /* UNLOCKED STATE - Hero Banner Overlap Layout */
        <div className="space-y-4">
          {/* 상단 Hero 배너 + 장소 카드 오버랩 컨테이너 */}
          <div className="relative pt-2">
            {/* 1. 배경 상단에 자연스럽게 펼쳐지는 로카프렌즈 4인방 일러스트 */}
            <div className="w-full max-w-[340px] h-40 mx-auto rounded-2xl overflow-hidden flex items-center justify-center">
              <img
                src={forYouIllustration}
                alt="LOCA Friends recommendations"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>

            {/* 2. 일러스트 하단과 겹치면서 올라오는 추천 장소 카드 (Negative Top Margin) */}
            <div className="relative -mt-6 z-10">
              <div className="flex items-center justify-end mb-2 px-1">
                <span className="text-xs text-gray-400 font-medium">
                  {currentIndex + 1} / {recommendations.length}
                </span>
              </div>

              {recommendations.length === 0 ? (
                <div className="py-12 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-500 shadow-sm">
                  추천할 장소 데이터를 불러오지 못했습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full overflow-hidden rounded-2xl shadow-md border border-gray-100/80 bg-white">
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
                            className="w-full flex-none p-5 bg-white cursor-pointer active:bg-gray-50/80 transition-colors text-left"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                  #{idx + 1} 맞춤 추천
                                </span>
                              </div>
                              
                              <div className="space-y-1">
                                <h3 className="text-base font-bold text-[#111]">
                                  {place.name}
                                </h3>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <MapPin size={14} className="flex-none text-gray-400" />
                                  <span className="truncate">{place.address || "주소 정보 없음"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-3.5 mt-3.5 border-t border-gray-100">
                              <div className="text-xs text-gray-400 font-medium">분위기 & 키워드</div>
                              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                                {place.tags === undefined && !place.keywords ? (
                                  /* 태그 비동기 로딩 중 스켈레톤 */
                                  <div className="flex flex-wrap gap-1.5 animate-pulse w-full">
                                    <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                                    <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                                    <div className="h-6 w-14 bg-gray-100 rounded-lg" />
                                  </div>
                                ) : Array.isArray(placeTags) && placeTags.length > 0 ? (
                                  placeTags.map((t, tIdx) => {
                                    const tagName = typeof t === "string" ? t : t.name || t.tagName;
                                    return (
                                      <span
                                        key={tIdx}
                                        className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium animate-fade-in"
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

                  {/* 하단 페이지네이션 및 이전/다음 버튼 */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="text-sm font-medium text-gray-500 disabled:opacity-30 active:scale-95 transition-transform px-2 py-1 cursor-pointer"
                    >
                      ← 이전
                    </button>

                    <div className="flex space-x-1.5">
                      {recommendations.map((_, dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            dotIdx === currentIndex
                              ? "w-4 bg-[#111]"
                              : "w-1.5 bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentIndex === recommendations.length - 1}
                      className="text-sm font-medium text-gray-500 disabled:opacity-30 active:scale-95 transition-transform px-2 py-1 cursor-pointer"
                    >
                      다음 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

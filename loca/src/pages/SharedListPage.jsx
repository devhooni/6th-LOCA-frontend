import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Folder,
  MapPin,
  ExternalLink,
  Navigation,
  Share2,
  Copy,
  CheckCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Compass,
} from "lucide-react";

import { fetchSharedList } from "../services/placeService";

export default function SharedListPage() {
  const { shareToken, token } = useParams();
  const activeToken = shareToken || token;
  const navigate = useNavigate();

  const [listData, setListData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!activeToken) {
      setError("유효하지 않은 공유 링크입니다.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchSharedList(activeToken)
      .then((data) => {
        if (isMounted) {
          setListData(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Shared List Fetch Error:", err);
          setError(err.message || "공유된 리스트를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeToken]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setToastMessage("공유 링크가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Copy Link Error:", err);
    }
  };

  const handleGoHome = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/explore");
    } else {
      navigate("/onboarding");
    }
  };

  const handleViewInExplore = (place) => {
    const accessToken = localStorage.getItem("accessToken");
    const placePayload = {
      id: place.placeId || place.id,
      placeId: place.placeId || place.id,
      name: place.name,
      address: place.address,
      latitude: Number(place.lat || place.latitude),
      longitude: Number(place.lng || place.longitude),
      lat: Number(place.lat || place.latitude),
      lng: Number(place.lng || place.longitude),
      category: place.placeType || place.category,
      kakaoPlaceId: place.kakaoPlaceId,
    };

    if (accessToken) {
      navigate("/explore", { state: { place: placePayload } });
    } else {
      navigate("/onboarding", { state: { from: { pathname: "/explore" }, place: placePayload } });
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] p-6">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-[#111]" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-gray-800">공유 리스트 불러오는 중</h2>
            <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-gray-900">리스트를 찾을 수 없습니다</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {error || "존재하지 않거나 비공개로 전환된 공유 링크입니다."}
            </p>
          </div>
          <button
            onClick={handleGoHome}
            className="w-full py-3.5 rounded-xl bg-[#111] text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            LOCA 홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  const items = listData.items || [];
  const createdDate = listData.createdAt
    ? new Date(listData.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 상단 네비게이션 헤더 */}
      <header className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-5 py-3.5 flex items-center justify-between">
        <button
          onClick={handleGoHome}
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors cursor-pointer"
        >
          <img src="/brand-icon.svg" alt="LOCA" className="w-6 h-6" />
          <span className="text-sm font-bold tracking-wider text-[#111]">LOCA</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCheck size={14} className="text-emerald-600" />
              <span className="text-emerald-600 font-bold">복사됨</span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>공유하기</span>
            </>
          )}
        </button>
      </header>

      {/* 본문 콘텐츠 */}
      <main className="flex-1 w-full max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* 리스트 헤더 카드 */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-none">
              <Folder size={24} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  SHARED LIST
                </span>
              </div>
              <h1 className="text-lg font-bold text-[#111] truncate mt-1">
                {listData.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>담긴 장소 <strong className="text-gray-800">{items.length}개</strong></span>
            {createdDate && <span>생성일 {createdDate}</span>}
          </div>
        </div>

        {/* 장소 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-gray-800">
              장소 목록 ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center space-y-2">
              <p className="text-xs text-gray-400">이 리스트에 담긴 장소가 없습니다.</p>
            </div>
          ) : (
            items.map((place, idx) => {
              const placeId = place.placeId || place.id || idx;
              const kakaoMapUrl = place.kakaoPlaceId
                ? `https://place.map.kakao.com/${place.kakaoPlaceId}`
                : `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
              const kakaoRouteUrl = `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

              return (
                <div
                  key={placeId}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs hover:border-gray-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-none font-bold text-xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#111] truncate">
                            {place.name}
                          </h3>
                          {place.placeType && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 flex-none">
                              {place.placeType}
                            </span>
                          )}
                        </div>
                        {place.address && (
                          <p className="text-xs text-gray-500 flex items-center space-x-1 mt-1 truncate">
                            <MapPin size={12} className="flex-none text-gray-400" />
                            <span className="truncate">{place.address}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 카카오맵 보기 & explore에서 보기 버튼 */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-50">
                    <a
                      href={kakaoMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>카카오맵 보기</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleViewInExplore(place)}
                      className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex-none cursor-pointer"
                      title="LOCA 탐색 지도에서 보기"
                    >
                      <Compass size={13} />
                      <span>explore에서 보기</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* 하단 CTA 배너 */}
        <div className="bg-gradient-to-br from-[#111] to-[#252525] text-white rounded-3xl p-6 shadow-sm space-y-3 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-yellow-400">
            <Sparkles size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">LOCA Spot Curator</span>
          </div>
          <h3 className="text-sm font-bold leading-snug">
            나만의 특별한 스팟을 기록하고<br />친구들과 공유해보세요
          </h3>
          <button
            onClick={handleGoHome}
            className="w-full py-3 rounded-xl bg-white text-[#111] text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm cursor-pointer mt-2"
          >
            LOCA 시작하기
          </button>
        </div>
      </main>

      {/* 하단 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#111]/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold">
            <CheckCheck size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

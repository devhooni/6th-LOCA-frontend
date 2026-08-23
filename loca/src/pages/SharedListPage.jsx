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
  X,
  Mail,
  Lock,
} from "lucide-react";

import { fetchSharedList, loginUser, signupUser } from "../services/placeService";

const RANDOM_BGS = [
  "/imgs/bg1.png",
  "/imgs/bg2.png",
  "/imgs/bg3.png",
  "/imgs/bg4.png",
];

export default function SharedListPage() {
  const { shareToken, token } = useParams();
  const activeToken = shareToken || token;
  const navigate = useNavigate();

  const [randomBg] = useState(() => {
    const randomIndex = Math.floor(Math.random() * RANDOM_BGS.length);
    return RANDOM_BGS[randomIndex];
  });

  const [listData, setListData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 미로그인 시 로그인/회원가입 팝업 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "signup"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [pendingPlace, setPendingPlace] = useState(null);



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
    const listName = listData?.name || "LOCA 추천 스팟 리스트";
    const itemCount = Array.isArray(listData?.items) ? listData.items.length : (listData?.itemCount || 0);
    const countText = itemCount > 0 ? ` (${itemCount}곳)` : "";
    const shareUrl = window.location.href;

    const shareText = `[LOCA] 📍 '${listName}'${countText} 장소 모음을 공유받았어요!\n\n제가 추천하는 특별한 스팟들을 확인해보세요 ✨\n🔗 ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setToastMessage("링크 복사 완료!");
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
      setPendingPlace(null);
      setAuthError(null);
      setShowAuthModal(true);
    }
  };

  const handleViewInExplore = (place) => {
    const accessToken = localStorage.getItem("accessToken");
    const isOtherUserPrivate = place.placeType === "PRIVATE" || place.placeType === "개인";

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
      placeType: place.placeType || (isOtherUserPrivate ? "PRIVATE" : "PUBLIC"),
      kakaoPlaceId: place.kakaoPlaceId,
      isSharedPlace: true,
      isOtherUserPrivate: isOtherUserPrivate,
    };

    if (accessToken) {
      navigate("/explore", { state: { place: placePayload } });
    } else {
      // 미로그인 시 온보딩 페이지로 튕기지 않고 로그인/회원가입 팝업 오픈
      setPendingPlace(placePayload);
      setAuthError(null);
      setShowAuthModal(true);
    }
  };

  // 팝업 모달에서 로그인/회원가입 처리 후 바로 장소 상세 화면으로 이동
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError(null);

    try {
      if (authTab === "signup") {
        await signupUser({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
      }
      await loginUser({
        email: authEmail.trim(),
        password: authPassword.trim(),
      });

      setShowAuthModal(false);
      if (pendingPlace) {
        navigate("/explore", { state: { place: pendingPlace } });
      } else {
        navigate("/explore");
      }
    } catch (err) {
      console.error("Auth Submit Error:", err);
      setAuthError(err.message || "로그인/회원가입에 실패했습니다.");
    } finally {
      setIsSubmittingAuth(false);
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

        {/* 하단 CTA 배너 (이미지 가림 없이 상단에 선명하게 노출 + 하단에 텍스트 및 시작하기 버튼) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden text-center space-y-0">
          {/* 1. 선명하고 예쁜 일러스트 이미지 (가림 없이 100% 온전하게 노출) */}
          <div className="w-full h-44 sm:h-52 bg-gray-50 overflow-hidden relative">
            <img
              src={randomBg}
              alt="LOCA Illustration"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* 2. 하단 텍스트 및 시작하기 버튼 영역 */}
          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#111] leading-relaxed">
              나만의 특별한 스팟을 기록하고<br />
              친구들과 함께 공유해보세요
            </h3>

            <button
              onClick={handleGoHome}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#111] hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>LOCA 시작하기</span>
            </button>
          </div>
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

      {/* 로그인 / 회원가입 팝업 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setShowAuthModal(false)}
          />

          <div className="relative z-10 bg-white rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl animate-slide-up">
            {/* 모달 상단 헤더 */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <img src="/brand-icon.svg" alt="LOCA" className="w-5 h-5" />
                <span className="text-sm font-bold tracking-wider text-[#111]">LOCA</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* 안내 문구 */}
            <div className="space-y-1 text-left">
              <h3 className="text-base font-bold text-[#111]">
                {authTab === "login" ? "로그인이 필요합니다" : "간편 회원가입"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {pendingPlace
                  ? `'${pendingPlace.name}' 장소 정보를 확인하고 탐색을 시작하세요.`
                  : "LOCA의 다양한 추천 스팟과 나만의 장소를 확인해보세요."}
              </p>
            </div>

            {/* 로그인 / 회원가입 탭 스위처 */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authTab === "login"
                    ? "bg-white text-[#111] shadow-2xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("signup");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authTab === "signup"
                    ? "bg-white text-[#111] shadow-2xs"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                회원가입
              </button>
            </div>

            {/* 폼 입력 영역 */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-gray-700">이메일</label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-gray-700">비밀번호</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-xs text-red-500 text-left pt-1 leading-snug">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmittingAuth || !authEmail.trim() || !authPassword.trim()}
                className="w-full py-3.5 rounded-xl bg-[#111] hover:bg-gray-800 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer mt-2"
              >
                {isSubmittingAuth ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <span>
                    {authTab === "login" ? "로그인하고 바로 보기" : "회원가입하고 바로 보기"}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


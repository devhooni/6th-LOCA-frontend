import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Lock,
  Globe,
  Loader2,
  RefreshCw,
  AlertCircle,
  Plus,
  MessageSquareText,
  Calendar,
  Check,
} from "lucide-react";
import {
  fetchPrivatePlaces,
  fetchPublicPlaces,
  fetchTags,
  updatePrivatePlace,
  deletePrivatePlace,
  fetchMyReviews,
  deleteReview,
  fetchUserIcon,
  updateUserIcon,
} from "../services/placeService";

import aloneImg from "/imgs/alone.png";

import friendsImg from "/imgs/friends.png";
import coupleImg from "/imgs/couple.png";
import familyImg from "/imgs/family.png";
import etcImg from "/imgs/etc.png";

// 12종 프로필 아이콘 프리셋 (id 1: 기본 프로필 + id 2~12: 11종 2D 카툰 로카프렌즈 아이콘)
export const PROFILE_ICONS = [
  { id: 1, type: "icon", icon: User, bg: "bg-gray-100", color: "text-gray-500" },
  { id: 2, type: "image", src: "/imgs/icons/icon_2.png", bg: "bg-white" },
  { id: 3, type: "image", src: "/imgs/icons/icon_3.png", bg: "bg-white" },
  { id: 4, type: "image", src: "/imgs/icons/icon_4.png", bg: "bg-white" },
  { id: 5, type: "image", src: "/imgs/icons/icon_5.png", bg: "bg-white" },
  { id: 6, type: "image", src: "/imgs/icons/icon_6.png", bg: "bg-white" },
  { id: 7, type: "image", src: "/imgs/icons/icon_7.png", bg: "bg-white" },
  { id: 8, type: "image", src: "/imgs/icons/icon_8.png", bg: "bg-white" },
  { id: 9, type: "image", src: "/imgs/icons/icon_9.png", bg: "bg-white" },
  { id: 10, type: "image", src: "/imgs/icons/icon_10.png", bg: "bg-white" },
  { id: 11, type: "image", src: "/imgs/icons/icon_11.png", bg: "bg-white" },
  { id: 12, type: "image", src: "/imgs/icons/icon_12.png", bg: "bg-white" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // 탭 상태: 'places' | 'reviews'
  const [activeTab, setActiveTab] = useState("places");

  // 내 장소 목록 관련 상태
  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);

  // 내 리뷰 목록 관련 상태
  const [myReviews, setMyReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // 장소 수정 모달 상태
  const [editingPlace, setEditingPlace] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    lat: "37.5563",
    lng: "126.9227",
    isShareable: false,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // 장소 삭제 진행 중인 ID
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);

  // 장소 ID별 장소 객체/이름 매핑 맵 & 태그 ID별 태그명 매핑 맵
  const [placeMap, setPlaceMap] = useState({});
  const [tagMap, setTagMap] = useState({});

  // 전체 태그 목록 불러와 tagMap 완성 (비동기 독립 실행)
  const loadTags = async () => {
    try {
      const tags = await fetchTags();
      if (Array.isArray(tags)) {
        const tMap = {};
        tags.forEach((t) => {
          const tId = t.tagId ?? t.id;
          const tName = t.name ?? t.tagName;
          if (tId !== undefined && tName) {
            tMap[tId] = tName;
          }
        });
        setTagMap(tMap);
      }
    } catch (e) {
      console.warn("Tags load in MyPage warn:", e);
    }
  };

  // 내 정보 및 내가 생성한 커스텀 장소 + 공용 장소 목록 불러와 placeMap 완성
  const loadMyPlaces = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoadingPlaces(true);
    setPlacesError(null);

    // 1. 내 개인 장소 먼저 즉시 호출 및 도착하는 대로 화면에 바로 렌더링
    fetchPrivatePlaces()
      .then((pRes) => {
        const privates = Array.isArray(pRes) ? pRes : (pRes?.content || []);
        setMyPlaces(privates);
        setPlaceMap((prev) => {
          const mapObj = { ...prev };
          privates.forEach((p) => {
            const pId = p.placeId ?? p.id;
            if (pId !== undefined && pId !== null) mapObj[pId] = p;
            if (p.kakaoPlaceId) mapObj[p.kakaoPlaceId] = p;
          });
          return mapObj;
        });
      })
      .catch((err) => {
        console.error("Load Private Places Error:", err);
        setPlacesError(err.message || "내 장소 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        setIsLoadingPlaces(false);
      });

    // 2. 리뷰 장소명/사진 매핑을 위한 공용 장소는 별도로 비동기 수집 (개인 장소 렌더링을 차단하지 않음)
    fetchPublicPlaces(0, 100)
      .then((pubRes) => {
        const publics = Array.isArray(pubRes) ? pubRes : (pubRes?.content || []);
        setPlaceMap((prev) => {
          const mapObj = { ...prev };
          publics.forEach((p) => {
            const pId = p.placeId ?? p.id;
            if (pId !== undefined && pId !== null && !mapObj[pId]) mapObj[pId] = p;
            if (p.kakaoPlaceId && !mapObj[p.kakaoPlaceId]) mapObj[p.kakaoPlaceId] = p;
          });
          return mapObj;
        });
      })
      .catch((e) => {
        console.warn("Public places load for placeMap warn:", e);
      });
  };

  // 내 작성 리뷰 목록 불러오기 (도착하는 대로 독립 렌더링)
  const loadMyReviews = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoadingReviews(true);
    setReviewsError(null);

    try {
      const reviews = await fetchMyReviews();
      setMyReviews(Array.isArray(reviews) ? reviews : []);
    } catch (err) {
      console.error("Load My Reviews Error:", err);
      setReviewsError(err.message || "내 리뷰 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingReviews(false);
    }
  };


  // 프로필 아이콘 관련 상태 (1~12)
  const [currentIconId, setCurrentIconId] = useState(1);
  const [showIconModal, setShowIconModal] = useState(false);
  const [isSavingIcon, setIsSavingIcon] = useState(false);
  const [iconError, setIconError] = useState(null);

  // 유저 아이콘 ID 불러오기 (GET /api/users/me/icon)
  const loadUserIcon = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const iconId = await fetchUserIcon();
      if (iconId) {
        setCurrentIconId(Number(iconId));
      }
    } catch (e) {
      console.warn("User icon load warn:", e);
    }
  };

  // 아이콘 변경 제출 (PUT /api/users/me/icon)
  const handleSelectIcon = async (iconId) => {
    setIsSavingIcon(true);
    setIconError(null);
    try {
      await updateUserIcon(iconId);
      setCurrentIconId(Number(iconId));
      setShowIconModal(false);
    } catch (err) {
      console.error("Update User Icon Error:", err);
      setIconError(err.message || "아이콘 변경에 실패했습니다.");
    } finally {
      setIsSavingIcon(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

    loadUserIcon();
    loadTags();
    loadMyPlaces();
    loadMyReviews();
  }, []);

  // 장소 수정 모달 열기
  const handleOpenEditModal = (place) => {
    setEditingPlace(place);
    setEditForm({
      name: place.name || "",
      address: place.address || "",
      lat: place.lat ? place.lat.toString() : "37.5563",
      lng: place.lng ? place.lng.toString() : "126.9227",
      isShareable: Boolean(place.isShareable),
    });
    setEditError(null);
  };

  // 장소 수정 API 전송
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlace) return;

    if (!editForm.name.trim()) {
      setEditError("장소 이름을 입력해주세요.");
      return;
    }
    if (!editForm.address.trim()) {
      setEditError("주소를 입력해주세요.");
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    const placeId = editingPlace.placeId || editingPlace.id;

    try {
      await updatePrivatePlace(placeId, {
        name: editForm.name.trim(),
        address: editForm.address.trim(),
        lat: editForm.lat,
        lng: editForm.lng,
        isShareable: editForm.isShareable,
      });

      alert(`[${editForm.name}] 장소 정보가 수정되었습니다.`);
      setEditingPlace(null);
      loadMyPlaces();
    } catch (err) {
      console.error("Update Custom Place Error:", err);
      setEditError(err.message || "장소 수정 중 에러가 발생했습니다.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 장소 삭제 API 전송
  const handleDeletePlace = async (place) => {
    const placeId = place.placeId || place.id;
    if (!window.confirm(`정말로 [${place.name}] 장소를 삭제하시겠습니까?`)) return;

    setDeletingPlaceId(placeId);
    try {
      await deletePrivatePlace(placeId);
      alert("장소가 삭제되었습니다.");
      loadMyPlaces();
    } catch (err) {
      console.error("Delete Custom Place Error:", err);
      alert(err.message || "장소 삭제 중 에러가 발생했습니다.");
    } finally {
      setDeletingPlaceId(null);
    }
  };

  // 리뷰 삭제 API 전송
  const handleDeleteReview = async (review) => {
    const reviewId = review.reviewId || review.visitId || review.id;
    if (!window.confirm(`정말로 이 리뷰([${review.title}])를 삭제하시겠습니까?`)) return;

    setDeletingReviewId(reviewId);
    try {
      await deleteReview(reviewId);
      alert("리뷰가 삭제되었습니다.");
      loadMyReviews();
    } catch (err) {
      console.error("Delete Review Error:", err);
      alert(err.message || "리뷰 삭제 중 에러가 발생했습니다.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    navigate("/onboarding", { replace: true });
  };

  const companionConfigMap = {
    ALONE: { label: "혼자", img: aloneImg },
    FRIEND: { label: "친구와", img: friendsImg },
    LOVER: { label: "연인과", img: coupleImg },
    FAMILY: { label: "가족과", img: familyImg },
    ETC: { label: "기타", img: etcImg },
  };

  const companionLabelMap = {
    ALONE: "혼자",
    FRIEND: "친구와",
    LOVER: "연인과",
    FAMILY: "가족과",
    ETC: "기타",
  };

  return (
    <div className="w-full space-y-5 bg-white flex flex-col h-full select-none text-left overflow-y-auto">
      {/* Header Title */}
      <div>
        <h1 className="text-xl font-bold text-[#111]">마이페이지</h1>
      </div>

      {/* User Info Profile Card */}
      <div className="flex items-center justify-between bg-white py-2">
        <div className="flex items-center space-x-3.5">
          {/* 내 프로필 아이콘 아바타 + 우측 하단 수정 버튼 */}
          <div className="relative group">
            {/* 아바타 원형 컨테이너 */}
            <div
              onClick={() => setShowIconModal(true)}
              className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 shadow-2xs cursor-pointer transition-transform active:scale-95 ${
                PROFILE_ICONS.find((i) => i.id === currentIconId)?.bg || "bg-gray-100"
              }`}
            >
              {(() => {
                const current = PROFILE_ICONS.find((i) => i.id === currentIconId) || PROFILE_ICONS[0];
                if (current.type === "image") {
                  return (
                    <img
                      src={current.src}
                      alt={current.name}
                      className="w-11 h-11 object-contain drop-shadow-xs"
                    />
                  );
                }
                if (current.type === "icon-svg") {
                  return <span className="text-2xl">{current.emoji}</span>;
                }
                return <User size={26} className={current.color || "text-gray-500"} />;
              })()}
            </div>

            {/* 오른쪽 아래 수정(연필) 아이콘 버튼 */}
            <button
              type="button"
              onClick={() => setShowIconModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#111] text-white flex items-center justify-center shadow-md hover:bg-gray-800 active:scale-90 transition-all cursor-pointer ring-2 ring-white"
              aria-label="아이콘 수정"
            >
              <Edit2 size={11} strokeWidth={2.5} />
            </button>
          </div>

          <div>
            <p className="text-base font-bold text-[#111]">
              {userEmail ? userEmail.split("@")[0] : "사용자"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{userEmail || "로그인이 필요합니다"}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 구분 */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("places")}
          className={`flex-1 py-3 text-sm transition-all text-center ${
            activeTab === "places"
              ? "text-[#111] font-bold border-b-2 border-[#111]"
              : "text-gray-400"
          }`}
        >
          등록 장소
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 py-3 text-sm transition-all text-center ${
            activeTab === "reviews"
              ? "text-[#111] font-bold border-b-2 border-[#111]"
              : "text-gray-400"
          }`}
        >
          작성 리뷰
        </button>
      </div>

      {/* TAB 1: 장소 */}
      {activeTab === "places" && (
        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#111]">총 {myPlaces.length}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadMyPlaces}
                disabled={isLoadingPlaces}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <RefreshCw size={16} className={isLoadingPlaces ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/add")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {placesError && (
            <div className="text-sm text-red-500 py-2">{placesError}</div>
          )}

          {isLoadingPlaces ? (
            <div className="space-y-3 pb-6 animate-fade-in">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 animate-pulse"
                >
                  <div className="flex flex-col space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-28 h-4 bg-gray-200 rounded" />
                      <div className="w-12 h-3.5 bg-gray-100 rounded" />
                    </div>
                    <div className="w-48 h-3 bg-gray-100 rounded" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 rounded" />
                    <div className="w-6 h-6 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : myPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <p className="text-sm">등록된 장소가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {myPlaces.map((place) => {
                const placeId = place.placeId || place.id;
                const isDeletingThis = deletingPlaceId === placeId;

                return (
                  <div
                    key={placeId}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-[#111]">
                          {place.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {place.isShareable ? "전체공개" : "나만보기"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{place.address}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(place)}
                        className="p-1.5 text-gray-300 hover:text-gray-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place)}
                        disabled={isDeletingThis}
                        className="p-1.5 text-gray-300 hover:text-red-500 disabled:opacity-50"
                      >
                        {isDeletingThis ? (
                          <Loader2 size={16} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 리뷰 */}
      {activeTab === "reviews" && (
        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-[#111]">총 {myReviews.length}개</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadMyReviews}
                disabled={isLoadingReviews}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <RefreshCw size={16} className={isLoadingReviews ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/review")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {reviewsError && (
            <div className="text-sm text-red-500 py-2">{reviewsError}</div>
          )}

          {isLoadingReviews ? (
            <div className="space-y-3 pb-6 animate-fade-in">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border border-gray-100 animate-pulse space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-3.5 bg-gray-200 rounded" />
                        <div className="w-12 h-3.5 bg-gray-100 rounded" />
                      </div>
                      <div className="w-36 h-4 bg-gray-200 rounded" />
                      <div className="w-full h-8 bg-gray-100 rounded" />
                    </div>
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex-none" />
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <div className="w-14 h-5 bg-gray-100 rounded-lg" />
                    <div className="w-16 h-5 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : myReviews.length === 0 ? (

            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <p className="text-sm">작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {myReviews.map((review) => {
                const reviewId = review.reviewId || review.visitId || review.id;
                const isDeletingThis = deletingReviewId === reviewId;
                const targetPlace = placeMap[review.placeId] || placeMap[review.place?.placeId] || review.place;
                const placeName = review.placeName || review.place?.name || (targetPlace ? targetPlace.name : `장소 #${review.placeId}`);

                // 리뷰에 첨부된 실제 사진 URL (imageUrls 배열의 첫 번째 또는 imageUrl)
                const reviewPhoto = (Array.isArray(review.imageUrls) && review.imageUrls.length > 0)
                  ? review.imageUrls[0]
                  : review.imageUrl || targetPlace?.imageUrl;

                const handleNavigateToPlace = () => {
                  if (targetPlace) {
                    navigate("/explore", { state: { place: targetPlace } });
                  } else {
                    navigate("/explore");
                  }
                };

                const compConfig = companionConfigMap[review.companion];

                return (
                  <div
                    key={reviewId}
                    className="p-4 bg-white rounded-2xl border border-gray-100/90 shadow-2xs hover:border-gray-200 transition-all cursor-pointer"
                    onClick={handleNavigateToPlace}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* 좌측: 장소명, 동행자 뱃지(텍스트+아이콘), 제목, 방문날짜, 내용 미리보기 */}
                      <div className="flex flex-col min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-xs font-bold text-gray-700 truncate">
                            {placeName}
                          </span>
                          {compConfig && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs">
                              {compConfig.label}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-[#111] truncate">
                          {review.title || "제목 없음"}
                        </h3>

                        {review.visitedAt && (
                          <p className="text-[11px] text-gray-400">
                            {new Date(review.visitedAt).toLocaleDateString("ko-KR")} 방문
                          </p>
                        )}

                        <p className="text-xs text-gray-600 line-clamp-2 pt-1">
                          {review.content}
                        </p>
                      </div>

                      {/* 우측: 실제 리뷰 사진 썸네일 & 삭제 버튼 */}
                      <div className="flex flex-col items-end space-y-2 flex-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReview(review);
                          }}
                          disabled={isDeletingThis}
                          className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {isDeletingThis ? (
                            <Loader2 size={15} className="animate-spin text-red-500" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>

                        <div className="w-20 h-20 rounded-md bg-gray-50 border border-gray-200 overflow-hidden shadow-2xs flex items-center justify-center">
                          {reviewPhoto ? (
                            <img
                              src={reviewPhoto}
                              alt={placeName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (compConfig) e.target.src = compConfig.img;
                              }}
                            />
                          ) : compConfig ? (
                            <img
                              src={compConfig.img}
                              alt={compConfig.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <MapPin size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 여러 장의 사진이 첨부된 경우 작은 썸네일 목록 */}
                    {Array.isArray(review.imageUrls) && review.imageUrls.length > 1 && (
                      <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                        {review.imageUrls.map((imgUrl, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={imgUrl}
                            alt={`사진 ${imgIdx + 1}`}
                            className="w-10 h-10 rounded-md object-cover border border-gray-200 flex-none"
                          />
                        ))}
                      </div>
                    )}

                    {/* 태그 & 키워드 칩 표시 (분위기 태그 tagIds + 커스텀 키워드 keywords) */}
                    {(() => {
                      // 1. tagIds 기반 태그명 추출
                      const resolvedTags = [];
                      if (Array.isArray(review.tagIds)) {
                        review.tagIds.forEach((tId) => {
                          const name = tagMap[tId];
                          if (name && !resolvedTags.includes(name)) {
                            resolvedTags.push(name);
                          }
                        });
                      }
                      // 2. 만약 장소 객체에 tags가 있다면 보강
                      if (resolvedTags.length === 0 && Array.isArray(targetPlace?.tags)) {
                        targetPlace.tags.forEach((t) => {
                          const name = typeof t === "string" ? t : (t.name || t.tagName);
                          if (name && !resolvedTags.includes(name)) {
                            resolvedTags.push(name);
                          }
                        });
                      }

                      // 3. 커스텀 키워드
                      const customKws = Array.isArray(review.keywords) ? review.keywords : [];

                      if (resolvedTags.length === 0 && customKws.length === 0) return null;

                      return (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {/* 분위기 태그 (tagIds) */}
                          {resolvedTags.map((tagText, idx) => (
                            <span
                              key={`tag-${idx}`}
                              className="bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg px-2 py-0.5"
                            >
                              #{tagText}
                            </span>
                          ))}

                          {/* 커스텀 키워드 (keywords) */}
                          {customKws.map((kw, idx) => (
                            <span
                              key={`kw-${idx}`}
                              className="bg-gray-100 text-gray-600 text-xs rounded-lg px-2 py-0.5"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 장소 수정 모달 */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4">
            <h3 className="text-base font-bold text-[#111]">장소 수정</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">장소 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">주소</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">공개 설정</label>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: false })}
                    className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                      !editForm.isShareable ? "bg-white text-[#111] font-semibold shadow-sm" : "text-gray-500"
                    }`}
                  >
                    나만 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: true })}
                    className={`flex-1 py-1.5 rounded-md text-sm transition-all ${
                      editForm.isShareable ? "bg-white text-[#111] font-semibold shadow-sm" : "text-gray-500"
                    }`}
                  >
                    전체 공개
                  </button>
                </div>
              </div>

              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-sm font-bold flex items-center justify-center"
                >
                  {isSubmittingEdit ? <Loader2 size={16} className="animate-spin" /> : "수정 완료"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 프로필 아이콘 변경 모달 (12종 프리셋 선택) */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm text-left space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-none">
              <h3 className="text-base font-bold text-[#111]">프로필 아이콘 설정</h3>
              <button
                onClick={() => setShowIconModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold p-1 cursor-pointer"
              >
                닫기
              </button>
            </div>

            {/* 12종 아이콘 그리드 (3열 x 4행) */}
            {/* 12종 아이콘 그리드 (3열 x 4행) - 각진 박스 & 내부 이중 박스 없이 아이콘 바로 표시 */}
            <div className="grid grid-cols-3 gap-2 overflow-y-auto p-1 flex-1 no-scrollbar">
              {PROFILE_ICONS.map((item) => {
                const isSelected = currentIconId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectIcon(item.id)}
                    disabled={isSavingIcon}
                    className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer relative aspect-square overflow-hidden ${
                      isSelected
                        ? "border-[#111] bg-gray-50 ring-2 ring-[#111] shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50"
                    }`}
                  >
                    {/* 별도 내부 박스 없이 아이콘/이미지 바로 가득 채워 표시 */}
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        alt="profile icon"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100/70 rounded-md">
                        <User size={30} className={item.color || "text-gray-500"} />
                      </div>
                    )}

                    {/* 선택됨 뱃지: 오른쪽 아래 초록색 원 안의 흰색 체크마크 */}
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-1.5 ring-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {iconError && <p className="text-xs text-red-500 text-center">{iconError}</p>}

            {isSavingIcon && (
              <div className="flex items-center justify-center py-1 text-xs text-gray-500 space-x-1.5">
                <Loader2 size={14} className="animate-spin text-[#111]" />
                <span>아이콘 변경 중...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 로그아웃 모달 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111]">로그아웃 하시겠습니까?</h3>
              <p className="text-sm text-gray-500 mt-2">
                저장된 계정 정보가 삭제됩니다.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold"
              >
                취소
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#111] text-white text-sm font-bold"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

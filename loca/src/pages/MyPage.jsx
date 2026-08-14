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
  Tag as TagIcon,
  Image as ImageIcon,
} from "lucide-react";
import {
  fetchPrivatePlaces,
  fetchPublicPlaces,
  updatePrivatePlace,
  deletePrivatePlace,
  fetchMyReviews,
  deleteReview,
} from "../services/placeService";

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

  // 장소 ID별 장소 객체/이름 매핑 맵
  const [placeMap, setPlaceMap] = useState({});

  // 내 정보 및 내가 생성한 커스텀 장소 목록 불러오기 (GET /api/places/custom & GET /api/places/public)
  const loadMyPlaces = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsLoadingPlaces(true);
    setPlacesError(null);

    try {
      let privates = [];
      let publics = [];

      try {
        const pRes = await fetchPrivatePlaces();
        if (Array.isArray(pRes)) privates = pRes;
      } catch (e) {
        console.warn("Private places load warn:", e);
      }

      try {
        const pubRes = await fetchPublicPlaces();
        if (Array.isArray(pubRes)) publics = pubRes;
      } catch (e) {
        console.warn("Public places load warn:", e);
      }

      setMyPlaces(privates);

      // 전체 장소 맵 구성 (placeId -> place object)
      const mapObj = {};
      [...privates, ...publics].forEach((p) => {
        const pId = p.placeId || p.id;
        if (pId) mapObj[pId] = p;
      });
      setPlaceMap(mapObj);
    } catch (err) {
      console.error("Load My Places Error:", err);
      setPlacesError(err.message || "내 장소 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // 내 작성 리뷰 목록 불러오기 (GET /api/users/me/reviews)
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

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setUserEmail(savedEmail);
    }

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

  // 장소 수정 API 전송 (PUT /api/places/custom/{placeId})
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

  // 장소 삭제 API 전송 (DELETE /api/places/custom/{placeId})
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

  // 리뷰 삭제 API 전송 (DELETE /api/users/me/reviews/{visitId})
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
    navigate("/onboarding", { replace: true });
  };

  const companionLabelMap = {
    ALONE: "혼자",
    FRIEND: "친구와",
    LOVER: "연인과",
    FAMILY: "가족과",
    ETC: "기타",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 p-4 select-none text-left overflow-y-auto space-y-4">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">마이페이지</h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          계정 정보, 등록 장소 및 작성한 리뷰를 관리해보세요.
        </p>
      </div>

      {/* User Info Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center space-x-4 flex-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-none">
          <User size={22} />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              로그인 계정
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-1.5">
            <Mail size={14} className="text-gray-400 flex-none" />
            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
              {userEmail || "로그인이 필요합니다"}
            </p>
          </div>
        </div>
      </div>

      {/* 탭 구분: 내가 등록한 장소 vs 내가 작성한 리뷰 */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl gap-1 border border-gray-300/60">
        <button
          onClick={() => setActiveTab("places")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "places"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MapPin size={15} />
          <span>등록 장소 ({myPlaces.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MessageSquareText size={15} />
          <span>작성 리뷰 ({myReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: 내가 만든 장소들 리스트 섹션 */}
      {activeTab === "places" && (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 space-y-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-none">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-gray-900">내가 등록한 장소</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {myPlaces.length}개
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={loadMyPlaces}
                disabled={isLoadingPlaces}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="새로고침"
              >
                <RefreshCw size={15} className={isLoadingPlaces ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/add")}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>추가</span>
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {placesError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-xs font-semibold text-rose-600">
              <AlertCircle size={15} className="flex-none" />
              <span>{placesError}</span>
            </div>
          )}

          {/* 장소 목록 렌더링 */}
          {isLoadingPlaces ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 flex-1">
              <Loader2 className="animate-spin text-indigo-600" size={22} />
              <span className="text-xs font-medium">내 장소를 불러오는 중...</span>
            </div>
          ) : myPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2 flex-1">
              <MapPin size={32} className="text-gray-300" />
              <p className="text-xs font-medium">등록된 장소가 없습니다.</p>
              <button
                onClick={() => navigate("/add")}
                className="text-xs font-bold text-indigo-600 underline cursor-pointer"
              >
                새로운 장소 등록하러 가기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto space-y-2 max-h-[350px]">
              {myPlaces.map((place) => {
                const placeId = place.placeId || place.id;
                const isDeletingThis = deletingPlaceId === placeId;

                return (
                  <div
                    key={placeId}
                    className="pt-2 pb-2 flex items-center justify-between group hover:bg-gray-50/60 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start space-x-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-none mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div className="flex flex-col overflow-hidden text-left space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {place.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                              place.isShareable
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {place.isShareable ? (
                              <>
                                <Globe size={10} /> 전체공개
                              </>
                            ) : (
                              <>
                                <Lock size={10} /> 나만보기
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{place.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-none ml-2">
                      <button
                        onClick={() => handleOpenEditModal(place)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="장소 정보 수정 (PUT)"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place)}
                        disabled={isDeletingThis}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                        title="장소 삭제 (DELETE)"
                      >
                        {isDeletingThis ? (
                          <Loader2 size={15} className="animate-spin text-rose-600" />
                        ) : (
                          <Trash2 size={15} />
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

      {/* TAB 2: 내가 작성한 리뷰 리스트 섹션 (GET /api/users/me/reviews) */}
      {activeTab === "reviews" && (
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 space-y-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-none">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-gray-900">내가 작성한 리뷰</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                {myReviews.length}개
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={loadMyReviews}
                disabled={isLoadingReviews}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="새로고침"
              >
                <RefreshCw size={15} className={isLoadingReviews ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => navigate("/review")}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>리뷰 작성</span>
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {reviewsError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-xs font-semibold text-rose-600">
              <AlertCircle size={15} className="flex-none" />
              <span>{reviewsError}</span>
            </div>
          )}

          {/* 리뷰 목록 렌더링 */}
          {isLoadingReviews ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 flex-1">
              <Loader2 className="animate-spin text-indigo-600" size={22} />
              <span className="text-xs font-medium">내 리뷰를 불러오는 중...</span>
            </div>
          ) : myReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2 flex-1">
              <MessageSquareText size={32} className="text-gray-300" />
              <p className="text-xs font-medium">작성한 리뷰가 없습니다.</p>
              <button
                onClick={() => navigate("/review")}
                className="text-xs font-bold text-indigo-600 underline cursor-pointer"
              >
                첫 리뷰 작성하러 가기
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto space-y-3 max-h-[350px]">
              {myReviews.map((review) => {
                const reviewId = review.reviewId || review.visitId || review.id;
                const isDeletingThis = deletingReviewId === reviewId;
                const targetPlace = placeMap[review.placeId];
                const placeName = targetPlace ? targetPlace.name : `장소 #${review.placeId}`;

                const handleNavigateToPlace = () => {
                  if (targetPlace) {
                    navigate("/explore", { state: { place: targetPlace } });
                  } else {
                    navigate("/explore");
                  }
                };

                return (
                  <div
                    key={reviewId}
                    className="pt-3 pb-3 space-y-2 hover:bg-indigo-50/40 p-2.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-100 group"
                    onClick={handleNavigateToPlace}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 overflow-hidden">
                        {/* 리뷰 제목 위 장소 이름 표시 */}
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600">
                          <MapPin size={13} className="flex-none" />
                          <span className="truncate group-hover:underline">{placeName}</span>
                        </div>

                        {/* 리뷰 제목 및 동행인 */}
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xs font-bold text-gray-900 truncate">
                            {review.title || "제목 없음"}
                          </h3>
                          {review.companion && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex-none">
                              {companionLabelMap[review.companion] || review.companion}
                            </span>
                          )}
                        </div>

                        {review.visitedAt && (
                          <p className="text-[11px] text-gray-400 flex items-center space-x-1">
                            <Calendar size={11} />
                            <span>
                              방문일: {new Date(review.visitedAt).toLocaleDateString("ko-KR")}
                            </span>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review);
                        }}
                        disabled={isDeletingThis}
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer flex-none ml-2"
                        title="리뷰 삭제 (DELETE)"
                      >
                        {isDeletingThis ? (
                          <Loader2 size={15} className="animate-spin text-rose-600" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>

                    {/* 본문 내용 */}
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {review.content}
                    </p>

                    {/* 키워드 태그 칩 */}
                    {Array.isArray(review.keywords) && review.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {review.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Logout Action Button */}
      <div className="flex-none pt-2 pb-2">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-600 text-xs font-bold flex items-center justify-center space-x-2 active:scale-98 transition-all hover:bg-rose-100/80 cursor-pointer shadow-xs"
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* 장소 수정 팝업 모달 (PUT /api/places/custom/{placeId}) */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">내 장소 수정</h3>
              <button
                onClick={() => setEditingPlace(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">장소 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">주소</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">공개 설정</label>
                <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: false })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !editForm.isShareable ? "bg-white text-gray-900 shadow-xs" : "text-gray-500"
                    }`}
                  >
                    <Lock size={12} />
                    나만 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isShareable: true })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      editForm.isShareable ? "bg-white text-indigo-600 shadow-xs" : "text-gray-500"
                    }`}
                  >
                    <Globe size={12} />
                    전체 공개
                  </button>
                </div>
              </div>

              {editError && <p className="text-xs font-bold text-rose-500">{editError}</p>}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <span>수정 완료</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 로그아웃 확인 모달팝업 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">로그아웃 하시겠습니까?</h3>
              <p className="text-xs text-gray-500 mt-1">
                저장된 계정 세션이 삭제되고 초기 온보딩 화면으로 이동합니다.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
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

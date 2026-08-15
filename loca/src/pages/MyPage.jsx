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

  // 내 정보 및 내가 생성한 커스텀 장소 목록 불러오기
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

  // 내 작성 리뷰 목록 불러오기
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
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <User size={24} />
          </div>
          <div>
            <p className="text-base font-bold text-[#111]">
              {userEmail ? userEmail.split("@")[0] : "사용자"}
            </p>
            <p className="text-sm text-gray-500">{userEmail || "로그인이 필요합니다"}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 className="animate-spin" size={20} />
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
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 className="animate-spin" size={20} />
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
                    className="p-4 bg-white rounded-xl border border-gray-100 cursor-pointer"
                    onClick={handleNavigateToPlace}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">{placeName}</span>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#111]">
                            {review.title || "제목 없음"}
                          </h3>
                          {review.companion && (
                            <span className="text-xs text-gray-500">
                              · {companionLabelMap[review.companion] || review.companion}
                            </span>
                          )}
                        </div>
                        {review.visitedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.visitedAt).toLocaleDateString("ko-KR")}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review);
                        }}
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

                    <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                      {review.content}
                    </p>

                    {Array.isArray(review.keywords) && review.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {review.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-600 text-xs rounded-lg px-2 py-0.5"
                          >
                            {kw}
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

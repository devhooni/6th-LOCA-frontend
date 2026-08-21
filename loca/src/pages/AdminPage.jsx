import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  AlertCircle,
  MapPin,
  Search,
  Tag as TagIcon,
  Building2,
} from "lucide-react";
import {
  fetchPublicPlaces,
  createAdminPlace,
  updateAdminPlace,
  deleteAdminPlace,
  fetchTags,
  createAdminTag,
  updateAdminTag,
  deleteAdminTag,
} from "../services/placeService";

export default function AdminPage() {
  // Active Tab: 'places' | 'tags'
  const [activeTab, setActiveTab] = useState("places");

  // ================= Places State =================
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [placeSearchTerm, setPlaceSearchTerm] = useState("");

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [placeForm, setPlaceForm] = useState({
    name: "",
    kakaoPlaceId: "",
    address: "",
    lat: "37.5563",
    lng: "126.9227",
  });
  const [placeFormError, setPlaceFormError] = useState(null);
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);

  // ================= Tags State =================
  const [tags, setTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagsError, setTagsError] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState(null);

  // GET /api/places/public 전체 장소 조회
  const loadPlaces = async () => {
    setIsLoadingPlaces(true);
    setPlacesError(null);
    try {
      const data = await fetchPublicPlaces(0, 100);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setPlaces(list);
    } catch (err) {
      console.error("Admin Places Load Error:", err);
      setPlacesError(err.message || "공용 장소 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // GET /api/tags 전체 태그 목록 조회
  const loadTags = async () => {
    setIsLoadingTags(true);
    setTagsError(null);
    try {
      const data = await fetchTags();
      setTags(data || []);
    } catch (err) {
      console.error("Admin Tags Load Error:", err);
      setTagsError(err.message || "태그 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoadingTags(false);
    }
  };

  useEffect(() => {
    loadPlaces();
    loadTags();
  }, []);

  // --------------- Place Actions ---------------
  const handleOpenAddPlaceModal = () => {
    setEditingPlace(null);
    setPlaceForm({
      name: "",
      kakaoPlaceId: "",
      address: "",
      lat: "37.5563",
      lng: "126.9227",
    });
    setPlaceFormError(null);
    setShowPlaceModal(true);
  };

  const handleOpenEditPlaceModal = (place) => {
    setEditingPlace(place);
    setPlaceForm({
      name: place.name || "",
      kakaoPlaceId: place.kakaoPlaceId || "",
      address: place.address || "",
      lat: place.lat ? place.lat.toString() : "37.5563",
      lng: place.lng ? place.lng.toString() : "126.9227",
    });
    setPlaceFormError(null);
    setShowPlaceModal(true);
  };

  const handlePlaceFormSubmit = async (e) => {
    e.preventDefault();
    setPlaceFormError(null);

    if (!placeForm.name.trim()) {
      setPlaceFormError("장소 이름을 입력해주세요.");
      return;
    }
    if (!placeForm.address.trim()) {
      setPlaceFormError("주소를 입력해주세요.");
      return;
    }

    setIsSubmittingPlace(true);
    try {
      if (editingPlace) {
        // PUT /api/admin/places/{placeId}
        await updateAdminPlace(editingPlace.placeId, {
          name: placeForm.name.trim(),
          address: placeForm.address.trim(),
          lat: placeForm.lat,
          lng: placeForm.lng,
        });
        alert("장소 정보가 수정되었습니다.");
      } else {
        // POST /api/admin/places
        if (!placeForm.kakaoPlaceId.trim()) {
          setPlaceFormError("신규 등록 시 kakaoPlaceId는 필수입니다.");
          setIsSubmittingPlace(false);
          return;
        }
        await createAdminPlace({
          name: placeForm.name.trim(),
          kakaoPlaceId: placeForm.kakaoPlaceId.trim(),
          address: placeForm.address.trim(),
          lat: placeForm.lat,
          lng: placeForm.lng,
        });
        alert("새 장소가 등록되었습니다.");
      }

      setShowPlaceModal(false);
      loadPlaces();
    } catch (err) {
      console.error("Admin Place Submit Error:", err);
      setPlaceFormError(err.message || "처리 중 에러가 발생했습니다.");
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  const handleDeletePlace = async (placeId, placeName) => {
    if (!window.confirm(`정말로 [${placeName}] 장소를 삭제하시겠습니까?`)) return;

    try {
      await deleteAdminPlace(placeId);
      alert("장소가 삭제되었습니다.");
      loadPlaces();
    } catch (err) {
      console.error("Delete Place Error:", err);
      alert(err.message || "삭제 처리 중 에러가 발생했습니다.");
    }
  };

  // --------------- Tag Actions ---------------
  // POST /api/admin/tags 신규 태그 추가
  const handleAddTagSubmit = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmittingTag(true);
    setTagsError(null);
    try {
      await createAdminTag({ name: newTagName.trim() });
      alert(`[#${newTagName.trim()}] 태그가 생성되었습니다.`);
      setNewTagName("");
      loadTags();
    } catch (err) {
      console.error("Create Tag Error:", err);
      setTagsError(err.message || "태그 생성에 실패했습니다.");
    } finally {
      setIsSubmittingTag(false);
    }
  };

  // DELETE /api/admin/tags/{tagId} 태그 삭제
  const handleDeleteTag = async (tagId, tagName) => {
    if (!window.confirm(`정말로 [#${tagName}] 태그를 삭제하시겠습니까?`)) return;

    setDeletingTagId(tagId);
    try {
      await deleteAdminTag(tagId);
      alert(`[#${tagName}] 태그가 삭제되었습니다.`);
      loadTags();
    } catch (err) {
      console.error("Delete Tag Error:", err);
      alert(err.message || "태그 삭제에 실패했습니다.");
    } finally {
      setDeletingTagId(null);
    }
  };

  const filteredPlaces = places.filter(
    (p) =>
      p.name?.toLowerCase().includes(placeSearchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(placeSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 p-4 space-y-4 text-left select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">어드민 관리 콘솔</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            장소 관리 및 추천 분위기/키워드 태그(POST, DELETE)를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "places") loadPlaces();
            else loadTags();
          }}
          disabled={isLoadingPlaces || isLoadingTags}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          title="새로고침"
        >
          <RefreshCw
            size={18}
            className={isLoadingPlaces || isLoadingTags ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Tab Nav: 장소 관리 vs 태그 관리 */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl gap-1 border border-gray-300/60">
        <button
          onClick={() => setActiveTab("places")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "places"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 size={16} />
          <span>공용 장소 관리 ({places.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "tags"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <TagIcon size={16} />
          <span>태그 관리 ({tags.length})</span>
        </button>
      </div>

      {/* TAB 1: 장소 관리 (Places) */}
      {activeTab === "places" && (
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={placeSearchTerm}
                onChange={(e) => setPlaceSearchTerm(e.target.value)}
                placeholder="장소명 또는 주소 검색..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-800 focus:outline-none focus:border-black"
              />
            </div>
            <button
              onClick={handleOpenAddPlaceModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-gray-800 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              <span>장소 추가 (POST)</span>
            </button>
          </div>

          {placesError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
              <AlertCircle size={16} />
              <span>{placesError}</span>
            </div>
          )}

          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                총 장소 목록 ({filteredPlaces.length}개)
              </span>
            </div>

            {isLoadingPlaces ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
                <Loader2 size={24} className="animate-spin text-gray-600" />
                <span className="text-xs font-medium">장소목록 불러오는 중...</span>
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                등록된 장소가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 overflow-y-auto max-h-[450px]">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.placeId}
                    className="p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-none mt-0.5">
                        <MapPin size={16} />
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {place.name}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            ID: {place.placeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{place.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-none ml-2">
                      <button
                        onClick={() => handleOpenEditPlaceModal(place)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="수정 (PUT)"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place.placeId, place.name)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="삭제 (DELETE)"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 태그 관리 (Tags) - POST /api/admin/tags & DELETE /api/admin/tags/{tagId} */}
      {activeTab === "tags" && (
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* 태그 생성 폼 */}
          <form
            onSubmit={handleAddTagSubmit}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3"
          >
            <h2 className="text-sm font-bold text-gray-900">새 태그 추가 (POST /api/admin/tags)</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="추가할 태그명 입력 (예: 잔잔한, 데이트)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                disabled={isSubmittingTag || !newTagName.trim()}
                className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center space-x-1 cursor-pointer"
              >
                {isSubmittingTag ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    <span>태그 생성</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {tagsError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
              <AlertCircle size={16} />
              <span>{tagsError}</span>
            </div>
          )}

          {/* 태그 리스트 영역 */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-700">
                등록된 태그 목록 ({tags.length}개)
              </span>
            </div>

            {isLoadingTags ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
                <Loader2 size={24} className="animate-spin text-gray-600" />
                <span className="text-xs font-medium">태그 목록 불러오는 중...</span>
              </div>
            ) : tags.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">등록된 태그가 없습니다.</div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => {
                  const tagId = tag.tagId || tag.id;
                  const isDeletingThis = deletingTagId === tagId;

                  return (
                    <div
                      key={tagId}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs hover:border-gray-300 transition-colors"
                    >
                      <TagIcon size={14} className="text-indigo-600" />
                      <span>#{tag.name}</span>
                      <span className="text-[10px] font-semibold text-gray-400">({tagId})</span>
                      <div className="flex items-center ml-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteTag(tagId, tag.name)}
                          disabled={isDeletingThis}
                          className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="태그 삭제 (DELETE)"
                        >
                          {isDeletingThis ? (
                            <Loader2 size={12} className="animate-spin text-red-600" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 장소 등록 / 수정 팝업 모달 */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingPlace ? `장소 수정 (PUT #${editingPlace.placeId})` : "신규 장소 추가 (POST)"}
              </h3>
              <button
                onClick={() => setShowPlaceModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlaceFormSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">장소 이름 (name)</label>
                <input
                  type="text"
                  value={placeForm.name}
                  onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                  placeholder="예: 홍대 플래그십스토어"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              {!editingPlace && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">카카오 장소 ID (kakaoPlaceId)</label>
                  <input
                    type="text"
                    value={placeForm.kakaoPlaceId}
                    onChange={(e) => setPlaceForm({ ...placeForm, kakaoPlaceId: e.target.value })}
                    placeholder="예: 21162440"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">주소 (address)</label>
                <input
                  type="text"
                  value={placeForm.address}
                  onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                  placeholder="예: 서울 마포구 양화로 162"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">위도 (lat)</label>
                  <input
                    type="number"
                    step="any"
                    value={placeForm.lat}
                    onChange={(e) => setPlaceForm({ ...placeForm, lat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">경도 (lng)</label>
                  <input
                    type="number"
                    step="any"
                    value={placeForm.lng}
                    onChange={(e) => setPlaceForm({ ...placeForm, lng: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {placeFormError && <p className="text-xs font-bold text-red-500">{placeFormError}</p>}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlace}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isSubmittingPlace ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>{editingPlace ? "수정 완료" : "장소 등록"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";


import {
  MapPin,
  Calendar,
  Users,
  Tag as TagIcon,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Check,
  Search,
  Upload,
  Globe,
  Lock,
  User,
} from "lucide-react";
import {
  fetchPublicPlaces,
  fetchAllPublicPlaces,
  fetchPrivatePlaces,
  fetchTags,
  createReview,
  uploadReviewImage,
} from "../services/placeService";
import ImageWithSkeleton from "../components/common/ImageWithSkeleton";



// 동행인 정적 옵션 목록 (컴포넌트 외부에 선언하여 매 렌더링마다 재생성 방지)
const COMPANION_OPTIONS = [
  { value: "ALONE", label: "혼자", img: "/imgs/alone.png" },
  { value: "FRIEND", label: "친구와", img: "/imgs/friends.png" },
  { value: "LOVER", label: "연인과", img: "/imgs/couple.png" },
  { value: "FAMILY", label: "가족과", img: "/imgs/family.png" },
  { value: "ETC", label: "기타/동료", img: "/imgs/etc.png" },
];

// 메모이제이션된 장소 카드 (선택 변경 시 변경된 2개 카드만 리렌더링되어 0ms 즉각 반응)
const PlaceCard = memo(function PlaceCard({ place, isSelected, onSelect }) {
  const id = place.placeId || place.id;

  return (
    <div
      onClick={() => onSelect(id)}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left select-none ${
        isSelected
          ? "bg-white border-[#111] shadow-xs ring-1 ring-[#111]"
          : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/80"
      }`}
    >
      <div className="flex items-start space-x-2.5 min-w-0 flex-1">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-none mt-0.5 ${
            isSelected ? "bg-[#111] text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <MapPin size={14} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-sm font-bold truncate ${
              isSelected ? "text-[#111]" : "text-gray-800"
            }`}
          >
            {place.name}
          </span>
          <span className="text-xs text-gray-400 truncate mt-0.5">
            {place.address || "주소 미입력"}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[#111] text-white flex items-center justify-center flex-none ml-2">
          <Check size={12} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
});

export default function ReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // 이전 페이지에서 전달된 장소 선택 정보가 있는 경우
  const preselectedPlace = location.state?.place;
  const preselectedPlaceId =
    location.state?.placeId || preselectedPlace?.placeId || preselectedPlace?.id;

  const initialPlaceType =
    preselectedPlace?.placeType === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  // 장소 및 태그 목록 state (공용 장소 vs 개인 장소 분리)
  const [publicPlaces, setPublicPlaces] = useState(
    preselectedPlace && initialPlaceType === "PUBLIC" ? [preselectedPlace] : []
  );
  const [privatePlaces, setPrivatePlaces] = useState(
    preselectedPlace && initialPlaceType === "PRIVATE" ? [preselectedPlace] : []
  );
  const [placeTypeFilter, setPlaceTypeFilter] = useState(initialPlaceType); // "PUBLIC" | "PRIVATE"
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

  // 장소 검색어 state (100% 클라이언트 메모리 필터링, API 통신 0회)
  const [placeSearchTerm, setPlaceSearchTerm] = useState("");

  // 한 번에 렌더링할 장소 개수 제한 (50개씩 가상 페이징)
  const [displayLimit, setDisplayLimit] = useState(50);

  // 리뷰 작성 폼 state (이전 페이지에서 전달된 장소가 있으면 즉시 선택)
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    preselectedPlaceId ? String(preselectedPlaceId) : ""
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [companion, setCompanion] = useState("ALONE");
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // 키워드 (문자열 태그) & 분위기 태그 (tagIds) & 이미지 URL 목록
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 검색어나 탭이 바뀌면 표시 개수를 다시 50개로 리셋
  useEffect(() => {
    setDisplayLimit(50);
  }, [placeSearchTerm, placeTypeFilter]);

  // 페이지 마운트 시 공용 장소 + 개인 장소 + 태그 목록을 병렬로 호출 (캐시 활용)
  useEffect(() => {
    setIsLoadingPlaces(true);

    fetchTags()
      .then((tagsRes) => {
        if (Array.isArray(tagsRes)) setAvailableTags(tagsRes);
      })
      .catch((e) => console.warn("Tags load warn:", e));

    Promise.allSettled([
      fetchAllPublicPlaces(15),
      fetchPrivatePlaces(),
    ])
      .then(([pubRes, privRes]) => {
        let pubList =
          pubRes.status === "fulfilled"
            ? pubRes.value?.content || (Array.isArray(pubRes.value) ? pubRes.value : [])
            : [];
        let privList =
          privRes.status === "fulfilled"
            ? privRes.value?.content || (Array.isArray(privRes.value) ? privRes.value : [])
            : [];

        // 이전 페이지에서 넘어온 장소가 있는 경우 목록에 병합 및 자동 선택
        if (preselectedPlaceId) {
          const isPriv =
            preselectedPlace?.placeType === "PRIVATE" ||
            privList.some((p) => String(p.placeId || p.id) === String(preselectedPlaceId));

          if (isPriv) {
            if (preselectedPlace && !privList.some((p) => String(p.placeId || p.id) === String(preselectedPlaceId))) {
              privList = [preselectedPlace, ...privList];
            }
            setPlaceTypeFilter("PRIVATE");
          } else {
            if (preselectedPlace && !pubList.some((p) => String(p.placeId || p.id) === String(preselectedPlaceId))) {
              pubList = [preselectedPlace, ...pubList];
            }
            setPlaceTypeFilter("PUBLIC");
          }
          setSelectedPlaceId(String(preselectedPlaceId));
        } else if (pubList.length > 0) {
          setSelectedPlaceId(String(pubList[0].placeId || pubList[0].id));
        } else if (privList.length > 0) {
          setSelectedPlaceId(String(privList[0].placeId || privList[0].id));
          setPlaceTypeFilter("PRIVATE");
        }

        setPublicPlaces(pubList);
        setPrivatePlaces(privList);
      })
      .catch((err) => {
        console.error("Places load error:", err);
        setErrorMsg("장소 목록을 불러오는데 실패했습니다.");
      })
      .finally(() => {
        setIsLoadingPlaces(false);
      });
  }, [preselectedPlaceId, preselectedPlace]);

  // 장소 선택 핸들러 (useCallback으로 메모이제이션)
  const handleSelectPlace = useCallback((id) => {
    setSelectedPlaceId(String(id));
  }, []);

  // 현재 선택된 탭(PUBLIC vs PRIVATE)에 해당하는 장소 목록
  const currentPlaces = useMemo(() => {
    return placeTypeFilter === "PUBLIC" ? publicPlaces : privatePlaces;
  }, [placeTypeFilter, publicPlaces, privatePlaces]);

  // 검색어에 따른 필터링 결과 메모이제이션 (선택된 장소가 있으면 최상단으로 우선 정렬)
  const filteredPlaces = useMemo(() => {
    let list = currentPlaces;
    if (placeSearchTerm.trim()) {
      const term = placeSearchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.address?.toLowerCase().includes(term)
      );
    }

    // 선택된 장소가 목록에 있다면 최상단으로 올려 즉시 눈에 띄게 표시
    if (selectedPlaceId) {
      const idx = list.findIndex(
        (p) => String(p.placeId || p.id) === String(selectedPlaceId)
      );
      if (idx > 0) {
        const selected = list[idx];
        const rest = list.filter((_, i) => i !== idx);
        return [selected, ...rest];
      }
    }

    return list;
  }, [currentPlaces, placeSearchTerm, selectedPlaceId]);


  // 화면에 실제 렌더링할 50개 단위 장소 슬라이스
  const visiblePlaces = useMemo(() => {
    return filteredPlaces.slice(0, displayLimit);
  }, [filteredPlaces, displayLimit]);

  // 스크롤 시 50개씩 추가 로드
  const handlePlaceListScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      if (displayLimit < filteredPlaces.length) {
        setDisplayLimit((prev) => Math.min(prev + 50, filteredPlaces.length));
      }
    }
  };







  // 키워드 태그 추가
  const handleAddKeyword = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = keywordInput.trim();
      if (trimmed && !keywords.includes(trimmed)) {
        setKeywords([...keywords, trimmed]);
        setKeywordInput("");
      }
    }
  };

  const handleRemoveKeyword = (targetIndex) => {
    setKeywords(keywords.filter((_, idx) => idx !== targetIndex));
  };

  // 분위기 태그 (tagIds) 토글 선택
  const handleToggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  // 이미지 파일 업로드 (POST /api/users/me/review-images)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 형식 검증
    if (!file.type.startsWith("image/")) {
      setErrorMsg("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg(null);

    try {
      const uploadedUrl = await uploadReviewImage(file);
      if (uploadedUrl && typeof uploadedUrl === "string") {
        setImageUrls((prev) => [...prev, uploadedUrl]);
      }
    } catch (err) {
      console.error("Image Upload Error:", err);
      setErrorMsg(err.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      // Reset input value so same file can be selected again if needed
      if (e.target) e.target.value = "";
    }
  };

  const handleRemoveImageUrl = (targetIndex) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== targetIndex));
  };

  // POST /api/users/me/reviews 리뷰 등록 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedPlaceId) {
      setErrorMsg("리뷰할 장소를 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("리뷰 제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("리뷰 내용을 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ISO 형식 날짜 변환 (YYYY-MM-DDT00:00:00.000Z)
      const isoVisitedAt = new Date(visitedAt).toISOString();

      await createReview({
        placeId: selectedPlaceId,
        title: title.trim(),
        content: content.trim(),
        companion: companion,
        visitedAt: isoVisitedAt,
        keywords: keywords,
        tagIds: selectedTagIds,
        imageUrls: imageUrls,
      });

      alert("리뷰가 성공적으로 등록되었습니다! 🎉");
      navigate("/foryou"); // 등록 후 For You 맞춤 추천 페이지로 이동
    } catch (err) {
      console.error("Create Review Submit Error:", err);
      // 실서버 백엔드 에러 원본 메시지 렌더링
      setErrorMsg(err.message || "리뷰 등록 중 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white select-none text-left space-y-5 overflow-x-hidden">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-bold text-[#111]">리뷰 작성</h1>
        <p className="text-sm text-gray-500 mt-1">
          방문했던 장소의 경험과 분위기 태그를 나누어보세요.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-sm text-red-500 font-medium">
          <AlertCircle size={16} className="flex-none" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-6">
        {/* 1. 장소 선택 (placeId) */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 block">
            방문 장소 선택 *
          </label>

          {/* 로딩 중: 펄스 애니메이션 스켈레톤 박스 컴포넌트 */}
          {isLoadingPlaces && (
            <div className="space-y-2.5 animate-fade-in">
              <div className="w-full h-11 bg-gray-100 rounded-xl animate-pulse flex items-center justify-between px-3.5">
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2 border border-gray-100 rounded-2xl p-2 bg-gray-50/60 max-h-56 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-xl border border-gray-100 animate-pulse flex items-center justify-between"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="w-32 h-4 bg-gray-200 rounded" />
                      <div className="w-48 h-3 bg-gray-100 rounded" />
                    </div>
                    <div className="w-4 h-4 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 로드 완료: 즉시 사용 가능한 커스텀 장소 검색 및 선택 박스 컴포넌트 */}
          {!isLoadingPlaces && (
            <div className="space-y-3 animate-fade-in">
              {/* 장소 타입 선택 아이콘 박스 (공용 장소 vs 개인 장소) */}
              <div className="grid grid-cols-2 gap-2.5 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setPlaceTypeFilter("PUBLIC");
                    setPlaceSearchTerm("");
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-2.5 text-left cursor-pointer ${
                    placeTypeFilter === "PUBLIC"
                      ? "bg-white border-[#111] text-[#111] shadow-2xs"
                      : "bg-gray-50/70 border-gray-100 hover:border-gray-200 hover:bg-gray-100/70 text-gray-500"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-none ${
                      placeTypeFilter === "PUBLIC"
                        ? "bg-[#111] text-white"
                        : "bg-gray-200/70 text-gray-500"
                    }`}
                  >
                    <Globe size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-xs font-bold ${
                          placeTypeFilter === "PUBLIC" ? "text-[#111]" : "text-gray-700"
                        }`}
                      >
                        공용 장소
                      </span>
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-gray-100 text-gray-500">
                        PUBLIC
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 truncate mt-0.5">
                      추천 스팟 {publicPlaces.length}개
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPlaceTypeFilter("PRIVATE");
                    setPlaceSearchTerm("");
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-2.5 text-left cursor-pointer ${
                    placeTypeFilter === "PRIVATE"
                      ? "bg-white border-[#111] text-[#111] shadow-2xs"
                      : "bg-gray-50/70 border-gray-100 hover:border-gray-200 hover:bg-gray-100/70 text-gray-500"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-none ${
                      placeTypeFilter === "PRIVATE"
                        ? "bg-[#111] text-white"
                        : "bg-gray-200/70 text-gray-500"
                    }`}
                  >
                    <Lock size={16} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-xs font-bold ${
                          placeTypeFilter === "PRIVATE" ? "text-[#111]" : "text-gray-700"
                        }`}
                      >
                        개인 장소
                      </span>
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-gray-100 text-gray-500">
                        PRIVATE
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 truncate mt-0.5">
                      내 등록 장소 {privatePlaces.length}개
                    </span>
                  </div>
                </button>
              </div>


              {/* 장소 검색 필터 입력란 (순수 로컬 메모리 필터링, API 요청 0회) */}
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  value={placeSearchTerm}
                  onChange={(e) => setPlaceSearchTerm(e.target.value)}
                  placeholder={
                    placeTypeFilter === "PUBLIC"
                      ? "공용 장소명 또는 주소 검색..."
                      : "개인 장소명 또는 주소 검색..."
                  }
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none transition-colors"
                />
                {placeSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setPlaceSearchTerm("")}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* 커스텀 장소 박스 스크롤 목록 (50개씩 가상 페이징 + 메모이제이션으로 0ms 즉각 반응) */}
              {currentPlaces.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-400">
                  {placeTypeFilter === "PUBLIC"
                    ? "등록된 공용 장소가 없습니다."
                    : "등록된 개인 장소가 없습니다."}
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-400">
                  검색된 장소가 없습니다.
                </div>
              ) : (
                <div
                  onScroll={handlePlaceListScroll}
                  className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar border border-gray-100 rounded-2xl p-1.5 bg-gray-50/50"
                >
                  {visiblePlaces.map((place) => {
                    const id = place.placeId || place.id;
                    const isSelected = String(selectedPlaceId) === String(id);
                    return (
                      <PlaceCard
                        key={id}
                        place={place}
                        isSelected={isSelected}
                        onSelect={handleSelectPlace}
                      />
                    );
                  })}

                  {filteredPlaces.length > visiblePlaces.length && (
                    <button
                      type="button"
                      onClick={() =>
                        setDisplayLimit((prev) =>
                          Math.min(prev + 50, filteredPlaces.length)
                        )
                      }
                      className="w-full py-2 text-xs font-bold text-gray-500 hover:text-[#111] bg-white border border-gray-100 rounded-xl transition-colors cursor-pointer"
                    >
                      더 보기 ({visiblePlaces.length} / {filteredPlaces.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>


        {/* 2. 제목 & 방문 일자 & 동행인 (companion) */}
        <div className="space-y-6">
          {/* 제목 (title) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">리뷰 제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="한 줄로 요약하는 한눈 리뷰 제목"
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none transition-colors"
            />
          </div>

          {/* 방문 날짜 (visitedAt) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              방문 일자
            </label>
            <input
              type="date"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:border-gray-400 outline-none transition-colors"
            />
          </div>

          {/* 동행인 선택 (companion: ALONE, FRIEND, LOVER, FAMILY, ETC) - 크게 시원하게 보이는 가로 스크롤 카드 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 block">
                누구와 함께 방문하셨나요?
              </label>
              <span className="text-[11px] text-gray-400">좌우로 넘겨 선택 ➔</span>
            </div>

            <div className="flex space-x-2.5 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar -mx-1 px-2">
              {COMPANION_OPTIONS.map((opt) => {
                const isSelected = companion === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCompanion(opt.value)}
                    className={`flex-none flex flex-col items-center justify-between w-[86px] h-[108px] p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#111] text-white border-[#111] shadow-md ring-2 ring-[#111]/15"
                        : "bg-gray-50/80 text-gray-600 border-gray-200/80 hover:bg-white hover:border-gray-300 shadow-2xs"
                    }`}
                  >
                    {/* 큼직하고 선명한 캐릭터 일러스트 */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={opt.img}
                        alt={opt.label}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span className={`text-xs font-bold tracking-tight mt-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>


          {/* 3. 본문 내용 (content) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">상세 리뷰 내용 *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="장소의 분위기, 대표 메뉴, 인테리어 등 마음에 들었던 점을 솔직하게 자유롭게 기록해보세요."
              className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* 4. 분위기 태그 선택 (tagIds) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              어울리는 분위기 태그 선택 (다중 선택 가능)
            </label>
            {availableTags.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 추천 태그가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {availableTags.map((tag) => {
                  const tagId = tag.tagId || tag.id;
                  const isSelected = selectedTagIds.includes(tagId);
                  return (
                    <button
                      key={tagId}
                      type="button"
                      onClick={() => handleToggleTag(tagId)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-[#111] text-white font-bold"
                          : "bg-gray-100 text-gray-600 font-medium hover:bg-gray-200"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. 키워드 태그 직접 입력 (keywords) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">커스텀 키워드 추가</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium"
                  >
                    <span>#{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 6. 사진 첨부 (파일 업로드 전용) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 block">
                사진 첨부
              </label>
              {imageUrls.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">
                  {imageUrls.length}장 첨부됨
                </span>
              )}
            </div>

            {/* 숨겨진 파일 선택 input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* 사진 업로드 버튼 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isUploadingImage ? (
                <>
                  <Loader2 size={18} className="animate-spin text-gray-600" />
                  <span>사진 업로드 중...</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-gray-500" />
                  <span>내 기기에서 사진 선택하여 업로드</span>
                </>
              )}
            </button>

            {/* 업로드된 이미지 미리보기 목록 */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                  >
                    <ImageWithSkeleton
                      src={url}
                      alt={`첨부 이미지 ${idx + 1}`}
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                      title="사진 삭제"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#111] text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>리뷰 등록 중...</span>
                </>
              ) : (
                <span>리뷰 등록하기</span>
              )}
            </button>
          </div>
        </form>
    </div>
  );
}


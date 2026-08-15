import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  fetchPublicPlaces,
  fetchPrivatePlaces,
  fetchTags,
  createReview,
} from "../services/placeService";

export default function ReviewPage() {
  const navigate = useNavigate();

  // 장소 및 태그 목록 state
  const [places, setPlaces] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // 장소 검색어 state
  const [placeSearchTerm, setPlaceSearchTerm] = useState("");

  // 리뷰 작성 폼 state
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [companion, setCompanion] = useState("ALONE");
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // 키워드 (문자열 태그) & 분위기 태그 (tagIds) & 이미지 URL
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState([]);

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 초기 데이터 (공용 장소 publicPlaces 및 분위기 태그 목록) 로드
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitial(true);
      setErrorMsg(null);

      try {
        // 공용 장소 목록 로드 (Public 장소만 선택 가능)
        let publicPlacesList = [];
        try {
          const publicRes = await fetchPublicPlaces();
          if (Array.isArray(publicRes)) publicPlacesList = publicRes;
        } catch (e) {
          console.warn("Public places load warn:", e);
        }

        setPlaces(publicPlacesList);
        if (publicPlacesList.length > 0) {
          setSelectedPlaceId(publicPlacesList[0].placeId || publicPlacesList[0].id);
        }

        // 전체 태그 목록 로드
        try {
          const tagsRes = await fetchTags();
          if (Array.isArray(tagsRes)) setAvailableTags(tagsRes);
        } catch (e) {
          console.warn("Tags load warn:", e);
        }
      } catch (err) {
        console.error("Review Page Initial Load Error:", err);
        setErrorMsg("기본 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadInitialData();
  }, []);

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

  // 이미지 URL 추가
  const handleAddImageUrl = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = imageUrlInput.trim();
      if (trimmed && !imageUrls.includes(trimmed)) {
        setImageUrls([...imageUrls, trimmed]);
        setImageUrlInput("");
      }
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

  const companionOptions = [
    { value: "ALONE", label: "혼자" },
    { value: "FRIEND", label: "친구와" },
    { value: "LOVER", label: "연인과" },
    { value: "FAMILY", label: "가족과" },
    { value: "ETC", label: "기타/동료" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white select-none text-left overflow-y-auto space-y-5">
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

      {isLoadingInitial ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm font-medium">
            장소 및 태그 정보를 준비하는 중...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 pb-6">
          {/* 1. 장소 선택 (placeId) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              방문 장소 선택 *
            </label>

            {/* 장소 검색 필터 입력란 */}
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                value={placeSearchTerm}
                onChange={(e) => setPlaceSearchTerm(e.target.value)}
                placeholder="장소명 또는 주소 검색..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none transition-colors"
              />
              {placeSearchTerm && (
                <button
                  type="button"
                  onClick={() => setPlaceSearchTerm("")}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {places.length === 0 ? (
              <p className="text-sm text-red-500 font-medium">
                등록된 장소가 없습니다. 먼저 장소를 추가해주세요.
              </p>
            ) : (
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:border-gray-400 outline-none transition-colors"
              >
                {places
                  .filter(
                    (p) =>
                      p.name?.toLowerCase().includes(placeSearchTerm.toLowerCase()) ||
                      p.address?.toLowerCase().includes(placeSearchTerm.toLowerCase())
                  )
                  .map((place) => {
                    const id = place.placeId || place.id;
                    return (
                      <option key={id} value={id}>
                        {place.name} ({place.address || "주소 미입력"})
                      </option>
                    );
                  })}
              </select>
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

            {/* 동행인 선택 (companion: ALONE, FRIEND, LOVER, FAMILY, ETC) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 block">
                누구와 함께 방문하셨나요?
              </label>
              <div className="flex flex-wrap gap-2">
                {companionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCompanion(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      companion === opt.value
                        ? "bg-[#111] text-white font-bold"
                        : "bg-gray-100 text-gray-600 font-medium hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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

          {/* 6. 이미지 URL 첨부 (imageUrls) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block">
              사진 링크 첨부
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={handleAddImageUrl}
                placeholder="https://... 이미지 URL 입력"
                className="flex-1 px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-400 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="space-y-2 pt-2">
                {imageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm"
                  >
                    <span className="truncate text-gray-600 max-w-[200px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={16} />
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
      )}
    </div>
  );
}

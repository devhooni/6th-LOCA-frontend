import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Navigation,
  MapPin,
  Loader2,
  X,
  ExternalLink,
  Tag,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquareText,
  Calendar,
  User,
  Globe,
} from "lucide-react";
import {
  fetchExploreRecommendations,
  fetchPublicPlaceDetail,
  fetchPublicPlaces,
  fetchPrivatePlaces,
  fetchTags,
  fetchMyReviews,
  fetchPlaceReviews,
  fetchReviewDetail,
} from "../services/placeService";

import aloneImg from "/imgs/alone.png";
import friendsImg from "/imgs/friends.png";
import coupleImg from "/imgs/couple.png";
import familyImg from "/imgs/family.png";
import etcImg from "/imgs/etc.png";

export const COMPANION_CONFIG = {
  ALONE: { label: "혼자", img: aloneImg },
  FRIEND: { label: "친구와", img: friendsImg },
  LOVER: { label: "연인과", img: coupleImg },
  FAMILY: { label: "가족과", img: familyImg },
  ETC: { label: "기타", img: etcImg },
};

export default function ExplorePage() {
  const location = useLocation();
  const targetPlaceFromState = location.state?.place;
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const placeMarkersRef = useRef([]);
  // 장소 선택 시 이전 진행 중인 요청을 취소하기 위한 AbortController ref
  const selectPlaceAbortRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Tab & Filter state
  const [placeType, setPlaceType] = useState("공용"); // 기본값 '공용'으로 설정
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [selectedTagIds, setSelectedTagIds] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagMap, setTagMap] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  // API Places state
  const [publicPlaces, setPublicPlaces] = useState([]);
  const [publicPage, setPublicPage] = useState(0);
  const [hasNextPublic, setHasNextPublic] = useState(false);
  const [privatePlaces, setPrivatePlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [apiError, setApiError] = useState(null);

  // 리뷰 개수 매핑 맵 (placeId -> reviewCount)
  const [reviewCountMap, setReviewCountMap] = useState({});

  // Selected Place State & Detail Loading
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetail, setPlaceDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 선택된 장소의 리뷰 목록 상태
  const [placeReviews, setPlaceReviews] = useState([]);
  const [isLoadingPlaceReviews, setIsLoadingPlaceReviews] = useState(false);

  // 리뷰 정보 상세 팝업 모달 상태
  const [selectedReviewDetail, setSelectedReviewDetail] = useState(null);
  const [isLoadingReviewDetail, setIsLoadingReviewDetail] = useState(false);
  const [reviewDetailError, setReviewDetailError] = useState(null);

  // Bottom Sheet State & Touch Handling
  const [sheetState, setSheetState] = useState("half");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(255);
  const [sheetHeight, setSheetHeight] = useState(255);

  // 전체 태그 목록 & 리뷰 목록 불러와 tagMap 및 reviewCountMap 구성
  useEffect(() => {
    fetchTags()
      .then((tags) => {
        if (Array.isArray(tags) && tags.length > 0) {
          setAvailableTags(tags);
          const tMap = {};
          tags.forEach((t) => {
            const tId = t.tagId ?? t.id;
            const tName = t.name ?? t.tagName;
            if (tId !== undefined && tName) tMap[tId] = tName;
          });
          setTagMap(tMap);

          // 태그가 불러와지면 전체 태그 ID 목록을 기본 활성 태그로 등록
          const allIds = tags.map((t) => t.tagId ?? t.id).filter(Boolean);
          if (allIds.length > 0) {
            setSelectedTagIds(allIds);
            handleSelectPublicRef.current(allIds, 0);
          }
        }
      })
      .catch((err) => console.warn("Tags load failed:", err));


    // 내 리뷰 목록 및 장소별 리뷰 개수 집계 (캐시 경유 → 중복 호출 없음)
    fetchMyReviews()
      .then((reviews) => {
        if (Array.isArray(reviews)) {
          const counts = {};
          reviews.forEach((r) => {
            const pId = r.placeId ?? r.place?.placeId;
            if (pId !== undefined && pId !== null) {
              counts[pId] = (counts[pId] || 0) + 1;
            }
          });
          setReviewCountMap(counts);
        }
      })
      .catch((err) => console.warn("My reviews count load failed:", err));
  }, []);

  const handleSelectPlace = useCallback(async (place) => {
    // 이전 요청이 진행 중이면 취소 (Race Condition 방지)
    if (selectPlaceAbortRef.current) {
      selectPlaceAbortRef.current.abort();
    }
    const abortController = new AbortController();
    selectPlaceAbortRef.current = abortController;

    setSelectedPlace(place);
    setSheetState("half");
    setSheetHeight(255);
    setPlaceReviews([]);
    setSelectedReviewDetail(null);

    if (mapRef.current && place.lat && place.lng) {
      const targetPos = new window.kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.panTo(targetPos);
    }

    const placeId = place.placeId || place.id;
    if (placeId) {
      setIsLoadingDetail(true);
      setIsLoadingPlaceReviews(true);

      // 장소 상세 조회 (취소 가능)
      fetchPublicPlaceDetail(placeId)
        .then((detail) => {
          if (!abortController.signal.aborted) setPlaceDetail(detail);
        })
        .catch((err) => {
          if (!abortController.signal.aborted) {
            console.warn("Place detail fetch failed, using place basic info:", err);
            setPlaceDetail(null);
          }
        })
        .finally(() => {
          if (!abortController.signal.aborted) setIsLoadingDetail(false);
        });

      // 장소에 등록된 리뷰 목록 조회 (/api/places/{placeId}/reviews)
      try {
        const reviewsRes = await fetchPlaceReviews(placeId, 0);
        if (abortController.signal.aborted) return;

        const list = reviewsRes?.content || (Array.isArray(reviewsRes) ? reviewsRes : []);
        setPlaceReviews(list);
        setReviewCountMap((prev) => ({
          ...prev,
          [placeId]: list.length,
        }));
      } catch (err) {
        if (abortController.signal.aborted) return;
        console.warn("Place reviews fetch failed:", err);
        setPlaceReviews([]);
        setReviewCountMap((prev) => ({
          ...prev,
          [placeId]: 0,
        }));
      } finally {
        if (!abortController.signal.aborted) setIsLoadingPlaceReviews(false);
      }
    } else {
      setPlaceDetail(null);
      setPlaceReviews([]);
    }
  }, []);

  // 리뷰 클릭 시 리뷰 상세 모달 오픈 (GET /api/users/me/reviews/{visitId})
  const handleOpenReviewDetail = async (review) => {
    const visitId = review.reviewId || review.visitId || review.id;
    if (!visitId) {
      setSelectedReviewDetail(review);
      return;
    }

    setIsLoadingReviewDetail(true);
    setReviewDetailError(null);
    setSelectedReviewDetail(review); // 즉시 열어서 보여주고 API 완료 시 갱신

    try {
      const detail = await fetchReviewDetail(visitId);
      if (detail) {
        setSelectedReviewDetail(detail);
      }
    } catch (err) {
      console.warn("Review detail API fetch error (using card info):", err);
      // 이미 review 기본 데이터가 있으므로 그대로 표시
    } finally {
      setIsLoadingReviewDetail(false);
    }
  };

  const updateMapPlaceMarkers = useCallback((places, currentSelected = null) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];

    if (!places || places.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    const activeId = currentSelected?.placeId ?? currentSelected?.id ?? currentSelected?.kakaoPlaceId;

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;

      const pId = place.placeId ?? place.id ?? place.kakaoPlaceId;
      const isSelected = activeId && String(activeId) === String(pId);

      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      bounds.extend(position);

      const content = document.createElement("div");
      content.style.cssText = "cursor: pointer; display: flex; align-items: center; justify-content: center; pointer-events: auto;";

      if (isSelected) {
        // 선택된 마커: 싱그러운 초록색 (#10B981) + 강조 펄스/섀도우
        content.innerHTML = `
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #10B981; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; transform: scale(1.15); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.45); transition: all 0.2s ease-in-out;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #fff;"></div>
          </div>
        `;
      } else {
        // 일반 마커: 다크 (#111)
        content.innerHTML = `
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #fff;"></div>
          </div>
        `;
      }

      content.addEventListener("click", () => {
        handleSelectPlace(place);
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: isSelected ? 30 : 10,
      });

      customOverlay.setMap(mapRef.current);
      placeMarkersRef.current.push(customOverlay);
    });

    if (places.length > 0 && !currentSelected) {
      mapRef.current.setBounds(bounds);
      setTimeout(() => {
        if (mapRef.current && mapRef.current.getLevel() < 4) {
          mapRef.current.setLevel(4);
        }
      }, 50);
    }
  }, [handleSelectPlace]);

  // 개인 장소 로딩
  const handleSelectPrivate = useCallback(async () => {
    setPlaceType("개인");
    setSelectedPlace(null);
    setIsLoadingPlaces(true);
    setApiError(null);

    try {
      const data = await fetchPrivatePlaces();
      const fetchedPlaces = Array.isArray(data) ? data : [];
      setPrivatePlaces(fetchedPlaces);
      updateMapPlaceMarkers(fetchedPlaces);
    } catch (err) {
      console.error("Private Places Fetch Error:", err);
      setApiError(err.message || "개인 장소 목록을 불러오는데 실패했습니다.");
      updateMapPlaceMarkers([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [updateMapPlaceMarkers]);

  // 공용 장소 로딩 (/api/recommendations/explore 기반 페이징 및 태그 연동 + 전체 공용 장소 캐싱)
  const [allPublicPlaces, setAllPublicPlaces] = useState([]);

  // 전체 공용 장소 백그라운드 로드 (검색 시 모든 페이지의 장소를 찾을 수 있도록)
  useEffect(() => {
    fetchPublicPlaces(0, 100)
      .then((res) => {
        const list = res?.content || (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setAllPublicPlaces(list);
        }
      })
      .catch((err) => console.warn("All public places cache warn:", err));
  }, []);

  const handleSelectPublic = useCallback(async (targetTagIds = null, pageNum = 0) => {
    setPlaceType("공용");
    setSelectedPlace(null);
    setIsLoadingPlaces(true);
    setApiError(null);
    setPublicPage(pageNum);

    try {
      // 전달된 targetTagIds가 있으면 그것을, 없으면 현재 선택된 selectedTagIds 또는 전체 태그 ID 목록을 사용
      let activeTags = targetTagIds;
      if (!activeTags || activeTags.length === 0) {
        if (selectedTagIds && selectedTagIds.length > 0) {
          activeTags = selectedTagIds;
        } else if (availableTags && availableTags.length > 0) {
          activeTags = availableTags.map((t) => t.tagId ?? t.id).filter(Boolean);
        } else {
          activeTags = [1];
        }
      }

      const recData = await fetchExploreRecommendations(activeTags, pageNum, 20);

      const fetchedPlaces = recData?.content || (Array.isArray(recData) ? recData : []);
      const hasNext = Boolean(recData?.hasNext);

      setPublicPlaces(fetchedPlaces);
      setHasNextPublic(hasNext);
      updateMapPlaceMarkers(fetchedPlaces);
    } catch (err) {
      console.error("Explore API Fetch Error:", err);
      setApiError(err.message || "추천 공용 장소를 불러오는데 실패했습니다.");
      updateMapPlaceMarkers([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, [availableTags, selectedTagIds, updateMapPlaceMarkers]);


  const handleDragStart = (clientY) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartHeight.current = sheetHeight;
  };

  const handleDragMove = useCallback(
    (clientY) => {
      if (!isDragging) return;
      const deltaY = dragStartY.current - clientY;
      const newHeight = dragStartHeight.current + deltaY;
      const maxHeight = window.innerHeight - 80;
      const minHeight = 24;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setSheetHeight(newHeight);
      }
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const maxHeight = window.innerHeight - 80;
    if (sheetHeight > 450) {
      setSheetState("full");
      setSheetHeight(maxHeight);
    } else if (sheetHeight < 140) {
      setSheetState("collapsed");
      setSheetHeight(24);
    } else {
      setSheetState("half");
      setSheetHeight(255);
    }
  }, [isDragging, sheetHeight]);

  useEffect(() => {
    const onMouseMove = (e) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const moveToMyLocation = useCallback((mapInstance, shouldPan = true) => {
    const targetMap = mapInstance || mapRef.current;
    if (!targetMap || !window.kakao || !window.kakao.maps) {
      console.warn("지도 객체가 아직 준비되지 않았습니다.");
      return;
    }

    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);

    const onLocationSuccess = (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const locPosition = new window.kakao.maps.LatLng(latitude, longitude);

        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        const content = document.createElement("div");
        content.style.cssText =
          "display: flex; flex-direction: column; align-items: center; user-select: none; pointer-events: none; z-index: 30;";
        content.innerHTML = `
          <div style="background-color: #111; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.18); margin-bottom: 5px; display: flex; align-items: center; gap: 5px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #3b82f6; display: inline-block;"></span>
            내 위치
          </div>
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">
            <div style="width: 18px; height: 18px; border-radius: 50%; background-color: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.25); position: relative; z-index: 2;"></div>
          </div>
        `;


        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: locPosition,
          content: content,
          xAnchor: 0.5,
          yAnchor: 1.0,
          zIndex: 35,
        });

        customOverlay.setMap(targetMap);
        userMarkerRef.current = customOverlay;

        if (shouldPan) {
          targetMap.panTo(locPosition);
          targetMap.setLevel(3, { animate: true });
        }
      } catch (e) {
        console.error("현위치 마커 렌더링 오류:", e);
      } finally {
        setIsLocating(false);
      }
    };

    const onLocationError = (error) => {
      console.warn("1차 고정밀 위치 조회 실패, 일반 모드로 재시도:", error);

      // highAccuracy 실패 시 저전력/Wi-Fi 기반 일반 모드로 2차 재시도
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        (err2) => {
          setIsLocating(false);
          if (err2.code === 1) {
            alert("브라우저 위치 정보 접근 권한을 허용해주세요.");
          } else {
            console.warn("위치 정보를 가져올 수 없습니다:", err2);
            // 최종 실패 시 기본 중심(홍대 와우산로)으로 부드럽게 재정렬
            if (shouldPan && targetMap) {
              const defaultCenter = new window.kakao.maps.LatLng(37.5518, 126.925);
              targetMap.panTo(defaultCenter);
            }
          }
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    // 1차 시도: highAccuracy
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  }, []);


  // 카테고리/태그 및 검색어 필터링 적용된 목록 계산
  const displayPlaces = useMemo(() => {
    // 검색어가 있을 때는 현재 페이지만 보지 않고 전체 공용 장소 풀(allPublicPlaces)에서 검색
    let rawList;
    if (placeType === "공용") {
      rawList = submittedSearchTerm.trim() && allPublicPlaces.length > 0 ? allPublicPlaces : publicPlaces;
    } else {
      rawList = privatePlaces;
    }

    let filtered = rawList;

    // 1. 카테고리 필터
    if (categoryFilter !== "전체") {
      if (categoryFilter === "개인 장소") {
        filtered = placeType === "개인" ? privatePlaces : [];
      } else if (placeType === "개인") {
        // 개인 장소인 경우 클라이언트 사이드 태그 검색
        const targetKeyword = categoryFilter.toLowerCase();
        filtered = filtered.filter((place) => {
          const placeName = (place.name || "").toLowerCase();
          const placeAddress = (place.address || "").toLowerCase();
          const tags = (place.tags || place.keywords || []).map((t) =>
            (typeof t === "string" ? t : t.name || t.tagName || "").toLowerCase()
          );

          return (
            placeName.includes(targetKeyword) ||
            placeAddress.includes(targetKeyword) ||
            tags.some((t) => t.includes(targetKeyword))
          );
        });
      }
      // 공용 장소는 /api/recommendations/explore?tagIds={id} 서버 API를 통해 이미 정확한 태그 추천 결과가 반환됨
    }

    // 2. 검색어 (submittedSearchTerm) 필터
    if (submittedSearchTerm.trim()) {
      const q = submittedSearchTerm.trim().toLowerCase();
      filtered = filtered.filter((place) => {
        const name = (place.name || "").toLowerCase();
        const address = (place.address || "").toLowerCase();
        const tags = (place.tags || place.keywords || []).map((t) =>
          (typeof t === "string" ? t : t.name || t.tagName || "").toLowerCase()
        );

        return (
          name.includes(q) ||
          address.includes(q) ||
          tags.some((t) => t.includes(q))
        );
      });
    }

    return filtered;
  }, [placeType, publicPlaces, privatePlaces, allPublicPlaces, categoryFilter, submittedSearchTerm]);

  // 검색어나 필터 또는 선택된 장소(selectedPlace)가 바뀔 때 지도 마커 색상 동기화
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      updateMapPlaceMarkers(displayPlaces, selectedPlace);
    }
  }, [displayPlaces, selectedPlace, mapLoaded, updateMapPlaceMarkers]);

  // 카테고리 필터 클릭 핸들러 (태그별 /api/recommendations/explore 실시간 조회)
  const handleCategoryClick = (category, tagId = null) => {
    setCategoryFilter(category);
    if (placeType === "공용") {
      if (category === "전체") {
        const allIds = availableTags.map((t) => t.tagId ?? t.id).filter(Boolean);
        const activeIds = allIds.length > 0 ? allIds : [1];
        setSelectedTagIds(activeIds);
        handleSelectPublic(activeIds, 0);
      } else {
        const targetId =
          tagId ||
          availableTags.find((t) => (t.name || t.tagName) === category)?.tagId ||
          availableTags.find((t) => (t.name || t.tagName) === category)?.id ||
          1;
        setSelectedTagIds([targetId]);
        handleSelectPublic([targetId], 0);
      }
    }
  };


  const handleSelectPublicRef = useRef(handleSelectPublic);
  useEffect(() => {
    handleSelectPublicRef.current = handleSelectPublic;
  });

  const handleSelectPrivateRef = useRef(handleSelectPrivate);
  useEffect(() => {
    handleSelectPrivateRef.current = handleSelectPrivate;
  });

  const handleSelectPlaceRef = useRef(handleSelectPlace);
  useEffect(() => {
    handleSelectPlaceRef.current = handleSelectPlace;
  });

  const moveToMyLocationRef = useRef(moveToMyLocation);
  useEffect(() => {
    moveToMyLocationRef.current = moveToMyLocation;
  });

  useEffect(() => {
    const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY;

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!mapContainer.current) return;
          const defaultCenter = new window.kakao.maps.LatLng(37.5563, 126.9227);
          const options = {
            center: defaultCenter,
            level: 4,
          };
          const map = new window.kakao.maps.Map(mapContainer.current, options);
          mapRef.current = map;
          setMapLoaded(true);

          setTimeout(() => {
            if (!mapRef.current) return;
            map.relayout();
            map.setCenter(defaultCenter);

            moveToMyLocationRef.current(map, !targetPlaceFromState);

            if (targetPlaceFromState) {
              handleSelectPlaceRef.current(targetPlaceFromState);
            } else {
              handleSelectPublicRef.current();
            }
          }, 100);
        });
      } else {
        setErrorMsg("카카오 맵 SDK를 로드하지 못했습니다.");
      }
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
      script.onload = () => {
        initMap();
      };
      script.onerror = () => {
        setErrorMsg("카카오 맵 스크립트를 불러오는데 실패했습니다.");
      };
      document.head.appendChild(script);
    }
  }, []); // Run map init ONLY once on mount to prevent infinite re-renders!

  return (
    <div className="relative w-full h-full min-h-0 flex-1 overflow-hidden flex flex-col justify-end">
      {/* Map Element */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0 bg-gray-100" />

      {/* 상단 Explore 플로팅 타이틀 & 설명 헤더 박스 (바텀시트가 올라올 때 자연스럽게 뒤로 가려짐) */}
      <div className="absolute top-4 left-4 right-4 z-5 pointer-events-none opacity-[0.92]">
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-none shadow-md border border-gray-100/80 flex items-center justify-between pointer-events-auto">
          <div>
            <h1 className="text-base font-bold text-[#111] tracking-tight">Explore</h1>
            <p className="text-xs text-gray-500 mt-0.5">홍대 주변 스팟과 분위기별 추천 장소를 탐색해보세요.</p>
          </div>
        </div>
      </div>

      {/* 현위치 이동 버튼 */}
      {mapLoaded && (
        <button
          onClick={() => moveToMyLocation(null, true)}
          disabled={isLocating}
          aria-label="현재 위치로 이동"
          style={{ bottom: `${sheetHeight + 16}px` }}
          className="absolute right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-100 transition-all hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
          <Navigation
            size={20}
            className={`transition-transform ${
              isLocating ? "animate-spin text-gray-400" : "fill-current text-gray-700"
            }`}
          />
        </button>
      )}

      {/* 주변 장소 바텀 시트 */}
      <div
        style={{
          height: `${sheetHeight}px`,
          transition: isDragging ? "none" : "height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
        className="relative z-10 w-full bg-white rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.06)] px-5 pt-1 pb-4 flex flex-col overflow-hidden">
        
        {/* 상단 드래그 핸들 */}
        <div
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientY);
            }
          }}
          className="w-full py-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none flex-none mb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 바텀시트 콘텐츠 */}
        {sheetHeight > 50 && (
          <div className="flex flex-col h-full overflow-hidden">
            {selectedPlace ? (
              <div className="flex flex-col h-full overflow-y-auto pr-1 pb-4 text-left space-y-4">
                <div className="flex items-start justify-between flex-none pb-2 border-b border-gray-100">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-400">
                        {placeType} 장소
                      </span>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                        <MessageSquareText size={11} className="text-gray-500" />
                        <span>{placeReviews.length}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#111] mt-1">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                      <MapPin size={12} className="mr-1 text-gray-400 flex-none" />
                      {selectedPlace.address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceDetail(null);
                      setPlaceReviews([]);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    상세 정보를 불러오는 중...
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {/* 이미지 */}
                    {placeDetail?.imageUrl && (
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                        <img
                          src={placeDetail.imageUrl}
                          alt={selectedPlace.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* 분위기 태그 */}
                    {placeDetail?.tags && placeDetail.tags.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-semibold text-gray-500">분위기 태그</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {placeDetail.tags.map((tag) => (
                            <span
                              key={tag.tagId || tag.name}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1"
                            >
                              <Tag size={11} />
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 카카오맵 바로가기 버튼 */}
                    {selectedPlace.kakaoPlaceId && (
                      <a
                        href={`https://place.map.kakao.com/${selectedPlace.kakaoPlaceId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-2.5 rounded-xl bg-yellow-50 text-yellow-800 text-xs font-bold"
                      >
                        카카오맵에서 보기
                        <ExternalLink size={14} className="ml-1.5" />
                      </a>
                    )}

                    {/* 장소 리뷰 섹션 */}
                    <div className="pt-2 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <MessageSquareText size={15} className="text-[#111]" />
                          <h4 className="text-sm font-bold text-[#111]">
                            방문 리뷰 ({placeReviews.length})
                          </h4>
                        </div>
                      </div>

                      {isLoadingPlaceReviews ? (
                        <div className="flex items-center justify-center py-6 text-gray-400 text-xs">
                          <Loader2 className="animate-spin mr-2" size={16} />
                          리뷰를 불러오는 중...
                        </div>
                      ) : placeReviews.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                          아직 등록된 리뷰가 없습니다.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {placeReviews.map((rev) => {
                            const revId = rev.reviewId || rev.visitId || rev.id;
                            const compConfig = COMPANION_CONFIG[rev.companion];
                            const revPhoto = Array.isArray(rev.imageUrls) && rev.imageUrls.length > 0
                              ? rev.imageUrls[0]
                              : rev.imageUrl;

                            return (
                              <div
                                key={revId}
                                onClick={() => handleOpenReviewDetail(rev)}
                                className="p-3.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/70 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 text-left"
                              >
                                <div className="flex flex-col min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <h5 className="text-xs font-bold text-[#111] truncate">
                                      {rev.title || "방문 기록"}
                                    </h5>
                                    {compConfig && (
                                      <span className="px-1.5 py-0.5 rounded-md border border-gray-200 bg-white text-gray-700 text-[10px] font-bold">
                                        {compConfig.label}
                                      </span>
                                    )}
                                  </div>

                                  {rev.visitedAt && (
                                    <p className="text-[10px] text-gray-400">
                                      {new Date(rev.visitedAt).toLocaleDateString("ko-KR")} 방문
                                    </p>
                                  )}

                                  <p className="text-xs text-gray-600 line-clamp-2 pt-0.5">
                                    {rev.content}
                                  </p>

                                  {/* 키워드 태그 */}
                                  {Array.isArray(rev.keywords) && rev.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {rev.keywords.map((kw, kIdx) => (
                                        <span
                                          key={kIdx}
                                          className="bg-white text-gray-600 border border-gray-200 text-[10px] rounded-md px-1.5 py-0.5"
                                        >
                                          #{kw}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {revPhoto && (
                                  <div className="w-16 h-16 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex-none">
                                    <img
                                      src={revPhoto}
                                      alt="리뷰 사진"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* 검색 입력 폼 및 개인/공용 스위처 (검색 버튼/엔터 클릭 시에만 검색 실행) */}
                <div className="flex items-center gap-2 flex-none mb-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmittedSearchTerm(searchInput);
                    }}
                    className="relative flex-1 flex items-center"
                  >
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="장소명, 주소, 태그 검색..."
                      className="w-full pl-3.5 pr-14 py-1.5 rounded-xl bg-gray-100 border border-transparent text-xs text-[#111] placeholder-gray-400 focus:bg-white focus:border-gray-300 outline-none transition-colors"
                    />
                    <div className="absolute right-1.5 flex items-center space-x-1">
                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput("");
                            setSubmittedSearchTerm("");
                          }}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                        >
                          <X size={12} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="w-6 h-6 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
                        title="검색"
                        aria-label="검색"
                      >
                        <Search size={13} />
                      </button>
                    </div>
                  </form>


                  {/* 개인(사람 아이콘) / 공용(지구본 아이콘) 토글 스위처 */}
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg flex-none">
                    <button
                      type="button"
                      onClick={handleSelectPrivate}
                      title="개인 장소"
                      aria-label="개인 장소"
                      className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                        placeType === "개인"
                          ? "bg-white text-[#111] shadow-sm font-semibold"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <User size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPublic()}
                      title="공용 장소"
                      aria-label="공용 장소"
                      className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                        placeType === "공용"
                          ? "bg-white text-[#111] shadow-sm font-semibold"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Globe size={15} />
                    </button>
                  </div>
                </div>

                {sheetHeight > 130 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5 flex-none">
                    {/* 전체 버튼 */}
                    <button
                      onClick={() => handleCategoryClick("전체")}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                        categoryFilter === "전체"
                          ? "bg-[#111] text-white font-medium"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      전체
                    </button>

                    {/* 백엔드에 등록된 실시간 태그 목록 동적 렌더링 */}
                    {availableTags.map((tag) => {
                      const tagName = tag.name || tag.tagName || `태그 ${tag.tagId || tag.id}`;
                      const isSelected = categoryFilter === tagName;
                      return (
                        <button
                          key={tag.tagId || tag.id || tagName}
                          onClick={() => handleCategoryClick(tagName, tag.tagId || tag.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                            isSelected
                              ? "bg-[#111] text-white font-medium"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tagName}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 공용 장소일 때 페이지 넘기기 (Pagination) 컨트롤 - 상단 고정 배치 */}
                {placeType === "공용" && (publicPage > 0 || hasNextPublic) && sheetHeight > 130 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-2 flex-none">
                    <button
                      onClick={() => handleSelectPublic(selectedTagIds, publicPage - 1)}
                      disabled={publicPage === 0 || isLoadingPlaces}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>이전</span>
                    </button>

                    <span className="text-xs font-bold text-[#111]">
                      {publicPage + 1} 페이지
                    </span>

                    <button
                      onClick={() => handleSelectPublic(selectedTagIds, publicPage + 1)}
                      disabled={!hasNextPublic || isLoadingPlaces}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >
                      <span>다음</span>
                      <ChevronRight size={14} />
                    </button>

                  </div>
                )}

                {sheetHeight > 160 && (
                  <div className="flex flex-col space-y-3 overflow-y-auto pr-1 pb-4 flex-1">
                    {isLoadingPlaces ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                      </div>
                    ) : apiError ? (
                      <div className="flex flex-col items-center justify-center py-8 text-sm text-red-500">
                        {apiError}
                      </div>
                    ) : displayPlaces.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                        장소가 없습니다.
                      </div>
                    ) : (
                      displayPlaces.map((place) => {
                        const pId = place.placeId || place.id || place.kakaoPlaceId;
                        const reviewCount = reviewCountMap[place.placeId || place.id] || 0;

                        return (
                          <div
                            key={pId}
                            onClick={() => handleSelectPlace(place)}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white cursor-pointer hover:bg-gray-50/70 transition-all text-left"
                          >
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 flex-none mr-3 mt-0.5">
                                <MapPin size={16} />
                              </div>
                              <div className="flex flex-col">
                                <h4 className="text-sm font-bold text-[#111]">
                                  {place.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  {place.address}
                                </p>
                              </div>
                            </div>

                            {/* 장소 카드 내 말풍선 아이콘과 숫자만 표시 */}
                            <div className="flex items-center flex-none ml-2">
                              <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                                <MessageSquareText size={12} className="text-gray-500" />
                                <span>{reviewCount}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 리뷰 정보 상세 모달 팝업 (/api/users/me/reviews/{visitId}) */}
      {selectedReviewDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
          onClick={() => setSelectedReviewDetail(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더: 제목 (좌측) + 방문 날짜 & 닫기 버튼 (우측 같은 행) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#111] truncate pr-2">
                {selectedReviewDetail.title || "리뷰 상세"}
              </h3>
              <div className="flex items-center space-x-3 flex-none">
                {selectedReviewDetail.visitedAt && (
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar size={12} className="mr-1 text-gray-400" />
                    {(() => {
                      const d = new Date(selectedReviewDetail.visitedAt);
                      const days = ["일", "월", "화", "수", "목", "금", "토"];
                      const dayName = days[d.getDay()];
                      return `${d.toLocaleDateString("ko-KR")} (${dayName})`;
                    })()}
                  </div>
                )}
                <button
                  onClick={() => setSelectedReviewDetail(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {isLoadingReviewDetail ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-xs">
                <Loader2 className="animate-spin mr-2" size={16} />
                리뷰 정보를 불러오는 중...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* 1. 첨부 사진 갤러리 (사진이 먼저 상단에 위치) */}
                {Array.isArray(selectedReviewDetail.imageUrls) && selectedReviewDetail.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReviewDetail.imageUrls.map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={img}
                          alt={`리뷰 사진 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. 리뷰 본문 내용 (사진 아래에 위치) */}
                <div className="p-3.5 bg-gray-50 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100 text-xs min-h-[70px]">
                  {selectedReviewDetail.content || "작성된 내용이 없습니다."}
                </div>

                {/* 3. 누구와 갔는지 (동행인 뱃지) - 키워드 바로 위에 배치 */}
                {selectedReviewDetail.companion && COMPANION_CONFIG[selectedReviewDetail.companion] && (
                  <div className="pt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700 font-bold text-[11px]">
                      {COMPANION_CONFIG[selectedReviewDetail.companion].label}
                    </span>
                  </div>
                )}

                {/* 3. 분위기 태그 & 키워드 목록 */}
                {((Array.isArray(selectedReviewDetail.tagIds) && selectedReviewDetail.tagIds.length > 0) ||
                  (Array.isArray(selectedReviewDetail.keywords) && selectedReviewDetail.keywords.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Array.isArray(selectedReviewDetail.tagIds) &&
                      selectedReviewDetail.tagIds.map((tId) => {
                        const tName = tagMap[tId];
                        if (!tName) return null;
                        return (
                          <span
                            key={`t-${tId}`}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]"
                          >
                            #{tName}
                          </span>
                        );
                      })}

                    {Array.isArray(selectedReviewDetail.keywords) &&
                      selectedReviewDetail.keywords.map((kw, kIdx) => (
                        <span
                          key={`k-${kIdx}`}
                          className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium text-[11px]"
                        >
                          #{kw}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {!mapLoaded && !errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm z-30">
          지도를 불러오는 중...
        </div>
      )}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-red-500 text-sm p-4 text-center z-30">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

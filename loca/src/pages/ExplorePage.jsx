import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Navigation, MapPin, Loader2, X, ExternalLink, Tag } from "lucide-react";
import { fetchExploreRecommendations, fetchPublicPlaceDetail, fetchPrivatePlaces } from "../services/placeService";

export default function ExplorePage() {
  const location = useLocation();
  const targetPlaceFromState = location.state?.place;
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const placeMarkersRef = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Tab & Filter state
  const [placeType, setPlaceType] = useState("개인"); // '개인' | '공용'
  const [categoryFilter, setCategoryFilter] = useState("전체"); // '전체' | '카페' | '맛집' | '개인 장소' 등

  // API Places state
  const [publicPlaces, setPublicPlaces] = useState([]);
  const [privatePlaces, setPrivatePlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Selected Place State & Detail Loading
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetail, setPlaceDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Bottom Sheet State & Touch Handling
  const [sheetState, setSheetState] = useState("half");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(220);
  const [sheetHeight, setSheetHeight] = useState(220);

  // 장소 클릭 시 백엔드 상세 조회 및 카카오 지도 이동
  const handleSelectPlace = useCallback((place) => {
    setSelectedPlace(place);
    setSheetState("half");
    setSheetHeight(220);

    if (mapRef.current && place.lat && place.lng) {
      const targetPos = new window.kakao.maps.LatLng(place.lat, place.lng);
      mapRef.current.panTo(targetPos);
    }

    if (place.placeId) {
      setIsLoadingDetail(true);
      fetchPublicPlaceDetail(place.placeId)
        .then((detail) => setPlaceDetail(detail))
        .catch((err) => {
          console.warn("Place detail fetch failed, using place basic info:", err);
          setPlaceDetail(null);
        })
        .finally(() => setIsLoadingDetail(false));
    } else {
      setPlaceDetail(null);
    }
  }, []);

  // 지도 위 장소 마커 표시 및 뷰포트 맞춤 함수
  const updateMapPlaceMarkers = useCallback((places) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

    // 기존 장소 마커 지우기
    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];

    if (!places || places.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;

      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      bounds.extend(position);

      const content = document.createElement("div");
      content.style.cssText = "cursor: pointer; display: flex; align-items: center; justify-content: center; pointer-events: auto;";
      content.innerHTML = `
        <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #252525; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #6366f1;"></div>
        </div>
      `;

      content.addEventListener("click", () => {
        handleSelectPlace(place);
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        xAnchor: 0.5,
        yAnchor: 0.5,
      });

      customOverlay.setMap(mapRef.current);
      placeMarkersRef.current.push(customOverlay);
    });

    if (places.length > 0) {
      mapRef.current.setBounds(bounds);
      // 마커 개수가 적거나 좁은 지역일 때 지나치게 확대되는 것(level 1-2)을 방지하고 공용 탭 수준(level 4 이상)의 적절한 축척 유지
      setTimeout(() => {
        if (mapRef.current && mapRef.current.getLevel() < 4) {
          mapRef.current.setLevel(4);
        }
      }, 50);
    }
  }, [handleSelectPlace]);

  // '개인' 버튼 클릭 처리 및 API 호출 (GET /api/places/custom)
  const handleSelectPrivate = useCallback(async () => {
    setPlaceType("개인");
    setSelectedPlace(null);
    setIsLoadingPlaces(true);
    setApiError(null);

    try {
      const data = await fetchPrivatePlaces();
      const fetchedPlaces = data || [];
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

  // '공용' 버튼 클릭 처리 및 API 호출 (GET /api/recommendations/explore)
  const handleSelectPublic = async () => {
    setPlaceType("공용");
    setSelectedPlace(null);
    setIsLoadingPlaces(true);
    setApiError(null);

    try {
      const data = await fetchExploreRecommendations();
      const fetchedPlaces = data || [];
      setPublicPlaces(fetchedPlaces);
      updateMapPlaceMarkers(fetchedPlaces);
    } catch (err) {
      console.error("Explore API Fetch Error:", err);
      setApiError(err.message || "장소 정보를 불러오는데 실패했습니다.");
      updateMapPlaceMarkers([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // 터치/마우스 드래그 이벤트
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

    // snap 포인트 처리
    const maxHeight = window.innerHeight - 80;
    if (sheetHeight > 460) {
      setSheetState("full");
      setSheetHeight(maxHeight);
    } else if (sheetHeight < 150) {
      setSheetState("collapsed");
      setSheetHeight(24);
    } else {
      setSheetState("half");
      setSheetHeight(220);
    }
  }, [isDragging, sheetHeight]);

  // Global mouse move / up handlers for desktop dragging
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

  // 내 위치를 가져와서 지도 이동 및 마커 표시하는 함수
  const moveToMyLocation = useCallback((mapInstance, shouldPan = true) => {
    const targetMap = mapInstance || mapRef.current;
    if (!targetMap || !window.kakao || !window.kakao.maps) return;

    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locPosition = new window.kakao.maps.LatLng(latitude, longitude);

        // 이전 사용자 위치 마커가 있으면 제거
        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        // 인라인 스타일로 카카오맵 커스텀 오버레이 생성
        const content = document.createElement("div");
        content.style.cssText =
          "display: flex; flex-direction: column; align-items: center; user-select: none; pointer-events: none;";
        content.innerHTML = `
          <div style="background-color: #252525; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #34d399; display: inline-block;"></span>
            현위치
          </div>
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #252525; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #6366f1;"></div>
            </div>
          </div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: locPosition,
          content: content,
          xAnchor: 0.5,
          yAnchor: 1.0,
        });

        customOverlay.setMap(targetMap);
        userMarkerRef.current = customOverlay;

        if (shouldPan) {
          targetMap.panTo(locPosition);
          targetMap.setLevel(4);
        }
        setIsLocating(false);
      },
      (error) => {
        console.warn("위치 정보를 가져올 수 없습니다:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY;

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!mapContainer.current) return;
          // 홍대입구역 좌표 기본 설정 (위치 미허용 시 기본값)
          const defaultCenter = new window.kakao.maps.LatLng(37.5563, 126.9227);
          const options = {
            center: defaultCenter,
            level: 4,
          };
          const map = new window.kakao.maps.Map(mapContainer.current, options);
          mapRef.current = map;
          setMapLoaded(true);

          setTimeout(() => {
            map.relayout();
            map.setCenter(defaultCenter);
            
            if (targetPlaceFromState) {
              handleSelectPlace(targetPlaceFromState);
            } else {
              moveToMyLocation(map, true);
              // 초기 접속 시 기본 선택된 '개인' 탭의 마커 및 목록 자동 로드
              handleSelectPrivate();
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
  }, [moveToMyLocation, handleSelectPrivate]);

  return (
    <div className="relative w-full h-full min-h-0 flex-1 overflow-hidden flex flex-col justify-end">
      {/* Map Element */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />

      {/* 현위치 이동 버튼 (주변 장소 시트 높이에 동적으로 위치 변경) */}
      {mapLoaded && (
        <button
          onClick={() => moveToMyLocation(null, true)}
          disabled={isLocating}
          aria-label="현재 위치로 이동"
          style={{ bottom: `${sheetHeight + 16}px` }}
          className="absolute right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-neutral-surface)] text-[var(--color-text-primary)] shadow-lg border border-[var(--color-neutral-border)] active:scale-95 transition-all hover:bg-gray-50 disabled:opacity-50">
          <Navigation
            size={20}
            className={`transition-transform ${
              isLocating
                ? "animate-spin text-indigo-600"
                : "fill-current text-gray-700"
            }`}
          />
        </button>
      )}

      {/* 주변 장소 바텀 시트 */}
      <div
        style={{
          height: `${sheetHeight}px`,
          transition: isDragging
            ? "none"
            : "height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
        className="relative z-10 w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 px-5 pt-1 pb-4 flex flex-col gap-3 overflow-hidden">
        {/* 상단 드래그 핸들 바 영역 (드래그 조작 전용, 클릭 동작 없음) */}
        <div
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleDragStart(e.touches[0].clientY);
            }
          }}
          className="w-full py-2 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none flex-none">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
        </div>

        {/* 바텀시트 콘텐츠 */}
        {sheetHeight > 50 && (
          <>
            {/* 선택된 장소가 있을 때: 장소 상세 정보 뷰 */}
            {selectedPlace ? (
              <div className="flex flex-col h-full overflow-y-auto pr-0.5 text-left gap-3.5 pb-4">
                {/* 상단 닫기 및 장소 헤더 */}
                <div className="flex items-start justify-between flex-none">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        {selectedPlace.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {selectedPlace.address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceDetail(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 백엔드 장소 상세 로딩 / 정보 영역 */}
                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-xs">
                    <Loader2 className="animate-spin" size={18} />
                    <span>상세 정보를 불러오는 중...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-1">
                    {/* 태그 목록 */}
                    {placeDetail?.tags && placeDetail.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {placeDetail.tags.map((tag) => (
                          <span
                            key={tag.tagId || tag.name}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Tag size={12} />
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 카카오 지도 장소 상세 외부 링크 */}
                    {selectedPlace.kakaoPlaceId && (
                      <a
                        href={`https://place.map.kakao.com/${selectedPlace.kakaoPlaceId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between w-full p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-900 text-xs font-bold hover:bg-yellow-100 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>카카오 맵에서 장소 상세 정보 보기</span>
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* 일반 리스트 뷰 */
              <>
                {/* 헤더: 타이틀 & 개수 & 개인/공용 스위처 */}
                <div className="flex items-center justify-between flex-none">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Places</h2>
                    {placeType === "공용" && publicPlaces.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {publicPlaces.length}개
                      </span>
                    )}
                    {placeType === "개인" && privatePlaces.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                        {privatePlaces.length}개
                      </span>
                    )}
                  </div>
                  <div className="flex items-center bg-gray-100 p-1 rounded-full text-xs font-semibold">
                    <button
                      onClick={handleSelectPrivate}
                      className={`px-3 py-1 rounded-full transition-all ${
                        placeType === "개인"
                          ? "bg-black text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      개인
                    </button>
                    <button
                      onClick={handleSelectPublic}
                      className={`px-3 py-1 rounded-full transition-all ${
                        placeType === "공용"
                          ? "bg-black text-white shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      공용
                    </button>
                  </div>
                </div>

                {/* 카테고리 태그 칩스 */}
                {sheetHeight > 110 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-none">
                    {["전체", "카페", "맛집", "개인 장소"].map((category) => {
                      const isSelected = categoryFilter === category;
                      return (
                        <button
                          key={category}
                          onClick={() => setCategoryFilter(category)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                            isSelected
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 장소 카드 리스트 영역 */}
                {sheetHeight > 160 && (
                  <div className="flex flex-col gap-3 overflow-y-auto pr-0.5 flex-1 pb-4">
                    {isLoadingPlaces ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                        <Loader2 className="animate-spin text-gray-600" size={24} />
                        <span className="text-xs font-medium">장소를 불러오는 중...</span>
                      </div>
                    ) : apiError ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 bg-red-50 rounded-2xl border border-red-100 text-center gap-1.5">
                        <span className="text-xs font-bold text-red-600">서버 통신 에러</span>
                        <span className="text-xs text-red-500">{apiError}</span>
                      </div>
                    ) : placeType === "공용" ? (
                      publicPlaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-xs">
                          추천 장소가 없습니다.
                        </div>
                      ) : (
                        publicPlaces.map((place) => (
                          <div
                            key={place.placeId || place.kakaoPlaceId}
                            onClick={() => handleSelectPlace(place)}
                            className="flex items-start justify-between p-3.5 rounded-2xl border border-gray-200 bg-white shadow-2xs hover:border-gray-300 transition-all flex-none text-left cursor-pointer active:scale-98"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 flex-none mt-0.5">
                                <MapPin size={20} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                                  {place.name}
                                </h4>
                                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                                  {place.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      /* '개인' 탭 선택 시 privatePlaces API 데이터 출력 */
                      privatePlaces.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-xs gap-1">
                          <span>등록된 개인 장소가 없습니다.</span>
                          <span className="text-[11px] text-gray-400">+ 탭에서 새로운 개인 장소를 추가해보세요!</span>
                        </div>
                      ) : (
                        privatePlaces.map((place) => (
                          <div
                            key={place.placeId || place.id}
                            onClick={() => handleSelectPlace(place)}
                            className="flex items-start justify-between p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/30 hover:border-indigo-200 transition-all flex-none text-left cursor-pointer active:scale-98"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-none mt-0.5">
                                <MapPin size={20} />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                                  {place.name}
                                </h4>
                                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                                  {place.address}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 로딩 & 에러 메세지 */}
      {!mapLoaded && !errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-neutral-background)] text-[var(--color-text-secondary)] text-sm font-medium z-30">
          지도를 불러오는 중입니다...
        </div>
      )}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-neutral-background)] text-red-500 text-sm font-medium p-4 text-center z-30">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

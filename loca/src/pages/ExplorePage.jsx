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
  const [categoryFilter, setCategoryFilter] = useState("전체");

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

  const updateMapPlaceMarkers = useCallback((places) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

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
        <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #111; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #fff;"></div>
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
      setTimeout(() => {
        if (mapRef.current && mapRef.current.getLevel() < 4) {
          mapRef.current.setLevel(4);
        }
      }, 50);
    }
  }, [handleSelectPlace]);

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

        if (userMarkerRef.current) {
          userMarkerRef.current.setMap(null);
        }

        const content = document.createElement("div");
        content.style.cssText =
          "display: flex; flex-direction: column; align-items: center; user-select: none; pointer-events: none;";
        content.innerHTML = `
          <div style="background-color: #fff; color: #111; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1px solid #f0f0f0; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background-color: #3b82f6; display: inline-block;"></span>
            현위치
          </div>
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #3b82f6; border: 2.5px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
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

            moveToMyLocation(map, !targetPlaceFromState);

            if (targetPlaceFromState) {
              handleSelectPlace(targetPlaceFromState);
            } else {
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
  }, [moveToMyLocation, handleSelectPrivate, targetPlaceFromState]);

  return (
    <div className="relative w-full h-full min-h-0 flex-1 overflow-hidden flex flex-col justify-end">
      {/* Map Element */}
      <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0 bg-gray-100" />

      {/* 현위치 이동 버튼 */}
      {mapLoaded && (
        <button
          onClick={() => moveToMyLocation(null, true)}
          disabled={isLocating}
          aria-label="현재 위치로 이동"
          style={{ bottom: `${sheetHeight + 16}px` }}
          className="absolute right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-100 transition-all hover:bg-gray-50 disabled:opacity-50">
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
              <div className="flex flex-col h-full overflow-y-auto pr-1 pb-4 text-left">
                <div className="flex items-start justify-between flex-none mb-4">
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-[#111]">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedPlace.address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlace(null);
                      setPlaceDetail(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    상세 정보를 불러오는 중...
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {placeDetail?.tags && placeDetail.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {placeDetail.tags.map((tag) => (
                          <span
                            key={tag.tagId || tag.name}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs flex items-center gap-1"
                          >
                            <Tag size={12} />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {selectedPlace.kakaoPlaceId && (
                      <a
                        href={`https://place.map.kakao.com/${selectedPlace.kakaoPlaceId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-3 rounded-xl bg-yellow-50 text-yellow-800 text-sm font-bold mt-2"
                      >
                        카카오맵에서 보기
                        <ExternalLink size={16} className="ml-1.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between flex-none mb-4">
                  <h2 className="text-base font-bold text-[#111]">Explore</h2>
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
                    <button
                      onClick={handleSelectPrivate}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        placeType === "개인"
                          ? "bg-white text-[#111] font-semibold shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      개인
                    </button>
                    <button
                      onClick={handleSelectPublic}
                      className={`px-3 py-1 rounded-md text-sm transition-all ${
                        placeType === "공용"
                          ? "bg-white text-[#111] font-semibold shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      공용
                    </button>
                  </div>
                </div>

                {sheetHeight > 110 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 flex-none">
                    {["전체", "카페", "맛집", "개인 장소"].map((category) => {
                      const isSelected = categoryFilter === category;
                      return (
                        <button
                          key={category}
                          onClick={() => setCategoryFilter(category)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
                            isSelected
                              ? "bg-[#111] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
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
                    ) : (placeType === "공용" ? publicPlaces : privatePlaces).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-sm">
                        장소가 없습니다.
                      </div>
                    ) : (
                      (placeType === "공용" ? publicPlaces : privatePlaces).map((place) => (
                        <div
                          key={place.placeId || place.kakaoPlaceId || place.id}
                          onClick={() => handleSelectPlace(place)}
                          className="flex items-start p-3.5 rounded-xl border border-gray-100 bg-white cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 flex-none mr-3">
                            <MapPin size={16} />
                          </div>
                          <div className="flex flex-col text-left">
                            <h4 className="text-sm font-bold text-[#111]">
                              {place.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {place.address}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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

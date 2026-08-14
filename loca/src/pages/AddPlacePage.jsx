import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Check, Lock, Globe, Navigation, AlertTriangle, Loader2 } from "lucide-react";
import { createCustomPlace } from "../services/placeService";

export default function AddPlacePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Form states
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [searchPlaces, setSearchPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [visibility, setVisibility] = useState("PRIVATE");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // 이탈 재확인 모달 상태 및 이동하려던 대상 경로
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const targetPathRef = useRef(null);

  // 입력값 작성 유무 체크
  const isDirty = placeName.trim().length > 0 || address.trim().length > 0 || selectedPlace !== null;

  // 브라우저 새로고침 / 탭 닫기 억제
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 브라우저 뒤로가기(popstate) 발생 시 커스텀 팝업으로 차단
  useEffect(() => {
    if (!isDirty) return;

    // 현재 상태를 히스토리에 한 번 더 밀어넣어 뒤로가기 시 이 페이지에 유지
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setShowExitConfirm(true);
      targetPathRef.current = -1; // 뒤로가기 요청
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  // 하단 바나 다른 링크 클릭 시 intercept용 윈도우 커스텀 이벤트
  useEffect(() => {
    const handleNavigationIntercept = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.stopPropagation();
        targetPathRef.current = e.detail?.to;
        setShowExitConfirm(true);
      }
    };

    window.addEventListener("loca-navigation-intercept", handleNavigationIntercept);
    return () => window.removeEventListener("loca-navigation-intercept", handleNavigationIntercept);
  }, [isDirty]);

  // 팝업에서 "나가기" 최종 승인
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    // isDirty 해제 후 요청되었던 경로로 이동
    setPlaceName("");
    setAddress("");
    setSelectedPlace(null);

    setTimeout(() => {
      if (targetPathRef.current === -1) {
        navigate(-1);
      } else if (targetPathRef.current) {
        navigate(targetPathRef.current);
      } else {
        navigate("/explore");
      }
    }, 50);
  };

  // 팝업에서 "계속 작성하기" 취소
  const handleCancelExit = () => {
    setShowExitConfirm(false);
    targetPathRef.current = null;
  };

  // 내 위치를 가져와서 지도 이동 및 내 위치 마커 핀 표시하는 함수
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
          <div style="background-color: #252525; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 4px; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap;">
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
        }
        setIsLocating(false);
      },
      (error) => {
        console.warn("위치 정보를 가져올 수 없습니다:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // 지도 터치(클릭) 시 주소 자동 추출
  const handleMapClick = useCallback(
    (mouseEvent) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;

      const latLng = mouseEvent.latLng;
      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(latLng.getLng(), latLng.getLat(), (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addressObj = result[0];
          const roadAddr = addressObj.road_address
            ? addressObj.road_address.address_name
            : addressObj.address.address_name;
          const mainName = addressObj.road_address?.building_name || roadAddr;

          const newPlace = {
            id: `custom-${Date.now()}`,
            place_name: mainName,
            road_address_name: roadAddr,
            address_name: addressObj.address.address_name,
            x: latLng.getLng().toString(),
            y: latLng.getLat().toString(),
          };

          setSelectedPlace(newPlace);
          setAddress(roadAddr);
          if (!placeName.trim()) {
            setPlaceName(mainName);
          }

          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          const marker = new window.kakao.maps.Marker({
            position: latLng,
          });
          marker.setMap(mapRef.current);
          markerRef.current = marker;
        }
      });
    },
    [placeName]
  );

  // 카카오맵 초기화
  useEffect(() => {
    const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY;

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!mapContainer.current) return;
          const defaultCenter = new window.kakao.maps.LatLng(37.5563, 126.9227);
          const options = {
            center: defaultCenter,
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer.current, options);
          mapRef.current = map;
          setIsMapLoaded(true);

          window.kakao.maps.event.addListener(map, "click", handleMapClick);

          setTimeout(() => {
            map.relayout();
            map.setCenter(defaultCenter);
            moveToMyLocation(map, true);
          }, 100);
        });
      }
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [handleMapClick, moveToMyLocation]);

  // 키워드 기반 주소/장소 검색 실행
  const handleSearch = (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(address, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchPlaces(data);
        } else {
          setSearchPlaces([]);
        }
      });
    }
  };

  // 검색결과 항목 선택 처리
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setSearchPlaces([]);
    const fullAddress = place.road_address_name || place.address_name;
    setAddress(fullAddress);
    if (!placeName.trim()) {
      setPlaceName(place.place_name);
    }

    if (mapRef.current && window.kakao && window.kakao.maps) {
      const moveLatLng = new window.kakao.maps.LatLng(place.y, place.x);
      mapRef.current.panTo(moveLatLng);

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      const marker = new window.kakao.maps.Marker({
        position: moveLatLng,
      });
      marker.setMap(mapRef.current);
      markerRef.current = marker;
    }
  };

  // 장소 추가하기 버튼 활성화 조건
  const isFormValid = placeName.trim().length > 0 && (selectedPlace || address.trim().length > 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 장소 등록 처리 (POST /api/places/custom 실서버 API 연동)
  const handleAddPlaceSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // 좌표값 추출 (selectedPlace x,y 또는 카카오 지도 마커 중심점 좌표)
    let lat = selectedPlace?.y ? parseFloat(selectedPlace.y) : null;
    let lng = selectedPlace?.x ? parseFloat(selectedPlace.x) : null;

    if (!lat || !lng) {
      if (mapRef.current && window.kakao && window.kakao.maps) {
        const center = mapRef.current.getCenter();
        lat = center.getLat();
        lng = center.getLng();
      } else {
        lat = 37.5563;
        lng = 126.9227;
      }
    }

    try {
      // POST /api/places/custom 호출 (isShareable: 전체공개 true / 나만보기 false)
      await createCustomPlace({
        name: placeName.trim(),
        address: address.trim() || selectedPlace?.address_name || selectedPlace?.road_address_name || "",
        lat: lat,
        lng: lng,
        isShareable: visibility === "PUBLIC",
      });

      alert(`[${placeName}] 장소가 정상적으로 등록되었습니다.`);
      setPlaceName("");
      setAddress("");
      setSelectedPlace(null);

      setTimeout(() => {
        navigate("/explore");
      }, 100);
    } catch (err) {
      console.error("Custom Place Add Error:", err);
      // 규칙 1: 실서버 에러 정직하게 표시 (Mock fallback 금지)
      setSubmitError(err.message || "장소 등록 중 에러가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-neutral-background)] px-5 py-4 space-y-4 overflow-y-auto relative">
      {/* Title */}
      <h1 className="text-xl font-bold text-[var(--color-text-primary)]">새 장소 추가</h1>

      {/* 공개 설정 탭 (나만 보기 / 전체 공개) */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">공개 설정</label>
        <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setVisibility("PRIVATE")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              visibility === "PRIVATE"
                ? "bg-white text-[var(--color-brand-primary)] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock size={14} />
            나만 보기
          </button>
          <button
            type="button"
            onClick={() => setVisibility("PUBLIC")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              visibility === "PUBLIC"
                ? "bg-white text-[var(--color-brand-primary)] shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Globe size={14} />
            전체 공개
          </button>
        </div>
      </div>

      {/* 1. 장소 이름 입력 박스 */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">장소 이름</label>
        <input
          type="text"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          placeholder="나만의 장소 이름을 입력하세요 (예: 홍대 최애 카페)"
          className="w-full px-3.5 py-3 rounded-xl border border-[var(--color-neutral-border)] bg-white text-sm focus:outline-hidden focus:border-[var(--color-brand-primary)] transition-colors"
        />
      </div>

      {/* 2. 주소 입력 & 검색 박스 */}
      <div className="flex flex-col space-y-1.5 relative">
        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">주소</label>
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소를 검색하거나 아래 지도에서 터치하세요"
            className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-[var(--color-neutral-border)] bg-white text-sm focus:outline-hidden focus:border-[var(--color-brand-primary)] transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 text-gray-400 hover:text-[var(--color-brand-primary)] p-1"
          >
            <Search size={18} />
          </button>
        </form>

        {/* 연관 주소/장소 검색 결과 드롭다운 */}
        {searchPlaces.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-52 overflow-y-auto divide-y divide-gray-100">
            {searchPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-2.5 transition-colors"
              >
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-none" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">{place.place_name}</span>
                  <span className="text-[11px] text-gray-500 truncate">
                    {place.road_address_name || place.address_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 위치 미리보기 카드 */}
      {selectedPlace && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-none">
              <Check size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">{placeName || selectedPlace.place_name}</span>
              <span className="text-[11px] text-gray-600">
                {selectedPlace.road_address_name || selectedPlace.address_name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 지도 영역 + 현위치 버튼 */}
      <div className="flex flex-col space-y-1.5 flex-1 min-h-[220px] relative">
        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">지도 위치 확인 (터치 가능)</label>
        <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-[var(--color-neutral-border)] shadow-xs">
          <div ref={mapContainer} className="w-full h-full absolute inset-0" />

          {/* 지도 내부 우측 하단 현위치(GPS) 버튼 */}
          {isMapLoaded && (
            <button
              type="button"
              onClick={() => moveToMyLocation(null, true)}
              disabled={isLocating}
              aria-label="현재 위치로 이동"
              className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md border border-gray-200 active:scale-95 transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              <Navigation
                size={18}
                className={`transition-transform ${
                  isLocating ? "animate-spin text-indigo-600" : "fill-current text-gray-700"
                }`}
              />
            </button>
          )}

          {!isMapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              지도를 로딩 중입니다...
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {submitError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 text-left">
          {submitError}
        </div>
      )}

      {/* 장소 추가하기 버튼 */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!isFormValid || isSubmitting}
          onClick={handleAddPlaceSubmit}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 ${
            isFormValid && !isSubmitting
              ? "bg-[var(--color-brand-primary)] text-white hover:bg-black active:scale-[0.98] cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>장소 등록 중...</span>
            </>
          ) : (
            <span>장소 추가하기</span>
          )}
        </button>
      </div>

      {/* 페이지 이탈 재확인 모달 팝업 */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl p-5 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-base font-bold text-gray-900">작성을 취소하고 나가시겠습니까?</h3>
              <p className="text-xs text-gray-500">
                작성 중인 내용은 저장되지 않고 삭제됩니다.
              </p>
            </div>
            <div className="flex w-full gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelExit}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                계속 작성하기
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { loadKakaoMapSdk } from "@/src/lib/kakaoMap";

export function KakaoMap({ places = [], selectedPlace, onSelectPlace, onMapClick }) {
  const mapRef = useRef(null);
  const kakaoInstanceRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [loadError, setLoadError] = useState("");
  const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY || import.meta.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  // 1. SDK 로드 및 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !appKey) return undefined;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current) return;
        kakaoInstanceRef.current = kakao;

        if (!mapInstanceRef.current) {
          const initialCenterPlace = selectedPlace ?? places[0];
          const center = new kakao.maps.LatLng(
            initialCenterPlace?.lat ?? 37.5563,
            initialCenterPlace?.lng ?? 126.9236
          );
          const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });
          mapInstanceRef.current = map;

          kakao.maps.event.addListener(map, "click", (mouseEvent) => {
            const latLng = mouseEvent.latLng;
            onMapClick?.({
              lat: Number(latLng.getLat().toFixed(6)),
              lng: Number(latLng.getLng().toFixed(6)),
            });
          });
        }
        setLoadError("");
      })
      .catch((err) => {
        console.error("Kakao Map SDK Load Error:", err);
        setLoadError(err?.message || "지도를 불러오지 못했어요. 잠시 후 다시 확인해주세요.");
      });

    return () => {
      cancelled = true;
    };
  }, [appKey, onMapClick]);

  // 2. 마커 생성 및 업데이트
  useEffect(() => {
    const kakao = kakaoInstanceRef.current;
    const map = mapInstanceRef.current;

    if (!kakao || !map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      const position = new kakao.maps.LatLng(place.lat, place.lng);
      const marker = new kakao.maps.Marker({
        map,
        position,
        title: place.name,
      });

      kakao.maps.event.addListener(marker, "click", () => {
        onSelectPlace?.(place);
        map.panTo(position);
      });

      markersRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  // 3. 선택된 장소로 지도 이동
  useEffect(() => {
    const kakao = kakaoInstanceRef.current;
    const map = mapInstanceRef.current;

    if (!kakao || !map || !selectedPlace?.lat || !selectedPlace?.lng) return;

    const moveLatLng = new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    map.panTo(moveLatLng);
  }, [selectedPlace]);

    if (!appKey || loadError) {
    // Normalize coordinates for the fallback map
    const validPlaces = places.filter(p => p.lat && p.lng);
    let minLat = 37.4;
    let maxLat = 37.7;
    let minLng = 126.8;
    let maxLng = 127.2;
    
    if (validPlaces.length > 0) {
      minLat = Math.min(...validPlaces.map(p => p.lat));
      maxLat = Math.max(...validPlaces.map(p => p.lat));
      minLng = Math.min(...validPlaces.map(p => p.lng));
      maxLng = Math.max(...validPlaces.map(p => p.lng));
      
      // Add padding
      const latPad = (maxLat - minLat) * 0.1 || 0.01;
      const lngPad = (maxLng - minLng) * 0.1 || 0.01;
      minLat -= latPad; maxLat += latPad;
      minLng -= lngPad; maxLng += lngPad;
    }

    return (
      <div
        style={{ position: "relative", width: "100%", height: "100%", minHeight: 200, background: "#e8e8e8", cursor: "crosshair", overflow: "hidden" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          // Reverse normalization to get lat/lng
          const lat = Number((maxLat - (y * (maxLat - minLat))).toFixed(6));
          const lng = Number((minLng + (x * (maxLng - minLng))).toFixed(6));
          onMapClick?.({ lat, lng });
        }}
      >
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[8%] top-[18%] h-24 w-44 rounded-lg bg-zinc-200" />
          <div className="absolute right-[12%] top-[12%] h-32 w-52 rounded-lg bg-zinc-200" />
          <div className="absolute bottom-[16%] left-[22%] h-40 w-56 rounded-lg bg-zinc-200" />
          <div className="absolute bottom-[10%] right-[18%] h-28 w-44 rounded-lg bg-zinc-200" />
        </div>
        {places.map((place, index) => {
          const left = place.lng ? ((place.lng - minLng) / (maxLng - minLng)) * 100 : (18 + (index % 3) * 24);
          const top = place.lat ? ((maxLat - place.lat) / (maxLat - minLat)) * 100 : (22 + Math.floor(index / 3) * 28);
          
          return (
            <button
              key={place.id}
              onClick={(evt) => {
                evt.stopPropagation();
                onSelectPlace?.(place);
              }}
              style={{
                position: "absolute",
                left: `${Math.max(2, Math.min(95, left))}%`,
                top: `${Math.max(2, Math.min(95, top))}%`,
                transform: "translate(-50%, -50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: selectedPlace?.id === place.id ? "#000" : "#fff",
                color: selectedPlace?.id === place.id ? "#fff" : "#000",
                fontSize: 10,
                fontWeight: "bold",
                border: "1px solid #ccc",
                zIndex: selectedPlace?.id === place.id ? 10 : 1
              }}
            >
              {index + 1}
            </button>
          );
        })}
        <div style={{ position: "absolute", bottom: 12, left: 12, background: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: "bold" }}>
          💡 지도를 클릭하면 위치가 선택됩니다.
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 200, background: "#e8e8e8" }} />;
}


import { useEffect, useRef, useState } from "react";
import { loadKakaoMapSdk } from "@/src/lib/kakaoMap";

const FALLBACK_CENTER = {
  lat: 37.5563,
  lng: 126.9236,
};

function calculateFallbackPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  return {
    lat: Number((37.565 - y * 0.02).toFixed(6)),
    lng: Number((126.915 + x * 0.02).toFixed(6)),
  };
}

export function KakaoMap({
  places = [],
  selectedPlace,
  onSelectPlace,
  onMapClick,
  className = "",
  fallbackHint = "지도를 클릭하면 위도와 경도가 자동으로 선택됩니다.",
}) {
  const mapRef = useRef(null);
  const kakaoInstanceRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [loadError, setLoadError] = useState("");

  const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!mapRef.current || !appKey) return undefined;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current) return;

        kakaoInstanceRef.current = kakao;

        if (!mapInstanceRef.current) {
          const initialCenterPlace = selectedPlace ?? places[0] ?? FALLBACK_CENTER;
          const center = new kakao.maps.LatLng(initialCenterPlace.lat, initialCenterPlace.lng);
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
      .catch((error) => {
        console.error("Kakao Map SDK Load Error:", error);
        setLoadError(error?.message || "지도를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.");
      });

    return () => {
      cancelled = true;
    };
  }, [appKey, onMapClick, places, selectedPlace]);

  useEffect(() => {
    const kakao = kakaoInstanceRef.current;
    const map = mapInstanceRef.current;

    if (!kakao || !map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

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

  useEffect(() => {
    const kakao = kakaoInstanceRef.current;
    const map = mapInstanceRef.current;

    if (!kakao || !map || !selectedPlace?.lat || !selectedPlace?.lng) return;

    map.panTo(new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng));
  }, [selectedPlace]);

  if (!appKey || loadError) {
    return (
      <div
        className={`relative h-full min-h-[560px] overflow-hidden rounded-2xl bg-zinc-100 ${
          onMapClick ? "cursor-crosshair" : "cursor-grab"
        } ${className}`}
        onClick={(event) => {
          if (!onMapClick) return;
          onMapClick(calculateFallbackPosition(event));
        }}
      >
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[8%] top-[18%] h-24 w-44 rounded-lg bg-zinc-200" />
          <div className="absolute right-[12%] top-[12%] h-32 w-52 rounded-lg bg-zinc-200" />
          <div className="absolute bottom-[16%] left-[22%] h-40 w-56 rounded-lg bg-zinc-200" />
          <div className="absolute bottom-[10%] right-[18%] h-28 w-44 rounded-lg bg-zinc-200" />
        </div>

        {places.slice(0, 6).map((place, index) => (
          <button
            aria-label={`${place.name} 선택`}
            className={`absolute flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shadow-sm ${
              selectedPlace?.id === place.id ? "ui-dark" : "bg-white text-black"
            }`}
            key={place.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelectPlace?.(place);
            }}
            style={{ left: `${18 + (index % 3) * 24}%`, top: `${22 + Math.floor(index / 3) * 28}%` }}
            type="button"
          >
            {index + 1}
          </button>
        ))}

        <div className="absolute bottom-5 left-5 max-w-[90%] rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-600 shadow-sm">
          {fallbackHint}
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={`h-full min-h-[560px] overflow-hidden rounded-2xl bg-zinc-100 ${className}`} />;
}

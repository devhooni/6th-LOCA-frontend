import { useEffect, useRef, useState } from "react";
import { loadKakaoMapSdk } from "@/src/lib/kakaoMap";

export function KakaoMap({ places, selectedPlace, onSelectPlace }) {
  const mapRef = useRef(null);
  const [loadError, setLoadError] = useState("");
  const appKey = import.meta.env.VITE_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!mapRef.current || !appKey) return undefined;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current) return;

        const centerPlace = selectedPlace ?? places[0];
        const center = new kakao.maps.LatLng(centerPlace?.lat ?? 37.5563, centerPlace?.lng ?? 126.9236);
        const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });

        places.forEach((place) => {
          const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(place.lat, place.lng),
            title: place.name,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            onSelectPlace?.(place);
            map.setCenter(new kakao.maps.LatLng(place.lat, place.lng));
          });
        });
      })
      .catch(() => {
        setLoadError("지도를 불러오지 못했어요. 잠시 후 다시 확인해주세요.");
      });

    return () => {
      cancelled = true;
    };
  }, [appKey, onSelectPlace, places, selectedPlace]);

  if (!appKey || loadError) {
    return (
      <div className="relative h-full min-h-[560px] overflow-hidden rounded-2xl bg-zinc-100">
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
              selectedPlace?.id === place.id ? "bg-black text-white" : "bg-white text-black"
            }`}
            key={place.id}
            onClick={() => onSelectPlace?.(place)}
            style={{ left: `${18 + (index % 3) * 24}%`, top: `${22 + Math.floor(index / 3) * 28}%` }}
            type="button"
          >
            {index + 1}
          </button>
        ))}
        <div className="absolute bottom-5 left-5 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-600 shadow-sm">
          {loadError || "Kakao Map 키가 없어서 와이어프레임 지도로 표시 중입니다."}
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-full min-h-[560px] overflow-hidden rounded-2xl bg-zinc-100" />;
}

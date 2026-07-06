"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/src/types/place";
import { getDefaultSelectedPlace, loadKakaoMapSdk } from "@/src/lib/kakaoMap";
import { MapBottomSheet } from "./MapBottomSheet";

type KakaoMapProps = {
  places: Place[];
};

export function KakaoMap({ places }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(getDefaultSelectedPlace(places));
  const [loadError, setLoadError] = useState("");
  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const message = appKey ? loadError : "카카오맵 API 키가 필요합니다. NEXT_PUBLIC_KAKAO_MAP_KEY를 설정해주세요.";

  useEffect(() => {
    if (!mapRef.current) return;
    if (!appKey) return;

    let cancelled = false;

    loadKakaoMapSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current) return;

        const center = new kakao.maps.LatLng(37.5563, 126.9236);
        const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });

        places.forEach((place) => {
          const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(place.lat, place.lng),
            title: place.name,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            setSelectedPlace(place);
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
  }, [appKey, places]);

  return (
    <div className="relative h-[calc(100dvh-92px)] overflow-hidden bg-zinc-100 md:h-[calc(100dvh-56px)]">
      <div ref={mapRef} className="h-full w-full" />
      {message ? (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div className="rounded-2xl bg-white p-5 text-sm font-semibold leading-6 text-[var(--text-secondary)] shadow-lg">{message}</div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(24,24,27,0.08)_25%,transparent_25%),linear-gradient(225deg,rgba(24,24,27,0.08)_25%,transparent_25%)] bg-[length:34px_34px] opacity-30" />
      )}
      {selectedPlace ? <MapBottomSheet place={selectedPlace} /> : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { getPlaces } from "@/src/services/placeService";

const tabs = ["전체", "저장", "카페"];

export default function MapPage() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data);
      setSelectedPlace(data[0] ?? null);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <section>
        <h1 className="text-4xl font-black">지도</h1>
        <p className="mt-3 text-base font-semibold text-zinc-500">
          내 주변의 장소를 지도에서 확인해 보세요.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="wire-panel flex min-h-[560px] flex-col p-5">
          <label className="flex h-12 items-center gap-3 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-zinc-500" htmlFor="map-search">
            <Icon className="h-5 w-5" name="search" />
            <input className="min-w-0 flex-1 outline-none placeholder:text-zinc-400" id="map-search" placeholder="지역 또는 장소 검색" />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab, index) => (
              <TagChip active={index === 0} key={tab}>
                {tab}
              </TagChip>
            ))}
          </div>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <div className="h-24 animate-pulse rounded-lg bg-zinc-100" key={index} />)
              : places.slice(0, 6).map((place) => (
                  <button
                    className={`flex w-full gap-3 rounded-lg border p-3 text-left interactive ${
                      selectedPlace?.id === place.id ? "border-black bg-zinc-50" : "border-[var(--border)] bg-white"
                    }`}
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    type="button"
                  >
                    <img alt="" className="h-16 w-16 rounded-lg object-cover" src={place.imageUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black">{place.name}</span>
                      <span className="mt-1 block text-xs font-semibold text-zinc-500">{place.categoryLabel} · {place.distance}</span>
                      <span className="mt-2 block text-xs text-zinc-400">{place.tags.slice(0, 2).join(" · ")}</span>
                    </span>
                  </button>
                ))}
          </div>

          {selectedPlace ? (
            <Link className="mt-4 flex h-11 items-center justify-center rounded-lg bg-black text-sm font-bold text-white" to={`/place/${selectedPlace.id}`}>
              장소 상세 보기
            </Link>
          ) : null}
        </aside>

        <KakaoMap places={places} selectedPlace={selectedPlace} onSelectPlace={setSelectedPlace} />
      </div>
    </AppShell>
  );
}

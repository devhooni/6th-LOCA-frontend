import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces } from "@/src/services/placeService";

const primaryTabs = ["추천", "인기", "신규", "컬렉션"];
const categoryTabs = ["전체", "카페", "맛집", "문화", "자연", "쇼핑"];

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">Explore</h1>
          <p className="mt-3 text-base font-semibold text-zinc-500">
            취향에 맞는 장소와 컬렉션을 둘러보세요.
          </p>
        </div>
        <Link className="inline-flex h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold interactive" to="/map">
          <Icon className="h-4 w-4" name="sliders" />
          지도에서 보기
        </Link>
      </section>

      <div className="mt-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          {primaryTabs.map((item, index) => (
            <TagChip active={index === 0} key={item}>
              {item}
            </TagChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((item, index) => (
            <TagChip active={index === 0} key={item}>
              {item}
            </TagChip>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="h-64 animate-pulse rounded-lg bg-zinc-100" key={index} />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {places.slice(0, 6).map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>

        <aside className="wire-panel p-6">
          <h2 className="text-lg font-black">이번 주 인기</h2>
          <ol className="mt-5 space-y-5">
            {places.slice(0, 5).map((place, index) => (
              <li className="flex gap-4" key={place.id}>
                <span className="w-8 text-lg font-black text-zinc-300">{String(index + 1).padStart(2, "0")}</span>
                <Link className="min-w-0 flex-1 hover:underline" to={`/place/${place.id}`}>
                  <p className="truncate text-sm font-black">{place.name}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{place.categoryLabel} · {place.distance}</p>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </AppShell>
  );
}

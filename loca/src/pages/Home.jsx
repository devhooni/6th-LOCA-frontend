import { Link } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";

const moods = ["조용한", "새로운", "자연", "맛있는", "예술적인"];

export default function HomePage() {
  const places = mockPlaces.slice(0, 4);

  return (
    <AppShell>
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black leading-tight lg:text-5xl">
            안녕하세요, 민지님
          </h1>
          <p className="mt-4 text-lg font-semibold text-zinc-500">
            오늘도 새로운 장소를 발견해 보세요.
          </p>
        </div>
        <Link className="inline-flex h-12 items-center justify-center rounded-lg bg-black px-6 text-sm font-bold text-white" to="/explore">
          주변 장소 탐색
        </Link>
      </section>

      <Link className="mt-10 flex h-14 items-center gap-3 rounded-lg border border-[var(--border)] px-5 text-zinc-500 interactive" to="/explore">
        <Icon className="h-5 w-5" name="search" />
        <span className="text-sm font-semibold">어디로 떠나볼까요?</span>
      </Link>

      <section className="mt-10">
        <h2 className="text-xl font-black">오늘의 기분</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {moods.map((mood, index) => (
            <TagChip active={index === 0} key={mood}>
              {mood}
            </TagChip>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">LOCA 추천</h2>
          <Link className="text-sm font-bold text-zinc-500 hover:text-black" to="/explore">
            전체보기 →
          </Link>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place) => (
            <Link className="wire-card interactive overflow-hidden" key={place.id} to={`/place/${place.id}`}>
              <img alt="" className="h-40 w-full object-cover" src={place.imageUrl} />
              <div className="p-4">
                <h3 className="font-black">{place.name}</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{place.categoryLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

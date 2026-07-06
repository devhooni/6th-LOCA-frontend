import Link from "next/link";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";

const situations = [
  { label: "혼자 쉬기", href: "/for-you", description: "조용한 자리와 산책 포인트" },
  { label: "가볍게 걷기", href: "/map", description: "현재 주변의 로컬 스팟" },
  { label: "숨은 장소 기록", href: "/place/new", description: "지도에 없는 나만의 장소" },
  { label: "코스로 묶기", href: "/collections", description: "장소를 컬렉션으로 공유" },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="w-full md:pl-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand)] md:hidden">LOCA</h1>
            <p className="hidden text-sm font-bold text-[var(--brand)] md:block">홍대 로컬 탐험 플랫폼</p>
          </div>
          <button aria-label="알림" className="rounded-full p-2 text-zinc-500" type="button">
            <Icon name="bell" />
          </button>
        </header>

        <section className="mt-12 grid gap-8 md:mt-8 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
          <div className="relative overflow-hidden rounded-b-[28px] pb-10 md:rounded-[28px] md:bg-white md:p-10 md:shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
            <TagChip compact>오늘의 질문</TagChip>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--text)] md:text-5xl md:leading-tight">
              오늘은
              <br />
              어떤 동네의 기억을
              <br />
              남겨볼까요?
            </h2>
            <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500 md:text-base md:leading-7">
              장소를 찾는 데서 끝나지 않고, 나만의 순간과 코스로 남겨보세요.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {situations.map((item) => (
                <Link className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 transition hover:bg-zinc-50 md:bg-zinc-50" href={item.href} key={item.label}>
                  <p className="font-extrabold">{item.label}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-rows-2">
            <Link className="block rounded-2xl bg-[#1e1e1e] p-5 text-white shadow-[0_14px_34px_rgba(24,24,27,0.18)] md:p-7" href="/for-you">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white md:text-2xl">ForYou</h3>
                  <p className="mt-4 text-sm font-medium leading-6 text-white/80 md:text-base">
                    내 기록으로 열리는
                    <br />
                    개인 맞춤 장소 추천
                  </p>
                </div>
                <Icon className="h-6 w-6 text-white/80 md:h-7 md:w-7" name="heart" />
              </div>
              <span className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)]">
                <Icon className="h-4 w-4" name="chevron" />
              </span>
            </Link>

            <Link className="block rounded-2xl bg-zinc-100 p-5 text-[var(--text)] md:p-7" href="/explore">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--brand)] md:text-2xl">Explore</h3>
                  <p className="mt-4 text-sm font-semibold leading-6 text-zinc-500 md:text-base">
                    Public Place와
                    <br />
                    Private Place 둘러보기
                  </p>
                </div>
                <Icon className="h-6 w-6 text-[var(--brand)] md:h-7 md:w-7" name="bookmark" />
              </div>
              <span className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                <Icon className="h-4 w-4" name="chevron" />
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <Link className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.08)]" href="/place/new">
            <p className="text-lg font-extrabold">Private Place 등록</p>
            <p className="mt-2 text-sm font-semibold text-zinc-500">지도에 없는 벤치, 포토 스팟, 산책길을 남겨보세요.</p>
          </Link>
          <Link className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.08)]" href="/collections">
            <p className="text-lg font-extrabold">장소 컬렉션</p>
            <p className="mt-2 text-sm font-semibold text-zinc-500">장소들을 코스로 묶고 링크로 공유하세요.</p>
          </Link>
        </section>

        <section className="hidden md:mt-8 md:block">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">요즘 눈에 띄는 장소</h2>
            <Link className="text-sm font-bold text-[var(--brand)]" href="/explore">
              전체보기
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {mockPlaces.slice(0, 3).map((place) => (
              <Link className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(0,0,0,0.06)]" href={`/place/${place.id}`} key={place.id}>
                <img alt="" className="h-28 w-full object-cover" src={place.imageUrl} />
                <div className="p-4">
                  <p className="font-extrabold">{place.name}</p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{place.categoryLabel} · {place.distance}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

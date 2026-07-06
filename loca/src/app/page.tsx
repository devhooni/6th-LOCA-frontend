import Link from "next/link";
import { Icon } from "@/src/components/common/Icon";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";

export default function HomePage() {
  return (
    <AppShell>
      <div className="w-full md:pl-8"></div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand)] md:hidden">
            LOCA
          </h1>
          <p className="hidden text-sm font-bold text-[var(--brand)] md:block">
            홍대 로컬 탐험 플랫폼
          </p>
        </div>
        <button
          aria-label="알림"
          className="rounded-full p-2 text-zinc-500"
          type="button">
          <Icon name="bell" />
        </button>
      </header>

      <section className="mt-12 grid gap-8 md:mt-8 md:grid-cols-[1.05fr_0.95fr] md:items-stretch">
        <div className="relative overflow-hidden rounded-b-[28px] pb-24 md:rounded-[28px] md:bg-white md:p-10 md:pb-10 md:shadow-[0_16px_50px_rgba(0,0,0,0.06)]">
          <h2 className="text-3xl font-extrabold leading-tight text-[var(--text)] md:text-5xl md:leading-tight">
            오늘은
            <br />
            어떤 동네를
            <br />
            탐험할까요?
          </h2>
          <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500 md:text-base md:leading-7">
            나만의 취향으로 홍대를 즐겨보세요.
            <br />
            기록이 쌓일수록 추천은 더 정교해져요.
          </p>
          <div className="absolute bottom-0 right-0 h-36 w-64 opacity-70 md:h-56 md:w-96">
            <div className="absolute bottom-0 right-6 h-24 w-16 rounded-t-xl border border-[#d8ded5] bg-white/70 md:h-40 md:w-24" />
            <div className="absolute bottom-0 right-24 h-32 w-20 rounded-t-2xl border border-[#d8ded5] bg-white/60 md:right-36 md:h-52 md:w-28" />
            <div className="absolute bottom-0 right-44 h-20 w-14 rounded-t-xl border border-[#d8ded5] bg-white/70 md:right-72 md:h-32 md:w-20" />
            <div className="absolute bottom-0 right-20 h-20 w-5 rounded-full bg-[#abc7a2] md:right-32 md:h-32 md:w-8" />
            <div className="absolute bottom-0 right-40 h-14 w-4 rounded-full bg-[#bfd4b9] md:right-64 md:h-24 md:w-7" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-rows-2">
          <Link
            className="block rounded-2xl bg-[linear-gradient(135deg,#285b3b,#17462c)] p-5 text-white shadow-[0_14px_34px_rgba(31,90,57,0.22)] md:p-7"
            href="/for-you">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold md:text-2xl">ForYou</h3>
                <p className="mt-4 text-sm font-medium leading-6 text-white/80 md:text-base">
                  내 취향에 맞는
                  <br />
                  장소 추천받기
                </p>
              </div>
              <Icon
                className="h-6 w-6 text-white/80 md:h-7 md:w-7"
                name="heart"
              />
            </div>
            <span className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)]">
              <Icon className="h-4 w-4" name="chevron" />
            </span>
          </Link>

          <Link
            className="block rounded-2xl bg-[#efefe4] p-5 text-[var(--text)] md:p-7"
            href="/explore">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--brand)] md:text-2xl">
                  Explore
                </h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-zinc-500 md:text-base">
                  새로운 로컬을
                  <br />
                  탐험하기
                </p>
              </div>
              <Icon
                className="h-6 w-6 text-[var(--brand)] md:h-7 md:w-7"
                name="bookmark"
              />
            </div>
            <span className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white">
              <Icon className="h-4 w-4" name="chevron" />
            </span>
          </Link>
        </div>
      </section>

      <section className="hidden md:mt-8 md:block">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">요즘 눈에 띄는 장소</h2>
          <Link
            className="text-sm font-bold text-[var(--brand)]"
            href="/explore">
            전체보기
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {mockPlaces.slice(0, 3).map((place) => (
            <Link
              className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
              href={`/place/${place.id}`}
              key={place.id}>
              <img
                alt=""
                className="h-28 w-full object-cover"
                src={place.imageUrl}
              />
              <div className="p-4">
                <p className="font-extrabold">{place.name}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {place.categoryLabel} · {place.distance}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

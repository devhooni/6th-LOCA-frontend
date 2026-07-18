import { Link } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";
import { mockUser } from "@/src/mocks/user";

const tabs = ["최근 기록", "저장한 장소", "컬렉션"];

export default function MyPage() {
  const cards = mockReviews.slice(0, 4).map((review) => {
    const place = mockPlaces.find((item) => item.id === review.placeId) ?? mockPlaces[0];
    return { review, place };
  });

  return (
    <AppShell>
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">마이페이지</h1>
          <p className="mt-3 text-base font-semibold text-zinc-500">
            나의 기록과 장소를 관리해 보세요.
          </p>
        </div>
        <button className="h-11 rounded-lg border border-[var(--border)] px-4 text-sm font-bold interactive" type="button">
          프로필 편집
        </button>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="wire-panel p-7">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
              <Icon className="h-9 w-9 text-zinc-400" name="user" />
            </div>
            <div>
              <h2 className="text-2xl font-black">{mockUser.name}</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">@minji_loca</p>
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold leading-7 text-zinc-500">
            홍대 주변의 조용한 공간과 감성적인 장소를 기록합니다.
          </p>
        </aside>

        <section className="wire-panel bg-zinc-50 p-7">
          <h2 className="text-xl font-black">나의 LOCA 활동</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              ["24", "기록"],
              ["67", "저장한 장소"],
              ["128", "팔로워"],
              ["6", "컬렉션"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-2 text-sm font-bold text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab, index) => (
            <button
              className={`h-12 px-5 text-sm font-black ${
                index === 0 ? "border-b-2 border-black text-black" : "text-zinc-400"
              }`}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ review, place }) => (
            <Link className="wire-card interactive overflow-hidden" key={review.id} to={`/place/${place.id}`}>
              <img alt="" className="h-36 w-full object-cover" src={review.images[0] ?? place.imageUrl} />
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-black">{review.title}</h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{place.name}</p>
                <div className="mt-3 flex gap-1.5">
                  <TagChip compact>{place.categoryLabel}</TagChip>
                  <TagChip compact>{review.mood}</TagChip>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

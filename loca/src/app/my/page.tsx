import { Icon } from "@/src/components/common/Icon";
import { StatItem } from "@/src/components/common/StatItem";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";
import { mockUser } from "@/src/mocks/user";

export default function MyPage() {
  const recordedPlaces = mockReviews
    .map((review) => mockPlaces.find((place) => place.id === review.placeId))
    .filter(Boolean);

  return (
    <AppShell>
      <div className="w-full md:pl-8">
        <header className="flex justify-end gap-2">
          <button
            aria-label="알림"
            className="rounded-full p-2 text-zinc-500"
            type="button">
            <Icon name="bell" />
          </button>
          <button
            aria-label="설정"
            className="rounded-full p-2 text-zinc-500"
            type="button">
            <Icon name="settings" />
          </button>
        </header>

        <div className="md:grid md:grid-cols-[330px_1fr] md:gap-8">
          <aside>
            <section className="mt-5 flex items-center gap-4 md:mt-0 md:block md:rounded-2xl md:bg-white md:p-7 md:text-center md:shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ee] text-[var(--brand)] md:mx-auto md:h-24 md:w-24">
                <Icon className="h-10 w-10 md:h-12 md:w-12" name="user" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold md:mt-4 md:text-2xl">
                  {mockUser.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  {mockUser.title}
                </p>
              </div>
            </section>

            <section className="mt-8 flex rounded-2xl bg-white p-4 md:block md:space-y-5 md:p-5">
              <StatItem
                label="기록한 장소"
                value={mockUser.recordedPlaceCount}
              />
              <StatItem label="저장한 장소" value={mockUser.savedPlaceCount} />
              <StatItem
                label="방문한 동네"
                value={mockUser.visitedNeighborhoodCount}
              />
            </section>
          </aside>

          <section className="mt-8 md:mt-0">
            <div className="-mx-5 border-b border-[var(--border)] border-t border-[var(--border)] bg-white md:mx-0 md:rounded-2xl md:border md:px-4">
              <div className="grid grid-cols-3 text-center text-sm font-bold">
                <span className="border-b-2 border-[var(--brand)] py-4 text-[var(--text)]">
                  기록
                </span>
                <span className="py-4 text-zinc-400">저장</span>
                <span className="py-4 text-zinc-400">방문</span>
              </div>
            </div>

            <div className="mt-5 space-y-5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {recordedPlaces.map((place, index) =>
                place ? (
                  <article
                    className="flex gap-3 rounded-2xl md:bg-white md:p-4 md:shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
                    key={place.id}>
                    <img
                      alt=""
                      className="h-20 w-20 rounded-xl object-cover"
                      src={place.imageUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate text-sm font-extrabold">
                          {place.name}
                        </h2>
                        <Icon
                          className="h-5 w-5 shrink-0 text-zinc-500"
                          name="bookmark"
                        />
                      </div>
                      <div className="mt-2 flex gap-1">
                        <TagChip compact>{place.categoryLabel}</TagChip>
                        <TagChip compact>{place.tags[0]}</TagChip>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-zinc-400">
                        {mockReviews[index]?.date}
                      </p>
                    </div>
                  </article>
                ) : null,
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

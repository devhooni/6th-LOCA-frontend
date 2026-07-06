import Link from "next/link";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { categories, mockPlaces } from "@/src/mocks/places";

export default function MapPage() {
  return (
    <AppShell flush>
      <div className="flex h-full w-full flex-col overflow-hidden overscroll-none touch-none">
        <section className="w-full px-5 pt-5 pb-3 md:px-10 md:pt-8 touch-auto bg-transparent z-10">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.08)] md:max-w-2xl">
            <Icon className="h-5 w-5 text-zinc-400" name="search" />
            <span className="flex-1 text-sm font-semibold text-zinc-400">
              장소나 동네를 검색해보세요
            </span>
            <Link
              aria-label="목록으로 보기"
              className="text-[var(--brand)]"
              href="/explore">
              <Icon name="x" />
            </Link>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <TagChip active={category.key === "all"} key={category.key}>
                {category.label}
              </TagChip>
            ))}
          </div>
        </section>
        <div className="absolute inset-y-0 right-0 left-0 md:left-64 w-auto touch-auto">
          <KakaoMap places={mockPlaces} />
        </div>
      </div>
    </AppShell>
  );
}

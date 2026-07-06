import Link from "next/link";
import type { Place } from "@/src/types/place";
import { Button } from "@/src/components/common/Button";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";

type MapBottomSheetProps = {
  place: Place;
};

export function MapBottomSheet({ place }: MapBottomSheetProps) {
  const visibilityLabel = place.visibility === "private" ? "Private Place" : "Public Place";

  return (
    <aside className="absolute inset-x-4 bottom-24 z-10 rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)] md:inset-x-auto md:bottom-8 md:left-8 md:w-[380px]">
      <div className="flex gap-3">
        <img alt="" className="h-20 w-20 rounded-xl object-cover" src={place.imageUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-base font-extrabold">{place.name}</h2>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${place.visibility === "private" ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-600"}`}>
              {visibilityLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <TagChip compact>{place.categoryLabel}</TagChip>
            {place.tags.slice(0, 2).map((tag) => (
              <TagChip compact key={tag}>
                {tag}
              </TagChip>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-zinc-500">
            <Icon className="h-3.5 w-3.5 text-[var(--warning)]" filled name="star" />
            {place.rating} · {place.distance}
          </div>
        </div>
      </div>
      {place.visibility === "private" ? (
        <p className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-500">사용자가 직접 남긴 숨은 장소예요.</p>
      ) : null}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button href={`/place/${place.id}`} variant="secondary">
          상세
        </Button>
        <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-semibold text-white" href={`/review/write?placeId=${place.id}`}>
          기록
        </Link>
        <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700" href="/collections">
          컬렉션
        </Link>
      </div>
    </aside>
  );
}

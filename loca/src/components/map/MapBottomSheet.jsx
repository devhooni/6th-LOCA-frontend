import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/common/Button";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";

export function MapBottomSheet({ place }) {
  const [isOpen, setIsOpen] = useState(true);
  const visibilityLabel =
    place.visibility === "private" ? "Private Place" : "Public Place";

  return (
    <aside
      className={`fixed inset-x-0 z-50 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out
        ${isOpen ? "bottom-[56px] inset-x-4 rounded-2xl pb-4" : "bottom-[56px] inset-x-4 h-12 overflow-hidden rounded-xl"}
        md:absolute md:inset-x-auto md:bottom-8 md:left-8 md:w-[380px] md:h-auto md:rounded-2xl md:pb-0 md:shadow-[0_18px_50px_rgba(0,0,0,0.16)]`}
    >
      <div
        className="flex h-12 w-full cursor-pointer items-center justify-center md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="h-1 w-10 rounded-full bg-zinc-300" />
          <span className="text-[10px] font-bold text-zinc-400">
            {isOpen ? "접기" : "장소 정보 펼치기"}
          </span>
        </div>
      </div>

      <div className="px-4 pb-1 md:p-5">
        <div className="flex gap-3">
          <img
            alt=""
            className="h-16 w-16 rounded-xl object-cover md:h-20 md:w-20"
            src={place.imageUrl}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate text-base font-extrabold">
                {place.name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${place.visibility === "private" ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-600"}`}
              >
                {visibilityLabel}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <TagChip compact>{place.categoryLabel}</TagChip>
              {place.tags.slice(0, 1).map((tag) => (
                <TagChip compact key={tag}>
                  {tag}
                </TagChip>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-zinc-500">
              <Icon
                className="h-3.5 w-3.5 text-[var(--warning)]"
                filled
                name="star"
              />
              {place.rating} · {place.distance}
            </div>
          </div>
        </div>

        {place.visibility === "private" ? (
          <p className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-500">
            사용자가 직접 남긴 숨은 장소예요.
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button href={`/place/${place.id}`} variant="secondary">
            상세
          </Button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-semibold !text-white md:h-12"
            to={`/review/write?placeId=${place.id}`}
          >
            기록
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700"
            to="/collections"
          >
            컬렉션
          </Link>
        </div>
      </div>
    </aside>
  );
}

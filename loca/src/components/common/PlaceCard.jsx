import { Link } from "react-router-dom";
import { Icon } from "./Icon";
import { TagChip } from "./TagChip";

export function PlaceCard({ place, compact = false }) {
  return (
    <Link
      className="wire-card interactive block overflow-hidden focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      to={`/place/${place.id}`}
    >
      <div className={`relative ${compact ? "h-28" : "h-40"}`}>
        <img alt="" className="h-full w-full object-cover" src={place.imageUrl} />
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black">
          <Icon className="h-4 w-4" name="bookmark" />
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-black">{place.name}</h3>
        <p className="mt-1 text-sm font-semibold text-zinc-500">{place.categoryLabel}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {place.tags.slice(0, compact ? 1 : 2).map((tag) => (
            <TagChip compact key={tag}>
              {tag}
            </TagChip>
          ))}
        </div>
        {!compact ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1 text-[var(--warning)]">
              <Icon className="h-3.5 w-3.5" filled name="star" />
              {place.rating || "-"}
            </span>
            <span>{place.distance}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

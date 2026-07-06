import Link from "next/link";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { getCollectionById } from "@/src/services/collectionService";

export default async function CollectionDetailPage({ params }: PageProps<"/collections/[id]">) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  const publicCount = (collection.places ?? []).filter((place) => place.visibility === "public").length;
  const privateCount = (collection.places ?? []).filter((place) => place.visibility === "private").length;

  return (
    <AppShell>
      <div className="w-full md:pl-8">
        <Link className="text-sm font-bold text-zinc-500" href="/collections">← Collections</Link>
        <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_rgba(24,24,27,0.08)]">
          <img alt="" className="h-56 w-full object-cover" src={collection.coverImageUrl} />
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold md:text-3xl">{collection.title}</h1>
              <TagChip compact>{collection.visibility}</TagChip>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500">{collection.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <TagChip compact>Public {publicCount}</TagChip>
              <TagChip compact>Private {privateCount}</TagChip>
              <TagChip compact>{collection.placeIds.length} places</TagChip>
            </div>
            <button className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-xs font-bold text-zinc-600" type="button">
              링크 복사 · /collections/{collection.shareSlug}
            </button>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {(collection.places ?? []).map((place, index) => (
            <Link className="relative flex gap-4 rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(24,24,27,0.08)]" href={`/place/${place.id}`} key={place.id}>
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-extrabold text-white">{index + 1}</span>
                {index < (collection.places?.length ?? 0) - 1 ? <span className="mt-2 h-full min-h-12 w-px bg-[var(--border)]" /> : null}
              </div>
              <img alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" src={place.imageUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-extrabold">{place.name}</h2>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${place.visibility === "private" ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-600"}`}>
                    {place.visibility === "private" ? "Private" : "Public"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-zinc-500">{place.description}</p>
                <p className="mt-2 text-xs font-bold text-zinc-400">{place.categoryLabel} · {place.distance}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

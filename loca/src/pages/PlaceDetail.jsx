import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/src/components/common/Button";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaceById } from "@/src/services/placeService";
import { mockReviews } from "@/src/mocks/reviews";

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaceById(id).then((data) => {
      setPlace(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />
      </AppShell>
    );
  }

  if (!place) {
    return (
      <AppShell>
        <div className="wire-panel p-8 text-sm font-semibold text-zinc-500">
          장소를 찾을 수 없어요.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link className="inline-flex h-10 items-center text-sm font-bold text-zinc-500 hover:text-black" to="/explore">
        ← Explore로 돌아가기
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px]">
        <img alt="" className="h-[520px] w-full rounded-2xl object-cover" src={place.imageUrl} />

        <aside className="flex flex-col">
          <div>
            <h1 className="text-4xl font-black leading-tight">{place.name}</h1>
            <p className="mt-3 text-base font-semibold text-zinc-500">
              {place.categoryLabel} · {place.address}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <TagChip active>{place.categoryLabel}</TagChip>
              {place.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
          </div>

          <dl className="mt-8 space-y-5 border-y border-[var(--border)] py-6">
            <div>
              <dt className="text-sm font-black">주소</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-500">{place.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-black">영업시간</dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-500">{place.hours}</dd>
            </div>
            <div>
              <dt className="text-sm font-black">평점</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-500">
                <Icon className="h-4 w-4 text-[var(--warning)]" filled name="star" />
                {place.rating || "-"} · 기록 {place.reviewCount}개 · {place.distance}
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-base font-semibold leading-8 text-zinc-600">
            {place.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
            <Button variant="secondary">
              ♡ 저장하기
            </Button>
            <Button href={`/review/write?placeId=${place.id}`}>
              이 장소 기록하기
            </Button>
          </div>
        </aside>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-black">방문자 기록</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {mockReviews.slice(0, 2).map((review) => (
            <article className="wire-panel p-5" key={review.id}>
              <p className="text-sm font-black">{review.title}</p>
              <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-zinc-500">
                {review.memory}
              </p>
              <p className="mt-4 text-xs font-bold text-zinc-400">{review.date}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

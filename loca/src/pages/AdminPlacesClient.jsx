import { useState } from "react";
import { Button } from "@/src/components/common/Button";
import { TagChip } from "@/src/components/common/TagChip";
import {
  createPlace,
  deletePlace,
  updatePlace,
} from "@/src/services/placeService";

const emptyForm = {
  kakaoPlaceId: "",
  name: "",
  category: "cafe",
  address: "",
  lat: 37.5563,
  lng: 126.9236,
  description: "",
  imageUrl: "",
  tagIds: [],
};

export function AdminPlacesClient({ initialPlaces, tags }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const selectedTagNames = form.tagIds;

  const submit = async () => {
    try {
      if (editingId) {
        const updated = await updatePlace(editingId, form);
        setPlaces((current) =>
          current.map((place) => (place.id === editingId ? updated : place)),
        );
        setEditingId(null);
      } else {
        const created = await createPlace(form);
        setPlaces((current) => [created, ...current]);
      }
      setForm(emptyForm);
      setMessage("저장되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "요청 처리 중 문제가 발생했습니다.",
      );
    }
  };

  const startEdit = (place) => {
    setEditingId(place.id);
    setForm({
      kakaoPlaceId: place.kakaoPlaceId ?? "",
      name: place.name,
      category: place.category,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      description: place.description,
      imageUrl: place.imageUrl,
      tagIds: place.tags,
    });
  };

  const remove = async (placeId) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deletePlace(placeId);
      setPlaces((current) => current.filter((place) => place.id !== placeId));
      setMessage("삭제되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "요청 처리 중 문제가 발생했습니다.",
      );
    }
  };

  return (
    <div className="w-full md:pl-8">
      <h1 className="text-2xl font-extrabold">장소 관리</h1>
      {message ? (
        <p className="mt-3 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-600">
          {message}
        </p>
      ) : null}

      <section className="mt-5 rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(24,24,27,0.08)]">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            placeholder="kakaoPlaceId"
            value={form.kakaoPlaceId}
            onChange={(event) =>
              setForm({ ...form, kakaoPlaceId: event.target.value })
            }
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            placeholder="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <select
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value })
            }
          >
            <option value="cafe">cafe</option>
            <option value="food">food</option>
            <option value="bar">bar</option>
            <option value="culture">culture</option>
            <option value="beauty">beauty</option>
            <option value="workshop">workshop</option>
          </select>
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            placeholder="address"
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            placeholder="lat"
            value={form.lat}
            onChange={(event) =>
              setForm({ ...form, lat: Number(event.target.value) })
            }
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            placeholder="lng"
            value={form.lng}
            onChange={(event) =>
              setForm({ ...form, lng: Number(event.target.value) })
            }
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm md:col-span-2"
            placeholder="imageUrl"
            value={form.imageUrl}
            onChange={(event) =>
              setForm({ ...form, imageUrl: event.target.value })
            }
          />
          <textarea
            className="h-24 rounded-xl border border-[var(--border)] p-3 text-sm md:col-span-2"
            placeholder="description"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              className={`rounded-full px-3 py-2 text-xs font-bold ${selectedTagNames.includes(tag.name) ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`}
              key={tag.id}
              onClick={() =>
                setForm({
                  ...form,
                  tagIds: selectedTagNames.includes(tag.name)
                    ? selectedTagNames.filter((id) => id !== tag.name)
                    : [...selectedTagNames, tag.name],
                })
              }
              type="button"
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={submit}>{editingId ? "수정 완료" : "등록"}</Button>
          {editingId ? (
            <Button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              variant="secondary"
            >
              취소
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {places.map((place) => (
          <article
            className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(24,24,27,0.08)]"
            key={place.id}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-extrabold">{place.name}</h2>
                <p className="mt-1 text-sm font-semibold text-zinc-500">
                  {place.categoryLabel} · {place.address}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {place.tags.map((tag) => (
                    <TagChip compact key={tag}>
                      {tag}
                    </TagChip>
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold text-zinc-400">
                  평점 {place.averageRating ?? place.rating} · 방문{" "}
                  {place.visitCount ?? 0} · 리뷰 {place.reviewCount}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startEdit(place)} variant="secondary">
                  수정
                </Button>
                <Button onClick={() => remove(place.id)} variant="ghost">
                  삭제
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

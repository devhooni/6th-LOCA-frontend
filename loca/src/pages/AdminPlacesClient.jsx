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
  visibility: "public",
  source: "kakao",
};

function getPlaceKey(place) {
  return String(place.placeId ?? place.id);
}

function isPrivatePlace(place) {
  return place.visibility === "private" || place.source === "user";
}

export function AdminPlacesClient({ initialPlaces, tags }) {
  const [places, setPlaces] = useState(initialPlaces);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [filter, setFilter] = useState("all");

  const selectedTagNames = form.tagIds;

  const submit = async () => {
    if (pendingAction) return;
    if (!form.name.trim()) {
      setMessage("장소 이름을 입력해주세요.");
      return;
    }

    setPendingAction("submit");
    try {
      if (editingId) {
        const updated = await updatePlace(editingId, form);
        setPlaces((current) =>
          current.map((place) => (getPlaceKey(place) === editingId ? updated : place)),
        );
        setEditingId(null);
      } else {
        const created = await createPlace(form);
        setPlaces((current) => [created, ...current]);
      }
      setForm(emptyForm);
      setMessage("저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 처리 중 문제가 발생했습니다.");
    } finally {
      setPendingAction("");
    }
  };

  const startEdit = (place) => {
    const privatePlace = isPrivatePlace(place);
    setEditingId(getPlaceKey(place));
    setForm({
      kakaoPlaceId: place.kakaoPlaceId ?? "",
      name: place.name ?? "",
      category: place.category ?? "cafe",
      address: place.address ?? "",
      lat: place.lat,
      lng: place.lng,
      description: place.description ?? "",
      imageUrl: place.imageUrl ?? "",
      tagIds: place.tags ?? [],
      visibility: privatePlace ? "private" : "public",
      source: privatePlace ? "user" : "kakao",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const remove = async (place) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    if (pendingAction) return;

    const placeId = getPlaceKey(place);
    setPendingAction(`delete-${placeId}`);
    try {
      await deletePlace(placeId, place);
      setPlaces((current) => current.filter((item) => getPlaceKey(item) !== placeId));
      if (editingId === placeId) cancelEdit();
      setMessage("삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 처리 중 문제가 발생했습니다.");
    } finally {
      setPendingAction("");
    }
  };

  const filteredPlaces = places.filter((place) => {
    const privatePlace = isPrivatePlace(place);
    if (filter === "public") return !privatePlace;
    if (filter === "private") return privatePlace;
    return true;
  });

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
            onChange={(event) => setForm({ ...form, kakaoPlaceId: event.target.value })}
            placeholder="kakaoPlaceId"
            value={form.kakaoPlaceId}
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="name"
            value={form.name}
          />
          <select
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            value={form.category}
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
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="address"
            value={form.address}
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            onChange={(event) => setForm({ ...form, lat: Number(event.target.value) })}
            placeholder="lat"
            value={form.lat}
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm"
            onChange={(event) => setForm({ ...form, lng: Number(event.target.value) })}
            placeholder="lng"
            value={form.lng}
          />
          <input
            className="h-11 rounded-xl border border-[var(--border)] px-3 text-sm md:col-span-2"
            onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
            placeholder="imageUrl"
            value={form.imageUrl}
          />
          <textarea
            className="h-24 rounded-xl border border-[var(--border)] p-3 text-sm md:col-span-2"
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="description"
            value={form.description}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              className={`rounded-full px-3 py-2 text-xs font-bold ${
                selectedTagNames.includes(tag.name)
                  ? "bg-[var(--brand)] text-white"
                  : "bg-zinc-100 text-zinc-500"
              }`}
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
          <Button disabled={pendingAction === "submit"} onClick={submit}>
            {pendingAction === "submit" ? "처리 중" : editingId ? "수정 완료" : "등록"}
          </Button>
          {editingId ? (
            <Button disabled={Boolean(pendingAction)} onClick={cancelEdit} variant="secondary">
              취소
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <h2 className="text-lg font-black">등록 장소 목록 ({filteredPlaces.length})</h2>
          <div className="flex gap-1.5">
            {[
              ["all", "전체"],
              ["public", "Public"],
              ["private", "Private"],
            ].map(([key, label]) => (
              <button
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  filter === key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
                key={key}
                onClick={() => setFilter(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredPlaces.map((place) => {
            const privatePlace = isPrivatePlace(place);
            const placeId = getPlaceKey(place);
            const deleting = pendingAction === `delete-${placeId}`;

            return (
              <article
                className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_rgba(24,24,27,0.08)]"
                key={placeId}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold">{place.name}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          privatePlace ? "bg-zinc-900 text-white" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {privatePlace ? "Private" : "Public"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      {place.categoryLabel} · {place.address}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(place.tags ?? []).map((tag) => (
                        <TagChip compact key={tag}>
                          {tag}
                        </TagChip>
                      ))}
                    </div>
                    <p className="mt-2 text-xs font-bold text-zinc-400">
                      위도 {place.lat} · 경도 {place.lng} · 방문 {place.visitCount ?? 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      disabled={Boolean(pendingAction)}
                      onClick={() => startEdit(place)}
                      variant="secondary"
                    >
                      수정
                    </Button>
                    <Button disabled={deleting} onClick={() => remove(place)} variant="ghost">
                      {deleting ? "처리 중" : "삭제"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

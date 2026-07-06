"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/src/components/common/Button";
import { Icon } from "@/src/components/common/Icon";
import { getPlaceById } from "@/src/mocks/places";

const copy = {
  close: "\ub2eb\uae30",
  write: "\uae30\ub85d\ud558\uae30",
  complete: "\uc644\ub8cc",
  selectedPlace: "\uc120\ud0dd\ud55c \uc7a5\uc18c",
  companionTitle: "\ub204\uad6c\uc640 \ub2e4\ub140\uc654\ub098\uc694?",
  noteTitle: "\uc5b4\ub5a4 \uc810\uc774 \uc88b\uc558\ub098\uc694?",
  notePlaceholder:
    "\uc88b\uc558\ub358 \uc810\uc744 \uc790\uc720\ub86d\uac8c \ub0a8\uaca8\ubcf4\uc138\uc694.",
  revisitTitle: "\ub2e4\uc2dc \ubc29\ubb38\ud558\uace0 \uc2f6\ub098\uc694?",
  photoTitle: "\uc0ac\uc9c4 \ucd94\uac00",
  alert:
    "\uae30\ub85d\uc774 \uc784\uc2dc\ub85c \uc644\ub8cc\ub418\uc5c8\uc5b4\uc694.",
};

const companions = [
  { key: "alone", label: "\ud63c\uc790", icon: "user" },
  { key: "friend", label: "\uce5c\uad6c", icon: "users" },
  { key: "date", label: "\uc5f0\uc778", icon: "heart" },
  { key: "family", label: "\uac00\uc871", icon: "users" },
  { key: "other", label: "\uae30\ud0c0", icon: "users" },
] as const;

const revisitOptions = [
  { key: "yes", label: "\ub124" },
  { key: "maybe", label: "\ubcf4\ud1b5" },
  { key: "no", label: "\uc544\ub2c8\uc694" },
] as const;

export function ReviewWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") ?? "object-yeonnam";
  const place = useMemo(() => getPlaceById(placeId), [placeId]);
  const [companion, setCompanion] =
    useState<(typeof companions)[number]["key"]>("alone");
  const [revisitIntent, setRevisitIntent] =
    useState<(typeof revisitOptions)[number]["key"]>("yes");
  const [note, setNote] = useState("");

  const complete = () => {
    console.log("mock review submitted", {
      placeId: place.id,
      companion,
      revisitIntent,
      note,
    });
    window.alert(copy.alert);
    router.push("/my");
  };

  return (
    <div className="min-h-dvh bg-white px-5 pb-8 pt-5 md:min-h-[calc(100dvh-56px)] md:bg-transparent md:px-10 md:py-10">
      <div className="mx-auto max-w-4xl rounded-none bg-white md:h-[calc(100dvh-136px)] md:max-h-[760px] md:min-h-[500px] md:rounded-3xl md:p-8 md:shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:flex md:flex-col md:overflow-hidden">
        <header className="flex items-center justify-between">
          <button
            aria-label={copy.close}
            className="rounded-full p-2 text-zinc-500"
            onClick={() => router.back()}
            type="button">
            <Icon name="x" />
          </button>
          <h1 className="text-base font-extrabold md:text-xl">{copy.write}</h1>
          <button
            className="px-2 text-sm font-extrabold text-[var(--brand)]"
            onClick={complete}
            type="button">
            {copy.complete}
          </button>
        </header>

        <div className="md:grid md:grid-cols-[280px_1fr] md:gap-8 md:flex-1 md:h-full md:overflow-hidden">
          <aside className="md:h-full">
            <p className="mt-8 text-sm font-bold text-zinc-500">
              {copy.selectedPlace}
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3 md:block">
              <img
                alt=""
                className="h-14 w-14 rounded-xl object-cover md:h-44 md:w-full"
                src={place.imageUrl}
              />
              <div className="md:mt-4">
                <h2 className="text-sm font-extrabold md:text-lg">
                  {place.name}
                </h2>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  {place.categoryLabel}
                </p>
              </div>
            </div>
          </aside>

          <div className="md:h-full md:overflow-y-auto md:pr-2">
            <section className="mt-7 md:mt-0">
              <h2 className="text-sm font-extrabold">{copy.companionTitle}</h2>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {companions.map((item) => (
                  <button
                    className="flex flex-col items-center gap-2 text-[11px] font-semibold text-zinc-500"
                    key={item.key}
                    onClick={() => setCompanion(item.key)}
                    type="button">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${companion === item.key ? "border border-[var(--brand)] bg-[#eef5ee] text-[var(--brand)]" : "bg-zinc-100 text-zinc-400"}`}>
                      <Icon className="h-5 w-5" name={item.icon} />
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.noteTitle}</h2>
              <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
                <textarea
                  className="h-24 w-full resize-none border-0 text-sm outline-none placeholder:text-zinc-300"
                  maxLength={200}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={copy.notePlaceholder}
                  value={note}
                />
                <div className="text-right text-xs font-semibold text-zinc-300">
                  {note.length} / 200
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.revisitTitle}</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {revisitOptions.map((item) => (
                  <button
                    className={`h-12 rounded-xl text-sm font-bold ${
                      revisitIntent === item.key
                        ? "border border-[var(--brand)] bg-[#eef5ee] text-[var(--brand)]"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                    key={item.key}
                    onClick={() => setRevisitIntent(item.key)}
                    type="button">
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.photoTitle}</h2>
              <div className="mt-4 flex gap-3">
                <button
                  className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600"
                  type="button">
                  <Icon className="h-7 w-7" name="plus" />
                </button>
                {[
                  place.imageUrl,
                  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80",
                ].map((src) => (
                  <div
                    className="relative h-20 w-20 overflow-hidden rounded-xl"
                    key={src}>
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={src}
                    />
                    <span className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white">
                      <Icon className="h-3 w-3" name="x" />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <Button className="mt-9 w-full" onClick={complete}>
              {copy.complete}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

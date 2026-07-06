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
  todaySection: "\uc624\ub298\uc758 \uc2dc\uac04",
  experienceSection: "\uc7a5\uc18c\uc5d0\uc11c \ub290\ub080 \uac83",
  afterSection: "\ub098\uc911\uc758 \ub098\uc5d0\uac8c",
  title: "\uc624\ub298\uc758 \uc81c\ubaa9",
  titlePlaceholder: "\uc624\ub298\uc744 \ud55c \uc904\ub85c \ub0a8\uaca8\ubcf4\uc138\uc694",
  companion: "\ub204\uad6c\uc640 \ub2e4\ub140\uc654\ub098\uc694?",
  mood: "\uc624\ub298\uc758 \uae30\ubd84",
  keywords: "\uc624\ub298\uc758 \ud0a4\uc6cc\ub4dc",
  keywordsHelp: "\uc624\ub298\uc744 \uac00\uc7a5 \uc798 \ud45c\ud604\ud558\ub294 \ud0a4\uc6cc\ub4dc\ub97c \uace8\ub77c\uc8fc\uc138\uc694.",
  memory: "\uae30\uc5b5\uc5d0 \ub0a8\ub294 \uc2dc\uac04",
  memoryPlaceholder: "\uc624\ub298 \uac00\uc7a5 \uae30\uc5b5\uc5d0 \ub0a8\ub294 \uc2dc\uac04\uc744 \uc801\uc5b4\ubcf4\uc138\uc694.",
  review: "\uc88b\uc558\ub358 \uc810",
  reviewPlaceholder: "\uc88b\uc558\ub358 \uc810\uc774\ub098 \uc544\uc26c\uc6e0\ub358 \uc810\uc744 \uc790\uc720\ub86d\uac8c \ub0a8\uaca8\ubcf4\uc138\uc694.",
  satisfaction: "\uc774\ubc88 \ubc29\ubb38 \ub9cc\uc871\ub3c4",
  expense: "\uc624\ub298 \uc5bc\ub9c8 \uc815\ub3c4 \uc0ac\uc6a9\ud588\ub098\uc694?",
  unknownExpense: "\uae30\uc5b5 \uc548\ub098\uc694",
  atmosphere: "\ubd84\uc704\uae30 \ud0dc\uadf8",
  photo: "\uc0ac\uc9c4 \ucd94\uac00",
  futureMemo: "\ubbf8\ub798\uc758 \ub098\uc5d0\uac8c \ud55c\ub9c8\ub514",
  futurePlaceholder: "\ubbf8\ub798\uc758 \ub098\uc5d0\uac8c \ud55c\ub9c8\ub514 \ub0a8\uaca8\ubcf4\uc138\uc694.",
  alert: "\uc624\ub298\uc758 \ucd94\uc5b5\uc774 \uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4.\n\ub098\ub9cc\uc758 LOCA \ub2e4\uc774\uc5b4\ub9ac\uc5d0 \uae30\ub85d\ub418\uc5c8\uc5b4\uc694.",
};

const companions = [
  { key: "alone", label: "\ud63c\uc790", icon: "user" },
  { key: "friend", label: "\uce5c\uad6c", icon: "users" },
  { key: "date", label: "\uc5f0\uc778", icon: "heart" },
  { key: "family", label: "\uac00\uc871", icon: "users" },
  { key: "other", label: "\uae30\ud0c0", icon: "users" },
] as const;

const moods = [
  { key: "happy", label: "\ud589\ubcf5" },
  { key: "calm", label: "\ud3c9\uc628" },
  { key: "excited", label: "\uc124\ub818" },
  { key: "inspired", label: "\uc704\ub85c\ubc1b\uc74c" },
  { key: "lonely", label: "\uc678\ub85c\uc6c0" },
  { key: "stressed", label: "\uc2a4\ud2b8\ub808\uc2a4" },
] as const;

const keywordOptions = [
  "\ube44 \uc624\ub294 \ub0a0",
  "\ub9d1\uc74c",
  "\ud63c\uc790 \ub0a0",
  "\uc800\ub141",
  "\uace0\uc591\uc774",
  "\ub370\uc774\ud2b8",
  "\uce5c\uad6c",
  "\uc57c\uac04 \uc0b0\ucc45",
  "\uacf5\uc5f0",
  "\uc774\ub3d9",
  "\ud734\uc2dd",
  "\uac00\uc871",
];

const atmosphereOptions = [
  "\uc544\ub291",
  "\uc870\uc6a9\ud55c",
  "\uc0ac\uc9c4\ub9db\uc9d1",
  "\ubd84\uc704\uae30 \uc88b\uc74c",
  "\uc74c\uc545 \uc88b\uc74c",
  "\uc57c\uacbd",
  "\ub300\ud654\ud558\uae30 \uc88b\uc74c",
  "\uac10\uc131",
  "\ud65c\uae30\ucc2c",
];

function toggleLimited(list: string[], value: string, max: number) {
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (list.length >= max) return list;
  return [...list, value];
}

export function ReviewWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placeId = searchParams.get("placeId") ?? "object-yeonnam";
  const place = useMemo(() => getPlaceById(placeId), [placeId]);
  const [title, setTitle] = useState("");
  const [companion, setCompanion] = useState<(typeof companions)[number]["key"]>("alone");
  const [mood, setMood] = useState<(typeof moods)[number]["key"]>("calm");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [memory, setMemory] = useState("");
  const [review, setReview] = useState("");
  const [satisfaction, setSatisfaction] = useState(4);
  const [expense, setExpense] = useState("");
  const [expenseUnknown, setExpenseUnknown] = useState(false);
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>([]);
  const [futureMemo, setFutureMemo] = useState("");

  const complete = () => {
    console.log("mock diary submitted", {
      placeId: place.id,
      title,
      companion,
      mood,
      keywords,
      memory,
      review,
      satisfaction,
      expense: expenseUnknown ? null : Number(expense.replaceAll(",", "")) || null,
      expenseUnknown,
      atmosphereTags,
      futureMemo,
    });
    window.alert(copy.alert);
    router.push("/my");
  };

  const handleExpense = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    setExpense(digits ? Number(digits).toLocaleString("ko-KR") : "");
  };

  return (
    <div className="h-full bg-white px-5 pb-8 pt-5 md:bg-transparent md:px-10 md:py-8">
      <div className="mx-auto max-w-5xl rounded-none bg-white md:max-h-full md:overflow-y-auto md:rounded-3xl md:p-8 md:shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <header className="flex items-center justify-between">
          <button aria-label={copy.close} className="rounded-full p-2 text-zinc-500" onClick={() => router.back()} type="button">
            <Icon name="x" />
          </button>
          <h1 className="text-base font-extrabold md:text-xl">{copy.write}</h1>
          <button className="px-2 text-sm font-extrabold text-[var(--brand)]" onClick={complete} type="button">
            {copy.complete}
          </button>
        </header>

        <div className="md:grid md:grid-cols-[280px_1fr] md:gap-8">
          <aside>
            <p className="mt-8 text-sm font-bold text-zinc-500">{copy.selectedPlace}</p>
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3 md:block">
              <img alt="" className="h-14 w-14 rounded-xl object-cover md:h-44 md:w-full" src={place.imageUrl} />
              <div className="md:mt-4">
                <h2 className="text-sm font-extrabold md:text-lg">{place.name}</h2>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{place.categoryLabel}</p>
              </div>
            </div>
          </aside>

          <div>
            <div className="mt-7 md:mt-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-400">Today</p>
              <h2 className="mt-1 text-xl font-extrabold">{copy.todaySection}</h2>
            </div>

            <section className="mt-5">
              <label className="text-sm font-extrabold" htmlFor="diary-title">
                {copy.title}
              </label>
              <input
                className="mt-3 h-12 w-full rounded-xl border border-[var(--border)] px-4 text-sm outline-none focus:border-[var(--brand)]"
                id="diary-title"
                maxLength={40}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={copy.titlePlaceholder}
                value={title}
              />
            </section>

            <section className="mt-7">
              <h2 className="text-sm font-extrabold">{copy.companion}</h2>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {companions.map((item) => (
                  <button className="flex flex-col items-center gap-2 text-[11px] font-semibold text-zinc-500" key={item.key} onClick={() => setCompanion(item.key)} type="button">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full ${companion === item.key ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`}>
                      <Icon className="h-5 w-5" name={item.icon} />
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.mood}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {moods.map((item) => (
                  <button className={`rounded-full px-4 py-2 text-sm font-bold ${mood === item.key ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`} key={item.key} onClick={() => setMood(item.key)} type="button">
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.keywords}</h2>
              <p className="mt-1 text-xs font-semibold text-zinc-400">{copy.keywordsHelp}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {keywordOptions.map((item) => (
                  <button className={`rounded-full px-3 py-2 text-xs font-bold ${keywords.includes(item) ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`} key={item} onClick={() => setKeywords((current) => toggleLimited(current, item, 3))} type="button">
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-10 border-t border-[var(--border)] pt-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-400">Experience</p>
              <h2 className="mt-1 text-xl font-extrabold">{copy.experienceSection}</h2>
            </div>

            <section className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-extrabold" htmlFor="memory">
                  {copy.memory}
                </label>
                <textarea className="mt-3 h-28 w-full resize-none rounded-xl border border-[var(--border)] p-4 text-sm outline-none placeholder:text-zinc-300 focus:border-[var(--brand)]" id="memory" maxLength={100} onChange={(event) => setMemory(event.target.value)} placeholder={copy.memoryPlaceholder} value={memory} />
                <div className="text-right text-xs font-semibold text-zinc-300">{memory.length} / 100</div>
              </div>
              <div>
                <label className="text-sm font-extrabold" htmlFor="review">
                  {copy.review}
                </label>
                <textarea className="mt-3 h-28 w-full resize-none rounded-xl border border-[var(--border)] p-4 text-sm outline-none placeholder:text-zinc-300 focus:border-[var(--brand)]" id="review" maxLength={300} onChange={(event) => setReview(event.target.value)} placeholder={copy.reviewPlaceholder} value={review} />
                <div className="text-right text-xs font-semibold text-zinc-300">{review.length} / 300</div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.satisfaction}</h2>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button className={`h-11 rounded-xl text-sm font-extrabold ${satisfaction === value ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`} key={value} onClick={() => setSatisfaction(value)} type="button">
                    {value}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-10 border-t border-[var(--border)] pt-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-400">After</p>
              <h2 className="mt-1 text-xl font-extrabold">{copy.afterSection}</h2>
            </div>

            <section className="mt-5">
              <label className="text-sm font-extrabold" htmlFor="expense">
                {copy.expense}
              </label>
              <div className="mt-3 flex gap-2">
                <input className="h-12 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-4 text-sm outline-none disabled:bg-zinc-100 disabled:text-zinc-400" disabled={expenseUnknown} id="expense" onChange={(event) => handleExpense(event.target.value)} placeholder="18,500" value={expense} />
                <label className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-zinc-100 px-3 text-xs font-bold text-zinc-600">
                  <input checked={expenseUnknown} onChange={(event) => setExpenseUnknown(event.target.checked)} type="checkbox" />
                  {copy.unknownExpense}
                </label>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.atmosphere}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {atmosphereOptions.map((item) => (
                  <button className={`rounded-full px-3 py-2 text-xs font-bold ${atmosphereTags.includes(item) ? "bg-[var(--brand)] text-white" : "bg-zinc-100 text-zinc-500"}`} key={item} onClick={() => setAtmosphereTags((current) => toggleLimited(current, item, 3))} type="button">
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-extrabold">{copy.photo}</h2>
              <div className="mt-4 flex gap-3">
                <button className="flex h-20 w-20 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600" type="button">
                  <Icon className="h-7 w-7" name="plus" />
                </button>
                {[place.imageUrl, "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80"].map((src) => (
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl" key={src}>
                    <img alt="" className="h-full w-full object-cover" src={src} />
                    <span className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white">
                      <Icon className="h-3 w-3" name="x" />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <label className="text-sm font-extrabold" htmlFor="future-memo">
                {copy.futureMemo}
              </label>
              <textarea className="mt-3 h-24 w-full resize-none rounded-xl border border-[var(--border)] p-4 text-sm outline-none placeholder:text-zinc-300 focus:border-[var(--brand)]" id="future-memo" maxLength={80} onChange={(event) => setFutureMemo(event.target.value)} placeholder={copy.futurePlaceholder} value={futureMemo} />
              <div className="text-right text-xs font-semibold text-zinc-300">{futureMemo.length} / 80</div>
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/src/components/common/Icon";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";
import { mockUser } from "@/src/mocks/user";
import { getPlaces, getPrivatePlaces } from "@/src/services/placeService";
import { getReviewsMe } from "@/src/services/reviewService";

const tabs = ["최근 기록", "기록", "나만의 장소", "임시저장"];
const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

function getActivityCalendarDays(calendar) {
  const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
  const leadingEmptyDays = firstDay === 0 ? 6 : firstDay - 1;
  const lastDate = new Date(calendar.year, calendar.month, 0).getDate();

  return [
    ...Array.from({ length: leadingEmptyDays }, (_, index) => ({
      key: `empty-${index}`,
      empty: true,
    })),
    ...Array.from({ length: lastDate }, (_, index) => {
      const date = index + 1;
      return {
        key: `date-${date}`,
        date,
        count: calendar.recordsByDate[date] ?? 0,
      };
    }),
  ];
}

function ActivityCalendar({ calendar }) {
  const days = getActivityCalendarDays(calendar);
  const maxCount = Math.max(...Object.values(calendar.recordsByDate), 1);

  return (
    <div className="mt-7 rounded-xl border border-[var(--border)] bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black">기록 캘린더</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500">
            날짜별로 남긴 기록 수를 보여줄 예정입니다.
          </p>
        </div>
        <p className="text-sm font-black text-zinc-500">
          {calendar.year}년 {calendar.month}월
        </p>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {weekdays.map((weekday) => (
          <div
            className={`text-xs font-black ${
              weekday === "토" ? "text-zinc-500" : weekday === "일" ? "text-zinc-700" : "text-zinc-400"
            }`}
            key={weekday}
          >
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          if (day.empty) {
            return <div className="h-14" key={day.key} />;
          }

          const hasRecords = day.count > 0;
          const isToday = day.date === 25;
          const intensity = hasRecords ? day.count / maxCount : 0;

          return (
            <div className="flex h-14 flex-col items-center justify-start gap-1" key={day.key}>
              <div
                className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-black ${
                  hasRecords ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-300"
                } ${intensity >= 0.8 ? "ring-2 ring-zinc-300" : ""}`}
                title={`${day.date}일 기록 ${day.count}개`}
              >
                {hasRecords ? day.count : ""}
              </div>
              <span
                className={`text-xs font-black ${
                  isToday
                    ? "rounded-full bg-zinc-900 px-2 py-0.5 text-white"
                    : hasRecords
                      ? "text-zinc-900"
                      : "text-zinc-400"
                }`}
              >
                {day.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [reviews, setReviews] = useState(mockReviews);
  const [allPlaces, setAllPlaces] = useState(mockPlaces);
  const [privatePlaces, setPrivatePlaces] = useState([]);

  useEffect(() => {
    Promise.all([getReviewsMe(), getPlaces(), getPrivatePlaces()]).then(([reviewsData, placesData, privateData]) => {
      if (reviewsData) setReviews(reviewsData);
      if (placesData) setAllPlaces(placesData);
      if (privateData) setPrivatePlaces(privateData);
    });
  }, []);

  const cards = reviews.slice(0, 4).map((review) => {
    const place = allPlaces.find((item) => String(item.id) === String(review.placeId)) ?? allPlaces[0];
    return { review, place };
  });


  return (
    <AppShell>
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black">마이페이지</h1>
          <p className="mt-3 text-base font-semibold text-zinc-500">
            진우님의 기록과 개인 장소를 한눈에 관리해 보세요.
          </p>
        </div>
        <button className="h-11 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-bold text-zinc-700 interactive" type="button">
          프로필 편집
        </button>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="wire-panel p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
            Profile
          </p>
          <h2 className="mt-2 text-xl font-black">진우님 프로필</h2>

          <div className="mt-6 flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
              <Icon className="h-9 w-9 text-zinc-400" name="user" />
            </div>
            <div>
              <h3 className="text-2xl font-black">{mockUser.name}</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500">{mockUser.handle}</p>
              <p className="mt-1 text-xs font-bold text-zinc-400">{mockUser.title}</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5">
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-2xl font-black">{mockUser.followerCount}</p>
              <p className="mt-1 text-xs font-bold text-zinc-500">팔로워</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-2xl font-black">{mockUser.followingCount}</p>
              <p className="mt-1 text-xs font-bold text-zinc-500">팔로잉</p>
            </div>
          </div>
        </aside>

        <section className="wire-panel bg-zinc-50 p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black">나의 LOCA 활동</h2>
              <p className="mt-2 text-sm font-semibold text-zinc-500">
                리뷰는 기록으로, 장소는 별도 장소 데이터로 분리해 관리합니다.
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-black text-zinc-500">
              이번 주 기록 {mockUser.recentRecordCount}개
            </span>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-5">
              <p className="text-sm font-black text-zinc-500">기록</p>
              <p className="mt-3 text-3xl font-black">{reviews.length}개</p>
              <p className="mt-2 text-xs font-semibold text-zinc-400">방문 후 남긴 리뷰/기록</p>
            </div>
            <div className="rounded-lg bg-white p-5">
              <p className="text-sm font-black text-zinc-500">나만의 장소</p>
              <p className="mt-3 text-3xl font-black">{privatePlaces.length || mockUser.privatePlaceCount}개</p>
              <p className="mt-2 text-xs font-semibold text-zinc-400">지도에 직접 추가한 장소</p>
            </div>
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-5">
              <p className="text-sm font-black text-zinc-500">임시저장</p>
              <p className="mt-3 text-3xl font-black">{mockUser.draftCount}개</p>
              <p className="mt-2 text-xs font-semibold text-zinc-400">작성 중인 기록</p>
            </div>
          </div>

          <ActivityCalendar calendar={mockUser.activityCalendar} />
        </section>
      </div>

      <section className="mt-10">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab, index) => (
            <button
              className={`h-12 px-5 text-sm font-black ${
                index === 0 ? "border-b-2 border-black text-black" : "text-zinc-400"
              }`}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ review, place }) => (
            <Link className="wire-card interactive overflow-hidden" key={review.id} to={`/place/${place.id}`}>
              <img alt="" className="h-36 w-full object-cover" src={review.images[0] ?? place.imageUrl} />
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-black">{review.title}</h3>
                <p className="mt-1 text-xs font-semibold text-zinc-500">{place.name}</p>
                <div className="mt-3 flex gap-1.5">
                  <TagChip compact>{place.categoryLabel}</TagChip>
                  <TagChip compact>{review.mood}</TagChip>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

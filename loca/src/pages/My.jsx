import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";
import { mockUser } from "@/src/mocks/user";
import { getPlaces, getPrivatePlaces } from "@/src/services/placeService";
import { getReviewsMe } from "@/src/services/reviewService";

const TABS = ["기록", "장소들", "임시저장"];

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Stat card
function StatCard({ value, label, accent }) {
  return (
    <div style={{
      background: accent ? "var(--brand-black)" : "var(--surface)",
      border: `1.5px solid ${accent ? "transparent" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      padding: "18px 16px",
      flex: 1,
    }}>
      <p style={{
        fontSize: "1.5rem",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        color: accent ? "#fff" : "var(--text)",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </p>
      <p style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: accent ? "rgba(255,255,255,0.6)" : "var(--text-4)",
      }}>
        {label}
      </p>
    </div>
  );
}

// Activity heatmap (simplified)
function ActivityHeatmap({ calendar }) {
  const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;
  const lastDate = new Date(calendar.year, calendar.month, 0).getDate();
  const maxCount = Math.max(...Object.values(calendar.recordsByDate), 1);

  const days = [
    ...Array.from({ length: leading }, (_, i) => ({ key: `e${i}`, empty: true })),
    ...Array.from({ length: lastDate }, (_, i) => {
      const date = i + 1;
      return { key: `d${date}`, date, count: calendar.recordsByDate[date] ?? 0 };
    }),
  ];

  return (
    <div style={{
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "18px",
      marginTop: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 800 }}>기록 캘린더</p>
        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)" }}>
          {calendar.year}.{String(calendar.month).padStart(2, "0")}
        </p>
      </div>

      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {["월", "화", "수", "목", "금", "토", "일"].map((d) => (
          <div key={d} style={{
            textAlign: "center",
            fontSize: "0.625rem",
            fontWeight: 800,
            color: d === "일" ? "#e53e3e" : d === "토" ? "#4a90d9" : "var(--text-4)",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {days.map((day) => {
          if (day.empty) return <div key={day.key} />;
          const intensity = day.count / maxCount;
          const isToday = day.date === new Date().getDate();

          return (
            <div
              key={day.key}
              title={`${day.date}일 기록 ${day.count}개`}
              style={{
                aspectRatio: "1",
                borderRadius: 4,
                background: day.count > 0
                  ? `rgba(10,10,10,${0.2 + intensity * 0.8})`
                  : "var(--surface-2)",
                border: isToday ? "1.5px solid var(--brand-black)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.5625rem",
                fontWeight: 800,
                color: day.count > 0 && intensity > 0.5 ? "#fff" : "var(--text-4)",
              }}
            >
              {day.date}
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
  const [userPlaces, setUserPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState("기록");

  useEffect(() => {
    Promise.all([getReviewsMe(), getPlaces(), getPrivatePlaces()]).then(
      ([reviewsData, placesData, privateData]) => {
        if (reviewsData) setReviews(reviewsData);
        if (placesData) setAllPlaces(placesData);
        if (privateData) setUserPlaces(privateData);
      }
    );
  }, []);

  const cards = reviews.slice(0, 6).map((review) => {
    const place = allPlaces.find((p) => String(p.id) === String(review.placeId)) ?? allPlaces[0];
    return { review, place };
  });

  const placeCards = userPlaces.length
    ? userPlaces
    : allPlaces.filter((p) => p.createdByUser || p.visibility === "private" || p.source === "user");
  const placeCount = Math.max(placeCards.length, mockUser.privatePlaceCount);

  return (
    <AppShell>
      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 20px 0",
      }}>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.025em" }}>
          마이페이지
        </h1>
        <button
          type="button"
          className="btn btn-icon tap-target"
          aria-label="설정"
        >
          <SettingsIcon />
        </button>
      </div>

      {/* ── Profile card ── */}
      <div
        className="anim-fade-up"
        style={{
          margin: "20px 20px 0",
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--brand-black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "1.25rem",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}>
            진
          </div>

          {/* Name & handle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "1.0625rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              {mockUser.name}
            </p>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)", marginTop: 2 }}>
              {mockUser.handle}
            </p>
            {mockUser.title && (
              <span style={{
                display: "inline-block",
                marginTop: 6,
                background: "var(--surface-2)",
                borderRadius: "var(--radius-full)",
                padding: "2px 10px",
                fontSize: "0.6875rem",
                fontWeight: 800,
                color: "var(--text-3)",
                letterSpacing: "0.03em",
              }}>
                {mockUser.title}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm tap-target"
          >
            편집
          </button>
        </div>

        {/* Follower stats */}
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 18,
          paddingTop: 18,
          borderTop: "1px solid var(--border)",
        }}>
          {[
            { label: "팔로워", value: mockUser.followerCount },
            { label: "팔로잉", value: mockUser.followingCount },
            { label: "이번 주", value: `${mockUser.recentRecordCount}개` },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.0625rem", fontWeight: 900, letterSpacing: "-0.02em" }}>{s.value}</p>
              <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-4)", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity stats ── */}
      <div style={{ padding: "16px 20px 0" }}>
        <p style={{
          fontSize: "0.75rem",
          fontWeight: 800,
          color: "var(--text-4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}>
          나의 LOCA 활동
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <StatCard value={`${reviews.length}`} label="기록" accent />
          <StatCard value={`${placeCount}`} label="장소들" />
          <StatCard value={`${mockUser.draftCount}`} label="임시저장" />
        </div>

        {/* Heatmap */}
        <ActivityHeatmap calendar={mockUser.activityCalendar} />
      </div>

      {/* ── Divider ── */}
      <div className="divider-thick" style={{ margin: "24px 0 0" }} />

      {/* ── Tabs ── */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className="tap-target"
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              height: 48,
              fontSize: "0.875rem",
              fontWeight: 800,
              background: "none",
              border: "none",
              color: activeTab === tab ? "var(--text)" : "var(--text-4)",
              borderBottom: activeTab === tab ? "2.5px solid var(--brand-black)" : "2.5px solid transparent",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: 기록 ── */}
      {activeTab === "기록" && (
        <div style={{ padding: "16px 20px" }} className="anim-fade-in">
          {cards.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 20px",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-lg)",
              border: "1.5px dashed var(--border)",
            }}>
              <p style={{ fontSize: "2rem", marginBottom: 10 }}>✍️</p>
              <p style={{ fontWeight: 700, color: "var(--text-3)", marginBottom: 16 }}>
                아직 기록이 없어요
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                장소 찾아보기
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cards.map(({ review, place }, i) => (
                <Link
                  key={review.id}
                  to={`/place/${place.id}`}
                  className="card tap-target block"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: "var(--radius-lg)" }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "var(--surface-2)",
                  }}>
                    <img
                      src={review.images?.[0] ?? place.imageUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="line-clamp-1" style={{ fontWeight: 800, fontSize: "0.9375rem" }}>
                      {review.title}
                    </p>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-3)", marginTop: 3 }}>
                      {place.name}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {[place.categoryLabel, review.mood].filter(Boolean).map((t) => (
                        <span key={t} className="chip chip--sm" style={{ cursor: "default" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: 장소들 ── */}
      {activeTab === "장소들" && (
        <div style={{ padding: "16px 20px" }} className="anim-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Add new place card */}
            <Link
              to="/place/new"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 160,
                border: "1.5px dashed var(--border)",
                borderRadius: "var(--radius-lg)",
                color: "var(--text-3)",
                fontWeight: 700,
                fontSize: "0.8125rem",
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
              className="tap-target"
            >
              <PlusIcon />
              장소 추가
            </Link>

            {placeCards.map((place) => (
              <Link
                key={place.id}
                to={`/place/${place.id}`}
                className="card tap-target block"
                style={{ overflow: "hidden", borderRadius: "var(--radius-lg)" }}
              >
                <div style={{ height: 90, overflow: "hidden" }}>
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <p className="line-clamp-1" style={{ fontWeight: 800, fontSize: "0.875rem" }}>{place.name}</p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-3)", marginTop: 2 }}>{place.categoryLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: 임시저장 ── */}
      {activeTab === "임시저장" && (
        <div style={{ padding: "16px 20px" }} className="anim-fade-in">
          <div style={{
            textAlign: "center",
            padding: "48px 20px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px dashed var(--border)",
          }}>
            <p style={{ fontSize: "2rem", marginBottom: 10 }}>📝</p>
            <p style={{ fontWeight: 800, marginBottom: 6 }}>작성 중인 기록 {mockUser.draftCount}개</p>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-3)" }}>
              임시저장한 기록은 저장 기능 연동 후<br />이 영역에서 이어서 작성할 수 있어요.
            </p>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </AppShell>
  );
}

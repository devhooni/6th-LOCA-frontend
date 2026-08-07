import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TagChip } from "@/src/components/common/TagChip";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces } from "@/src/services/placeService";

const MOODS = [
  { label: "전체", emoji: "✨" },
  { label: "조용한", emoji: "🔇" },
  { label: "새로운", emoji: "🌟" },
  { label: "자연", emoji: "🌿" },
  { label: "맛있는", emoji: "🍜" },
  { label: "예술적인", emoji: "🎨" },
  { label: "힐링", emoji: "🧘" },
];

const LocaPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(0);

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      {/* ── Top Bar ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 20px 0",
      }}>
        {/* Brand logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--brand-black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}>
            <LocaPin />
          </div>
          <span style={{
            fontSize: "1.0625rem",
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}>
            LOCA
          </span>
        </div>

        {/* Top right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            className="btn btn-icon-round"
            style={{ width: 38, height: 38 }}
            aria-label="알림"
          >
            <BellIcon />
          </button>
          <Link
            to="/my"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--brand-black)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 900,
              letterSpacing: "-0.01em",
              border: "none",
            }}
            aria-label="마이페이지"
          >
            진
          </Link>
        </div>
      </div>

      {/* ── Greeting ── */}
      <div
        className="anim-fade-up"
        style={{ padding: "24px 20px 0" }}
      >
        <p style={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--text-3)",
          letterSpacing: "0.03em",
          marginBottom: 6,
        }}>
          안녕하세요, 진우님 👋
        </p>
        <h1 style={{
          fontSize: "clamp(1.5rem, 6vw, 1.875rem)",
          fontWeight: 900,
          letterSpacing: "-0.025em",
          lineHeight: 1.2,
        }}>
          오늘은 어떤<br />장소를 디깅할까요?
        </h1>
      </div>

      {/* ── Search bar ── */}
      <div
        className="anim-fade-up anim-delay-1"
        style={{ padding: "20px 20px 0" }}
      >
        <Link
          to="/explore"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 50,
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: "var(--radius-full)",
            padding: "0 18px",
            textDecoration: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
          className="tap-target"
        >
          <SearchIcon />
          <span style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-4)",
            flex: 1,
          }}>
            장소 이름, 분위기, 키워드로 검색
          </span>
        </Link>
      </div>

      {/* ── Quick access cards ── */}
      <div
        className="anim-fade-up anim-delay-2"
        style={{ padding: "24px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
      >
        <Link
          to="/for-you"
          className="card card-dark tap-target"
          style={{
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            border: "none",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✨</span>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>PERSONALIZED</p>
            <p style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>For You</p>
          </div>
        </Link>
        <Link
          to="/explore"
          className="card tap-target"
          style={{
            padding: "18px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>🔍</span>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-3)", marginBottom: 3 }}>DISCOVER</p>
            <p style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>Explore</p>
          </div>
        </Link>
      </div>

      {/* ── Mood section ── */}
      <div style={{ padding: "32px 0 0" }}>
        <div style={{ padding: "0 20px" }} className="section-header">
          <h2 className="t-heading">오늘의 기분</h2>
        </div>
        <div className="hscroll" style={{ padding: "0 20px 4px" }}>
          {MOODS.map((mood, i) => (
            <TagChip
              key={mood.label}
              active={activeMood === i}
              onClick={() => setActiveMood(i)}
            >
              {mood.emoji} {mood.label}
            </TagChip>
          ))}
        </div>
      </div>

      {/* ── Recommended places ── */}
      <div style={{ padding: "28px 0 0" }}>
        <div className="section-header" style={{ padding: "0 20px" }}>
          <h2 className="t-heading">LOCA 추천</h2>
          <Link to="/explore" className="section-link">전체보기 →</Link>
        </div>

        {loading ? (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : (
          <>
            {/* First card: wide hero */}
            {places[0] && (
              <div style={{ padding: "0 20px", marginBottom: 12 }}>
                <Link
                  to={`/place/${places[0].id}`}
                  className="card tap-target block"
                  style={{ borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden", height: 200 }}
                >
                  <img
                    src={places[0].imageUrl}
                    alt={places[0].name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
                  }} />
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 18px",
                    color: "#fff",
                  }}>
                    <span style={{
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      opacity: 0.7,
                      textTransform: "uppercase",
                    }}>
                      {places[0].categoryLabel}
                    </span>
                    <h3 style={{
                      fontSize: "1.125rem",
                      fontWeight: 900,
                      letterSpacing: "-0.02em",
                      marginTop: 3,
                    }}>
                      {places[0].name}
                    </h3>
                  </div>
                </Link>
              </div>
            )}

            {/* Remaining: 2-column grid */}
            <div style={{
              padding: "0 20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}>
              {places.slice(1, 5).map((place) => (
                <PlaceCard key={place.id} place={place} compact />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom spacer ── */}
      <div style={{ height: 24 }} />
    </AppShell>
  );
}

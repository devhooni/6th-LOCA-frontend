import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces } from "@/src/services/placeService";

const CATEGORIES = [
  { label: "전체", emoji: "🗺" },
  { label: "카페", emoji: "☕" },
  { label: "맛집", emoji: "🍜" },
  { label: "문화", emoji: "🎨" },
  { label: "자연", emoji: "🌿" },
  { label: "쇼핑", emoji: "🛍" },
  { label: "술집", emoji: "🍺" },
];

const SORT_TABS = ["추천", "인기", "신규", "컬렉션"];

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeSort, setActiveSort] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data);
      setLoading(false);
    });
  }, []);

  return (
    <AppShell>
      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(250,250,250,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "14px 20px 0",
      }}>
        {/* Title row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <h1 style={{
            fontSize: "1.375rem",
            fontWeight: 900,
            letterSpacing: "-0.025em",
          }}>
            Explore
          </h1>
          <Link
            to="/map"
            className="btn btn-secondary btn-sm tap-target"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <MapIcon />
            지도 보기
          </Link>
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-4)",
            pointerEvents: "none",
          }}>
            <SearchIcon />
          </div>
          <input
            id="explore-search"
            className="search-input"
            placeholder="장소 이름, 분위기로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Sort tabs */}
        <div className="hscroll" style={{ paddingBottom: 12 }}>
          {SORT_TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className="tap-target"
              onClick={() => setActiveSort(i)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.875rem",
                fontWeight: 800,
                whiteSpace: "nowrap",
                background: activeSort === i ? "var(--brand-black)" : "transparent",
                color: activeSort === i ? "#fff" : "var(--text-3)",
                border: activeSort === i ? "none" : "none",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category chips ── */}
      <div className="hscroll" style={{ padding: "14px 20px" }}>
        {CATEGORIES.map((cat, i) => (
          <TagChip
            key={cat.label}
            active={activeCategory === i}
            onClick={() => setActiveCategory(i)}
          >
            {cat.emoji} {cat.label}
          </TagChip>
        ))}
      </div>

      {/* ── Results count ── */}
      <div style={{ padding: "0 20px 12px" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)" }}>
          {loading ? "로딩 중..." : `장소 ${places.length}개`}
        </p>
      </div>

      {/* ── Place grid ── */}
      <div style={{ padding: "0 20px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {places
              .filter((p) => !query || p.name.includes(query) || (p.tags ?? []).some((t) => t.includes(query)))
              .slice(0, 10)
              .map((place, i) => (
                <div
                  key={place.id}
                  className="anim-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <PlaceCard place={place} compact />
                </div>
              ))}
          </div>
        )}
      </div>

      <div style={{ height: 24 }} />
    </AppShell>
  );
}

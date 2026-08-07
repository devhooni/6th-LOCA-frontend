import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPublicPlaceById, getPlaceReviews } from "@/src/services/placeService";

const TABS = ["정보", "기록", "주변"];

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function PlaceDetailPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("정보");

  useEffect(() => {
    setLoading(true);
    Promise.all([getPublicPlaceById(id), getPlaceReviews(id)])
      .then(([placeData, reviewsData]) => {
        setPlace(placeData);
        setReviews(reviewsData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "0 0 0" }}>
          <div className="skeleton" style={{ height: 280, borderRadius: 0 }} />
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton" style={{ height: 28, width: "60%", borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ height: 16, width: "40%", borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-md)" }} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!place) {
    return (
      <AppShell>
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>😶</p>
          <p style={{ fontWeight: 700, color: "var(--text-3)" }}>장소를 찾을 수 없어요.</p>
          <Link to="/explore" className="btn btn-primary btn-sm" style={{ marginTop: 20 }}>탐색으로 돌아가기</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Hero image ── */}
      <div style={{ position: "relative", height: 280 }}>
        <img
          src={place.imageUrl}
          alt={place.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.6) 100%)",
        }} />

        {/* Floating back button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-icon-round tap-target"
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "none",
          }}
          aria-label="뒤로가기"
        >
          <BackIcon />
        </button>

        {/* Action buttons */}
        <div style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 8,
        }}>
          <button
            type="button"
            className="btn btn-icon-round tap-target"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              border: "none",
            }}
            aria-label="공유하기"
          >
            <ShareIcon />
          </button>
          <button
            type="button"
            className="btn btn-icon-round tap-target"
            style={{
              background: saved ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              border: "none",
              color: saved ? "#fff" : "inherit",
            }}
            onClick={() => setSaved((v) => !v)}
            aria-label="저장하기"
          >
            <BookmarkIcon filled={saved} />
          </button>
        </div>

        {/* Place name overlay */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          color: "#fff",
        }}>
          <span style={{
            fontSize: "0.6875rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}>
            {place.categoryLabel}
          </span>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            letterSpacing: "-0.025em",
            marginTop: 4,
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}>
            {place.name}
          </h1>
        </div>
      </div>

      {/* ── Quick stats bar ── */}
      <div style={{
        display: "flex",
        padding: "14px 20px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        gap: 20,
      }}>
        {place.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: "var(--warning)" }}><StarIcon /></span>
            <span style={{ fontSize: "0.875rem", fontWeight: 800 }}>{place.rating}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-4)" }}>
              ({reviews.length})
            </span>
          </div>
        )}
        {place.distance && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)" }}>
            <PinIcon />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>{place.distance}</span>
          </div>
        )}
        {place.hours && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-3)" }}>
            <ClockIcon />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>{place.hours}</span>
          </div>
        )}
      </div>

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
              color: activeTab === tab ? "var(--text)" : "var(--text-4)",
              borderBottom: activeTab === tab ? "2.5px solid var(--brand-black)" : "2.5px solid transparent",
              transition: "color 0.15s ease, border-color 0.15s ease",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2.5px solid var(--brand-black)" : "2.5px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: 정보 ── */}
      {activeTab === "정보" && (
        <div style={{ padding: "24px 20px" }} className="anim-fade-in">
          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <TagChip active>{place.categoryLabel}</TagChip>
            {place.tags?.slice(0, 4).map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>

          {/* Description */}
          {place.description && (
            <p style={{
              fontSize: "0.9375rem",
              fontWeight: 500,
              lineHeight: 1.7,
              color: "var(--text-2)",
              marginBottom: 24,
            }}>
              {place.description}
            </p>
          )}

          {/* Info rows */}
          <div style={{
            background: "var(--surface-2)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1.5px solid var(--border)",
          }}>
            {[
              { icon: <PinIcon />, label: "주소", value: place.address },
              { icon: <ClockIcon />, label: "영업시간", value: place.hours },
            ].filter((r) => r.value).map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 18px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ color: "var(--text-3)", marginTop: 1 }}>{row.icon}</span>
                <div>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-3)", marginBottom: 4 }}>{row.label}</p>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: 기록 ── */}
      {activeTab === "기록" && (
        <div style={{ padding: "24px 20px" }} className="anim-fade-in">
          <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-3)", marginBottom: 16 }}>
            방문자 기록 {reviews.length}개
          </p>
          {reviews.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "var(--surface-2)",
              borderRadius: "var(--radius-lg)",
              border: "1.5px dashed var(--border)",
            }}>
              <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>✍️</p>
              <p style={{ fontWeight: 700, color: "var(--text-3)" }}>첫 번째 기록을 남겨보세요</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.map((review) => (
                <article
                  key={review.id}
                  style={{
                    background: "var(--surface)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "16px 18px",
                  }}
                >
                  <p style={{ fontWeight: 800, fontSize: "0.9375rem", marginBottom: 8 }}>{review.title}</p>
                  <p className="line-clamp-3" style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text-3)",
                    lineHeight: 1.65,
                  }}>
                    {review.memory || review.review}
                  </p>
                  <p style={{
                    marginTop: 12,
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--text-4)",
                    letterSpacing: "0.03em",
                  }}>
                    {review.date}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: 주변 ── */}
      {activeTab === "주변" && (
        <div style={{ padding: "24px 20px" }} className="anim-fade-in">
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-lg)",
          }}>
            <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>🗺️</p>
            <p style={{ fontWeight: 700, color: "var(--text-3)" }}>주변 장소 보기</p>
            <Link
              to="/map"
              className="btn btn-primary btn-sm"
              style={{ marginTop: 16, display: "inline-flex" }}
            >
              지도에서 보기
            </Link>
          </div>
        </div>
      )}

      {/* ── Fixed CTA ── */}
      <div style={{
        position: "sticky",
        bottom: 64,
        zIndex: 20,
        padding: "12px 20px",
        background: "rgba(250,250,250,0.92)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border)",
      }}>
        <Link
          to={`/review/write?placeId=${place.id}`}
          className="btn btn-primary btn-full"
          style={{ borderRadius: "var(--radius-md)" }}
        >
          ✍️ 이 장소 기록하기
        </Link>
      </div>

      <div style={{ height: 8 }} />
    </AppShell>
  );
}

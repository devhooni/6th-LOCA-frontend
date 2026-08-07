import { Link } from "react-router-dom";

const BookmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/**
 * PlaceCard — Mobile-optimized place card with hover lift effect
 */
export function PlaceCard({ place, compact = false }) {
  const isPrivate = place.visibility === "private" || place.source === "user";

  return (
    <Link
      className="card block tap-target focus:outline-none"
      to={`/place/${place.id}`}
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ height: compact ? "120px" : "160px" }}
      >
        <img
          alt={place.name}
          src={place.imageUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)"
        }} />

        {/* Privacy badge */}
        <span
          className="badge"
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: isPrivate ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.92)",
            color: isPrivate ? "#fafafa" : "#0a0a0a",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontSize: "0.625rem",
            letterSpacing: "0.06em",
          }}
        >
          {isPrivate ? "🔒 Private" : "🌐 Public"}
        </span>

        {/* Bookmark button */}
        <button
          type="button"
          className="btn btn-icon-round"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 34,
            height: 34,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            border: "none",
            boxShadow: "none",
          }}
          onClick={(e) => e.preventDefault()}
          aria-label="저장하기"
        >
          <BookmarkIcon />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: compact ? "12px 14px" : "14px 16px" }}>
        <p className="t-caption" style={{ color: "var(--text-4)", marginBottom: 4 }}>
          {place.categoryLabel}
        </p>
        <h3 className="t-heading line-clamp-1" style={{ fontSize: "0.9375rem" }}>
          {place.name}
        </h3>

        {!compact && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            {place.rating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--warning)", fontSize: "0.75rem", fontWeight: 700 }}>
                <StarIcon />
                {place.rating}
              </span>
            )}
            {place.distance && (
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-4)" }}>
                {place.distance}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {place.tags?.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {place.tags.slice(0, compact ? 1 : 2).map((tag) => (
              <span
                key={tag}
                className="chip chip--sm"
                style={{ cursor: "default", pointerEvents: "none" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";

export function PlaceCard({ place, compact = false }) {
  const isPrivate = place.visibility === "private" || place.source === "user";

  return (
    <Link to={"/place/" + place.id} className="card" style={{ display: "block", position: "relative" }}>
      <div style={{ position: "relative", height: compact ? 80 : 140 }}>
        <img
          alt={place.name}
          src={place.imageUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span
          style={{
            position: "absolute",
            left: 8,
            top: 8,
            background: isPrivate ? "#000" : "#fff",
            color: isPrivate ? "#fff" : "#000",
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: "bold",
            borderRadius: 12,
            border: isPrivate ? "none" : "1px solid #ccc"
          }}
        >
          {isPrivate ? "🔒 Private" : "🌐 Public"}
        </span>
      </div>
      <div style={{ padding: "8px 0 4px" }}>
        <strong>{place.name}</strong>
        {place.categoryLabel && <span style={{ marginLeft: 8, fontSize: 13 }}>{place.categoryLabel}</span>}
        {place.rating && <span style={{ marginLeft: 8, fontSize: 13 }}>★ {place.rating}</span>}
        {place.distance && <span style={{ marginLeft: 8, fontSize: 13, color: "#666" }}>{place.distance}</span>}
      </div>
      {place.tags?.length > 0 && (
        <div style={{ fontSize: 12, color: "#666" }}>{place.tags.slice(0, 3).join(" · ")}</div>
      )}
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { TagChip } from "@/src/components/common/TagChip";
import { AppShell } from "@/src/components/layout/AppShell";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { getPlaces } from "@/src/services/placeService";

const CATEGORIES = ["전체", "카페", "맛집", "문화", "자연", "쇼핑", "술집"];

export default function ExplorePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
    const [query, setQuery] = useState("");
  const [isMapMode, setIsMapMode] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data);
      setSelectedPlace(data[0] ?? null);
      setLoading(false);
    });
  }, []);

  const filtered = places.filter(
    (p) =>
      !query ||
      p.name.includes(query) ||
      (p.tags ?? []).some((t) => t.includes(query)),
  );

  return (
    <AppShell>
      <div
        className="page-header"
        style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>탐색</h1>
        <button
          onClick={() => setIsMapMode(!isMapMode)}
          style={{
            fontSize: 13,
            padding: "4px 12px",
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: "bold",
          }}>
          {isMapMode ? "목록 보기" : "지도 보기"}
        </button>
      </div>

      <div className="section" style={{ marginTop: 12 }}>
        <input
          id="explore-search"
          type="text"
          placeholder="장소 이름, 분위기로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field"
        />
      </div>

      
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>
        {loading ? "로딩 중..." : "장소 " + filtered.length + "개"}
      </p>

      {isMapMode ? (
        <div style={{ height: 400, position: "relative" }}>
          <KakaoMap
            places={filtered}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
          />
          {selectedPlace && (
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                right: 12,
                zIndex: 10,
                background: "#fff",
                padding: 12,
                border: "1px solid #ccc",
              }}>
              <strong style={{ display: "block" }}>{selectedPlace.name}</strong>
              <span style={{ fontSize: 12, color: "#666" }}>
                {selectedPlace.address}
              </span>
              <Link
                to={"/place/" + selectedPlace.id}
                style={{
                  display: "block",
                  marginTop: 8,
                  fontSize: 12,
                  fontWeight: "bold",
                  textAlign: "right",
                }}>
                상세보기 →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {!loading &&
            filtered.map((place) => (
              <PlaceCard key={place.id} place={place} compact />
            ))}
        </div>
      )}
    </AppShell>
  );
}

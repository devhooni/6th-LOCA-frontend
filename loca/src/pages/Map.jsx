import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TagChip } from "@/src/components/common/TagChip";
import { BottomNav } from "@/src/components/layout/BottomNav";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { getPlaces } from "@/src/services/placeService";

const FILTER_TABS = ["전체", "저장", "카페"];

export default function MapPage() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getPlaces().then((data) => {
      setPlaces(data);
      setSelectedPlace(data[0] ?? null);
      setLoading(false);
    });
  }, []);

  const filtered = places.filter((p) =>
    !searchQuery || p.name.includes(searchQuery)
  );

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* 지도 영역 (화면 상단 60%) */}
      <div style={{ flex: "0 0 60dvh", position: "relative" }}>
        <KakaoMap
          places={filtered}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
        />

        {/* 검색창 오버레이 */}
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 10 }}>
          <input
            id="map-search"
            type="text"
            placeholder="지역 또는 장소 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #ccc",
              background: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 필터 칩 오버레이 */}
        <div style={{ position: "absolute", top: 60, left: 12, zIndex: 10, display: "flex", gap: 6 }}>
          {FILTER_TABS.map((tab, i) => (
            <TagChip key={tab} active={activeFilter === i} onClick={() => setActiveFilter(i)}>
              {tab}
            </TagChip>
          ))}
        </div>
      </div>

      {/* 장소 리스트 (하단 스크롤) */}
      <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #ddd", paddingBottom: 64 }}>
        {loading ? (
          <p style={{ padding: 16 }}>로딩 중...</p>
        ) : (
          filtered.slice(0, 8).map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => setSelectedPlace(place)}
              style={{
                width: "100%",
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
                background: selectedPlace?.id === place.id ? "#f5f5f5" : "#fff",
                textAlign: "left",
                border: "none",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
              }}
            >
              <img
                src={place.imageUrl}
                alt=""
                style={{ width: 52, height: 52, objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {place.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>
                  {place.categoryLabel}{place.distance ? " · " + place.distance : ""}
                </p>
                {place.tags?.length > 0 && (
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#999" }}>
                    {place.tags.slice(0, 2).join(" · ")}
                  </p>
                )}
              </div>
              {selectedPlace?.id === place.id && (
                <Link
                  to={"/place/" + place.id}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 12, flexShrink: 0, fontWeight: 600 }}
                >
                  상세보기 →
                </Link>
              )}
            </button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

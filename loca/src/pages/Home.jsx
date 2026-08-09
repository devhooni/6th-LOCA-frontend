import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TagChip } from "@/src/components/common/TagChip";
import { PlaceCard } from "@/src/components/common/PlaceCard";
import { AppShell } from "@/src/components/layout/AppShell";
import { getPlaces } from "@/src/services/placeService";

const MOODS = ["전체","조용한","새로운","자연","맛있는","예술적인","힐링"];

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(0);

  useEffect(() => {
    getPlaces().then((data) => { setPlaces(data.slice(0, 6)); setLoading(false); });
  }, []);

  return (
    <AppShell>
      <div className="section">
        <p style={{ margin: 0, fontSize: 13, color: "#666" }}>안녕하세요, 진우님</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 900 }}>오늘은 어디로 떠날까요?</h1>
      </div>

      <div className="section" style={{ display: "flex", gap: 8 }}>
        <Link to="/for-you" className="btn-primary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>For You</Link>
        <Link to="/explore" className="btn-secondary" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>Explore</Link>
      </div>

      <div className="section">
        <input type="text" placeholder="어디로 떠나볼까요?" readOnly className="input-field"
          onClick={() => { window.location.href = "/explore"; }} style={{ cursor: "pointer" }} />
      </div>

      <div className="section">
        <p style={{ fontWeight: 700, marginBottom: 8 }}>오늘의 기분</p>
        <div className="hscroll">
          {MOODS.map((mood, i) => (
            <TagChip key={mood} active={activeMood === i} onClick={() => setActiveMood(i)}>{mood}</TagChip>
          ))}
        </div>
      </div>

      <div className="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontWeight: 700, margin: 0 }}>LOCA 추천</p>
          <Link to="/explore" style={{ fontSize: 13 }}>전체보기 →</Link>
        </div>
        {loading ? <p>로딩 중...</p> : places.map((place) => <PlaceCard key={place.id} place={place} />)}
      </div>
    </AppShell>
  );
}

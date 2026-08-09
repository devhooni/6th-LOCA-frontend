import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { getPlaces, getPlaceById } from "@/src/services/placeService";
import { createReview } from "@/src/services/reviewService";

export function ReviewWriteForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlaceId = searchParams.get("placeId") ?? "101";
  
  const [place, setPlace] = useState(null);
  const [allPlaces, setAllPlaces] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPlaces().then((data) => {
      if (data?.length) setAllPlaces(data);
    });
    getPlaceById(initialPlaceId).then(setPlace);
  }, [initialPlaceId]);

  const complete = async () => {
    if (!title.trim() || !review.trim()) {
      window.alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const targetPlaceId = place?.placeId || (!isNaN(Number(initialPlaceId)) ? Number(initialPlaceId) : 101);
      await createReview({
        placeId: targetPlaceId,
        placeName: place?.name,
        title,
        content: review,
        rating: 5,
      });
      navigate("/place/" + targetPlaceId);
    } catch {
      window.alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="page-header" style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>기록 쓰기</h1>
        <button onClick={complete} disabled={saving} style={{ fontSize: 13, padding: "4px 12px", border: "1px solid #000", background: "#000", color: "#fff", fontWeight: "bold" }}>
          {saving ? "저장 중..." : "완료"}
        </button>
      </div>

      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>장소 선택</label>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="input-field" 
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "12px" }}
          >
            <span>{place ? place.name : "장소를 선택해주세요"}</span>
            <span style={{ fontSize: 10 }}>{isDropdownOpen ? "▲" : "▼"}</span>
          </div>
          
          {isDropdownOpen && (
            <div style={{ position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #ddd", maxHeight: 200, overflowY: "auto", marginTop: 4 }}>
              {allPlaces.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => { setPlace(item); setIsDropdownOpen(false); }}
                  style={{ padding: 12, borderBottom: "1px solid #eee", cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: 11, color: "#666" }}>{item.address}</div>
                  </div>
                  <span style={{ fontSize: 10 }}>{(item.visibility === "private" || item.source === "user") ? "🔒" : "🌐"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        
        {/* Map for setting coordinates manually */}
        <div style={{ position: "relative" }}>
          <label style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 4 }}>위치 직접 찍기 (선택)</label>
          <div style={{ height: 200, border: "1px solid #ddd" }}>
            <KakaoMap
              places={place && place.lat ? [place] : []}
              selectedPlace={place}
              onMapClick={(coords) => {
                setPlace({ 
                  id: "custom-" + Date.now(), 
                  name: "지도에서 직접 선택한 위치", 
                  lat: coords.lat, 
                  lng: coords.lng 
                });
              }}
            />
          </div>
          {place && place.lat && (
            <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
              선택된 위도: {place.lat}, 경도: {place.lng}
            </div>
          )}
        </div>
        
        <label>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>제목</div>
          <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="기록의 제목을 입력하세요" />
        </label>
        
        <label>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>내용</div>
          <textarea className="input-field" value={review} onChange={(e) => setReview(e.target.value)} placeholder="어떤 경험을 하셨나요?" style={{ height: 120, resize: "none" }} />
        </label>
      </div>
    </AppShell>
  );
}

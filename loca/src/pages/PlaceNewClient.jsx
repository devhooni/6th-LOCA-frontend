import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KakaoMap } from "@/src/components/map/KakaoMap";
import { createPlace } from "@/src/services/placeService";
import { AppShell } from "@/src/components/layout/AppShell";

const defaultLocation = { lat: "37.5615", lng: "126.9232" };

export function PlaceNewClient() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [kakaoId, setKakaoId] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(defaultLocation.lat);
  const [lng, setLng] = useState(defaultLocation.lng);
  const [visibility, setVisibility] = useState("public");

  const handleMapClick = ({ lat: clickedLat, lng: clickedLng }) => {
    setLat(String(clickedLat));
    setLng(String(clickedLng));
  };

  const save = async () => {
    if (!name.trim()) {
      window.alert("장소 이름을 입력해주세요.");
      return;
    }
    
    

    try {
      const created = await createPlace({
        name,
        category: "cafe",
        categoryLabel: "추천 장소",
        address: address || "지도에서 선택한 위치",
        lat: Number(lat),
        lng: Number(lng),
        description: "등록된 장소입니다.",
        imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
        tagIds: ["추천"],
        tags: ["추천"],
        visibility,
        source: "kakao",
        registrationMethod: "mapSelect",
      });
      navigate("/place/" + created.id);
    } catch (err) {
      console.error(err);
      window.alert("장소 저장 실패: " + err.message);
    }
  };

  return (
    <AppShell>
      <div className="page-header" style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>장소 추가</h1>
        <button onClick={save} style={{ fontSize: 13, padding: "4px 12px", border: "1px solid #000", background: "#000", color: "#fff", fontWeight: "bold" }}>저장</button>
      </div>

      <div className="section" style={{ padding: 0 }}>
        <div style={{ height: 240, borderBottom: "1px solid #ddd" }}>
          <KakaoMap
            onMapClick={handleMapClick}
            places={[{ id: "preview", name: name || "선택한 지점", lat: Number(lat), lng: Number(lng) }]}
            selectedPlace={{ id: "preview", lat: Number(lat), lng: Number(lng) }}
          />
        </div>
        <p style={{ margin: 0, padding: 8, fontSize: 11, color: "#666", textAlign: "center", borderBottom: "1px solid #eee" }}>
          지도를 클릭하여 위치를 설정하세요. (위도: {lat}, 경도: {lng})
        </p>
      </div>

      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>카카오 Place ID (전체공개 전용)</div>
          <input className="input-field" value={kakaoId} onChange={(e) => setKakaoId(e.target.value)} placeholder="예: 26573919 (스타벅스 홍대역점)" />
        </label>
        
        <label>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>장소 이름 (나만 보기용)</div>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 무신사 홍대" />
        </label>
        
        <label>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>상세 주소 (선택)</div>
          <input className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="직접 입력" />
        </label>

        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>공개 설정</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              className={visibility === "public" ? "btn-primary" : "btn-secondary"} 
              style={{ flex: 1, padding: 12 }}
              onClick={() => setVisibility("public")}
            >
              🌐 전체 공개
            </button>
            <button 
              className={visibility === "private" ? "btn-primary" : "btn-secondary"} 
              style={{ flex: 1, padding: 12 }}
              onClick={() => { setVisibility("private");  }}
            >
              🔒 나만 보기
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

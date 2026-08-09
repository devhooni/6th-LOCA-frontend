import { useEffect, useState } from "react";
import { AppShell } from "@/src/components/layout/AppShell";
import { apiClient } from "@/src/lib/apiClient";

export default function AdminPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaces = async () => {
    try {
      const data = await apiClient("/api/places/public");
      setPlaces(Array.isArray(data) ? data : []);
    } catch {
      window.alert("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiClient("/api/admin/places/" + id, { method: "DELETE" });
      fetchPlaces();
    } catch {
      window.alert("삭제 실패");
    }
  };

  return (
    <AppShell>
      <div className="page-header" style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>장소 관리</h1>
      </div>
      <div className="section" style={{ paddingBottom: 100 }}>
        {loading ? <p>로딩 중...</p> : places.map(p => (
          <div key={p.placeId || p.id} style={{ padding: 12, border: "1px solid #ddd", marginBottom: 8 }}>
            <strong>{p.name}</strong>
            <div style={{ fontSize: 12, color: "#666" }}>{p.address}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => handleDelete(p.placeId || p.id)} style={{ fontSize: 12, color: "red" }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

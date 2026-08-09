import { useEffect, useState } from "react";
import { AppShell } from "@/src/components/layout/AppShell";
import { apiClient } from "@/src/lib/apiClient";

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");

  const fetchTags = async () => {
    try {
      const data = await apiClient("/api/tags");
      setTags(Array.isArray(data) ? data : []);
    } catch {
      window.alert("태그 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTags(); }, []);

  const handleAdd = async () => {
    if (!newTag.trim()) return;
    try {
      await apiClient("/api/admin/tags", { method: "POST", body: JSON.stringify({ name: newTag }) });
      setNewTag("");
      fetchTags();
    } catch {
      window.alert("태그 추가 실패");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiClient("/api/admin/tags/" + id, { method: "DELETE" });
      fetchTags();
    } catch {
      window.alert("삭제 실패");
    }
  };

  return (
    <AppShell>
      <div className="page-header" style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>태그 관리</h1>
      </div>
      <div className="section" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input className="input-field" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="새 태그 이름" />
        <button onClick={handleAdd} className="btn-primary" style={{ padding: "0 16px" }}>추가</button>
      </div>
      <div className="section">
        {loading ? <p>로딩 중...</p> : tags.map(t => (
          <div key={t.tagId || t.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", border: "1px solid #ddd", marginBottom: 8 }}>
            <span>{t.name}</span>
            <button onClick={() => handleDelete(t.tagId || t.id)} style={{ color: "red", fontSize: 12 }}>삭제</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

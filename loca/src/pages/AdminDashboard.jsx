import { Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";

export default function AdminDashboard() {
  return (
    <AppShell>
      <div className="page-header" style={{ padding: "16px 0", borderBottom: "none" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>관리자 대시보드</h1>
      </div>
      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link to="/admin/places" style={{ padding: 16, border: "1px solid #ddd", display: "block", fontWeight: "bold" }}>장소 관리 (Public Places)</Link>
        <Link to="/admin/tags" style={{ padding: 16, border: "1px solid #ddd", display: "block", fontWeight: "bold" }}>태그 관리 (Tags)</Link>
      </div>
    </AppShell>
  );
}

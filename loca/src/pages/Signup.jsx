import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "@/src/components/layout/AppShell";
import { apiClient } from "@/src/lib/apiClient";

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSignup = async (e) => {
    e.preventDefault();
    if(!email || !password || !nickname) return alert("모든 정보를 입력해주세요.");
    
    setLoading(true);
    try {
      const res = await apiClient("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, nickname })
      });
      alert("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      alert("회원가입 실패: 백엔드 서버를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", minHeight: "100vh", justifyContent: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 32, textAlign: "center" }}>회원가입</h1>
        
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input-field" type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
          <input className="input-field" type="text" placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link to="/login" style={{ color: "#666", textDecoration: "underline", fontSize: 14 }}>돌아가기</Link>
        </div>
      </div>
    </AppShell>
  );
}

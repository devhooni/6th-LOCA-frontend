import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { loginUser } from "../services/placeService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // POST /api/auth/login API 호출 및 JWT 토큰 저장
      await loginUser({ email, password });
      // 성공 시 explore 탐색 화면으로 이동
      navigate("/explore");
    } catch (err) {
      console.error("Login Error:", err);
      // 규칙 1: 실서버 에러 정직하게 표시
      setErrorMsg(err.message || "로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8 select-none">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="self-start text-gray-400 hover:text-gray-600 transition-colors -ml-1 mb-8"
        aria-label="뒤로가기"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Title */}
      <div className="mb-10 text-left">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">로그인</h1>
        <p className="text-sm text-gray-500">LOCA 서비스 이용을 위해 로그인해주세요.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* 이메일 */}
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium text-gray-700">이메일</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@loca.com"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5 text-left">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {errorMsg && (
            <p className="text-xs text-red-500 ml-0.5">{errorMsg}</p>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="space-y-4 pb-4 mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#111] text-white text-sm font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>로그인 중...</span>
              </>
            ) : (
              <span>로그인</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
            <span>계정이 없으신가요?</span>
            <Link to="/signup" className="font-semibold text-[#111] underline">
              회원가입
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

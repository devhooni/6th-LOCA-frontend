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
    <div className="flex flex-col min-h-screen bg-white px-6 py-6 select-none">
      {/* Header Back Button */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={22} />
        </button>
      </div>

      {/* Main Title Section */}
      <div className="mt-4 mb-8 text-left space-y-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          LOCA 로그인
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          서비스 이용을 위해 이메일과 비밀번호를 입력해주세요.
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* 이메일 입력 폼 */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1">
              이메일
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@loca.com"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--color-neutral-border)] bg-gray-50/50 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* 비밀번호 입력 폼 */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-[var(--color-text-secondary)] ml-1">
              비밀번호
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[var(--color-neutral-border)] bg-gray-50/50 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 에러 메시지 렌더링 */}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-500 ml-1 text-left animate-shake">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Action Button & Sign Up Link */}
        <div className="space-y-4 pb-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-[var(--color-brand-primary)] text-white text-sm font-bold shadow-md active:scale-98 transition-all hover:bg-[var(--color-brand-primary)]/90 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>로그인 중...</span>
              </>
            ) : (
              <span>로그인</span>
            )}
          </button>

          <div className="flex items-center justify-center space-x-2 text-xs text-[var(--color-text-secondary)]">
            <span>계정이 없으신가요?</span>
            <Link
              to="/signup"
              className="font-bold text-[var(--color-brand-primary)] underline hover:opacity-80 transition-opacity"
            >
              회원가입하기
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
